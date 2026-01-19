const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function shouldRetryRm(err) {
  return (
    err &&
    typeof err === 'object' &&
    ['ENOTEMPTY', 'EPERM', 'EBUSY', 'EACCES'].includes(err.code)
  );
}

function rmDirWithRetries(dirPath) {
  const delays = [0, 50, 100, 200, 400, 800, 1200, 2000];
  let lastErr = null;

  for (let attempt = 0; attempt < delays.length; attempt++) {
    try {
      if (delays[attempt] > 0) sleep(delays[attempt]);
      fs.rmSync(dirPath, { recursive: true, force: true });
      return;
    } catch (err) {
      lastErr = err;
      if (!shouldRetryRm(err)) throw err;
    }
  }

  throw lastErr;
}

function runNextBuildOnce() {
  return new Promise((resolve) => {
    const nextBin = require.resolve('next/dist/bin/next');

    let output = '';

    const child = spawn(process.execPath, [nextBin, 'build'], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: process.env,
    });

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(chunk);
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(chunk);
    });

    child.on('close', (code) => {
      resolve({ code: code ?? 1, output });
    });
  });
}

function isWindowsNextExportRmdirEnotempty(output) {
  if (!output) return false;
  return (
    output.includes('ENOTEMPTY') &&
    output.includes('rmdir') &&
    (output.includes('\\.next\\export') || output.includes('/.next/export'))
  );
}

async function main() {
  const first = await runNextBuildOnce();
  if (first.code === 0) process.exit(0);

  // Next.js on Windows can intermittently fail when removing `.next/export`.
  // If we detect that specific failure mode, delete the folder ourselves and retry once.
  if (isWindowsNextExportRmdirEnotempty(first.output)) {
    const exportDir = path.join(process.cwd(), '.next', 'export');
    try {
      if (fs.existsSync(exportDir)) {
        rmDirWithRetries(exportDir);
      }
    } catch (err) {
      // If cleanup fails, keep the original failure.
      process.exit(first.code);
    }

    const second = await runNextBuildOnce();
    process.exit(second.code);
  }

  process.exit(first.code);
}

main().catch(() => process.exit(1));
