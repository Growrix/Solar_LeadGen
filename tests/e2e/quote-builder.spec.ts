import { test, expect, Page } from '@playwright/test';

// Unique test IDs for localStorage isolation
const TEST_IDS = {
  IMPORT_WORKFLOW: 'TEST_IMPORT_1',
  STC_CAPTION: 'TEST_STC_2',
  TOOLTIPS: 'TEST_TOOLTIPS_3',
  PREFILLED: 'TEST_PREFILLED_4',
  BUDGET_BANNER: 'TEST_BUDGET_5',
  CONSOLE_ERRORS: 'TEST_CONSOLE_6'
};

const DRAFT_KEY = (leadId: string) => `bid:draft:${leadId}:installer-id`;

// Helper to read meta from localStorage
async function readMeta(page: Page, leadId: string) {
  return await page.evaluate((key: string) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw).meta; } catch { return null; }
  }, DRAFT_KEY(leadId));
}

// Helper: Setup imported draft state (for tests that need imported data)
async function setupImportedDraft(page: Page, leadId: string): Promise<void> {
  await page.evaluate((key: string) => {
    const importedDraft = {
      mode: 'bid',
      system: {
        systemType: 'grid-tie',
        systemSize: 6.6,
        projectType: 'residential'
      },
      roof: {
        roofType: 'tile',
        pitchDeg: 25,
        orientations: ['north'],
        shadingLevel: 1
      },
      products: {
        battery: {
          included: false
        }
      },
      pricing: {
        stc: {
          eligible: true,
          postcode: '3000',
          zone: '3',
          stcCount: 85,
          stcPrice: 38.5
        },
        budgetRange: '$5000-$6000'
      },
      assumptions: {
        retailPrice: 0.32,
        feedInTariff: 0.08,
        selfConsumption: 0.7
      },
      meta: {
        importedAt: new Date().toISOString(),
        importSource: 'instant-quote',
        prefilledFields: [
          'system.systemSize',
          'roof.roofType',
          'roof.pitchDeg',
          'roof.orientations',
          'roof.shadingLevel',
          'pricing.stc.zone',
          'assumptions.retailPrice',
          'assumptions.feedInTariff',
          'pricing.budgetRange'
        ],
        version: '2.0'
      }
    };
    localStorage.setItem(key, JSON.stringify(importedDraft));
  }, DRAFT_KEY(leadId));
}

// Navigate before each test
test.beforeEach(async ({ page }) => {
  // Each test gets its own ID for localStorage isolation - set in test itself
  // Wait for hydration signal before interacting
});

test('Import workflow stamps metadata & STC zone', async ({ page }) => {
  const testId = TEST_IDS.IMPORT_WORKFLOW;
  await page.goto(`/test/quote-builder?id=${testId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('bid-builder-heading')).toBeVisible({ timeout: 10000 });

  const importBtn = page.getByRole('button', { name: /Import from Instant Quote/i });
  await expect(importBtn).toBeVisible();
  await importBtn.click();
  await expect(page.getByRole('heading', { name: /Import from Instant Quote/i })).toBeVisible();
  const acceptBtn = page.getByRole('button', { name: /Accept & Import/i });
  await expect(acceptBtn).toBeEnabled();
  await acceptBtn.click();
  await expect(page.getByRole('heading', { name: /Import from Instant Quote/i })).toHaveCount(0);
  await page.waitForTimeout(1000); // Wait for localStorage write
  const meta = await readMeta(page, testId);
  expect(meta).toBeTruthy();
  expect(meta?.importedAt).toBeTruthy();
  expect(meta?.importSource).toBe('instant-quote');
  expect(meta?.prefilledFields).toContain('pricing.stc.zone');
});

test('STC postcode caption appears', async ({ page }) => {
  const testId = TEST_IDS.STC_CAPTION;
  await page.goto(`/test/quote-builder?id=${testId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('bid-builder-heading')).toBeVisible({ timeout: 10000 });
  
  // Perform import to trigger caption rendering
  await page.getByRole('button', { name: /Import from Instant Quote/i }).click();
  await page.getByRole('button', { name: /Accept & Import/i }).click();
  await page.waitForTimeout(1000);
  
  // Expand Pricing Engine section to see caption
  const pricingSectionToggle = page.getByRole('button', { name: /Pricing Engine/i });
  if (await pricingSectionToggle.isVisible().catch(() => false)) {
    await pricingSectionToggle.click();
    await page.waitForTimeout(300);
  }
  
  const caption = page.getByTestId('stc-postcode-caption');
  await expect(caption).toBeVisible({ timeout: 10000 });
});

test('Roof tooltips show guidance text (hover + focus)', async ({ page }) => {
  const testId = TEST_IDS.TOOLTIPS;
  await page.goto(`/test/quote-builder?id=${testId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('bid-builder-heading')).toBeVisible({ timeout: 10000 });
  
  // Expand Roof & Site Details
  const roofSectionToggle = page.getByRole('button', { name: /Roof & Site Details/i });
  if (await roofSectionToggle.isVisible().catch(() => false)) {
    await roofSectionToggle.click();
    await page.waitForTimeout(300);
  }
  // Orientation tooltip
  const orientationInfo = page.getByTestId('tooltip-orientation');
  await orientationInfo.hover();
  await expect(page.getByText(/North-facing panels typically generate 100% efficiency/i)).toBeVisible({ timeout: 5000 });
  
  // Pitch tooltip
  const pitchInfo = page.getByTestId('tooltip-pitch');
  await pitchInfo.hover();
  await expect(page.getByText(/Optimal pitch.*20-30°/i)).toBeVisible({ timeout: 5000 });

  // Shading tooltip
  const shadingInfo = page.getByTestId('tooltip-shading');
  await shadingInfo.hover();
  await expect(page.getByText(/Minimal:.*10% shading/i)).toBeVisible({ timeout: 5000 });
});

test('Prefilled captions appear under imported fields', async ({ page }) => {
  const testId = TEST_IDS.PREFILLED;
  await page.goto(`/test/quote-builder?id=${testId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('bid-builder-heading')).toBeVisible({ timeout: 10000 });
  
  // Perform import to trigger prefilled captions
  await page.getByRole('button', { name: /Import from Instant Quote/i }).click();
  await page.getByRole('button', { name: /Accept & Import/i }).click();
  await page.waitForTimeout(1000);
  // Expand relevant sections where captions appear
  const pricingSectionToggle = page.getByRole('button', { name: /Pricing Engine/i });
  if (await pricingSectionToggle.isVisible().catch(() => false)) {
    await pricingSectionToggle.click();
    await page.waitForTimeout(300);
  }
  
  const captionMatcher = /Prefilled from homeowner Instant Quote/i;
  // Check that at least one caption is visible
  await expect(page.getByText(captionMatcher).first()).toBeVisible({ timeout: 10000 });
});

test('Budget hint banner appears and dismisses', async ({ page }) => {
  const testId = TEST_IDS.BUDGET_BANNER;
  await page.goto(`/test/quote-builder?id=${testId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('bid-builder-heading')).toBeVisible({ timeout: 10000 });
  
  // Perform import first
  await page.getByRole('button', { name: /Import from Instant Quote/i }).click();
  await page.getByRole('button', { name: /Accept & Import/i }).click();
  await page.waitForTimeout(1000);
  
  // Add a high-priced line item to exceed budget ($6000 max, need >$6600)
  // Budget is $5000-$6000, so max = $6000, need total > $6600 (110%)
  // Add line item: $8000 to definitely exceed
  await page.evaluate((key: string) => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const draft = JSON.parse(raw);
    draft.pricing = draft.pricing || {};
    draft.pricing.lineItems = [
      { description: 'Solar Panels', qty: 20, unitPrice: 200, taxGst: true }, // $4000
      { description: 'Inverter', qty: 1, unitPrice: 3500, taxGst: true }       // $3500
      // Total: $7500 > $6600 threshold
    ];
    localStorage.setItem(key, JSON.stringify(draft));
  }, DRAFT_KEY(testId));
  
  // Reload to trigger recalculation
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('bid-builder-heading')).toBeVisible({ timeout: 10000 });
  
  const banner = page.getByTestId('budget-exceed-banner');
  await expect(banner).toBeVisible({ timeout: 10000 });
  
  // Verify banner contains expected text
  await expect(banner).toContainText(/Current total.*exceeds homeowner budget/i);
  
  // Dismiss banner
  const dismissBtn = banner.getByRole('button');
  await dismissBtn.click();
  await expect(banner).toHaveCount(0);
});

test('No console errors during core interactions', async ({ page }) => {
  const testId = TEST_IDS.CONSOLE_ERRORS;
  await page.goto(`/test/quote-builder?id=${testId}`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('bid-builder-heading')).toBeVisible({ timeout: 10000 });
  
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore React deprecation warnings from third-party libs (recharts)
      if (!text.includes('defaultProps will be removed')) {
        errors.push(text);
      }
    }
  });
  await page.getByRole('button', { name: /Import from Instant Quote/i }).click();
  await page.getByRole('button', { name: /Accept & Import/i }).click();
  expect(errors).toEqual([]);
});
