import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  globalSetup: 'tests/e2e/global-setup.ts',
  timeout: 30_000,
  retries: 0,
  // Keep base URL and NextAuth URL in sync for E2E (prevents callbackUrl redirects to the wrong origin/port).
  // The webServer process inherits env from this config.
  webServer: {
    command: process.env.E2E_WEB_COMMAND || 'npm run dev:e2e',
    url: process.env.E2E_BASE_URL || 'http://localhost:3001',
    reuseExistingServer: process.env.CI ? false : true,
    timeout: 120_000,
    env: {
      ...process.env,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.E2E_BASE_URL || 'http://localhost:3001',
      NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL || process.env.E2E_BASE_URL || 'http://localhost:3001',
    },
  },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3001',
    trace: 'on', // Capture full auth flow for debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  reporter: [ ['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }] ],
  
  // Setup projects for authentication storage state
  projects: [
    // Setup: Run auth setup before all tests
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    
    // Tests that use homeowner auth
    {
      name: 'homeowner-tests',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/homeowner.json',
      },
      dependencies: ['setup'],
      testMatch: /.*homeowner\.spec\.ts/,
    },
    
    // Tests that use installer auth
    {
      name: 'installer-tests',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/installer.json',
      },
      dependencies: ['setup'],
      testMatch: /.*installer\.spec\.ts/,
    },
    
    // Tests that need negotiation (both roles)
    {
      name: 'negotiation-tests',
      use: {
        ...devices['Desktop Chrome'],
        // Negotiation tests will use helpers to switch between roles
      },
      dependencies: ['setup'],
      testMatch: /.*negotiation\.spec\.ts/,
    },
  ],
});
