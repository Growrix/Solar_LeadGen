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

function baseUrl(): string {
  // Must match Playwright baseURL/webServer (localhost:3001 by default).
  return process.env.E2E_BASE_URL || 'http://localhost:3000';
}

test.describe('News Engine Phase 17 OG Image Remediation', () => {
  const testRunId = `phase17-e2e-${Date.now()}`;
  const createdItemIds: string[] = [];

  let htmlOgItemId: string;
  let htmlOgItemTitle: string;

  let overrideItemId: string;
  let overrideItemTitle: string;

  test.beforeAll(async () => {
    htmlOgItemTitle = `E2E Phase 17 OG HTML ${testRunId}`;
    const htmlOgItem = await prisma.newsItem.create({
      data: {
        title: htmlOgItemTitle,
        summary: 'Phase 17 E2E - HTML OG image resolution',
        contentHtml: '<p>Phase 17 e2e content</p>',
        category: 'E2E',
        tags: ['e2e', 'phase17'],
        status: 'NEEDS_REVIEW',
        aiModel: 'e2e',
        relevanceScore: 0,
        sourceType: 'MANUAL_ENTRY',
        ogImageUrl: `${baseUrl()}/api/e2e/og-page`,
        ogImageApprovalRequired: true,
      },
      select: { id: true },
    });
    htmlOgItemId = htmlOgItem.id;
    createdItemIds.push(htmlOgItemId);

    overrideItemTitle = `E2E Phase 17 Override ${testRunId}`;
    const overrideItem = await prisma.newsItem.create({
      data: {
        title: overrideItemTitle,
        summary: 'Phase 17 E2E - override URL ingest',
        contentHtml: '<p>Phase 17 e2e content</p>',
        category: 'E2E',
        tags: ['e2e', 'phase17'],
        status: 'NEEDS_REVIEW',
        aiModel: 'e2e',
        relevanceScore: 0,
        sourceType: 'MANUAL_ENTRY',
        ogImageUrl: null,
        ogImageApprovalRequired: true,
      },
      select: { id: true },
    });
    overrideItemId = overrideItem.id;
    createdItemIds.push(overrideItemId);
  });

  test.afterAll(async () => {
    await prisma.newsItem.deleteMany({ where: { id: { in: createdItemIds } } });
    await prisma.$disconnect();
  });

  test('Auto-ingests HTML page OG image, allows approval and publish', async ({ page }) => {
    await loginAdmin(page);

    await page.goto('/admin/news-engine');
    await page.getByRole('button', { name: 'Drafts & Reviews' }).click();
    await page.fill('input[placeholder="Filter board..."]', testRunId);

    await page.getByRole('button', { name: htmlOgItemTitle }).click();
    await page.getByRole('button', { name: 'Close review' }).waitFor();

    await page.getByRole('button', { name: 'SEO & Compliance' }).click();
    await page.locator('input[placeholder="https://..."]').waitFor({ timeout: 45000 });

    const overrideInput = page.locator('input[placeholder="https://..."]');

    // Phase 17 requirement: initial OG URL should auto-ingest into stable storage.
    await expect(overrideInput).toHaveValue(/\/api\/public\/news-engine\/s3\/|news-engine\/og-images\//, { timeout: 45000 });

    // Preview should be visible.
    await expect(page.getByAltText('OG preview')).toBeVisible();

    // Approval must not block when preview is valid.
    await page.getByRole('button', { name: 'Approve OG Image' }).click();
    await expect(page.getByText(/Approved\s/i)).toBeVisible({ timeout: 15000 });

    // Publish via UI (confirmation modal).
    const publishNow = page.getByRole('button', { name: 'Publish Now' });
    await publishNow.click();

    await page.getByRole('heading', { name: 'Confirm Live Publication' }).waitFor();

    const publishRespPromise = page.waitForResponse(
      (r) => r.url().includes(`/api/admin/news-engine/items/${encodeURIComponent(htmlOgItemId)}/publish-now`) && r.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Yes, Publish' }).click();
    const publishResp = await publishRespPromise;
    expect(publishResp.ok()).toBeTruthy();

    // Verify public page renders and includes og:image metadata.
    const dbItem = await prisma.newsItem.findUnique({
      where: { id: htmlOgItemId },
      select: { slug: true, ogImageUrl: true },
    });
    expect(dbItem?.slug).toBeTruthy();

    await page.goto(`/news/${encodeURIComponent(dbItem!.slug!)}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /http/);
  });

  test('Override URL ingest works for a direct image, then approve + publish', async ({ page }) => {
    await loginAdmin(page);

    await page.goto('/admin/news-engine');
    await page.getByRole('button', { name: 'Drafts & Reviews' }).click();
    await page.fill('input[placeholder="Filter board..."]', testRunId);

    await page.getByRole('button', { name: overrideItemTitle }).click();
    await page.getByRole('button', { name: 'Close review' }).waitFor();

    await page.getByRole('button', { name: 'SEO & Compliance' }).click();
    await page.locator('input[placeholder="https://..."]').waitFor({ timeout: 15000 });

    const overrideInput = page.locator('input[placeholder="https://..."]');
    await overrideInput.fill(`${baseUrl()}/api/e2e/test-image`);

    // Manual ingest path remains and must work.
    await page.getByRole('button', { name: 'Save to S3' }).click();
    await expect(overrideInput).toHaveValue(/\/api\/public\/news-engine\/s3\/|news-engine\/og-images\//, { timeout: 45000 });

    await page.getByRole('button', { name: 'Approve OG Image' }).click();
    await expect(page.getByText(/Approved\s/i)).toBeVisible({ timeout: 15000 });

    const publishNow = page.getByRole('button', { name: 'Publish Now' });
    await publishNow.click();

    await page.getByRole('heading', { name: 'Confirm Live Publication' }).waitFor();

    const publishRespPromise = page.waitForResponse(
      (r) => r.url().includes(`/api/admin/news-engine/items/${encodeURIComponent(overrideItemId)}/publish-now`) && r.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Yes, Publish' }).click();
    const publishResp = await publishRespPromise;
    expect(publishResp.ok()).toBeTruthy();
  });

  test('Free-source image button ingests and previews', async ({ page }) => {
    await loginAdmin(page);

    await page.goto('/admin/news-engine');
    await page.getByRole('button', { name: 'Drafts & Reviews' }).click();

    // Reuse override item (now published) is fine; the control should still ingest and preview.
    await page.fill('input[placeholder="Filter board..."]', overrideItemTitle);
    await page.getByRole('button', { name: overrideItemTitle }).click();
    await page.getByRole('button', { name: 'Close review' }).waitFor();

    await page.getByRole('button', { name: 'SEO & Compliance' }).click();
    await page.locator('input[placeholder="https://..."]').waitFor({ timeout: 15000 });

    const overrideInput = page.locator('input[placeholder="https://..."]');

    await page.getByRole('button', { name: 'Find free image' }).click();
    await expect(overrideInput).toHaveValue(/\/api\/public\/news-engine\/s3\/|news-engine\/og-images\//, { timeout: 45000 });
    await expect(page.getByAltText('OG preview')).toBeVisible();
  });
});
