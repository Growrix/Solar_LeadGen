import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  retries: 0,
  webServer: {
    command: process.env.E2E_WEB_COMMAND || 'npm run dev:e2e',
    url: process.env.E2E_BASE_URL || 'http://localhost:3001',
    reuseExistingServer: process.env.CI ? false : true,
    timeout: 120_000
  },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [ ['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }] ],
});
