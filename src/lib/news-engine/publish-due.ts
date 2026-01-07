import { prisma } from '@/lib/prisma';
import { slugify } from './slug';
import { writeNewsAuditLog } from './audit';

export async function findAvailableSlug(base: string, excludeItemId?: string): Promise<string | null> {
  const normalizedBase = base.trim();
  if (!normalizedBase) return null;

  for (let i = 0; i < 25; i++) {
    const candidate = i === 0 ? normalizedBase : `${normalizedBase}-${i + 1}`;
    const existing = await prisma.newsItem.findFirst({
      where: {
        slug: candidate,
        ...(excludeItemId ? { id: { not: excludeItemId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;
  }

  return `${normalizedBase}-${Date.now().toString(36)}`;
}

export async function publishDueScheduledNewsItems(input?: { limit?: number }): Promise<{ publishedCount: number }> {
  const limit = Math.min(Math.max(input?.limit ?? 50, 1), 200);
  const now = new Date();

  const due = await prisma.newsItem.findMany({
    where: {
      status: 'SCHEDULED',
      deletedAt: null,
      scheduledFor: {
        lte: now,
      },
    },
    orderBy: [{ scheduledFor: 'asc' }, { id: 'asc' }],
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      scheduledFor: true,
    },
  });

  let publishedCount = 0;

  for (const item of due) {
    try {
      const base = item.slug?.trim() || slugify(item.title);
      const slug = await findAvailableSlug(base, item.id);
      if (!slug) continue;

      const publishedAt = new Date();

      await prisma.newsItem.update({
        where: { id: item.id },
        data: {
          status: 'PUBLISHED',
          publishedAt,
          scheduledFor: null,
          rejectedAt: null,
          rejectionReason: null,
          slug,
        },
        select: { id: true },
      });

      await writeNewsAuditLog({
        action: 'news_item_auto_published',
        itemId: item.id,
        metadata: {
          scheduledFor: item.scheduledFor?.toISOString() ?? null,
          publishedAt: publishedAt.toISOString(),
          slug,
        },
      });

      publishedCount += 1;
    } catch (error) {
      // Best-effort: if another request published it first, ignore.
      console.warn('⚠️ [publishDueScheduledNewsItems] Unable to publish due item:', item.id, error);
    }
  }

  return { publishedCount };
}
