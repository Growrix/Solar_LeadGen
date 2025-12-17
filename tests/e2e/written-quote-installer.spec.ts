import { test, expect } from '@playwright/test';

/**
 * Written Quote E2E Tests - Installer Flow
 * Tests installer's ability to submit written quotes
 */

test.describe('Written Quote - Installer Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as installer (adjust credentials based on your test data)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'installer@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/installer/**');
  });

  test('Installer can submit written quote', async ({ page }) => {
    // Navigate to assigned lead
    await page.goto('/installer/leads');
    await expect(page.locator('h1')).toContainText('My Leads');

    // Open first available lead
    const firstLead = page.locator('[data-testid="lead-card"]').first();
    await firstLead.click();

    // Wait for lead details page
    await page.waitForURL('**/installer/leads/**');

    // Open QuoteBuilderModal in written-quote mode
    const writeQuoteBtn = page.locator('button:has-text("Send Written Quote")');
    if (await writeQuoteBtn.isVisible()) {
      await writeQuoteBtn.click();
    } else {
      // Alternative: click "Place Bid" and check for written-quote mode option
      await page.click('button:has-text("Place Bid")');
    }

    // Wait for modal to open
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Verify modal is in written-quote mode
    await expect(page.locator('button:has-text("Submit Quote")')).toBeVisible();

    // Fill required fields (adjust selectors based on your QuoteBuilderModal)
    // System Selection
    await page.selectOption('select[name="systemSize"]', { label: '6.6 kW' });
    
    // Pricing
    await page.fill('input[name="basePrice"]', '8500');
    
    // Submit quote
    await page.click('button:has-text("Submit Quote")');

    // Wait for API call
    await page.waitForResponse(response => 
      response.url().includes('/api/written-quotes/start') && response.status() === 200
    );

    // Verify success notification
    await expect(page.locator('[role="status"]')).toContainText('Quote submitted');

    // Modal should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('Installer can revise written quote after homeowner counter', async ({ page }) => {
    // This test requires setup: a written quote with status HOMEOWNER_TURN
    test.skip(!process.env.TEST_WITH_SEED_DATA, 'Requires seeded test data');

    // Navigate to lead with existing written quote
    await page.goto('/installer/leads');
    const leadWithQuote = page.locator('[data-testid="lead-card"]:has-text("Counter-offer received")').first();
    await leadWithQuote.click();

    // Open written quote panel
    await page.click('button:has-text("Review Written Quote")');

    // Verify negotiation panel visible
    await expect(page.locator('[data-testid="written-quote-panel"]')).toBeVisible();

    // See homeowner's counter price
    await expect(page.locator('[data-testid="current-price"]')).toContainText('$8,000');

    // Submit revised offer
    await page.fill('input[name="revisedPrice"]', '8250');
    await page.fill('textarea[name="notes"]', 'Meeting you halfway on price');
    await page.click('button:has-text("Send Revised Quote")');

    // Wait for API call
    await page.waitForResponse(response => 
      response.url().includes('/api/written-quotes/') && 
      response.url().includes('/offer') && 
      response.status() === 200
    );

    // Verify success
    await expect(page.locator('[role="status"]')).toContainText('Offer sent');

    // Verify price updated
    await expect(page.locator('[data-testid="current-price"]')).toContainText('$8,250');
  });

  test('Installer can view written quote history', async ({ page }) => {
    test.skip(!process.env.TEST_WITH_SEED_DATA, 'Requires seeded test data');

    // Navigate to lead with written quote history
    await page.goto('/installer/leads');
    const leadWithQuote = page.locator('[data-testid="lead-card"]').first();
    await leadWithQuote.click();

    // Open written quote panel
    await page.click('button:has-text("Review Written Quote")');

    // Expand history
    await page.click('button:has-text("View History")');

    // Verify events displayed
    await expect(page.locator('[data-testid="quote-event"]')).toHaveCount(3);
    await expect(page.locator('[data-testid="quote-event"]').first()).toContainText('Initial quote');
    await expect(page.locator('[data-testid="quote-event"]').nth(1)).toContainText('Counter-offer');
    await expect(page.locator('[data-testid="quote-event"]').nth(2)).toContainText('Revised offer');
  });
});
