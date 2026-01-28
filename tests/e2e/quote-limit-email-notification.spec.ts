import { test, expect, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_CREDENTIALS = {
  email: 'admin@solarmatch.com',
  password: 'Admin123!Secure',
};

async function loginAdmin(page: Page) {
  await page.request.post('/api/fix-admin');

  const csrfResp = await page.request.get('/api/auth/csrf');
  expect(csrfResp.ok()).toBeTruthy();
  const csrf = (await csrfResp.json()) as { csrfToken?: string };
  expect(csrf.csrfToken).toBeTruthy();

  const callbackResp = await page.request.post('/api/auth/callback/credentials', {
    form: {
      csrfToken: csrf.csrfToken ?? '',
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      role: 'ADMIN',
      callbackUrl: '/admin/dashboard',
      json: 'true',
    },
  });
  expect(callbackResp.status()).toBeLessThan(400);

  const sessionResp = await page.request.get('/api/auth/session');
  expect(sessionResp.ok()).toBeTruthy();
  const session = (await sessionResp.json()) as any;
  expect(session?.user?.role).toBe('ADMIN');
}

test.describe('Quote Limit Email Notifications', () => {
  let homeownerId: string;
  let homeownerEmail: string;

  test.beforeAll(async () => {
    // Create test homeowner
    const homeowner = await prisma.user.create({
      data: {
        email: `test-homeowner-limit-${Date.now()}@example.com`,
        name: 'Test Homeowner Limit',
        role: 'HOMEOWNER',
        leadSubmissionLimit: 5,
        leadSubmissionCount: 0,
        biddingLeadsLimit: 1,
        biddingLeadsSubmitted: 0,
      },
    });
    homeownerId = homeowner.id;
    homeownerEmail = homeowner.email;
    console.log(`Created test homeowner: ${homeownerEmail} (ID: ${homeownerId})`);
  });

  test.afterAll(async () => {
    // Cleanup: Delete notifications
    await prisma.notification.deleteMany({
      where: { userId: homeownerId },
    });

    // Cleanup: Delete email logs
    await prisma.emailDelivery.deleteMany({
      where: { recipientEmail: homeownerEmail },
    });

    // Cleanup: Delete test homeowner
    await prisma.user.delete({ where: { id: homeownerId } });
    
    console.log(`Cleaned up test homeowner: ${homeownerEmail}`);
    await prisma.$disconnect();
  });

  test('Admin increases quote limit → Homeowner receives email', async ({ page }) => {
    await loginAdmin(page);

    // Step 1: Simulate admin API call to increase quote limit
    const response = await page.request.patch(`/api/admin/homeowners/${homeownerId}/lead-limit`, {
      data: {
        quoteLimit: 10,
        notify: true,
        reason: 'Test - Increasing limit for E2E test',
      },
    });

    console.log(`API Response Status: ${response.status()}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Step 2: Verify email delivery log was created
    const emailLog = await prisma.emailDelivery.findFirst({
      where: {
        recipientEmail: homeownerEmail,
        subject: 'Quote Limit Updated',
      },
      orderBy: { sentAt: 'desc' },
    });

    console.log('Email Log:', emailLog);

    expect(emailLog).not.toBeNull();
    expect(emailLog?.status).toBe('SENT');
    expect(emailLog?.provider).toBe('sendgrid');
    // This is a system-generated transactional email (not a marketing notification).
    expect(emailLog?.messageType).toBe('transactional');

    // Step 3: Verify internal notification was created
    const notification = await prisma.notification.findFirst({
      where: {
        userId: homeownerId,
        messageKey: 'homeowner.system.limit_updated',
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Notification:', notification);

    expect(notification).not.toBeNull();
    expect(notification?.title).toBe('Quote Limit Updated');
    expect(notification?.type).toBe('SYSTEM');

    // Step 4: Verify metadata contains limit change
    expect(notification?.metadata).toMatchObject({
      previousLimit: 5,
      newLimit: 10,
      remainingAllowance: 10,
    });
  });

  test('Admin increases bidding limit → Homeowner receives email', async ({ page }) => {
    await loginAdmin(page);

    // Step 1: Simulate admin API call to increase bidding limit
    const response = await page.request.patch(`/api/admin/homeowners/${homeownerId}/bidding-limit`, {
      data: {
        biddingLimit: 3,
        notify: true,
        reason: 'Test - Increasing bidding limit for E2E test',
      },
    });

    console.log(`API Response Status: ${response.status()}`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Step 2: Verify email delivery log was created
    const emailLog = await prisma.emailDelivery.findFirst({
      where: {
        recipientEmail: homeownerEmail,
        subject: 'Bidding Limit Updated',
      },
      orderBy: { sentAt: 'desc' },
    });

    console.log('Email Log:', emailLog);

    expect(emailLog).not.toBeNull();
    expect(emailLog?.status).toBe('SENT');
    expect(emailLog?.provider).toBe('sendgrid');

    // Step 3: Verify internal notification was created
    const notification = await prisma.notification.findFirst({
      where: {
        userId: homeownerId,
        messageKey: 'homeowner.system.bidding_limit_updated',
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Notification:', notification);

    expect(notification).not.toBeNull();
    expect(notification?.title).toBe('Bidding Limit Updated');
    expect(notification?.type).toBe('SYSTEM');

    // Step 4: Verify metadata contains limit change
    expect(notification?.metadata).toMatchObject({
      previousLimit: 1,
      newLimit: 3,
      remainingBiddingAllowance: 3,
    });
  });

  test('Email contains correct route key for homeowner dashboard', async () => {
    // Fetch the last created notification
    const notification = await prisma.notification.findFirst({
      where: {
        userId: homeownerId,
        messageKey: {
          in: ['homeowner.system.limit_updated', 'homeowner.system.bidding_limit_updated'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(notification).not.toBeNull();
    expect(notification?.routeKey).toBe('homeowner.requests');
    
    console.log('Notification Route Key:', notification?.routeKey);
  });

  test('No email sent when notify=false', async ({ page }) => {
    await loginAdmin(page);

    // Step 1: Get current email log count
    const beforeCount = await prisma.emailDelivery.count({
      where: { recipientEmail: homeownerEmail },
    });

    // Step 2: Direct API call with notify=false
    const response = await page.request.patch(`/api/admin/homeowners/${homeownerId}/lead-limit`, {
      data: {
        quoteLimit: 15,
        notify: false, // ← KEY: notify=false
        reason: 'Test - No notification requested',
      },
    });

    expect(response.status()).toBe(200);

    // Step 3: Verify NO new email was sent
    const afterCount = await prisma.emailDelivery.count({
      where: { recipientEmail: homeownerEmail },
    });

    expect(afterCount).toBe(beforeCount); // Count should not increase

    // Step 4: Verify NO new internal notification was created
    const notification = await prisma.notification.findFirst({
      where: {
        userId: homeownerId,
        messageKey: 'homeowner.system.limit_updated',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Notification metadata should NOT contain newLimit=15
    if (notification) {
      const metadata = notification.metadata as any;
      expect(metadata.newLimit).not.toBe(15);
    }

    console.log('✅ Verified: No email/notification when notify=false');
  });
});

test.describe('Quote Limit Email Integration (Manual Test Helper)', () => {
  test.skip('Manual: Send test email to verify rendering', async () => {
    // This test is skipped by default
    // Uncomment and run manually to test email rendering
    
    // You would need to:
    // 1. Have a real homeowner account
    // 2. Use admin credentials
    // 3. Manually increase limit
    // 4. Check your email inbox
    
    console.log('Manual test: Check your email inbox for "Quote Limit Updated"');
  });
});
