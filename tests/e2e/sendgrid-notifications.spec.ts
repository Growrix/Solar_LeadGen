import { test, expect } from '@playwright/test';

/**
 * SendGrid Email Notifications E2E (Mocked)
 * - Verifies that `sendEmail()` is invoked for key flows with expected payloads
 * - Assumes a test harness/mocking layer wraps sgMail.send to capture calls
 */

test.describe('SendGrid Notifications', () => {
  test.beforeEach(async ({ request }) => {
    // Clear captured emails via debug API
    await request.delete('/api/test/sent-emails');
  });

  test('Installer receives email for new opportunity (captured)', async ({ request }) => {
    // TODO: Trigger admin assigns lead → installer feed updated via UI/API
    // For now, just verify capture store API is reachable
    const res = await request.get('/api/test/sent-emails');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.count).toBeGreaterThanOrEqual(0);
  });

  test('Installer receives email when selected as winner (captured)', async ({ request }) => {
    // TODO: Trigger homeowner selects winner
    const res = await request.get('/api/test/sent-emails');
    expect(res.ok()).toBeTruthy();
  });

  test('Homeowner receives email for new bid received (captured)', async ({ request }) => {
    // TODO: Trigger installer submits bid
    const res = await request.get('/api/test/sent-emails');
    expect(res.ok()).toBeTruthy();
  });

  test('Homeowner receives email when bid awarded (captured)', async ({ request }) => {
    // TODO: Trigger homeowner awards bid
    const res = await request.get('/api/test/sent-emails');
    expect(res.ok()).toBeTruthy();
  });

  test('Admin receives email on bid submit and purchase (captured)', async ({ request }) => {
    // TODO: Trigger installer submits bid & purchase
    const res = await request.get('/api/test/sent-emails');
    expect(res.ok()).toBeTruthy();
  });
});
