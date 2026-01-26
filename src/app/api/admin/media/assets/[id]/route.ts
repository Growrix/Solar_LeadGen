import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;

    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
      include: {
        folder: { select: { id: true, name: true, parentId: true } },
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({
      asset: {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        url: asset.url,
        s3Key: asset.s3Key,
        size: asset.size,
        dimensions: asset.dimensions,
        mimeType: asset.mimeType,
        altText: asset.altText,
        caption: asset.caption,
        tags: asset.tags,
        folderId: asset.folderId,
        folder: asset.folder,
        status: asset.status,
        uploadedById: asset.uploadedById,
        uploadedBy: asset.uploadedBy,
        trashedAt: asset.trashedAt,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('[GET /api/admin/media/assets/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch media asset' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (body.folderId !== undefined && body.folderId !== null) {
      const folderExists = await prisma.mediaFolder.findUnique({ where: { id: body.folderId } });
      if (!folderExists) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
      }
    }

    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: normalizeString(body.name).trim() } : {}),
        ...(body.altText !== undefined ? { altText: normalizeString(body.altText) } : {}),
        ...(body.caption !== undefined ? { caption: normalizeString(body.caption) } : {}),
        ...(body.tags !== undefined ? { tags: normalizeStringArray(body.tags) } : {}),
        ...(body.folderId !== undefined ? { folderId: body.folderId || null } : {}),
      },
      include: {
        folder: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      asset: {
        id: updated.id,
        name: updated.name,
        type: updated.type,
        url: updated.url,
        s3Key: updated.s3Key,
        size: updated.size,
        dimensions: updated.dimensions,
        mimeType: updated.mimeType,
        altText: updated.altText,
        caption: updated.caption,
        tags: updated.tags,
        folderId: updated.folderId,
        folder: updated.folder,
        status: updated.status,
        uploadedById: updated.uploadedById,
        uploadedBy: updated.uploadedBy,
        trashedAt: updated.trashedAt,
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
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    console.error('[PUT /api/admin/media/assets/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update media asset' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const existing = await prisma.mediaAsset.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    if (permanent) {
      await prisma.mediaAsset.delete({ where: { id } });
      return NextResponse.json({ success: true, action: 'deleted' });
    }

    if (existing.status === 'TRASHED') {
      await prisma.mediaAsset.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          trashedAt: null,
        },
      });
      return NextResponse.json({ success: true, action: 'restored' });
    }

    await prisma.mediaAsset.update({
      where: { id },
      data: {
        status: 'TRASHED',
        trashedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, action: 'trashed' });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('[DELETE /api/admin/media/assets/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to process media asset' }, { status: 500 });
  }
}
