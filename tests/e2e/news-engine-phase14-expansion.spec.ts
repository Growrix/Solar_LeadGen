import { test, expect, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_CREDENTIALS = {
  email: 'admin@solarmatch.com',
  password: 'Admin123!Secure',
};

async function loginAdmin(page: Page) {
  // Ensure the expected admin account/password exists in the local DB.
  await page.request.post('/api/fix-admin');

  // Programmatic sign-in via NextAuth.
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

test.describe('News Engine Phase 14 Expansion (Phase 5 E2E)', () => {
  const testRunId = `phase14-e2e-${Date.now()}`;
  let itemId: string;
  let itemTitle: string;
  let sourceId: string;
  let sourceEntryId: string;
  let researchEntryId: string;

  test.beforeAll(async () => {
    // Seed a NewsItem plus linked source + research entries so provenance enrichment has data.
    sourceId = `e2e-source-${testRunId}`;

    await prisma.newsSource.create({
      data: {
        id: sourceId,
        name: `E2E Source ${testRunId}`,
        url: `https://example.com/e2e-feed/${testRunId}.xml`,
        enabled: false,
        kind: 'RSS_FEED',
      },
      select: { id: true },
    });

    itemTitle = `E2E Phase 14 Item ${testRunId}`;

    const item = await prisma.newsItem.create({
      data: {
        title: itemTitle,
        summary: 'E2E Phase 14 summary',
        contentHtml: '<p>E2E Phase 14 content</p>',
        category: 'E2E',
        tags: ['e2e', 'phase14'],
        status: 'NEEDS_REVIEW',
        aiModel: 'e2e',
        relevanceScore: 0,
        sourceType: 'RSS_FEED',
        sourceId,
        // A stable public URL that should typically return 2xx.
        // The test accepts OK or BROKEN (network can vary), but it must persist a status.
        ogImageUrl: 'https://example.com/favicon.ico',
        ogImageApprovalRequired: true,
      },
      select: { id: true },
    });

    itemId = item.id;

    const now = new Date();

    const sourceEntry = await prisma.newsSourceEntry.create({
      data: {
        sourceId,
        url: `https://example.com/e2e-source/${testRunId}`,
        title: `E2E RSS Entry ${testRunId}`,
        publishedAt: now,
        fetchedAt: now,
        status: 'PROCESSED',
        itemId,
        rawJson: { e2e: true, kind: 'rss' },
      },
      select: { id: true },
    });
    sourceEntryId = sourceEntry.id;

    const researchEntry = await prisma.newsResearchEntry.create({
      data: {
        kind: 'WEB',
        query: `E2E query ${testRunId}`,
        url: `https://example.com/e2e-research/${testRunId}`,
        title: `E2E Research ${testRunId}`,
        publishedAt: now,
        fetchedAt: now,
        status: 'PROCESSED',
        itemId,
        rawJson: { e2e: true, kind: 'web' },
      },
      select: { id: true },
    });
    researchEntryId = researchEntry.id;
  });

  test.afterAll(async () => {
    // Cleanup seeded data (best-effort, non-destructive).
    await prisma.newsResearchEntry.deleteMany({ where: { id: researchEntryId } });
    await prisma.newsSourceEntry.deleteMany({ where: { id: sourceEntryId } });
    await prisma.newsItem.deleteMany({ where: { id: itemId } });
    await prisma.newsSource.deleteMany({ where: { id: sourceId } });
    await prisma.$disconnect();
  });

  test('Review modal shows enriched provenance + server OG re-check persists status', async ({ page }) => {
    await loginAdmin(page);

    await page.goto('/admin/news-engine');

    await page.getByRole('button', { name: 'Drafts & Reviews' }).click();

    // Filter down to the seeded item.
    await page.fill('input[placeholder="Filter board..."]', testRunId);

    // Open the card.
    await page.getByRole('button', { name: itemTitle }).click();
    await page.getByRole('button', { name: 'Close review' }).waitFor();

    // Ensure provenance call occurs.
    await page.waitForResponse((r) =>
      r.url().includes(`/api/admin/news-engine/items/${encodeURIComponent(itemId)}/provenance`) && r.status() === 200
    );

    // Verify enriched provenance UI.
    await page.getByRole('button', { name: 'Research Summary' }).click();
    await page.getByText('Provenance').waitFor();
    await page.getByText('Details view is enriched (Phase 4)').waitFor();

    // Should show at least the two sources we seeded.
    await expect(page.getByText('RSS', { exact: true })).toBeVisible();
    await expect(page.getByText('WEB', { exact: true })).toBeVisible();

    // Verify server-backed OG image re-check.
    await page.getByRole('button', { name: 'SEO & Compliance' }).click();
    await page.getByText('Image controls').waitFor({ timeout: 15000 });

    const recheck = page.getByRole('button', { name: 'Re-check' });
    await expect(recheck).toBeVisible();

    const recheckRespPromise = page.waitForResponse((r) =>
      r.url().includes(`/api/admin/news-engine/items/${encodeURIComponent(itemId)}/og-image/check`) &&
      r.request().method() === 'POST'
    );

    await recheck.click();
    const recheckResp = await recheckRespPromise;
    expect(recheckResp.ok()).toBeTruthy();

    const recheckJson = (await recheckResp.json()) as {
      ok: true;
      itemId: string;
      status: 'OK' | 'BROKEN' | 'UNKNOWN';
      checkedAt: string;
      error: string | null;
    };

    expect(recheckJson.ok).toBeTruthy();
    expect(recheckJson.itemId).toBe(itemId);
    expect(['OK', 'BROKEN', 'UNKNOWN']).toContain(recheckJson.status);
    expect(recheckJson.checkedAt).toBeTruthy();

    // Verify persistence at DB level.
    const dbItem = await prisma.newsItem.findUnique({
      where: { id: itemId },
      select: { ogImageLastCheckedAt: true, ogImageLastCheckStatus: true, ogImageLastCheckError: true },
    });
    expect(dbItem?.ogImageLastCheckedAt).toBeTruthy();
    expect(['OK', 'BROKEN', 'UNKNOWN', null]).toContain(dbItem?.ogImageLastCheckStatus ?? null);

    // Close and reopen modal; badge should load from image-controls.
    await page.getByRole('button', { name: 'Close review' }).click();

    await page.getByRole('button', { name: itemTitle }).click();
    await page.getByRole('button', { name: 'Close review' }).waitFor();
    await page.getByRole('button', { name: 'SEO & Compliance' }).click();
    await page.getByText('Image controls').waitFor({ timeout: 15000 });

    // Badge text should match one of statuses (not CHECKING).
    await expect(page.getByText('CHECKING')).toHaveCount(0);
    await expect(page.getByText(recheckJson.status)).toBeVisible();
  });
});
