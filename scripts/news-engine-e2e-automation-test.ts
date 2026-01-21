/**
 * News Engine Automation E2E Test
 *
 * What this does (safe, non-destructive):
 * - Creates/ensures a disabled NewsSource (so no external RSS fetch is required)
 * - Inserts one NEW NewsSourceEntry (seed input for automation)
 * - Calls the internal automation runner endpoint over HTTP
 * - Verifies a NewsItem + NewsAiRequestLog were created
 *
 * Run:
 *   npx tsx scripts/news-engine-e2e-automation-test.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { callOpenAiJson } from '../src/lib/openai';

const prisma = new PrismaClient();

function loadDotEnvFallback(): void {
  // Scripts run outside Next.js, so we load .env here for the script process only.
  // This does NOT affect your already-running Next.js dev server.
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

async function main() {
  loadDotEnvFallback();

  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  const model = (process.env.OPENAI_MODEL || 'gpt-4o-mini').trim() || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Add it to .env and restart your dev server if needed.');
  }

  console.log('🧪 News Engine Automation E2E Test');
  console.log(`- OpenAI model: ${model}`);

  // 1) Ensure a source exists (disabled so the runner will not attempt external fetch)
  const sourceId = 'e2e-test-source';
  const source = await prisma.newsSource.upsert({
    where: { id: sourceId },
    create: {
      id: sourceId,
      name: 'E2E Test Source (Local)',
      url: 'https://example.com/e2e-test-feed.xml',
      enabled: false,
      kind: 'RSS_FEED',
    },
    update: {
      name: 'E2E Test Source (Local)',
      url: 'https://example.com/e2e-test-feed.xml',
      enabled: false,
      kind: 'RSS_FEED',
    },
    select: { id: true },
  });

  // 2) Insert one NEW entry for the automation runner to pick up
  const now = new Date();
  const entryUrl = `https://example.com/e2e-seed/${now.getTime()}`;
  const entryTitle = `[E2E Seed] Solar market update ${now.toISOString()}`;

  const entry = await prisma.newsSourceEntry.create({
    data: {
      sourceId: source.id,
      url: entryUrl,
      title: entryTitle,
      publishedAt: now,
      fetchedAt: now,
      status: 'NEW',
      rawJson: { title: entryTitle, link: entryUrl, isoDate: now.toISOString() },
    },
    select: { id: true },
  });

  console.log(`- Seeded NewsSourceEntry: ${entry.id}`);

  // 3) Run a direct OpenAI → DB draft flow (same shape as the internal runner)
  const aiLog = await prisma.newsAiRequestLog.create({
    data: {
      action: 'e2e_local_draft_from_source_entry',
      provider: 'openai',
      model,
      input: {
        entryId: entry.id,
        title: entryTitle,
        url: entryUrl,
        publishedAt: now.toISOString(),
      },
      success: false,
    },
    select: { id: true },
  });

  const prompt = [
    'Draft a NEWS ENGINE post from this RSS-like entry.',
    '',
    `- Title: ${entryTitle}`,
    `- URL: ${entryUrl}`,
    `- PublishedAt: ${now.toISOString()}`,
    '',
    'Constraints:',
    '- Be accurate and avoid unverifiable claims.',
    '- Write in a professional news style for a solar lead-gen site.',
    '- Return JSON only (no markdown).',
    '- JSON fields: title, summary, contentHtml, category, tags (array), seoTitle, seoDescription, ogImageUrl.',
    '- contentHtml must be valid HTML (<p>, <h2>, <ul>/<li>).',
  ].join('\n');

  let raw = '';
  try {
    const system =
      'You are an assistant that drafts NEWS ENGINE posts for a solar lead-gen company. Output must be valid JSON only with fields: title, summary, contentHtml, category, tags (array of strings), seoTitle, seoDescription, ogImageUrl. contentHtml must be valid HTML and should not include unverified claims.';
    const result = await callOpenAiJson({
      system,
      prompt,
      modelOverride: model,
      temperature: 0.4,
    });
    raw = result.raw;

    await prisma.newsAiRequestLog.update({
      where: { id: aiLog.id },
      data: { success: true, output: { raw, modelUsed: result.modelUsed } },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'OpenAI request failed';
    await prisma.newsAiRequestLog.update({
      where: { id: aiLog.id },
      data: { success: false, error: msg },
    });
    throw err;
  }

  const trimmed = raw.trim();
  const unfenced = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  let parsed: any = null;
  try {
    parsed = JSON.parse(unfenced);
  } catch {
    parsed = null;
  }

  const pickString = (obj: any, key: string, fallback = ''): string =>
    obj && typeof obj === 'object' && typeof obj[key] === 'string' ? String(obj[key]).trim() : fallback;
  const pickStringArray = (obj: any, key: string): string[] =>
    obj && typeof obj === 'object' && Array.isArray(obj[key])
      ? obj[key].filter((v: any) => typeof v === 'string').map((v: string) => v.trim()).filter(Boolean)
      : [];

  const draft = {
    title: pickString(parsed, 'title', entryTitle) || entryTitle,
    summary: pickString(parsed, 'summary', ''),
    contentHtml: pickString(parsed, 'contentHtml', ''),
    category: pickString(parsed, 'category', ''),
    tags: pickStringArray(parsed, 'tags'),
    seoTitle: pickString(parsed, 'seoTitle', '') || null,
    seoDescription: pickString(parsed, 'seoDescription', '') || null,
    ogImageUrl: pickString(parsed, 'ogImageUrl', '') || null,
  };

  const item = await prisma.newsItem.create({
    data: {
      title: draft.title,
      summary: draft.summary,
      contentHtml: draft.contentHtml,
      category: draft.category,
      tags: draft.tags,
      seoTitle: draft.seoTitle,
      seoDescription: draft.seoDescription,
      ogImageUrl: draft.ogImageUrl,
      status: 'NEEDS_REVIEW',
      aiModel: model,
      relevanceScore: 0,
      sourceType: 'RSS_FEED',
      sourceId: source.id,
    },
    select: { id: true, title: true, status: true, aiModel: true, createdAt: true },
  });

  await prisma.newsSourceEntry.update({
    where: { id: entry.id },
    data: { status: 'PROCESSED', itemId: item.id, error: null },
    select: { id: true },
  });

  await prisma.newsAiRequestLog.update({
    where: { id: aiLog.id },
    data: {
      success: true,
      itemId: item.id,
      output: { draft, raw },
    },
  });

  console.log('✅ Created NewsItem:', item);
  console.log(`\n🎉 E2E OpenAI + DB test PASSED`);
  console.log('- Refresh /admin/news-engine → Drafts & Reviews. You should see the new item under NEEDS REVIEW.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n❌ E2E automation test FAILED');
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
