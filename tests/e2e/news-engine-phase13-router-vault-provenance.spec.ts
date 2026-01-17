/**
 * News Engine Phase 13 E2E (Router + Key Vault + Provenance + Image Controls)
 *
 * Notes:
 * - Uses existing admin login flow.
 * - Key Vault create/edit requires NEWS_ENGINE_KEY_VAULT_MASTER_KEY (or NEWS_KEY_VAULT_MASTER_KEY).
 */

import { test, expect, type Page } from '@playwright/test';

const ADMIN_CREDENTIALS = {
  email: 'admin@solarmatch.com',
  password: 'Admin123!Secure',
};

async function loginAdmin(page: Page) {
  // Ensure the expected admin account/password exists in the local DB.
  // This endpoint is intended for local/dev debugging.
  await page.request.post('/api/fix-admin');

  // Programmatic sign-in via NextAuth (avoids UI redirect flakiness).
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

test.describe('News Engine Phase 13', () => {
  test('AI Router defaults can be saved', async ({ page }) => {
    await loginAdmin(page);

    const createdProfileResp = await page.request.post('/api/admin/news-engine/model-profiles', {
      data: {
        displayName: `E2E Router Profile ${Date.now()}`,
        provider: 'openai',
        modelId: 'gpt-4o-mini',
        enabled: true,
      },
    });
    expect(createdProfileResp.ok()).toBeTruthy();
    const createdProfile = (await createdProfileResp.json()) as { profile?: { id: string } };
    expect(createdProfile.profile?.id).toBeTruthy();
    const profileId = createdProfile.profile!.id;

    await page.goto('/admin/news-engine');

    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByText('AI Router').waitFor();

    // Wait for defaults + profiles to load.
    await page.waitForResponse((r) => r.url().includes('/api/admin/news-engine/model-profiles') && r.status() === 200);
    await page.waitForResponse((r) => r.url().includes('/api/admin/news-engine/ai-router/defaults') && r.status() === 200);

    // Target the router default select for a specific task row.
    // (Use DOM structure from SettingsTab: <p>{taskType}</p> -> parent -> parent row -> select)
    const routerSelect = page
      .getByText('research_deep', { exact: true })
      .locator('..')
      .locator('..')
      .locator('select');
    await expect(routerSelect).toBeVisible();

    await routerSelect.selectOption(profileId);

    const save = page.getByRole('button', { name: 'Save Configuration' });
    const saveResponse = page.waitForResponse((r) => r.url().includes('/api/admin/news-engine/ai-router/defaults') && r.request().method() === 'PUT');
    await save.click();
    await saveResponse;

    // Verify the dropdown stays selected (no UI crash).
    await expect(routerSelect).toHaveValue(profileId);
  });

  test('Key Vault: can add key (requires master key env)', async ({ page }) => {
    const hasMasterKey = Boolean(process.env.NEWS_ENGINE_KEY_VAULT_MASTER_KEY || process.env.NEWS_KEY_VAULT_MASTER_KEY);
    test.skip(!hasMasterKey, 'NEWS_ENGINE_KEY_VAULT_MASTER_KEY (or NEWS_KEY_VAULT_MASTER_KEY) not set');

    await loginAdmin(page);

    await page.goto('/admin/news-engine');
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('heading', { name: 'Key Vault' }).waitFor();

    const add = page.getByRole('button', { name: 'Add Key' });
    await add.click();

    await page.getByRole('heading', { name: 'Add Key' }).waitFor();

    await page.locator('select').first().selectOption('OpenAI');
    const keyLabel = `E2E Drafting Key ${Date.now()}`;
    await page.fill('input[placeholder^="e.g."]', keyLabel);

    // Pool select is the next select in the modal.
    // Use Images to avoid polluting the Drafting pool (which is used by automation scripts).
    await page.locator('select').nth(1).selectOption('Images');

    // Raw Key is write-only; use a dummy string (encryption happens server-side).
    await page.fill('input[type="password"]', `sk-e2e-${Date.now()}-dummy`);

    const saveKey = page.getByRole('button', { name: 'Save Key' });
    const createResp = page.waitForResponse((r) => r.url().includes('/api/admin/news-engine/key-vault') && r.request().method() === 'POST');
    await saveKey.click();
    const resp = await createResp;
    expect(resp.ok()).toBeTruthy();

    // Ensure the label is visible in the table.
    await page.getByText(keyLabel).first().waitFor();
  });

  test('Review modal persists image controls and loads provenance', async ({ page }) => {
    await loginAdmin(page);

    await page.goto('/admin/news-engine');

    // The board filter is in the Drafts & Reviews tab.
    await page.getByRole('button', { name: 'Drafts & Reviews' }).click();

    // Create a minimal item via authenticated API so we can open it.
    const title = `E2E Phase13 Item ${Date.now()}`;
    const create = await page.request.post('/api/admin/news-engine/items', {
      data: {
        title,
        summary: 'E2E summary',
        contentHtml: '<p>E2E</p>',
        category: 'E2E',
        tags: ['e2e'],
      },
    });
    expect(create.ok()).toBeTruthy();

    await page.reload();

    await page.getByRole('button', { name: 'Drafts & Reviews' }).click();

    // Filter down to the created item.
    await page.fill('input[placeholder="Filter board..."]', 'E2E Phase13 Item');

    // Open the card.
    await page.getByRole('button', { name: title }).click();
    await page.getByRole('button', { name: 'Close review' }).waitFor();

    // Provenance call should occur when modal opens.
    await page.waitForResponse((r) => r.url().includes('/api/admin/news-engine/items/') && r.url().includes('/provenance') && r.status() === 200);

    // Update image controls.
    await page.getByRole('button', { name: 'SEO & Compliance' }).click();
    await page.getByText('Image controls').waitFor();

      const ogUrl = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80';
    await page.fill('input[placeholder="https://..."]', ogUrl);

    const saveResp = page.waitForResponse((r) => r.url().includes('/api/admin/news-engine/items/') && r.url().includes('/image-controls') && r.request().method() === 'PUT');
    await page.getByRole('button', { name: 'Save as Draft' }).click();
    const saved = await saveResp;
    expect(saved.ok()).toBeTruthy();

    // Re-open and ensure the value persisted.
    await page.getByRole('button', { name: 'Close review' }).click();

    await page.getByRole('button', { name: title }).click();
    await page.getByRole('button', { name: 'Close review' }).waitFor();
    await page.getByRole('button', { name: 'SEO & Compliance' }).click();
    await page.getByText('Image controls').waitFor({ timeout: 15000 });
    const ogInput = page.locator('input[placeholder="https://..."]');
    await expect(ogInput).toBeVisible();
    await expect(ogInput).toHaveValue(/news-engine\/og-images/);
  });
});
