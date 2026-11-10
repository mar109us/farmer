let passedCount = 0;
let failedCount = 0;

export function expectEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected} but got ${actual}`);
  }
}

export function test(name, callback) {
  try {
    callback();
    passedCount = passedCount + 1;
    console.log(`PASS: ${name}`);
  } catch (error) {
    failedCount = failedCount + 1;
    console.error(`FAIL: ${name}: ${error.message}`);
  }
}

export function logTestSummary() {
  console.log(`${passedCount} passed, ${failedCount} failed`);
}
