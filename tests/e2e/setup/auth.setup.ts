import { test as setup, expect } from '@playwright/test';
import { encode } from 'next-auth/jwt';
import path from 'path';

const homeownerAuthFile = path.join(__dirname, '../.auth/homeowner.json');
const installerAuthFile = path.join(__dirname, '../.auth/installer.json');

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'solarmatch-dev-secret-key-change-in-production-2024';

/**
 * Setup: Create authenticated storage states for Homeowner and Installer
 * Option C: Manual JWT token creation (bypasses NextAuth modal completely)
 * 
 * This approach is most reliable for E2E testing with NextAuth:
 * - Avoids modal timing issues
 * - Avoids session creation race conditions
 * - Playwright recommended pattern: https://playwright.dev/docs/auth
 */

setup('authenticate as homeowner', async ({ page, context }) => {
  console.log('[Setup] Authenticating as homeowner...');
  
  // Create JWT token manually (bypassing NextAuth modal issues)
  // Using REAL user ID from seed data: homeowner@test.com
  const token = await encode({
    token: {
      id: 'cmiviuq7b0002i1hco4mjnoeg', // Real ID from seed
      email: 'homeowner@test.com',
      name: 'John Smith',
      role: 'HOMEOWNER',
      leadSubmissionCount: 0,
      quoteLimit: 5,
      phoneVerified: false,
      sessionVersion: 0,
      profileComplete: true,
    },
    secret: NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  console.log('[Setup] JWT token generated, setting cookie...');
  
  // Set NextAuth session token cookie
  await context.addCookies([{
    name: 'next-auth.session-token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    expires: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
  }]);

  // Navigate to homepage to verify session (dashboard requires real user data)
  await page.goto('/');
  await page.waitForTimeout(1000);
  
  // Verify session is established
  const sessionData = await page.evaluate(async () => {
    const res = await fetch('/api/auth/session');
    return res.json();
  });

  console.log('[Setup] Session data:', JSON.stringify(sessionData, null, 2));
  
  if (sessionData?.user?.role !== 'HOMEOWNER') {
    throw new Error(`Expected HOMEOWNER role, got: ${sessionData?.user?.role || 'none'}`);
  }

  console.log('[Setup] ✅ Homeowner authenticated successfully');
  
  // Save signed-in state to 'homeowner.json'
  await context.storageState({ path: homeownerAuthFile });
});

setup('authenticate as installer', async ({ page, context }) => {
  console.log('[Setup] Authenticating as installer...');
  
  // Create JWT token manually (bypassing NextAuth modal issues)
  // Using REAL user ID from seed data: installer@test.com
  const token = await encode({
    token: {
      id: 'cmj9nasmc0000i1wwhokf13wc', // Real ID from seed
      email: 'installer@test.com',
      name: 'Test Installer',
      role: 'INSTALLER',
      leadSubmissionCount: 0,
      quoteLimit: 999,
      phoneVerified: true,
      installerVerified: true,
      sessionVersion: 0,
      profileComplete: true,
    },
    secret: NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  console.log('[Setup] JWT token generated, setting cookie...');
  
  // Set NextAuth session token cookie
  await context.addCookies([{
    name: 'next-auth.session-token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    expires: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
  }]);

  // Navigate to homepage to verify session (leads page requires real user data)
  await page.goto('/');
  await page.waitForTimeout(1000);
  
  // Verify session is established
  const sessionData = await page.evaluate(async () => {
    const res = await fetch('/api/auth/session');
    return res.json();
  });

  console.log('[Setup] Session data:', JSON.stringify(sessionData, null, 2));
  
  if (sessionData?.user?.role !== 'INSTALLER') {
    throw new Error(`Expected INSTALLER role, got: ${sessionData?.user?.role || 'none'}`);
  }

  console.log('[Setup] ✅ Installer authenticated successfully');
  
  // Save signed-in state to 'installer.json'
  await context.storageState({ path: installerAuthFile });
});
