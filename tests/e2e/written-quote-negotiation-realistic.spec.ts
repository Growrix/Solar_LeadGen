import { test, expect } from '@playwright/test';

/**
 * Written Quote E2E Tests - Realistic User Flow
 * Tests the complete end-to-end written quote negotiation flow
 * 
 * Flow: Installer submits quote → Homeowner responds
 */

test.describe('Written Quote - Realistic Flow', () => {
  test('Installer can submit written quote and homeowner can view it', async ({ browser }) => {
    // Create separate contexts for installer and homeowner
    const installerContext = await browser.newContext({ storageState: 'tests/e2e/.auth/installer.json' });
    const homeownerContext = await browser.newContext({ storageState: 'tests/e2e/.auth/homeowner.json' });

    const installerPage = await installerContext.newPage();
    const homeownerPage = await homeownerContext.newPage();

    try {
      // Step 1: Installer navigates to their purchased leads
      await installerPage.goto('/installer/leads');
      await installerPage.waitForLoadState('networkidle');

      // Find first lead card
      const leadCard = installerPage.locator('[data-testid="lead-card"]').first();
      await expect(leadCard).toBeVisible({ timeout: 10000 });
      await leadCard.click();

      // Step 2: Installer submits written quote
      const sendQuoteButton = installerPage.locator('button:has-text("Send Written Quote")');
      await expect(sendQuoteButton).toBeVisible({ timeout: 5000 });
      await sendQuoteButton.click();

      // Fill quote form
      await installerPage.fill('input[name="basePrice"]', '9000');
      await installerPage.fill('textarea[name="notes"]', 'Initial written quote offer');
      
      const submitButton = installerPage.locator('button:has-text("Submit Quote")');
      await submitButton.click();

      // Wait for success
      await expect(installerPage.locator('text=Quote submitted successfully')).toBeVisible({ timeout: 5000 });

      // Step 3: Homeowner views the written quote
      await homeownerPage.goto('/homeowner/dashboard');
      await homeownerPage.waitForLoadState('networkidle');

      // Find lead card with written quote
      const homeownerLeadCard = homeownerPage.locator('[data-testid="lead-card"]').first();
      await expect(homeownerLeadCard).toBeVisible({ timeout: 10000 });
      await homeownerLeadCard.click();

      // Open written quote tab
      await homeownerPage.click('button:has-text("Review Bids")');
      await homeownerPage.click('button:has-text("Written Quote")');

      // Verify quote is visible
      await expect(homeownerPage.locator('[data-testid="current-price"]')).toContainText('$9,000');

      console.log('✅ Written quote flow test passed');
    } finally {
      await installerContext.close();
      await homeownerContext.close();
    }
  });

  test('Homeowner can counter written quote', async ({ browser }) => {
    const installerContext = await browser.newContext({ storageState: 'tests/e2e/.auth/installer.json' });
    const homeownerContext = await browser.newContext({ storageState: 'tests/e2e/.auth/homeowner.json' });

    const installerPage = await installerContext.newPage();
    const homeownerPage = await homeownerContext.newPage();

    try {
      // Step 1: Homeowner views written quote
      await homeownerPage.goto('/homeowner/dashboard');
      await homeownerPage.waitForLoadState('networkidle');

      const leadCard = homeownerPage.locator('[data-testid="lead-card"]').first();
      await leadCard.click();
      await homeownerPage.click('button:has-text("Review Bids")');
      await homeownerPage.click('button:has-text("Written Quote")');

      // Step 2: Homeowner counters
      await homeownerPage.fill('input[name="counterPrice"]', '8500');
      await homeownerPage.fill('textarea[name="notes"]', 'Can you do $8,500?');
      await homeownerPage.click('button:has-text("Counter-Offer")');

      // Wait for success
      await expect(homeownerPage.locator('text=Counter-offer sent')).toBeVisible({ timeout: 5000 });

      // Step 3: Installer sees counter-offer
      await installerPage.goto('/installer/leads');
      await installerPage.waitForLoadState('networkidle');

      const installerLeadCard = installerPage.locator('[data-testid="lead-card"]:has-text("Counter-offer received")').first();
      await expect(installerLeadCard).toBeVisible({ timeout: 10000 });

      console.log('✅ Counter-offer flow test passed');
    } finally {
      await installerContext.close();
      await homeownerContext.close();
    }
  });
});
