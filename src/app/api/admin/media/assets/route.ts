import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

type MediaAssetType = 'IMAGE' | 'VIDEO' | 'DOCUMENT';
type MediaAssetStatus = 'ACTIVE' | 'TRASHED';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeType(value: unknown): MediaAssetType | null {
  if (typeof value !== 'string') return null;
  const upper = value.toUpperCase();
  if (upper === 'IMAGE' || upper === 'VIDEO' || upper === 'DOCUMENT') {
    return upper;
  }
  return null;
}

function normalizeStatus(value: unknown): MediaAssetStatus | null {
  if (typeof value !== 'string') return null;
  const upper = value.toUpperCase();
  if (upper === 'ACTIVE' || upper === 'TRASHED') {
    return upper;
  }
  return null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') ?? 'ACTIVE';
    const status = normalizeStatus(statusParam) ?? 'ACTIVE';
    const typeParam = searchParams.get('type');
    const type = typeParam ? normalizeType(typeParam) : null;
    const folderId = searchParams.get('folderId');
    const q = normalizeString(searchParams.get('q')).trim();
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.MediaAssetWhereInput = {
      status,
      ...(type ? { type } : {}),
      ...(folderId !== null
        ? folderId === 'root'
          ? { folderId: null }
          : { folderId }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { altText: { contains: q, mode: 'insensitive' } },
              { tags: { has: q } },
            ],
          }
        : {}),
    };

    const [activeCount, trashedCount, imageCount, videoCount, documentCount, total, assets] = await Promise.all([
      prisma.mediaAsset.count({ where: { status: 'ACTIVE' } }),
      prisma.mediaAsset.count({ where: { status: 'TRASHED' } }),
      prisma.mediaAsset.count({ where: { status: 'ACTIVE', type: 'IMAGE' } }),
      prisma.mediaAsset.count({ where: { status: 'ACTIVE', type: 'VIDEO' } }),
      prisma.mediaAsset.count({ where: { status: 'ACTIVE', type: 'DOCUMENT' } }),
      prisma.mediaAsset.count({ where }),
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          folder: { select: { id: true, name: true } },
          uploadedBy: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({
      counts: {
        all: activeCount + trashedCount,
        active: activeCount,
        trashed: trashedCount,
        images: imageCount,
        videos: videoCount,
        documents: documentCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      assets: assets.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        url: a.url,
        s3Key: a.s3Key,
        size: a.size,
        dimensions: a.dimensions,
        mimeType: a.mimeType,
        altText: a.altText,
        caption: a.caption,
        tags: a.tags,
        folderId: a.folderId,
        folder: a.folder,
        status: a.status,
        uploadedById: a.uploadedById,
        uploadedBy: a.uploadedBy,
        trashedAt: a.trashedAt,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
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
        { error: 'Database schema missing media_assets table. Apply migrations and retry.' },
        { status: 500 }
      );
    }

    console.error('[GET /api/admin/media/assets] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch media assets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    const body = await request.json();

    const name = normalizeString(body.name).trim();
    const url = normalizeString(body.url).trim();
    const s3Key = normalizeString(body.s3Key).trim();
    const mimeType = normalizeString(body.mimeType).trim();
    const size = typeof body.size === 'number' ? body.size : 0;
    const type = normalizeType(body.type);

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }

    if (!s3Key) {
      return NextResponse.json({ error: 's3Key is required' }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: 'type must be one of: IMAGE, VIDEO, DOCUMENT' }, { status: 400 });
    }

    const existingKey = await prisma.mediaAsset.findUnique({ where: { s3Key } });
    if (existingKey) {
      return NextResponse.json({ error: 'Asset with this s3Key already exists' }, { status: 409 });
    }

    if (body.folderId) {
      const folderExists = await prisma.mediaFolder.findUnique({ where: { id: body.folderId } });
      if (!folderExists) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
      }
    }

    const created = await prisma.mediaAsset.create({
      data: {
        name,
        type,
        url,
        s3Key,
        size,
        dimensions: normalizeString(body.dimensions),
        mimeType,
        altText: normalizeString(body.altText),
        caption: normalizeString(body.caption),
        tags: normalizeStringArray(body.tags),
        folderId: body.folderId || null,
        status: 'ACTIVE',
        uploadedById: auth.userId,
      },
      include: {
        folder: { select: { id: true, name: true } },
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(
      {
        asset: {
          id: created.id,
          name: created.name,
          type: created.type,
          url: created.url,
          s3Key: created.s3Key,
          size: created.size,
          dimensions: created.dimensions,
          mimeType: created.mimeType,
          altText: created.altText,
          caption: created.caption,
          tags: created.tags,
          folderId: created.folderId,
          folder: created.folder,
          status: created.status,
          uploadedById: created.uploadedById,
          uploadedBy: created.uploadedBy,
          trashedAt: created.trashedAt,
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
      return NextResponse.json({ error: 'Asset with this s3Key already exists' }, { status: 409 });
    }

    console.error('[POST /api/admin/media/assets] Error:', error);
    return NextResponse.json({ error: 'Failed to create media asset' }, { status: 500 });
  }
}
