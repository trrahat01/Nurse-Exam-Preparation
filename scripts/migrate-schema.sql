-- Migration script for fetch_unseen_questions_distributed RPC function
-- Drop previous signatures to prevent overloading conflicts
DROP FUNCTION IF EXISTS public.fetch_unseen_questions_distributed(INT, TEXT, TEXT, TEXT, INT);
DROP FUNCTION IF EXISTS public.fetch_unseen_questions_distributed(INT, TEXT, TEXT, TEXT);

-- Atomic Question Delivery & Distribution RPC Function
-- Implements Iterative Inventory-Constrained Largest Remainder Method (LRM)
-- Nursing: 60%, General Knowledge: 15%, English: 15%, Bangla: 10%

CREATE OR REPLACE FUNCTION fetch_unseen_questions_distributed(
    p_total_count INT,
    p_category TEXT DEFAULT NULL,
    p_subcategory TEXT DEFAULT NULL,
    p_exam_type TEXT DEFAULT 'practice'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_delivered_questions JSONB := '[]'::jsonb;
    v_requested_count INT := p_total_count;
    v_delivered_count INT := 0;
    v_status TEXT;
    v_category_stats JSONB := '{}'::jsonb;
    v_categories TEXT[] := ARRAY['Nursing', 'General Knowledge', 'English', 'Bangla'];
    v_base_weights NUMERIC[] := ARRAY[0.60, 0.15, 0.15, 0.10];
    v_weights NUMERIC[] := ARRAY[0.0, 0.0, 0.0, 0.0];
    v_avail INT[] := ARRAY[0, 0, 0, 0];
    v_quota INT[] := ARRAY[0, 0, 0, 0];
    v_total_avail INT := 0;
    v_weight_sum NUMERIC := 0.0;
    
    -- Iteration variables for LRM
    v_remaining INT;
    v_requested_count_capped INT;
    v_iter INT;
    v_active_count INT;
    v_weight_active_sum NUMERIC;
    v_snap_remaining INT;
    v_snap_weight_active_sum NUMERIC;
    v_cap_found BOOLEAN;
    v_rem_cap INT;
    v_cap_alloc INT;
    v_share NUMERIC;
    v_floor INT;
    v_sum_target INT;
    v_diff INT;
    v_remainders NUMERIC[] := ARRAY[0.0, 0.0, 0.0, 0.0];
    v_alloc_add INT[] := ARRAY[0, 0, 0, 0];
    v_max_rem NUMERIC;
    v_max_idx INT;
    
    v_cat_name TEXT;
    v_cat_requested INT;
    v_delivered_for_cat INT;
    v_i INT;
    v_selected_ids UUID[] := ARRAY[]::UUID[];
    v_inserted_ids UUID[] := ARRAY[]::UUID[];
    v_cat_selected UUID[];
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'status', 'error',
            'message', 'Unauthorized',
            'requested_count', v_requested_count,
            'delivered_count', 0,
            'category_stats', '{}'::jsonb,
            'questions', '[]'::jsonb
        );
    END IF;

    -- Atomic transactional advisory lock per user to prevent concurrent race conditions
    PERFORM pg_advisory_xact_lock(hashtext(v_user_id::text));

    -- Validate exam type strictly (no silent fallback to practice)
    IF p_exam_type NOT IN ('mock', 'daily_20', 'daily_50', 'daily_100', 'challenge', 'practice') THEN
        RAISE EXCEPTION 'Invalid exam_type: %. Must be one of mock, daily_20, daily_50, daily_100, challenge, practice.', p_exam_type;
    END IF;

    IF v_requested_count <= 0 THEN
        RETURN jsonb_build_object(
            'status', 'insufficient',
            'requested_count', v_requested_count,
            'delivered_count', 0,
            'category_stats', '{}'::jsonb,
            'questions', '[]'::jsonb
        );
    END IF;

    -- 1. Determine available unseen inventory per category with filters
    FOR v_i IN 1..4 LOOP
        SELECT COUNT(*)::INT INTO v_avail[v_i]
        FROM public.questions q
        WHERE q.active = true 
            AND q.category = v_categories[v_i]
            AND (p_category IS NULL OR q.category = p_category)
            AND (p_subcategory IS NULL OR q.subcategory = p_subcategory)
            AND NOT EXISTS (
                SELECT 1 FROM public.question_exposures e
                WHERE e.user_id = v_user_id AND e.question_id = q.id
            );
        v_total_avail := v_total_avail + v_avail[v_i];
    END LOOP;

    -- 2. Determine effective weights with subcategory/category normalization
    IF p_category IS NOT NULL THEN
        FOR v_i IN 1..4 LOOP
            IF v_categories[v_i] = p_category THEN
                v_weights[v_i] := 1.0;
            ELSE
                v_weights[v_i] := 0.0;
            END IF;
        END LOOP;
    ELSE
        -- p_category IS NULL (may have p_subcategory or neither)
        v_weight_sum := 0.0;
        FOR v_i IN 1..4 LOOP
            IF v_avail[v_i] > 0 THEN
                v_weights[v_i] := v_base_weights[v_i];
                v_weight_sum := v_weight_sum + v_base_weights[v_i];
            ELSE
                v_weights[v_i] := 0.0;
            END IF;
        END LOOP;
        
        -- Normalize weights if some categories have zero available inventory in selection scope
        IF v_weight_sum > 0 THEN
            FOR v_i IN 1..4 LOOP
                v_weights[v_i] := v_weights[v_i] / v_weight_sum;
            END LOOP;
        END IF;
    END IF;

    -- 3. Genuine Iterative Inventory-Constrained Largest Remainder Method (LRM)
    v_requested_count_capped := LEAST(v_requested_count, v_total_avail);
    v_remaining := v_requested_count_capped;
    v_quota := ARRAY[0, 0, 0, 0];

    -- Iterative allocation loop (up to 10 iterations to ensure convergence)
    FOR v_iter IN 1..10 LOOP
        IF v_remaining <= 0 THEN
            EXIT;
        END IF;

        -- Count active categories that can still take more inventory
        v_active_count := 0;
        v_weight_active_sum := 0.0;
        FOR v_i IN 1..4 LOOP
            IF v_avail[v_i] > v_quota[v_i] AND v_weights[v_i] > 0 THEN
                v_active_count := v_active_count + 1;
                v_weight_active_sum := v_weight_active_sum + v_weights[v_i];
            END IF;
        END LOOP;

        IF v_active_count = 0 OR v_weight_active_sum <= 0 THEN
            EXIT;
        END IF;

        -- Snapshot current remaining count and active weight sum for simultaneous capacity-cap evaluation
        v_snap_remaining := v_remaining;
        v_snap_weight_active_sum := v_weight_active_sum;
        v_cap_found := FALSE;

        -- Evaluate all active categories against their remaining capacity using the same snapshot values
        FOR v_i IN 1..4 LOOP
            IF v_avail[v_i] > v_quota[v_i] AND v_weights[v_i] > 0 THEN
                v_rem_cap := v_avail[v_i] - v_quota[v_i];
                v_share := v_snap_remaining * (v_weights[v_i] / v_snap_weight_active_sum);

                IF v_share >= v_rem_cap THEN
                    v_cap_found := TRUE;
                END IF;
            END IF;
        END LOOP;

        IF v_cap_found THEN
            -- Apply all identified capacity caps together
            FOR v_i IN 1..4 LOOP
                IF v_avail[v_i] > v_quota[v_i] AND v_weights[v_i] > 0 THEN
                    v_rem_cap := v_avail[v_i] - v_quota[v_i];
                    v_share := v_snap_remaining * (v_weights[v_i] / v_snap_weight_active_sum);

                    IF v_share >= v_rem_cap THEN
                        v_cap_alloc := v_rem_cap;
                        v_quota[v_i] := v_quota[v_i] + v_cap_alloc;
                        v_remaining := v_remaining - v_cap_alloc;
                        v_weights[v_i] := 0.0; -- Remove from further proportional distribution
                    END IF;
                END IF;
            END LOOP;
            CONTINUE;
        END IF;

        -- No capacity caps detected in this pass; proceed with floor allocation and largest-remainder distribution
        v_sum_target := 0;
        FOR v_i IN 1..4 LOOP
            IF v_avail[v_i] > v_quota[v_i] AND v_weights[v_i] > 0 THEN
                v_share := v_remaining * (v_weights[v_i] / v_weight_active_sum);
                v_floor := floor(v_share)::INT;
                v_alloc_add[v_i] := v_floor;
                v_remainders[v_i] := v_share - v_floor;
                v_sum_target := v_sum_target + v_floor;
            ELSE
                v_alloc_add[v_i] := 0;
                v_remainders[v_i] := 0.0;
            END IF;
        END LOOP;

        -- Apply floor allocations to quotas and decrement v_remaining
        FOR v_i IN 1..4 LOOP
            v_quota[v_i] := v_quota[v_i] + v_alloc_add[v_i];
        END LOOP;
        v_remaining := v_remaining - v_sum_target;

        -- Distribute leftover seats using largest remainder with deterministic tie-breaking (order of v_categories)
        v_diff := v_remaining;
        WHILE v_diff > 0 LOOP
            v_max_rem := -1.0;
            v_max_idx := -1;

            FOR v_i IN 1..4 LOOP
                IF (v_avail[v_i] - v_quota[v_i]) > 0 AND v_remainders[v_i] > v_max_rem THEN
                    v_max_rem := v_remainders[v_i];
                    v_max_idx := v_i;
                END IF;
            END LOOP;

            IF v_max_idx = -1 THEN
                EXIT; -- No more inventory
            END IF;

            v_quota[v_max_idx] := v_quota[v_max_idx] + 1;
            v_remaining := v_remaining - 1; -- DECREMENT v_remaining for every remainder seat
            v_remainders[v_max_idx] := -1.0; -- Prevent reuse in this round
            v_diff := v_diff - 1;
        END LOOP;

        -- Allocation complete for this pass; exit loop
        EXIT;
    END LOOP;

    -- 4. Fetch question IDs per quota from unseen active inventory
    v_selected_ids := ARRAY[]::UUID[];
    FOR v_i IN 1..4 LOOP
        IF v_quota[v_i] > 0 THEN
            SELECT ARRAY_AGG(sub.id) INTO v_cat_selected
            FROM (
                SELECT q.id FROM public.questions q
                WHERE q.active = true AND q.category = v_categories[v_i]
                    AND (p_category IS NULL OR q.category = p_category)
                    AND (p_subcategory IS NULL OR q.subcategory = p_subcategory)
                    AND NOT EXISTS (
                        SELECT 1 FROM public.question_exposures e
                        WHERE e.user_id = v_user_id AND e.question_id = q.id
                    )
                ORDER BY q.importance DESC, RANDOM()
                LIMIT v_quota[v_i]
            ) sub;
            IF v_cat_selected IS NOT NULL THEN
                v_selected_ids := v_selected_ids || v_cat_selected;
            END IF;
        END IF;
    END LOOP;

    -- 5. Atomic exposure recording & question payload construction
    IF array_length(v_selected_ids, 1) > 0 THEN
        WITH inserted AS (
            INSERT INTO public.question_exposures (user_id, question_id, exam_type, served_at)
            SELECT v_user_id, unnest(v_selected_ids), p_exam_type, NOW()
            ON CONFLICT (user_id, question_id) DO NOTHING
            RETURNING question_id
        )
        SELECT
            COALESCE(JSONB_AGG(to_jsonb(q)), '[]'::jsonb),
            COUNT(*)::INT,
            COALESCE(ARRAY_AGG(q.id), ARRAY[]::UUID[])
        INTO v_delivered_questions, v_delivered_count, v_inserted_ids
        FROM public.questions q
        JOIN inserted i ON q.id = i.question_id;
    END IF;

    IF v_delivered_count = v_requested_count THEN
        v_status := 'complete';
    ELSIF v_delivered_count > 0 THEN
        v_status := 'partial';
    ELSE
        v_status := 'insufficient';
    END IF;

    -- Calculate category statistics directly from actual inserted exposure rows joined to questions
    v_category_stats := '{}'::jsonb;
    FOR v_i IN 1..4 LOOP
        v_cat_name := v_categories[v_i];
        v_cat_requested := v_quota[v_i];

        IF array_length(v_inserted_ids, 1) > 0 THEN
            SELECT COUNT(*)::INT INTO v_delivered_for_cat
            FROM public.questions q
            WHERE q.category = v_cat_name
                AND q.id = ANY(v_inserted_ids);
        ELSE
            v_delivered_for_cat := 0;
        END IF;

        v_category_stats := jsonb_set(
            v_category_stats,
            ARRAY[v_cat_name],
            jsonb_build_object(
                'requested', v_cat_requested,
                'delivered', v_delivered_for_cat
            )
        );
    END LOOP;

    RETURN jsonb_build_object(
        'status', v_status,
        'requested_count', v_requested_count,
        'delivered_count', v_delivered_count,
        'category_stats', v_category_stats,
        'questions', v_delivered_questions
    );
END;
$$;

-- Function Permissions
REVOKE ALL ON FUNCTION public.fetch_unseen_questions_distributed(INT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fetch_unseen_questions_distributed(INT, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.fetch_unseen_questions_distributed(INT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fetch_unseen_questions_distributed(INT, TEXT, TEXT, TEXT) TO service_role;
