/**
 * News Engine RSS Entry HTTP Test
 *
 * What this does (safe, non-destructive):
 * - Ensures News Engine automation settings allow drafting
 * - Seeds a disabled NewsSource + one NEW NewsSourceEntry
 * - Calls the INTERNAL automation runner over HTTP
 * - Verifies the entry was processed and a NewsItem was created
 *
 * Requires:
 * - A dev server running (recommended: `npm run dev:e2e` on http://localhost:3001)
 * - NEWS_ENGINE_CRON_SECRET in `.env`
 *
 * Run:
 *   npx tsx scripts/news-engine-rss-http-test.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { encryptWithNewsMasterKey } from '../src/lib/news-engine/key-vault';

const prisma = new PrismaClient();

function loadDotEnvFallback(): void {
  const envPath = resolve(process.cwd(), '.env');
  let raw = '';
  try {
    raw = readFileSync(envPath, 'utf8');
  } catch {
    return;
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (!key) continue;
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

async function ensureSetting(key: string, value: string): Promise<void> {
  await prisma.settings.upsert({
    where: { key },
    create: { key, value },
    update: { value },
    select: { key: true },
  });
}

async function main() {
  loadDotEnvFallback();

  const openAiApiKey = (process.env.OPENAI_API_KEY || '').trim();

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001').replace(/\/$/, '');
  const cronSecret = (process.env.NEWS_ENGINE_CRON_SECRET || '').trim();

  if (!cronSecret) {
    throw new Error('Missing NEWS_ENGINE_CRON_SECRET in .env (required to call internal automation runner).');
  }

  if (!openAiApiKey) {
    throw new Error('Missing OPENAI_API_KEY in .env (required to seed a Drafting key for the automation runner).');
  }

  console.log('🧪 News Engine RSS HTTP Test');
  console.log(`- Base URL: ${baseUrl}`);

  // Force automation settings to allow drafting during the test.
  await ensureSetting('news.automation.auto_draft', 'true');
  await ensureSetting('news.automation.auto_schedule', 'false');
  await ensureSetting('news.automation.auto_publish', 'false');
  await ensureSetting('news.settings.daily_limit', '10');
  await ensureSetting('news.settings.deduplication_enabled', 'true');

  // Ensure the internal runner has at least one valid Drafting key.
  // Playwright E2E uses dummy keys, which should not be used by the runner.
  await prisma.newsApiKey.updateMany({
    where: {
      pools: { has: 'DRAFTING' },
      label: { startsWith: 'E2E Drafting Key' },
    },
    data: { enabled: false },
  });

  const existingDraftingKey = await prisma.newsApiKey.findFirst({
    where: {
      enabled: true,
      provider: 'openai',
      pools: { has: 'DRAFTING' },
    },
    select: { id: true },
  });

  if (!existingDraftingKey) {
    await prisma.newsApiKey.create({
      data: {
        provider: 'openai',
        label: `E2E Script Drafting Key (${new Date().toISOString().slice(0, 10)})`,
        pools: ['DRAFTING'],
        enabled: true,
        encryptedKey: encryptWithNewsMasterKey(openAiApiKey),
      },
      select: { id: true },
    });
  }

  // Seed a disabled source so the runner will NOT attempt external RSS fetch.
  const sourceId = `e2e-http-source-${Date.now().toString(36)}`;
  await prisma.newsSource.create({
    data: {
      id: sourceId,
      name: 'E2E HTTP Test Source (Disabled)',
      url: 'https://example.com/disabled-feed.xml',
      enabled: false,
      kind: 'RSS_FEED',
    },
    select: { id: true },
  });

  const now = new Date();
  const entryUrl = `https://example.com/e2e-http-seed/${now.getTime()}`;
  const entryTitle = `[E2E HTTP Seed] Solar market update ${now.toISOString()}`;

  const entry = await prisma.newsSourceEntry.create({
    data: {
      sourceId,
      url: entryUrl,
      title: entryTitle,
      publishedAt: now,
      fetchedAt: now,
      status: 'NEW',
      rawJson: { title: entryTitle, link: entryUrl, isoDate: now.toISOString(), contentSnippet: 'Seeded test entry.' },
    },
    select: { id: true },
  });

  console.log(`- Seeded NewsSourceEntry: ${entry.id}`);

  const resp = await fetch(`${baseUrl}/api/internal/news-engine/automation/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-news-engine-cron-secret': cronSecret,
    },
    body: JSON.stringify({ reason: 'e2e_http_test' }),
  });

  const bodyText = await resp.text();
  let bodyJson: any = null;
  try {
    bodyJson = JSON.parse(bodyText);
  } catch {
    bodyJson = null;
  }

  if (!resp.ok) {
    throw new Error(`Runner HTTP ${resp.status}: ${bodyJson?.error || bodyText || 'Unknown error'}`);
  }

  const refreshedEntry = await prisma.newsSourceEntry.findUnique({
    where: { id: entry.id },
    select: { id: true, status: true, itemId: true, error: true },
  });

  if (!refreshedEntry) {
    throw new Error('Seeded entry disappeared unexpectedly.');
  }

  if (refreshedEntry.status !== 'PROCESSED' || !refreshedEntry.itemId) {
    throw new Error(
      `Entry was not processed. status=${refreshedEntry.status} itemId=${refreshedEntry.itemId ?? 'null'} error=${
        refreshedEntry.error ?? 'null'
      }\nRunner response: ${bodyText.slice(0, 1200)}`
    );
  }

  const item = await prisma.newsItem.findUnique({
    where: { id: refreshedEntry.itemId },
    select: { id: true, title: true, status: true, aiModel: true, createdAt: true },
  });

  console.log('✅ Runner response (summary):', {
    rssImported: bodyJson?.rssResults?.reduce?.((sum: number, r: any) => sum + (r?.imported || 0), 0) ?? undefined,
    draftResultsCount: Array.isArray(bodyJson?.draftResults) ? bodyJson.draftResults.length : undefined,
  });

  console.log('✅ Entry processed:', refreshedEntry);
  console.log('✅ Created NewsItem:', item);
  console.log('\n🎉 RSS HTTP test PASSED');
  console.log('- Refresh /admin/news-engine → Drafts & Reviews to see the new item.');
}

main()
  .catch((err) => {
    console.error('❌ RSS HTTP test FAILED');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => null);
  });
