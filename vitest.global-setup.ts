import { spawn, type ChildProcess } from 'child_process';
import path from 'path';

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function isServerUp(origin: string): Promise<boolean> {
  try {
    const response = await fetch(origin, { method: 'GET' });
    return response.status >= 200 && response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(origin: string, timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerUp(origin)) return;
    await sleep(750);
  }
  throw new Error(`Timed out waiting for dev server at ${origin}`);
}

export default async function globalSetup() {
  const origin = process.env.INTEGRATION_BASE_URL || process.env.E2E_BASE_URL || 'http://localhost:3000';

  // Keep auth URLs aligned with the server we target.
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || origin;
  process.env.NEXTAUTH_URL_INTERNAL = process.env.NEXTAUTH_URL_INTERNAL || origin;

  let child: ChildProcess | undefined;

  if (!(await isServerUp(origin))) {
    const scriptPath = path.join(process.cwd(), 'scripts', 'dev-e2e.js');
    child = spawn(process.execPath, [scriptPath], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || origin,
      },
    });

    await waitForServer(origin, 120_000);
  }

  return async () => {
    if (!child) return;

    try {
      child.kill();
    } catch {
      // ignore
    }
  };
}
