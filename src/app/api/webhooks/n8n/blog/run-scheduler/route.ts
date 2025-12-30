import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireN8nSecret } from '../_shared';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = requireN8nSecret(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const startedAt = new Date();
  const job = await prisma.blogJobLog.create({
    data: {
      type: 'PUBLISH_SCHEDULED',
      status: 'SUCCESS',
      startedAt,
      meta: { note: 'started' },
    },
    select: { id: true },
  });

  try {
    const now = new Date();

    const due = await prisma.blogPost.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: { lte: now },
      },
      select: { id: true, slug: true },
    });

    if (due.length === 0) {
      await prisma.blogJobLog.update({
        where: { id: job.id },
        data: {
          status: 'SUCCESS',
          finishedAt: new Date(),
          meta: { publishedCount: 0, published: [] },
        },
      });

      return NextResponse.json({ publishedCount: 0, published: [] });
    }

    const ids = due.map((p) => p.id);

    await prisma.blogPost.updateMany({
      where: { id: { in: ids }, status: 'SCHEDULED' },
      data: {
        status: 'PUBLISHED',
        publishedAt: now,
      },
    });

    await prisma.blogJobLog.update({
      where: { id: job.id },
      data: {
        status: 'SUCCESS',
        finishedAt: new Date(),
        meta: { publishedCount: due.length, published: due },
      },
    });

    return NextResponse.json({ publishedCount: due.length, published: due });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to publish scheduled posts';

    await prisma.blogJobLog
      .update({
        where: { id: job.id },
        data: {
          status: 'FAILURE',
          finishedAt: new Date(),
          error: message,
        },
      })
      .catch(() => null);

    console.error('❌ [POST /api/webhooks/n8n/blog/run-scheduler] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
