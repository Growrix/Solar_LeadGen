import { defineConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

function loadSimpleDotEnvFilesIntoProcessEnv(filenames: string[]) {
  for (const filename of filenames) {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;

    const raw = fs.readFileSync(filePath, 'utf8');
    for (const lineRaw of raw.split(/\r?\n/)) {
      const line = lineRaw.trim();
      if (!line || line.startsWith('#')) continue;

      const eqIndex = line.indexOf('=');
      if (eqIndex <= 0) continue;

      const key = line.slice(0, eqIndex).trim();
      if (!key) continue;
      if (process.env[key] !== undefined) continue;

      let value = line.slice(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  }
}

// Ensure Playwright runner sees `.env` (Next.js loads it for the web server, but Playwright does not).
loadSimpleDotEnvFilesIntoProcessEnv(['.env', '.env.local']);

// Windows/Node can prefer IPv6 (::1) for `localhost`, while the dev server may only be reachable via IPv4.
// This can cause intermittent `ECONNREFUSED ::1:3000` in Playwright's Node-side request client.
if (!process.env.NODE_OPTIONS?.includes('--dns-result-order=ipv4first')) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --dns-result-order=ipv4first`.trim();
}

// Some Playwright versions do not type-support `webServer.env`.
// Ensure required env vars are present for the spawned web server.
const E2E_BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

// IMPORTANT: Override any production `.env` values.
// If NEXTAUTH_URL points to https, NextAuth will set Secure cookies that are not sent over http://localhost,
// causing middleware to see no token and redirect to `/?callbackUrl=...`.
process.env.NEXTAUTH_URL = E2E_BASE_URL;
process.env.NEXTAUTH_URL_INTERNAL = E2E_BASE_URL;
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'e2e-nextauth-secret-not-for-production';
process.env.NEXTAUTH_DEBUG = process.env.NEXTAUTH_DEBUG || 'false';
process.env.NEWS_ENGINE_KEY_VAULT_MASTER_KEY = process.env.NEWS_ENGINE_KEY_VAULT_MASTER_KEY ?? '';
process.env.NEWS_KEY_VAULT_MASTER_KEY = process.env.NEWS_KEY_VAULT_MASTER_KEY ?? '';
process.env.NEXT_PUBLIC_NEWS_ENGINE_E2E_FREE_IMAGE_URL =
  process.env.NEXT_PUBLIC_NEWS_ENGINE_E2E_FREE_IMAGE_URL ||
  `${E2E_BASE_URL}/api/e2e/test-image`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  retries: 0,
  webServer: {
    command: process.env.E2E_WEB_COMMAND || 'npm run dev:e2e',
    url: E2E_BASE_URL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: E2E_BASE_URL,
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [ ['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }] ],
});
