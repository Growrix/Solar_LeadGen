import { test, expect } from '@playwright/test';

/**
 * Written Quote E2E Tests - Full Negotiation Flow
 * Tests complete negotiation cycle using actual user flow (no seed data assumptions)
 */

test.describe('Written Quote - Full Negotiation Flow', () => {
  test('Complete negotiation: Installer submits → Homeowner views', async ({ browser }) => {
    // Create two contexts for installer and homeowner using storage state
    const installerContext = await browser.newContext({ storageState: 'tests/e2e/.auth/installer.json' });
    const homeownerContext = await browser.newContext({ storageState: 'tests/e2e/.auth/homeowner.json' });

    const installerPage = await installerContext.newPage();
    const homeownerPage = await homeownerContext.newPage();

    try {
      // Step 1: Installer navigates to purchased leads
      await installerPage.goto('/installer/purchased-leads');
      await installerPage.waitForLoadState('networkidle');

      // Find and click first lead card
      const installerLeadCard = installerPage.locator('[data-testid="lead-card"]').first();
      await expect(installerLeadCard).toBeVisible({ timeout: 10000 });

      // Click "Submit Quote" button on the lead card
      const submitQuoteButton = installerPage.locator('button:has-text("Submit Quote")').first();
      await expect(submitQuoteButton).toBeVisible({ timeout: 5000 });
      await submitQuoteButton.click();

      await installerPage.fill('input[name="basePrice"]', '9000');
      await installerPage.fill('textarea[name="notes"]', 'Initial quote');
      
      const submitButton = installerPage.locator('button:has-text("Submit Quote")');
      await submitButton.click();

      // Wait for success
      await expect(installerPage.locator('text=Quote submitted')).toBeVisible({ timeout: 5000 });

      // Step 2: Homeowner views written quote
      await homeownerPage.goto('/homeowner/dashboard');
      await homeownerPage.waitForLoadState('networkidle');

      const homeownerLeadCard = homeownerPage.locator('[data-testid="lead-card"]').first();
      await expect(homeownerLeadCard).toBeVisible({ timeout: 10000 });
      await homeownerLeadCard.click();

      await homeownerPage.click('button:has-text("Review Bids")');
      await homeownerPage.click('button:has-text("Written Quote")');

      // Verify quote is visible
      await expect(homeownerPage.locator('[data-testid="current-price"]')).toContainText('$9,000', { timeout: 5000 });
      await expect(homeownerPage.locator('[data-testid="current-price"]')).toContainText('$8,500');

      // Step 3: Installer revises ($8,750)
      await installerPage.reload();
      await installerPage.click('button:has-text("Review Written Quote")');

      // Verify counter price visible
      await expect(installerPage.locator('[data-testid="current-price"]')).toContainText('$8,500');

      await installerPage.fill('input[name="revisedPrice"]', '8750');
      await installerPage.click('button:has-text("Send Revised Quote")');

      await installerPage.waitForResponse(response => 
        response.url().includes('/offer')
      );

      // Step 4: Homeowner accepts
      await homeownerPage.reload();
      await homeownerPage.click('button:has-text("Written Quote")');

      // Verify final price
      await expect(homeownerPage.locator('[data-testid="current-price"]')).toContainText('$8,750');

      await homeownerPage.click('button:has-text("Accept Quote")');

      const doneResponse = await homeownerPage.waitForResponse(response => 
        response.url().includes('/done')
      );

      const finalQuote = await doneResponse.json();
      expect(finalQuote.writtenQuote.currentPrice).toBe(8750);
      expect(finalQuote.writtenQuote.currentStatus).toBe('ACCEPTED');

      // Verify history has 4 events
      await homeownerPage.click('button:has-text("View History")');
      await expect(homeownerPage.locator('[data-testid="quote-event"]')).toHaveCount(4);

      // Verify events in order
      const events = await homeownerPage.locator('[data-testid="quote-event"]').all();
      await expect(events[0]).toContainText('$9,000');
      await expect(events[1]).toContainText('$8,500');
      await expect(events[2]).toContainText('$8,750');
      await expect(events[3]).toContainText('Accepted');

    } finally {
      await installerContext.close();
      await homeownerContext.close();
    }
  });

  test('Negotiation history displays correctly', async ({ page }) => {
    test.skip(!process.env.TEST_WITH_SEED_DATA, 'Requires seeded test data with complete negotiation');

    // Navigate to completed quote
    await page.goto('/homeowner/dashboard');
    await page.locator('[data-testid="lead-card"]:has-text("Accepted")').first().click();
    await page.click('button:has-text("Review Bids")');
    await page.click('button:has-text("Written Quote")');

    // Expand history
    await page.click('button:has-text("View History")');

    // Verify timeline
    const events = await page.locator('[data-testid="quote-event"]').all();
    expect(events.length).toBeGreaterThanOrEqual(2);

    // Verify each event has required info
    for (const event of events) {
      await expect(event.locator('[data-testid="event-actor"]')).toBeVisible();
      await expect(event.locator('[data-testid="event-timestamp"]')).toBeVisible();
      await expect(event.locator('[data-testid="event-price"]')).toBeVisible();
    }

    // Verify chronological order (most recent first)
    const timestamps = await page.locator('[data-testid="event-timestamp"]').allTextContents();
    for (let i = 1; i < timestamps.length; i++) {
      const prevTime = new Date(timestamps[i-1]);
      const currTime = new Date(timestamps[i]);
      expect(prevTime.getTime()).toBeGreaterThanOrEqual(currTime.getTime());
    }
  });

  test('Price formatting is consistent throughout negotiation', async ({ page }) => {
    test.skip(!process.env.TEST_WITH_SEED_DATA, 'Requires seeded test data');

    await page.goto('/homeowner/dashboard');
    await page.locator('[data-testid="lead-card"]').first().click();
    await page.click('button:has-text("Review Bids")');
    await page.click('button:has-text("Written Quote")');

    // Current price should be formatted with $ and commas
    const priceText = await page.locator('[data-testid="current-price"]').textContent();
    expect(priceText).toMatch(/\$\d{1,3}(,\d{3})*/);

    // History prices should also be formatted
    await page.click('button:has-text("View History")');
    const eventPrices = await page.locator('[data-testid="event-price"]').allTextContents();
    
    for (const price of eventPrices) {
      expect(price).toMatch(/\$\d{1,3}(,\d{3})*/);
    }
  });
});
