import { test, expect } from '@playwright/test';

/**
 * Written Quote E2E Tests - Full Negotiation Flow
 * Tests complete negotiation cycle from start to acceptance
 */

test.describe('Written Quote - Full Negotiation Flow', () => {
  test('Complete negotiation: Start → Counter → Offer → Accept', async ({ browser }) => {
    test.skip(!process.env.TEST_WITH_SEED_DATA, 'Requires seeded test data');

    // Create two contexts for installer and homeowner
    const installerContext = await browser.newContext();
    const homeownerContext = await browser.newContext();

    const installerPage = await installerContext.newPage();
    const homeownerPage = await homeownerContext.newPage();

    try {
      // Step 1: Installer submits initial quote ($9,000)
      await installerPage.goto('/login');
      await installerPage.fill('input[type="email"]', 'installer@test.com');
      await installerPage.fill('input[type="password"]', 'password');
      await installerPage.click('button[type="submit"]');
      await installerPage.waitForURL('**/installer/**');

      await installerPage.goto('/installer/leads');
      await installerPage.locator('[data-testid="lead-card"]').first().click();
      await installerPage.click('button:has-text("Send Written Quote")');
      
      await installerPage.fill('input[name="basePrice"]', '9000');
      await installerPage.click('button:has-text("Submit Quote")');
      
      await installerPage.waitForResponse(response => 
        response.url().includes('/api/written-quotes/start')
      );

      // Verify quote created
      const quoteResponse = await installerPage.waitForResponse(response => 
        response.url().includes('/api/written-quotes/get')
      );
      const quoteData = await quoteResponse.json();
      expect(quoteData.writtenQuote.currentPrice).toBe(9000);
      expect(quoteData.writtenQuote.currentStatus).toBe('HOMEOWNER_TURN');

      // Step 2: Homeowner counters ($8,500)
      await homeownerPage.goto('/login');
      await homeownerPage.fill('input[type="email"]', 'homeowner@test.com');
      await homeownerPage.fill('input[type="password"]', 'password');
      await homeownerPage.click('button[type="submit"]');
      await homeownerPage.waitForURL('**/homeowner/**');

      await homeownerPage.goto('/homeowner/dashboard');
      await homeownerPage.locator('[data-testid="lead-card"]').first().click();
      await homeownerPage.click('button:has-text("Review Bids")');
      await homeownerPage.click('button:has-text("Written Quote")');

      // Verify price displayed
      await expect(homeownerPage.locator('[data-testid="current-price"]')).toContainText('$9,000');

      await homeownerPage.fill('input[name="counterPrice"]', '8500');
      await homeownerPage.click('button:has-text("Counter-Offer")');

      await homeownerPage.waitForResponse(response => 
        response.url().includes('/counter')
      );

      // Verify price updated
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

    // Login as homeowner
    await page.goto('/login');
    await page.fill('input[type="email"]', 'homeowner@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

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

    await page.goto('/login');
    await page.fill('input[type="email"]', 'homeowner@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

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
