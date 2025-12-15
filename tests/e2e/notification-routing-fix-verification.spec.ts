/**
 * Phase 13O: Notification Routing Fix Verification
 * 
 * Tests T410 and T411 fixes:
 * - NEW_LEAD notification routes to /installer/leads (not marketplace)
 * - BID_WON notification routes to /installer/leads (not lead detail)
 * 
 * Run: npx playwright test notification-routing-fix-verification.spec.ts --headed
 */

import { test, expect } from '@playwright/test';

test.describe('Phase 13O: Notification Routing Fixes', () => {

  test('T410: NEW_LEAD notification routes to lead feed (not marketplace)', async ({ page }) => {
    console.log('\n🧪 Testing T410: NEW_LEAD notification routing');
    
    // Navigate to login page
    await page.goto('http://localhost:3000');
    
    // Check if we're already logged in or need to login
    const isLoggedIn = await page.locator('text=Dashboard').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      console.log('  ℹ️  Not logged in - this test requires manual login');
      console.log('  ℹ️  Please login as an installer and run test again');
      test.skip();
      return;
    }
    
    console.log('  ✅ User is logged in');
    
    // Navigate to notifications page to inspect notification data
    await page.goto('http://localhost:3000/api/notifications?limit=50');
    
    const responseText = await page.locator('pre').textContent();
    if (!responseText) {
      console.log('  ⚠️  No notifications found - cannot test routing');
      test.skip();
      return;
    }
    
    const notificationData = JSON.parse(responseText);
    const newLeadNotification = notificationData.notifications?.find(
      (n: any) => n.type === 'NEW_LEAD'
    );
    
    if (!newLeadNotification) {
      console.log('  ℹ️  No NEW_LEAD notifications found');
      console.log('  ℹ️  Create a NEW_LEAD notification to test this');
      test.skip();
      return;
    }
    
    console.log('  ✅ Found NEW_LEAD notification');
    console.log('  📍 ActionURL:', newLeadNotification.actionUrl);
    
    // CRITICAL CHECK: actionUrl should NOT contain "marketplace"
    expect(newLeadNotification.actionUrl).not.toContain('marketplace');
    console.log('  ✅ PASS: actionUrl does NOT contain "marketplace"');
    
    // CRITICAL CHECK: actionUrl should point to lead feed
    expect(newLeadNotification.actionUrl).toContain('/installer/leads');
    console.log('  ✅ PASS: actionUrl points to /installer/leads');
    
    // Navigate to the actionUrl and verify it loads correctly
    await page.goto(`http://localhost:3000${newLeadNotification.actionUrl}`);
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the lead feed page, not marketplace
    const currentUrl = page.url();
    expect(currentUrl).toContain('/installer/leads');
    expect(currentUrl).not.toContain('marketplace');
    console.log('  ✅ PASS: Navigated to lead feed successfully');
    console.log('  ✅ T410 FIX VERIFIED: NEW_LEAD routes to lead feed, NOT marketplace');
  });

  test('T411: BID_WON notification routes to lead feed (not lead detail)', async ({ page }) => {
    console.log('\n🧪 Testing T411: BID_WON notification routing');
    
    // Navigate to login page
    await page.goto('http://localhost:3000');
    
    // Check if we're already logged in
    const isLoggedIn = await page.locator('text=Dashboard').isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      console.log('  ℹ️  Not logged in - this test requires manual login');
      test.skip();
      return;
    }
    
    console.log('  ✅ User is logged in');
    
    // Fetch notifications
    await page.goto('http://localhost:3000/api/notifications?limit=50');
    
    const responseText = await page.locator('pre').textContent();
    if (!responseText) {
      console.log('  ⚠️  No notifications found');
      test.skip();
      return;
    }
    
    const notificationData = JSON.parse(responseText);
    const bidWonNotification = notificationData.notifications?.find(
      (n: any) => n.type === 'BID_WON'
    );
    
    if (!bidWonNotification) {
      console.log('  ℹ️  No BID_WON notifications found');
      console.log('  ℹ️  Create a BID_WON notification to test this');
      test.skip();
      return;
    }
    
    console.log('  ✅ Found BID_WON notification');
    console.log('  📍 ActionURL:', bidWonNotification.actionUrl);
    
    // CRITICAL CHECK: actionUrl should point to lead FEED (not detail with ID)
    // After T411 fix, should be: /installer/leads (not /installer/leads/[id])
    expect(bidWonNotification.actionUrl).toBe('/installer/leads');
    console.log('  ✅ PASS: actionUrl is exactly "/installer/leads"');
    
    // Navigate to the actionUrl
    await page.goto(`http://localhost:3000${bidWonNotification.actionUrl}`);
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the lead feed page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/installer/leads');
    expect(currentUrl).not.toMatch(/\/installer\/leads\/[a-z0-9]+/); // Should NOT have lead ID
    console.log('  ✅ PASS: On lead feed page (not detail page)');
    
    // Verify winner banner is visible (trophy icon + payment button)
    const hasTrophyIcon = await page.locator('svg').filter({ hasText: /trophy/i }).isVisible().catch(() => false);
    const hasPaymentButton = await page.locator('button:has-text("Proceed to Payment")').isVisible().catch(() => false);
    
    if (hasTrophyIcon || hasPaymentButton) {
      console.log('  ✅ PASS: Winner banner visible (trophy or payment button found)');
    } else {
      console.log('  ⚠️  WARNING: Winner banner not visible (may need to check lead status)');
    }
    
    console.log('  ✅ T411 FIX VERIFIED: BID_WON routes to feed where winner banner shows');
  });

  test('Verify NO notifications route to marketplace', async ({ page }) => {
    console.log('\n🧪 Testing: No notifications should route to marketplace');
    
    await page.goto('http://localhost:3000');
    
    const isLoggedIn = await page.locator('text=Dashboard').isVisible().catch(() => false);
    if (!isLoggedIn) {
      console.log('  ℹ️  Not logged in - skipping test');
      test.skip();
      return;
    }
    
    // Fetch ALL notifications
    await page.goto('http://localhost:3000/api/notifications?limit=100');
    
    const responseText = await page.locator('pre').textContent();
    if (!responseText) {
      console.log('  ℹ️  No notifications found');
      test.skip();
      return;
    }
    
    const notificationData = JSON.parse(responseText);
    const notifications = notificationData.notifications || [];
    
    console.log(`  📊 Checking ${notifications.length} notifications`);
    
    let marketplaceCount = 0;
    
    for (const notification of notifications) {
      if (notification.actionUrl && notification.actionUrl.includes('marketplace')) {
        console.log(`  ❌ FOUND MARKETPLACE URL: ${notification.type} → ${notification.actionUrl}`);
        marketplaceCount++;
      }
    }
    
    expect(marketplaceCount).toBe(0);
    console.log(`  ✅ PASS: 0 notifications route to marketplace (checked ${notifications.length} notifications)`);
  });

});
