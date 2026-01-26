import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    const where: Prisma.MediaFolderWhereInput = {
      parentId: parentId || null,
    };

    const folders = await prisma.mediaFolder.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        parent: { select: { id: true, name: true } },
        _count: {
          select: {
            children: true,
            assets: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    const totalFolders = await prisma.mediaFolder.count();

    return NextResponse.json({
      total: totalFolders,
      parentId: parentId || null,
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        parentId: f.parentId,
        parent: f.parent,
        childrenCount: f._count.children,
        assetCount: f._count.assets,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        { error: 'Database schema missing media_folders table. Apply migrations and retry.' },
        { status: 500 }
      );
    }

    console.error('[GET /api/admin/media/folders] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch media folders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const name = normalizeString(body.name).trim();
    const parentId = body.parentId || null;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    if (parentId) {
      const parentExists = await prisma.mediaFolder.findUnique({ where: { id: parentId } });
      if (!parentExists) {
        return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 });
      }
    }

    const existing = await prisma.mediaFolder.findFirst({
      where: { parentId, name },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A folder with this name already exists in the parent folder' },
        { status: 409 }
      );
    }

    const created = await prisma.mediaFolder.create({
      data: {
        name,
        parentId,
      },
      include: {
        parent: { select: { id: true, name: true } },
        _count: {
          select: {
            children: true,
            assets: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    return NextResponse.json(
      {
        folder: {
          id: created.id,
          name: created.name,
          parentId: created.parentId,
          parent: created.parent,
          childrenCount: created._count.children,
          assetCount: created._count.assets,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A folder with this name already exists in the parent folder' },
        { status: 409 }
      );
    }

    console.error('[POST /api/admin/media/folders] Error:', error);
    return NextResponse.json({ error: 'Failed to create media folder' }, { status: 500 });
  }
}
