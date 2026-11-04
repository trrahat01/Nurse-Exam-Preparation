const categories = ['Nursing', 'General Knowledge', 'English', 'Bangla'];
const baseWeights = [0.60, 0.15, 0.15, 0.10];

function runLrm(requestedCount, avail) {
  let totalAvail = avail.reduce((a, b) => a + b, 0);
  let requestedCountCapped = Math.min(requestedCount, totalAvail);
  let remaining = requestedCountCapped;
  let quota = [0, 0, 0, 0];

  // Initialize weights
  let weights = [0, 0, 0, 0];
  let weightSum = 0;
  for (let i = 0; i < 4; i++) {
    if (avail[i] > 0) {
      weights[i] = baseWeights[i];
      weightSum += baseWeights[i];
    } else {
      weights[i] = 0;
    }
  }
  if (weightSum > 0) {
    for (let i = 0; i < 4; i++) {
      weights[i] = weights[i] / weightSum;
    }
  }

  // Capacity-first allocation loop
  for (let iter = 0; iter < 10; iter++) {
    if (remaining <= 0) break;

    let activeCount = 0;
    let weightActiveSum = 0;
    for (let i = 0; i < 4; i++) {
      if (avail[i] > quota[i] && weights[i] > 0) {
        activeCount++;
        weightActiveSum += weights[i];
      }
    }

    if (activeCount === 0 || weightActiveSum <= 0) break;

    // Snapshot
    let snapRemaining = remaining;
    let snapWeightActiveSum = weightActiveSum;
    let capFound = false;

    for (let i = 0; i < 4; i++) {
      if (avail[i] > quota[i] && weights[i] > 0) {
        let remCap = avail[i] - quota[i];
        let share = snapRemaining * (weights[i] / snapWeightActiveSum);
        if (share >= remCap) {
          capFound = true;
        }
      }
    }

    if (capFound) {
      for (let i = 0; i < 4; i++) {
        if (avail[i] > quota[i] && weights[i] > 0) {
          let remCap = avail[i] - quota[i];
          let share = snapRemaining * (weights[i] / snapWeightActiveSum);
          if (share >= remCap) {
            let capAlloc = remCap;
            quota[i] += capAlloc;
            remaining -= capAlloc;
            weights[i] = 0; // Remove from further distribution
          }
        }
      }
      continue;
    }

    // No capacity caps in this pass: floor allocation & largest remainder
    let sumTarget = 0;
    let allocAdd = [0, 0, 0, 0];
    let remainders = [0, 0, 0, 0];

    for (let i = 0; i < 4; i++) {
      if (avail[i] > quota[i] && weights[i] > 0) {
        let share = remaining * (weights[i] / weightActiveSum);
        let floorVal = Math.floor(share);
        allocAdd[i] = floorVal;
        remainders[i] = share - floorVal;
        sumTarget += floorVal;
      } else {
        allocAdd[i] = 0;
        remainders[i] = 0;
      }
    }

    for (let i = 0; i < 4; i++) {
      quota[i] += allocAdd[i];
    }
    remaining -= sumTarget;

    // Distribute leftover seats
    let diff = remaining;
    while (diff > 0) {
      let maxRem = -1.0;
      let maxIdx = -1;
      for (let i = 0; i < 4; i++) {
        if (avail[i] - quota[i] > 0 && remainders[i] > maxRem) {
          maxRem = remainders[i];
          maxIdx = i;
        }
      }

      if (maxIdx === -1) break;

      quota[maxIdx] += 1;
      remaining -= 1;
      remainders[maxIdx] = -1.0;
      diff -= 1;
    }

    break;
  }

  // Invariant verification
  let sumQuota = quota.reduce((a, b) => a + b, 0);
  if (remaining !== requestedCountCapped - sumQuota) {
    throw new Error(`Invariant Violation: remaining (${remaining}) !== requestedCapped (${requestedCountCapped}) - sumQuota (${sumQuota})`);
  }
  for (let i = 0; i < 4; i++) {
    if (quota[i] < 0) throw new Error(`Negative quota for ${categories[i]}: ${quota[i]}`);
    if (quota[i] > avail[i]) throw new Error(`Quota exceeds inventory for ${categories[i]}: quota=${quota[i]}, avail=${avail[i]}`);
  }

  return quota;
}

// Test cases
const tests = [
  { name: 'Case A', req: 5, avail: [5, 0, 0, 0], expected: [5, 0, 0, 0] },
  { name: 'Case B', req: 20, avail: [2, 100, 100, 100], expected: [2, 7, 7, 4] },
  { name: 'Case C', req: 20, avail: [0, 100, 100, 100], expected: [0, 8, 7, 5] },
  { name: 'Case D', req: 20, avail: [2, 6, 4, 3], expected: [2, 6, 4, 3] },
  { name: 'Case E', req: 15, avail: [2, 6, 4, 3], expected: [2, 6, 4, 3] },
  { name: 'Zero Inventory', req: 10, avail: [0, 0, 0, 0], expected: [0, 0, 0, 0] },
  { name: 'Exact Capacity Equality', req: 10, avail: [6, 2, 2, 0], expected: [6, 2, 2, 0] },
  { name: 'Exhausted Inventory Partial', req: 25, avail: [5, 5, 5, 5], expected: [5, 5, 5, 5] },
  { name: 'Simultaneous Capacity Caps', req: 18, avail: [2, 6, 4, 3], expected: [2, 6, 4, 3] }
];

let failed = false;
for (const t of tests) {
  const result = runLrm(t.req, t.avail);
  const match = JSON.stringify(result) === JSON.stringify(t.expected);
  console.log(`${t.name}: ${match ? 'PASS' : 'FAIL'} | Got: ${JSON.stringify(result)} | Expected: ${JSON.stringify(t.expected)}`);
  if (!match) failed = true;
}

if (failed) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED!');
}
