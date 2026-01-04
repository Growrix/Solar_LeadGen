import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireAdmin();

    const id = context.params.id;
    const tag = await prisma.blogTag.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ tag });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('❌ [GET /api/admin/blog/tags/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog tag' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireAdmin();

    const id = context.params.id;
    const body = await request.json();

    const name = normalizeString(body.name).trim();
    const explicitSlug = normalizeString(body.slug).trim();

    const data: { name?: string; slug?: string } = {};
    if (name) data.name = name;
    if (explicitSlug || name) {
      const nextSlug = slugify(explicitSlug || name);
      if (nextSlug) data.slug = nextSlug;
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await prisma.blogTag.update({
      where: { id },
      data,
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ tag: updated });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Tag name or slug already exists' }, { status: 409 });
      }
    }

    console.error('❌ [PATCH /api/admin/blog/tags/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update blog tag' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    await requireAdmin();

    const id = context.params.id;
    await prisma.blogTag.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    console.error('❌ [DELETE /api/admin/blog/tags/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete blog tag' }, { status: 500 });
  }
}
