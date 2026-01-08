import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  retries: 0,
  webServer: {
    command: process.env.E2E_WEB_COMMAND || 'npm run dev:e2e',
    url: process.env.E2E_BASE_URL || 'http://localhost:3001',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXTAUTH_URL: process.env.E2E_BASE_URL || 'http://localhost:3001',
      NEXTAUTH_URL_INTERNAL: process.env.E2E_BASE_URL || 'http://localhost:3001',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'e2e-nextauth-secret-not-for-production',
    },
  },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3001',
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [ ['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }] ],
});
