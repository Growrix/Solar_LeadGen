import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;

    const folder = await prisma.mediaFolder.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true } },
        children: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            createdAt: true,
            _count: { select: { children: true, assets: { where: { status: 'ACTIVE' } } } },
          },
        },
        assets: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            name: true,
            type: true,
            url: true,
            mimeType: true,
            size: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            children: true,
            assets: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({
      folder: {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        parent: folder.parent,
        children: folder.children.map((c) => ({
          id: c.id,
          name: c.name,
          childrenCount: c._count.children,
          assetCount: c._count.assets,
          createdAt: c.createdAt,
        })),
        assets: folder.assets,
        childrenCount: folder._count.children,
        assetCount: folder._count.assets,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('[GET /api/admin/media/folders/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch media folder' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.mediaFolder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const name = body.name !== undefined ? normalizeString(body.name).trim() : existing.name;
    const parentId = body.parentId !== undefined ? (body.parentId || null) : existing.parentId;

    if (!name) {
      return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 });
    }

    if (parentId === id) {
      return NextResponse.json({ error: 'A folder cannot be its own parent' }, { status: 400 });
    }

    if (parentId && parentId !== existing.parentId) {
      const parentExists = await prisma.mediaFolder.findUnique({ where: { id: parentId } });
      if (!parentExists) {
        return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 });
      }
    }

    if (name !== existing.name || parentId !== existing.parentId) {
      const duplicate = await prisma.mediaFolder.findFirst({
        where: {
          parentId,
          name,
          id: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'A folder with this name already exists in the target location' },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.mediaFolder.update({
      where: { id },
      data: { name, parentId },
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

    return NextResponse.json({
      folder: {
        id: updated.id,
        name: updated.name,
        parentId: updated.parentId,
        parent: updated.parent,
        childrenCount: updated._count.children,
        assetCount: updated._count.assets,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A folder with this name already exists in the target location' },
        { status: 409 }
      );
    }

    console.error('[PUT /api/admin/media/folders/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update media folder' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;

    const existing = await prisma.mediaFolder.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            assets: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    if (existing._count.children > 0) {
      return NextResponse.json(
        { error: `Cannot delete folder with ${existing._count.children} subfolders. Delete or move them first.` },
        { status: 400 }
      );
    }

    if (existing._count.assets > 0) {
      return NextResponse.json(
        { error: `Cannot delete folder with ${existing._count.assets} assets. Delete or move them first.` },
        { status: 400 }
      );
    }

    await prisma.mediaFolder.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('[DELETE /api/admin/media/folders/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete media folder' }, { status: 500 });
  }
}
