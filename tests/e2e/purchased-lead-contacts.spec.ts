/**
 * E2E Test: Purchased Bidding Lead Contact Display
 * 
 * Verifies that after purchasing a bidding lead:
 * 1. Contact details are unmasked in the purchased leads page
 * 2. "Place Bid" button is removed
 * 3. Bid Evaluation modal shows real contact information
 * 4. Bid Builder modal's Lead Details also shows real contact information
 */

import { test, expect } from '@playwright/test';

test.describe('Purchased Bidding Lead - Contact Display', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as installer (assuming test installer exists)
    await page.goto('/api/auth/signin');
    await page.fill('input[name="email"]', 'installer@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/installer/dashboard');
  });

  test('should show unmasked contacts for purchased bidding lead', async ({ page }) => {
    // Navigate to purchased leads page
    await page.goto('/installer/purchased-leads');
    
    // Switch to Bidding tab
    await page.click('button:has-text("Bidding")');
    
    // Wait for leads to load
    await page.waitForSelector('[data-testid="lead-card"], .text-foreground', { timeout: 10000 });
    
    // Check if contact details are visible (not masked)
    const contactSection = page.locator('text=Contact Details Unlocked').first();
    await expect(contactSection).toBeVisible({ timeout: 5000 });
    
    // Verify name is not "Hidden" or "***"
    const nameText = await page.locator('text=Name:').locator('..').textContent();
    expect(nameText).not.toContain('***');
    expect(nameText).not.toContain('Hidden');
    expect(nameText).not.toContain('LOCKED');
    
    // Verify phone is not "HIDDEN"
    const phoneText = await page.locator('text=Phone:').locator('..').textContent();
    expect(phoneText).not.toContain('HIDDEN');
    
    // Verify "Place Bid" button is NOT present
    const placeBidButton = page.locator('button:has-text("Place Bid")');
    await expect(placeBidButton).not.toBeVisible();
  });

  test('should show real contacts in Bid Evaluation modal', async ({ page }) => {
    // Navigate to purchased leads page
    await page.goto('/installer/purchased-leads');
    
    // Switch to Bidding tab
    await page.click('button:has-text("Bidding")');
    await page.waitForTimeout(1000);
    
    // Click "Lead Details" button
    await page.click('button:has-text("Lead Details")');
    
    // Wait for modal to open
    await page.waitForSelector('text=Bid Evaluation', { timeout: 5000 });
    
    // Check that "Available After Purchase" is NOT shown
    const maskedMessage = page.locator('text=Available After Purchase');
    await expect(maskedMessage).not.toBeVisible();
    
    // Verify real contact information section exists
    const contactInfo = page.locator('text=Contact Information');
    await expect(contactInfo).toBeVisible();
    
    // Verify actual contact details are shown (not masked)
    const modalContent = await page.locator('[role="dialog"], .bg-background').textContent();
    expect(modalContent).not.toContain('will be unlocked after');
    expect(modalContent).not.toContain('Available After Purchase');
  });

  test('should show real contacts in Bid Builder Lead Details section', async ({ page }) => {
    // Navigate to purchased leads page
    await page.goto('/installer/purchased-leads');
    
    // Switch to Bidding tab
    await page.click('button:has-text("Bidding")');
    await page.waitForTimeout(1500);
    
    // Click "Place Bid" or "Submit Quote" button to open Bid Builder
    const bidButton = page.locator('button:has-text("Place Bid"), button:has-text("Submit Quote"), button:has-text("Build Bid")').first();
    await bidButton.click();
    
    // Wait for Bid Builder modal (Quote Builder)
    await page.waitForSelector('text=Quote Builder', { timeout: 5000 });
    
    // Look for "Lead Details - InstantQuote Data" section in right column
    const leadDetailsSection = page.locator('text=Lead Details - InstantQuote Data, text=Lead Technical Details');
    await expect(leadDetailsSection).toBeVisible({ timeout: 5000 });
    
    // Verify "Available After Purchase" is NOT shown in LeadTechnicalDetails
    const maskedMessage = page.locator('text=Available After Purchase');
    await expect(maskedMessage).not.toBeVisible();
    
    // Verify real contact information is displayed (green success border indicates unlocked)
    const successBorder = page.locator('.border-success\\/20');
    await expect(successBorder).toBeVisible({ timeout: 3000 });
    
    // Verify contact fields are present (Name, Phone, Email)
    const contactSection = page.locator('text=Contact Information');
    await expect(contactSection).toBeVisible();
    
    const nameField = page.locator('text=Name');
    const phoneField = page.locator('text=Phone');
    const emailField = page.locator('text=Email');
    
    await expect(nameField).toBeVisible();
    await expect(phoneField).toBeVisible();
    await expect(emailField).toBeVisible();
  });
});
