import { test, expect } from '@playwright/test';

test.describe('Debug Purchased Leads Page', () => {
  test('Check if purchased leads page loads and makes API call', async ({ browser }) => {
    const installerContext = await browser.newContext({ storageState: 'tests/e2e/.auth/installer.json' });
    const installerPage = await installerContext.newPage();

    // Enable console logging
    installerPage.on('console', msg => console.log(`[Browser Console]:`, msg.text()));
    
    // Enable request/response logging
    installerPage.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log(`[API Request]: ${request.method()} ${request.url()}`);
      }
    });
    
    installerPage.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`[API Response]: ${response.status()} ${response.url()}`);
      }
    });

    // Navigate to purchased leads page
    console.log('[Test] Navigating to /installer/purchased-leads...');
    await installerPage.goto('/installer/purchased-leads', { waitUntil: 'networkidle' });
    
    console.log('[Test] Page loaded, waiting 2 seconds for any async requests...');
    await installerPage.waitForTimeout(2000);

    // Check what's on the page
    const bodyText = await installerPage.textContent('body');
    console.log('[Test] Page body contains "Available Leads"?', bodyText?.includes('Available Leads'));
    console.log('[Test] Page body contains lead count:', bodyText?.match(/Available Leads[\s\S]*?(\d+)/)?.[1]);

    await installerContext.close();
  });
});
