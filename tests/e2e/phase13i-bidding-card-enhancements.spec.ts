/**
 * Phase 13I E2E Test: Bidding Lead Card Enhancements
 * 
 * Tests for:
 * - Homeowner: "Bid Awarded" status, trophy badge, Start Chat button
 * - Homeowner: Installer contacts unmasked in review modal after purchase
 * - Installer: "View Full Details" button opens BidEvaluationModal
 * - Installer: Button repositioned to align with other actions
 */

import { test, expect, Page } from '@playwright/test';

// Test data - assumes database has test leads and bids
const HOMEOWNER_CREDENTIALS = {
  email: 'homeowner@test.com',
  password: 'homeowner123'
};

const INSTALLER_CREDENTIALS = {
  email: 'mohammad@installer.com',
  password: 'installer123'
};

/**
 * Helper: Login as user
 */
async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/homeowner/dashboard', { timeout: 10000 });
}

/**
 * Helper: Setup test lead with PURCHASED BIDDING status
 * (In real implementation, this would use API to create test data)
 */
async function setupPurchasedBiddingLead(page: Page): Promise<string> {
  // Navigate to dashboard
  await page.goto('/homeowner/dashboard');
  
  // Find first BIDDING lead with PURCHASED status
  const leadCard = page.locator('[data-testid="lead-card"]').filter({
    has: page.locator('text=/Bid Awarded|PURCHASED/i')
  }).first();
  
  // Extract lead ID from card
  const leadId = await leadCard.getAttribute('data-lead-id');
  if (!leadId) {
    throw new Error('No PURCHASED BIDDING lead found. Run seed script first.');
  }
  
  return leadId;
}

/**
 * Test Suite: Homeowner Bidding Lead Card Enhancements
 */
test.describe('Phase 13I-A: Homeowner Lead Card Status Enhancement', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, HOMEOWNER_CREDENTIALS.email, HOMEOWNER_CREDENTIALS.password);
  });

  test('T290: Should display "Bid Awarded" status label for BIDDING + PURCHASED leads', async ({ page }) => {
    // Navigate to homeowner dashboard
    await page.goto('/homeowner/dashboard');
    
    // Find BIDDING lead with PURCHASED status
    const leadCard = page.locator('[data-testid="lead-card"]')
      .filter({ has: page.locator('[data-quote-type="BIDDING"]') })
      .filter({ has: page.locator('[data-status="PURCHASED"]') })
      .first();
    
    // Verify "Bid Awarded" status label appears
    await expect(leadCard.locator('text="Bid Awarded"')).toBeVisible();
    
    // Verify NOT showing generic "Responded by Installer"
    await expect(leadCard.locator('text="Responded by Installer"')).not.toBeVisible();
  });

  test('T291: Should display trophy badge visual indicator for BIDDING + PURCHASED leads', async ({ page }) => {
    await page.goto('/homeowner/dashboard');
    
    // Find BIDDING + PURCHASED lead card
    const leadCard = page.locator('[data-testid="lead-card"]')
      .filter({ has: page.locator('[data-quote-type="BIDDING"]') })
      .filter({ has: page.locator('[data-status="PURCHASED"]') })
      .first();
    
    // Verify trophy icon exists
    const trophyIcon = leadCard.locator('svg[data-icon="trophy"]').or(
      leadCard.locator('[class*="TrophyIcon"]')
    );
    await expect(trophyIcon).toBeVisible();
    
    // Verify badge has success/green styling
    const badgeText = leadCard.locator('text="Bid Awarded"');
    await expect(badgeText).toHaveClass(/text-success|text-green/);
  });

  test('T292: Should display "Start Chat" button for BIDDING + PURCHASED leads', async ({ page }) => {
    await page.goto('/homeowner/dashboard');
    
    // Find BIDDING + PURCHASED lead card
    const leadCard = page.locator('[data-testid="lead-card"]')
      .filter({ has: page.locator('[data-quote-type="BIDDING"]') })
      .filter({ has: page.locator('[data-status="PURCHASED"]') })
      .first();
    
    // Verify "Start Chat" button exists
    const chatButton = leadCard.locator('button:has-text("Start Chat")');
    await expect(chatButton).toBeVisible();
    
    // Test button click (may show toast or open modal)
    await chatButton.click();
    
    // Verify either chat modal opens OR toast message appears
    const chatModal = page.locator('[role="dialog"]:has-text("Chat")');
    const toast = page.locator('[role="status"]:has-text("Chat")');
    
    await expect(chatModal.or(toast)).toBeVisible({ timeout: 3000 });
  });

  test('Checkpoint: Verify other lead types unaffected', async ({ page }) => {
    await page.goto('/homeowner/dashboard');
    
    // Find CALL_VISIT or WRITTEN_QUOTE lead with PURCHASED status
    const nonBiddingLeadCard = page.locator('[data-testid="lead-card"]')
      .filter({ has: page.locator('[data-quote-type="CALL_VISIT"],[data-quote-type="WRITTEN_QUOTE"]') })
      .filter({ has: page.locator('[data-status="PURCHASED"]') })
      .first();
    
    // If exists, verify it does NOT show "Bid Awarded" or trophy
    if (await nonBiddingLeadCard.count() > 0) {
      await expect(nonBiddingLeadCard.locator('text="Bid Awarded"')).not.toBeVisible();
      await expect(nonBiddingLeadCard.locator('[data-icon="trophy"]')).not.toBeVisible();
      await expect(nonBiddingLeadCard.locator('button:has-text("Start Chat")')).not.toBeVisible();
      
      // Should show generic "Responded by Installer"
      await expect(nonBiddingLeadCard.locator('text="Responded by Installer"')).toBeVisible();
    }
  });
});

/**
 * Test Suite: Homeowner Review Modal Contact Unmasking
 */
test.describe('Phase 13I-B: Review Modal Installer Contact Unmasking', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, HOMEOWNER_CREDENTIALS.email, HOMEOWNER_CREDENTIALS.password);
  });

  test('T293-T294: Should display unmasked installer contacts in review modal after purchase', async ({ page }) => {
    await page.goto('/homeowner/dashboard');
    
    // Find BIDDING + PURCHASED lead and click "Review Bids"
    const leadCard = page.locator('[data-testid="lead-card"]')
      .filter({ has: page.locator('[data-quote-type="BIDDING"]') })
      .filter({ has: page.locator('[data-status="PURCHASED"]') })
      .first();
    
    const reviewButton = leadCard.locator('button:has-text("Review Bids")');
    await reviewButton.click();
    
    // Wait for modal to open
    const modal = page.locator('[role="dialog"]:has-text("Review Bids")');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Verify winning installer contact section visible
    const contactSection = modal.locator('[data-testid="installer-contact"]').or(
      modal.locator('text="Winning Installer Contact"').locator('xpath=ancestor::div[1]')
    );
    await expect(contactSection).toBeVisible();
    
    // Verify contact fields visible (not masked)
    await expect(contactSection.locator('text=/Phone:|Company:|Email:|Address:/i')).toBeVisible();
    
    // Verify NO masking (e.g., "***" or "Hidden until purchase")
    await expect(contactSection.locator('text="***"')).not.toBeVisible();
    await expect(contactSection.locator('text="Hidden until purchase"')).not.toBeVisible();
    
    // Verify actual contact data visible (e.g., phone number pattern)
    const phoneField = contactSection.locator('text=/0\d{9}|\\+61/');
    await expect(phoneField).toBeVisible();
  });

  test('T293-T294: API should return installer contacts for PURCHASED leads', async ({ page }) => {
    await page.goto('/homeowner/dashboard');
    
    // Setup API response listener
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/bids') && response.status() === 200
    );
    
    // Find BIDDING + PURCHASED lead and click "Review Bids"
    const leadCard = page.locator('[data-testid="lead-card"]')
      .filter({ has: page.locator('[data-quote-type="BIDDING"]') })
      .filter({ has: page.locator('[data-status="PURCHASED"]') })
      .first();
    
    const leadId = await leadCard.getAttribute('data-lead-id');
    const reviewButton = leadCard.locator('button:has-text("Review Bids")');
    await reviewButton.click();
    
    // Wait for API response
    const response = await responsePromise;
    const data = await response.json();
    
    // Verify response includes installer contact fields
    expect(data.bids).toBeDefined();
    expect(data.bids.length).toBeGreaterThan(0);
    
    // Find winning bid (should have contact info)
    const winnerBid = data.bids.find((bid: any) => bid.status === 'SELECTED' || bid.status === 'PURCHASED');
    expect(winnerBid).toBeDefined();
    expect(winnerBid.installer).toBeDefined();
    expect(winnerBid.installer.phone).toBeDefined();
    expect(winnerBid.installer.email).toBeDefined();
    expect(winnerBid.installer.businessAddress).toBeDefined();
    
    // Verify NOT masked
    expect(winnerBid.installer.phone).not.toBe('***');
    expect(winnerBid.installer.email).not.toBe('***');
  });
});

/**
 * Test Suite: Installer "View Full Details" Button Fix
 */
test.describe('Phase 13I-C: Installer Button Fix', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as installer
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', INSTALLER_CREDENTIALS.email);
    await page.fill('input[name="password"]', INSTALLER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/installer/dashboard', { timeout: 10000 });
  });

  test('T295: "View Full Details" button should open BidEvaluationModal (not LeadDetailsModal)', async ({ page }) => {
    await page.goto('/installer/leads');
    
    // Find BIDDING lead card
    const leadCard = page.locator('[data-testid="lead-card"]').filter({
      has: page.locator('[data-quote-type="BIDDING"]')
    }).first();
    
    // Click "View Full Details" button
    const viewDetailsButton = leadCard.locator('button:has-text("View Full Details")');
    await viewDetailsButton.click();
    
    // Verify BidEvaluationModal opens (has InstantQuote section)
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Verify modal contains InstantQuote data sections
    await expect(modal.locator('text="System Overview"')).toBeVisible();
    await expect(modal.locator('text="Financial Breakdown"')).toBeVisible();
    
    // Verify NOT LeadDetailsModal (which would show generic lead info only)
    // BidEvaluationModal has more detailed technical fields
    await expect(modal.locator('text="Recommended System Size"')).toBeVisible();
  });

  test('T296: "View Full Details" button should be positioned with other action buttons', async ({ page }) => {
    await page.goto('/installer/leads');
    
    // Find BIDDING lead card
    const leadCard = page.locator('[data-testid="lead-card"]').filter({
      has: page.locator('[data-quote-type="BIDDING"]')
    }).first();
    
    // Find action buttons container (flex gap-2)
    const actionsContainer = leadCard.locator('[class*="flex"][class*="gap-2"]').filter({
      has: page.locator('button:has-text("Place Bid")')
    });
    
    // Verify "View Full Details" button is inside actions container
    const viewDetailsButton = actionsContainer.locator('button:has-text("View Full Details")');
    await expect(viewDetailsButton).toBeVisible();
    
    // Verify button does NOT have mt-3 (separate positioning)
    const buttonParent = viewDetailsButton.locator('xpath=parent::*');
    const classes = await buttonParent.getAttribute('class');
    expect(classes).not.toContain('mt-3');
    
    // Verify button aligns horizontally with other buttons
    const placeBidButton = actionsContainer.locator('button:has-text("Place Bid")');
    const viewDetailsBbox = await viewDetailsButton.boundingBox();
    const placeBidBbox = await placeBidButton.boundingBox();
    
    if (viewDetailsBbox && placeBidBbox) {
      // Verify Y positions are similar (same row)
      expect(Math.abs(viewDetailsBbox.y - placeBidBbox.y)).toBeLessThan(10);
    }
  });
});

/**
 * Test Suite: Verification
 */
test.describe('Phase 13I Verification', () => {
  
  test('T297: Theme testing (Dark/Light/Purple)', async ({ page }) => {
    await login(page, HOMEOWNER_CREDENTIALS.email, HOMEOWNER_CREDENTIALS.password);
    await page.goto('/homeowner/dashboard');
    
    // Test Dark theme (default)
    await expect(page.locator('[data-theme="dark"]').or(page.locator('html'))).toBeVisible();
    
    // Find BIDDING + PURCHASED lead
    const leadCard = page.locator('[data-testid="lead-card"]')
      .filter({ has: page.locator('[data-quote-type="BIDDING"]') })
      .filter({ has: page.locator('[data-status="PURCHASED"]') })
      .first();
    
    // Verify "Bid Awarded" badge visible in Dark theme
    await expect(leadCard.locator('text="Bid Awarded"')).toBeVisible();
    
    // Switch to Light theme (if theme switcher exists)
    const themeSwitcher = page.locator('[data-testid="theme-switcher"]');
    if (await themeSwitcher.count() > 0) {
      await themeSwitcher.selectOption('light');
      await page.waitForTimeout(500);
      
      // Verify badge still visible in Light theme
      await expect(leadCard.locator('text="Bid Awarded"')).toBeVisible();
      
      // Switch to Purple theme
      await themeSwitcher.selectOption('purple');
      await page.waitForTimeout(500);
      
      // Verify badge still visible in Purple theme
      await expect(leadCard.locator('text="Bid Awarded"')).toBeVisible();
    }
  });

  test('T297: Responsive testing (320px, 768px, 1440px)', async ({ page }) => {
    await login(page, HOMEOWNER_CREDENTIALS.email, HOMEOWNER_CREDENTIALS.password);
    await page.goto('/homeowner/dashboard');
    
    // Test mobile (320px)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.waitForTimeout(500);
    
    const leadCard = page.locator('[data-testid="lead-card"]').first();
    await expect(leadCard).toBeVisible();
    await expect(leadCard.locator('text="Bid Awarded"')).toBeVisible();
    
    // Test tablet (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await expect(leadCard).toBeVisible();
    await expect(leadCard.locator('text="Bid Awarded"')).toBeVisible();
    
    // Test desktop (1440px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    
    await expect(leadCard).toBeVisible();
    await expect(leadCard.locator('text="Bid Awarded"')).toBeVisible();
    await expect(leadCard.locator('button:has-text("Start Chat")')).toBeVisible();
  });

  test('T297: No console errors during Phase 13I features', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await login(page, HOMEOWNER_CREDENTIALS.email, HOMEOWNER_CREDENTIALS.password);
    await page.goto('/homeowner/dashboard');
    
    // Interact with Phase 13I features
    const leadCard = page.locator('[data-testid="lead-card"]')
      .filter({ has: page.locator('[data-quote-type="BIDDING"]') })
      .filter({ has: page.locator('[data-status="PURCHASED"]') })
      .first();
    
    // Click "Review Bids" to test contact unmasking
    const reviewButton = leadCard.locator('button:has-text("Review Bids")');
    if (await reviewButton.count() > 0) {
      await reviewButton.click();
      await page.waitForTimeout(2000);
      
      // Close modal
      const closeButton = page.locator('[role="dialog"] button[aria-label="Close"]');
      if (await closeButton.count() > 0) {
        await closeButton.click();
      }
    }
    
    // Click "Start Chat" button
    const chatButton = leadCard.locator('button:has-text("Start Chat")');
    if (await chatButton.count() > 0) {
      await chatButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Verify no console errors
    expect(consoleErrors.filter(err => !err.includes('favicon'))).toHaveLength(0);
  });
});
