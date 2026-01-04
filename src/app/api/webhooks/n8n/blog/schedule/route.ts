import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireN8nSecret } from '../_shared';

export const dynamic = 'force-dynamic';

type Payload = {
  postId: string;
  scheduledFor: string;
};

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseNullableDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const dt = new Date(trimmed);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export async function POST(request: NextRequest) {
  const auth = requireN8nSecret(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const startedAt = new Date();
  const job = await prisma.blogJobLog.create({
    data: {
      type: 'N8N_SCHEDULE_POST',
      status: 'SUCCESS',
      startedAt,
      meta: { note: 'started' },
    },
    select: { id: true },
  });

  try {
    const body = (await request.json().catch(() => null)) as Payload | null;

    const postId = normalizeString(body?.postId).trim();
    const scheduledFor = parseNullableDate(body?.scheduledFor);

    if (!postId) return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    if (!scheduledFor) return NextResponse.json({ error: 'scheduledFor is required (ISO or datetime string)' }, { status: 400 });

    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        status: 'SCHEDULED',
        scheduledFor,
      },
      select: { id: true, status: true, scheduledFor: true },
    });

    await prisma.blogJobLog.update({
      where: { id: job.id },
      data: {
        status: 'SUCCESS',
        finishedAt: new Date(),
        meta: { updated },
      },
    });

    return NextResponse.json({ post: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to schedule post';

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

    console.error('❌ [POST /api/webhooks/n8n/blog/schedule] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
