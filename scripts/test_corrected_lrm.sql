-- Comprehensive test script to verify LRM allocation logic and invariants
DO $$
DECLARE
  v_categories TEXT[] := ARRAY['Nursing', 'General Knowledge', 'English', 'Bangla'];
  v_base_weights NUMERIC[] := ARRAY[0.60, 0.15, 0.15, 0.10];

  FUNCTION test_lrm(p_requested INT, p_avail INT[]) RETURNS INT[] AS $func$
  DECLARE
    v_quota INT[] := ARRAY[0, 0, 0, 0];
    v_weights NUMERIC[] := ARRAY[0.0, 0.0, 0.0, 0.0];
    v_total_avail INT := 0;
    v_weight_sum NUMERIC := 0.0;
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
    v_i INT;
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

    v_requested_count_capped := LEAST(p_requested, v_total_avail);
    v_remaining := v_requested_count_capped;

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

      v_snap_remaining := v_remaining;
      v_snap_weight_active_sum := v_weight_active_sum;
      v_cap_found := FALSE;

      FOR v_i IN 1..4 LOOP
        IF p_avail[v_i] > v_quota[v_i] AND v_weights[v_i] > 0 THEN
          v_rem_cap := p_avail[v_i] - v_quota[v_i];
          v_share := v_snap_remaining * (v_weights[v_i] / v_snap_weight_active_sum);
          IF v_share >= v_rem_cap THEN
            v_cap_found := TRUE;
          END IF;
        END IF;
      END LOOP;

      IF v_cap_found THEN
        FOR v_i IN 1..4 LOOP
          IF p_avail[v_i] > v_quota[v_i] AND v_weights[v_i] > 0 THEN
            v_rem_cap := p_avail[v_i] - v_quota[v_i];
            v_share := v_snap_remaining * (v_weights[v_i] / v_snap_weight_active_sum);
            IF v_share >= v_rem_cap THEN
              v_cap_alloc := v_rem_cap;
              v_quota[v_i] := v_quota[v_i] + v_cap_alloc;
              v_remaining := v_remaining - v_cap_alloc;
              v_weights[v_i] := 0.0;
            END IF;
          END IF;
        END LOOP;
        CONTINUE;
      END IF;

      v_sum_target := 0;
      FOR v_i IN 1..4 LOOP
        IF p_avail[v_i] > v_quota[v_i] AND v_weights[v_i] > 0 THEN
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

      FOR v_i IN 1..4 LOOP
        v_quota[v_i] := v_quota[v_i] + v_alloc_add[v_i];
      END LOOP;
      v_remaining := v_remaining - v_sum_target;

      v_diff := v_remaining;
      WHILE v_diff > 0 LOOP
        v_max_rem := -1.0;
        v_max_idx := -1;
        FOR v_i IN 1..4 LOOP
          IF (p_avail[v_i] - v_quota[v_i]) > 0 AND v_remainders[v_i] > v_max_rem THEN
            v_max_rem := v_remainders[v_i];
            v_max_idx := v_i;
          END IF;
        END LOOP;

        IF v_max_idx = -1 THEN EXIT; END IF;

        v_quota[v_max_idx] := v_quota[v_max_idx] + 1;
        v_remaining := v_remaining - 1;
        v_remainders[v_max_idx] := -1.0;
        v_diff := v_diff - 1;
      END LOOP;

      EXIT;
    END LOOP;

    RETURN v_quota;
  END;
  $func$ LANGUAGE plpgsql;

  PROCEDURE run_test(p_name TEXT, p_req INT, p_avail INT[], p_expected INT[]) IS
    v_actual INT[];
  BEGIN
    v_actual := test_lrm(p_req, p_avail);
    IF v_actual != p_expected THEN
      RAISE EXCEPTION 'Test % Failed! Expected %, Got %', p_name, p_expected, v_actual;
    ELSE
      RAISE NOTICE 'Test % Passed!', p_name;
    END IF;
  END;
BEGIN
  run_test('Case A', 5, ARRAY[5,0,0,0], ARRAY[5,0,0,0]);
  run_test('Case B', 20, ARRAY[2,100,100,100], ARRAY[2,7,7,4]);
  run_test('Case C', 20, ARRAY[0,100,100,100], ARRAY[0,8,7,5]);
  run_test('Case D', 20, ARRAY[2,6,4,3], ARRAY[2,6,4,3]);
  run_test('Case E', 15, ARRAY[2,6,4,3], ARRAY[2,6,4,3]);
  run_test('Zero Inventory', 10, ARRAY[0,0,0,0], ARRAY[0,0,0,0]);
  run_test('Exact Capacity Equality', 10, ARRAY[6,2,2,0], ARRAY[6,2,2,0]);
END $$;
