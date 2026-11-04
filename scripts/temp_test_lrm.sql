-- Temporary test script for LRM Algorithm
DO $$
DECLARE
    -- Define the test function mimicking the production logic
    FUNCTION test_lrm(p_total_count INT, p_avail INT[]) RETURNS INT[] AS $func$
    DECLARE
        v_categories TEXT[] := ARRAY['Nursing', 'General Knowledge', 'English', 'Bangla'];
        v_base_weights NUMERIC[] := ARRAY[0.60, 0.15, 0.15, 0.10];
        v_weights NUMERIC[] := ARRAY[0.0, 0.0, 0.0, 0.0];
        v_quota INT[] := ARRAY[0, 0, 0, 0];
        v_total_avail INT := 0;
        
        v_remaining INT;
        v_iter INT;
        v_active_count INT;
        v_weight_active_sum NUMERIC;
        v_target INT;
        v_sum_target INT;
        v_diff INT;
        v_remainders NUMERIC[] := ARRAY[0.0, 0.0, 0.0, 0.0];
        v_alloc_add INT[] := ARRAY[0, 0, 0, 0];
        v_max_rem NUMERIC;
        v_max_idx INT;
        v_i INT;
        v_weight_sum NUMERIC := 0.0;
    BEGIN
        FOR v_i IN 1..4 LOOP
            v_total_avail := v_total_avail + p_avail[v_i];
        END LOOP;

        v_weight_sum := 0.0;
        FOR v_i IN 1..4 LOOP
            IF p_avail[v_i] > 0 THEN
                v_weights[v_i] := v_base_weights[v_i];
                v_weight_sum := v_weight_sum + v_base_weights[v_i];
            ELSE
                v_weights[v_i] := 0.0;
            END IF;
        END LOOP;
        
        IF v_weight_sum > 0 THEN
            FOR v_i IN 1..4 LOOP
                v_weights[v_i] := v_weights[v_i] / v_weight_sum;
            END LOOP;
        END IF;

        v_remaining := LEAST(p_total_count, v_total_avail);
        
        FOR v_iter IN 1..10 LOOP
            IF v_remaining <= 0 THEN EXIT; END IF;

            v_active_count := 0;
            v_weight_active_sum := 0.0;
            FOR v_i IN 1..4 LOOP
                IF p_avail[v_i] > v_quota[v_i] AND v_weights[v_i] > 0 THEN
                    v_active_count := v_active_count + 1;
                    v_weight_active_sum := v_weight_active_sum + v_weights[v_i];
                END IF;
            END LOOP;

            IF v_active_count = 0 OR v_weight_active_sum <= 0 THEN EXIT; END IF;

            v_sum_target := 0;
            FOR v_i IN 1..4 LOOP
                IF p_avail[v_i] > v_quota[v_i] AND v_weights[v_i] > 0 THEN
                    DECLARE
                        v_norm_w NUMERIC := v_weights[v_i] / v_weight_active_sum;
                        v_share NUMERIC := v_remaining * v_norm_w;
                    BEGIN
                        v_target := floor(v_share)::INT;
                        v_target := LEAST(v_target, p_avail[v_i] - v_quota[v_i]);
                        v_alloc_add[v_i] := v_target;
                        v_remainders[v_i] := v_share - v_target;
                        v_sum_target := v_sum_target + v_target;
                    END;
                ELSE
                    v_alloc_add[v_i] := 0;
                    v_remainders[v_i] := 0.0;
                END IF;
            END LOOP;

            v_diff := v_remaining - v_sum_target;

            WHILE v_diff > 0 LOOP
                v_max_rem := -1.0;
                v_max_idx := -1;
                
                FOR v_i IN 1..4 LOOP
                    IF (p_avail[v_i] - v_quota[v_i] - v_alloc_add[v_i]) > 0 AND v_weights[v_i] > 0 THEN
                        IF v_remainders[v_i] > v_max_rem THEN
                            v_max_rem := v_remainders[v_i];
                            v_max_idx := v_i;
                        END IF;
                    END IF;
                END LOOP;

                IF v_max_idx != -1 THEN
                    v_alloc_add[v_max_idx] := v_alloc_add[v_max_idx] + 1;
                    v_remainders[v_max_idx] := -1.0;
                    v_diff := v_diff - 1;
                ELSE
                    EXIT;
                END IF;
            END LOOP;

            DECLARE
                v_progress INT := 0;
            BEGIN
                FOR v_i IN 1..4 LOOP
                    v_quota[v_i] := v_quota[v_i] + v_alloc_add[v_i];
                    v_progress := v_progress + v_alloc_add[v_i];
                END LOOP;
                
                IF v_progress = 0 THEN EXIT; END IF;
                
                v_remaining := v_remaining - v_progress;
            END;
        END LOOP;
        RETURN v_quota;
    END;
    $func$ LANGUAGE plpgsql;

    -- Procedure to run tests
    PROCEDURE run_test(name TEXT, requested INT, avail INT[], expected INT[]) AS $proc$
    DECLARE
        actual INT[];
    BEGIN
        actual := test_lrm(requested, avail);
        IF actual != expected THEN
            RAISE EXCEPTION 'Test % Failed! Expected %, Got %', name, expected, actual;
        ELSE
            RAISE NOTICE 'Test % Passed!', name;
        END IF;
    END;
    $proc$ LANGUAGE plpgsql;

BEGIN
    -- Run cases
    PERFORM run_test('A', 5, ARRAY[5,0,0,0], ARRAY[5,0,0,0]);
    PERFORM run_test('B', 20, ARRAY[2,100,100,100], ARRAY[2,7,7,4]);
    PERFORM run_test('C', 20, ARRAY[0,100,100,100], ARRAY[0,8,7,5]);
    PERFORM run_test('D', 20, ARRAY[2,6,4,3], ARRAY[2,6,4,3]);
    PERFORM run_test('E', 15, ARRAY[2,6,4,3], ARRAY[2,6,4,3]);
    
    -- Additional edge cases
    PERFORM run_test('Zero Inventory', 10, ARRAY[0,0,0,0], ARRAY[0,0,0,0]);
    PERFORM run_test('Exact Capacity Equality', 10, ARRAY[6,2,2,0], ARRAY[6,2,2,0]);
END $$;
