import { test, expect } from '@playwright/test';

/**
 * Written Quote E2E Tests - Homeowner Flow
 * Tests homeowner's ability to review, counter, and accept written quotes
 * 
 * Authentication: Uses Playwright storage state (tests/e2e/.auth/homeowner.json)
 * Session is pre-established via auth.setup.ts
 */

test.describe('Written Quote - Homeowner Flow', () => {
  // No login needed - storage state provides authenticated session

  test('Homeowner can view written quote in tab switcher', async ({ page }) => {
    test.skip(!process.env.TEST_WITH_SEED_DATA, 'Requires seeded test data');

    // Navigate to lead with written quote
    await page.goto('/homeowner/dashboard');
    const leadWithQuote = page.locator('[data-testid="lead-card"]:has-text("Written Quote")').first();
    await leadWithQuote.click();

    // Open bidding review modal
    await page.click('button:has-text("Review Bids")');

    // Wait for modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Verify tab switcher present
    await expect(page.locator('button:has-text("Marketplace Bids")')).toBeVisible();
    await expect(page.locator('button:has-text("Written Quote")')).toBeVisible();

    // Switch to Written Quote tab
    await page.click('button:has-text("Written Quote")');

    // Verify written quote content displayed
    await expect(page.locator('[data-testid="written-quote-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="quote-status"]')).toBeVisible();
  });

  test('Homeowner can counter written quote', async ({ page }) => {
    test.skip(!process.env.TEST_WITH_SEED_DATA, 'Requires seeded test data');

    // Navigate to lead and open modal
    await page.goto('/homeowner/dashboard');
    const leadWithQuote = page.locator('[data-testid="lead-card"]').first();
    await leadWithQuote.click();
    await page.click('button:has-text("Review Bids")');

    // Switch to Written Quote tab
    await page.click('button:has-text("Written Quote")');

    // Verify current price
    await expect(page.locator('[data-testid="current-price"]')).toContainText('$8,500');

    // Enter counter price
    await page.fill('input[name="counterPrice"]', '8000');
    await page.fill('textarea[name="notes"]', 'Can you work with this budget?');

    // Submit counter-offer
    await page.click('button:has-text("Counter-Offer")');

    // Wait for API call
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/written-quotes/') && 
      response.url().includes('/counter') && 
      response.status() === 200
    );

    expect(response.ok()).toBeTruthy();

    // Verify success notification
    await expect(page.locator('[role="status"]')).toContainText('Counter-offer sent');

    // Verify price updated
    await expect(page.locator('[data-testid="current-price"]')).toContainText('$8,000');

    // Verify status changed to INSTALLER_TURN
    await expect(page.locator('[data-testid="quote-status"]')).toContainText('Installer');
  });

  test('Homeowner can accept written quote', async ({ page }) => {
    test.skip(!process.env.TEST_WITH_SEED_DATA, 'Requires seeded test data');

    // Navigate to lead and open modal
    await page.goto('/homeowner/dashboard');
    const leadWithQuote = page.locator('[data-testid="lead-card"]').first();
    await leadWithQuote.click();
    await page.click('button:has-text("Review Bids")');

    // Switch to Written Quote tab
    await page.click('button:has-text("Written Quote")');

    // Verify accept button visible (homeowner's turn)
    await expect(page.locator('button:has-text("Accept Quote")')).toBeVisible();

    // Click accept
    await page.click('button:has-text("Accept Quote")');

    // Confirm in confirmation dialog if present
    const confirmBtn = page.locator('button:has-text("Confirm")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Wait for API call
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/written-quotes/') && 
      response.url().includes('/done') && 
      response.status() === 200
    );

    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.writtenQuote.currentStatus).toBe('ACCEPTED');

    // Verify success notification
    await expect(page.locator('[role="status"]')).toContainText('Quote accepted');

    // Verify status updated
    await expect(page.locator('[data-testid="quote-status"]')).toContainText('Accepted');

    // Verify action buttons disabled
    await expect(page.locator('button:has-text("Counter-Offer")')).toBeDisabled();
    await expect(page.locator('button:has-text("Accept Quote")')).toBeDisabled();
  });

  test('Homeowner can reject written quote', async ({ page }) => {
    test.skip(!process.env.TEST_WITH_SEED_DATA, 'Requires seeded test data');

    // Navigate to lead and open modal
    await page.goto('/homeowner/dashboard');
    const leadWithQuote = page.locator('[data-testid="lead-card"]').first();
    await leadWithQuote.click();
    await page.click('button:has-text("Review Bids")');

    // Switch to Written Quote tab
    await page.click('button:has-text("Written Quote")');

    // Click reject
    await page.click('button:has-text("Reject")');

    // Confirm rejection
    const confirmBtn = page.locator('button:has-text("Confirm")');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Wait for API call
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/written-quotes/') && 
      response.url().includes('/done') && 
      response.status() === 200
    );

    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();
    expect(responseBody.writtenQuote.currentStatus).toBe('REJECTED');

    // Verify status updated
    await expect(page.locator('[data-testid="quote-status"]')).toContainText('Rejected');
  });

  test('Homeowner cannot counter when installer has the turn', async ({ page }) => {
    test.skip(!process.env.TEST_WITH_SEED_DATA, 'Requires seeded test data');

    // Setup: written quote with status INSTALLER_TURN
    await page.goto('/homeowner/dashboard');
    const leadWithQuote = page.locator('[data-testid="lead-card"]:has-text("Waiting for installer")').first();
    await leadWithQuote.click();
    await page.click('button:has-text("Review Bids")');

    // Switch to Written Quote tab
    await page.click('button:has-text("Written Quote")');

    // Verify action buttons disabled
    await expect(page.locator('button:has-text("Counter-Offer")')).toBeDisabled();
    await expect(page.locator('button:has-text("Accept Quote")')).toBeDisabled();

    // Verify status message
    await expect(page.locator('[data-testid="status-message"]')).toContainText("Waiting for installer");
  });
});
