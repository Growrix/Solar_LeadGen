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

export async function GET() {
  try {
    await requireAdmin();

    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        {
          error:
            'Database schema missing blog tables. Apply migrations (npx prisma migrate deploy) and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [GET /api/admin/blog/categories] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const name = normalizeString(body.name).trim();
    const explicitSlug = normalizeString(body.slug).trim();
    const slug = slugify(explicitSlug || name);

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const created = await prisma.blogCategory.create({
      data: { name, slug },
      select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ category: created }, { status: 201 });
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
            error:
              'Database schema missing blog tables. Apply migrations (npx prisma migrate deploy) and retry.',
          },
          { status: 500 }
        );
      }

      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Category name or slug already exists' },
          { status: 409 }
        );
      }
    }

    console.error('❌ [POST /api/admin/blog/categories] Error:', error);
    return NextResponse.json({ error: 'Failed to create blog category' }, { status: 500 });
  }
}
