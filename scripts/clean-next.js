const fs = require('fs');
const path = require('path');

const target = path.join(process.cwd(), '.next');

function sleep(ms) {
  // Synchronous sleep without timers.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function shouldRetry(err) {
  return (
    err &&
    typeof err === 'object' &&
    ['ENOTEMPTY', 'EPERM', 'EBUSY', 'EACCES'].includes(err.code)
  );
}

if (!fs.existsSync(target)) {
  process.exit(0);
}

const delays = [0, 50, 100, 200, 400, 800, 1200, 2000];
let lastErr = null;

for (let attempt = 0; attempt < delays.length; attempt++) {
  try {
    if (delays[attempt] > 0) sleep(delays[attempt]);
    fs.rmSync(target, { recursive: true, force: true });
    process.exit(0);
  } catch (err) {
    lastErr = err;
    if (!shouldRetry(err)) {
      throw err;
    }
  }
}

// If we get here, the directory is likely locked by another process.
// Fail loudly so the caller can close the locking process.
throw lastErr;
