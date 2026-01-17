const { spawn, spawnSync } = require('child_process');
const path = require('path');

function runOrThrow(command, args, options) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error(`${command} exited with code ${result.status}`);
  }
}

// Ensure the `.next` folder is fully removed before starting `next dev`.
runOrThrow(process.execPath, [path.join(__dirname, 'clean-next.js')]);

const nextBin = require.resolve('next/dist/bin/next');

const env = {
  ...process.env,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
};

const child = spawn(process.execPath, [nextBin, 'dev', '--port', '3000'], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code) => process.exit(code ?? 0));
