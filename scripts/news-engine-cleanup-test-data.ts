/**
 * News Engine Safe Cleanup Script
 *
 * Goal: remove/disable only clearly-labeled E2E/test artifacts created by
 * Playwright and local scripts, without broad deletes.
 *
 * Default: DRY RUN (no DB changes)
 * Apply:   npx tsx scripts/news-engine-cleanup-test-data.ts --apply
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function readNumberFlag(name: string, fallback: number): number {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return fallback;
  const raw = process.argv[idx + 1];
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toIsoShort(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

async function main() {
  const apply = hasFlag('--apply');
  const lookbackDays = readNumberFlag('--days', 14);
  const cutoff = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

  console.log('🧹 News Engine Safe Cleanup');
  console.log(`- Mode: ${apply ? 'APPLY' : 'DRY RUN'}`);
  console.log(`- Lookback: last ${lookbackDays} days (cutoff: ${toIsoShort(cutoff)})`);

  // 1) Disable E2E keys (do NOT hard-delete to avoid accidental loss of a real key).
  const keyWhere = {
    createdAt: { gte: cutoff },
    OR: [
      { label: { startsWith: 'E2E' } },
      { label: { contains: 'E2E ' } },
      { label: { contains: 'E2E_' } },
    ],
  } as const;

  const keys = await prisma.newsApiKey.findMany({
    where: keyWhere,
    orderBy: [{ createdAt: 'desc' }],
    select: { id: true, label: true, provider: true, enabled: true, createdAt: true, pools: true },
  });

  console.log(`- Candidate NewsApiKey rows to disable: ${keys.length}`);
  for (const k of keys.slice(0, 10)) {
    console.log(`  - ${k.id} | ${k.provider} | ${k.label} | enabled=${k.enabled} | pools=${k.pools.join(',')} | ${toIsoShort(k.createdAt)}`);
  }
  if (keys.length > 10) console.log(`  (and ${keys.length - 10} more...)`);

  if (apply && keys.length) {
    await prisma.newsApiKey.updateMany({
      where: { id: { in: keys.map((k) => k.id) } },
      data: { enabled: false },
    });
    console.log('✅ Disabled E2E keys');
  }

  // 2) Delete E2E sources (safe; items will be preserved with sourceId set to null).
  const sources = await prisma.newsSource.findMany({
    where: {
      createdAt: { gte: cutoff },
      OR: [
        { id: 'e2e-test-source' },
        { id: { startsWith: 'e2e-http-source-' } },
        { name: { startsWith: 'E2E ' } },
        { name: { contains: 'E2E HTTP' } },
      ],
    },
    orderBy: [{ createdAt: 'desc' }],
    select: { id: true, name: true, enabled: true, createdAt: true },
  });

  console.log(`- Candidate NewsSource rows to delete: ${sources.length}`);
  for (const s of sources.slice(0, 10)) {
    console.log(`  - ${s.id} | ${s.name} | enabled=${s.enabled} | ${toIsoShort(s.createdAt)}`);
  }
  if (sources.length > 10) console.log(`  (and ${sources.length - 10} more...)`);

  if (apply && sources.length) {
    await prisma.newsSource.deleteMany({ where: { id: { in: sources.map((s) => s.id) } } });
    console.log('✅ Deleted E2E sources (entries cascade)');
  }

  // 3) Soft-delete E2E items (non-destructive).
  const items = await prisma.newsItem.findMany({
    where: {
      createdAt: { gte: cutoff },
      deletedAt: null,
      OR: [
        { title: { startsWith: 'E2E ' } },
        { title: { contains: 'E2E Seed' } },
        { title: { contains: 'E2E HTTP' } },
        { tags: { has: 'e2e' } },
      ],
    },
    orderBy: [{ createdAt: 'desc' }],
    select: { id: true, title: true, status: true, createdAt: true, tags: true },
  });

  console.log(`- Candidate NewsItem rows to soft-delete: ${items.length}`);
  for (const it of items.slice(0, 10)) {
    console.log(`  - ${it.id} | ${it.title} | status=${it.status} | tags=${it.tags.join(',')} | ${toIsoShort(it.createdAt)}`);
  }
  if (items.length > 10) console.log(`  (and ${items.length - 10} more...)`);

  if (apply && items.length) {
    const now = new Date();
    await prisma.newsItem.updateMany({
      where: { id: { in: items.map((i) => i.id) } },
      data: { deletedAt: now },
    });
    console.log('✅ Soft-deleted E2E items (set deletedAt)');
  }

  // 4) Delete explicit E2E AI logs created by scripts.
  const aiLogs = await prisma.newsAiRequestLog.findMany({
    where: {
      createdAt: { gte: cutoff },
      OR: [{ action: { startsWith: 'e2e_' } }, { action: { contains: 'e2e_' } }],
    },
    orderBy: [{ createdAt: 'desc' }],
    select: { id: true, action: true, success: true, createdAt: true },
  });

  console.log(`- Candidate NewsAiRequestLog rows to delete: ${aiLogs.length}`);
  for (const log of aiLogs.slice(0, 10)) {
    console.log(`  - ${log.id} | ${log.action} | success=${log.success} | ${toIsoShort(log.createdAt)}`);
  }
  if (aiLogs.length > 10) console.log(`  (and ${aiLogs.length - 10} more...)`);

  if (apply && aiLogs.length) {
    await prisma.newsAiRequestLog.deleteMany({ where: { id: { in: aiLogs.map((l) => l.id) } } });
    console.log('✅ Deleted E2E AI request logs');
  }

  console.log('\n🎉 Cleanup complete');
  if (!apply) {
    console.log('Run with `--apply` to perform changes.');
  }
}

main()
  .catch((err) => {
    console.error('❌ Cleanup FAILED');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => null);
  });
