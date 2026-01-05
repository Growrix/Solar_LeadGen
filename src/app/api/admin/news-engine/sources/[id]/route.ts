import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

// PUT /api/admin/news-engine/sources/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    const body = await request.json();

    const id = params.id;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const data: Prisma.NewsSourceUpdateInput = {
      ...(typeof body.enabled === 'boolean' ? { enabled: body.enabled } : {}),
      ...(typeof body.name === 'string' ? { name: normalizeString(body.name).trim() } : {}),
      ...(typeof body.url === 'string' ? { url: normalizeString(body.url).trim() } : {}),
      ...(typeof body.lastSync === 'string'
        ? {
            lastSync: (() => {
              const dt = new Date(body.lastSync);
              return Number.isNaN(dt.getTime()) ? undefined : dt;
            })(),
          }
        : {}),
      ...(typeof body.articleCount === 'number' && Number.isFinite(body.articleCount)
        ? { articleCount: Math.max(0, Math.floor(body.articleCount)) }
        : {}),
    };

    const updated = await prisma.newsSource.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        url: true,
        enabled: true,
        lastSync: true,
        articleCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_source_updated',
      actorId: auth.userId,
      sourceId: updated.id,
      metadata: { name: updated.name, url: updated.url, enabled: updated.enabled },
    });

    return NextResponse.json({ source: updated });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021') {
        return NextResponse.json(
          {
            error: 'Database schema missing News Engine tables. Apply migrations and retry.',
          },
          { status: 500 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Source not found' }, { status: 404 });
      }
    }

    console.error('❌ [PUT /api/admin/news-engine/sources/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update source' }, { status: 500 });
  }
}

// DELETE /api/admin/news-engine/sources/[id]
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();

    const id = params.id;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await prisma.newsSource.delete({ where: { id } });

    await writeNewsAuditLog({
      action: 'news_source_deleted',
      actorId: auth.userId,
      sourceId: id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021') {
        return NextResponse.json(
          {
            error: 'Database schema missing News Engine tables. Apply migrations and retry.',
          },
          { status: 500 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Source not found' }, { status: 404 });
      }
    }

    console.error('❌ [DELETE /api/admin/news-engine/sources/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
  }
}
