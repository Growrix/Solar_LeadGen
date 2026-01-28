import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { getPresignedUploadUrl, getPublicUrlForKey } from '@/lib/s3';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function getMediaType(mimeType: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  return 'DOCUMENT';
}

function generateObjectKey(filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `media/${timestamp}-${random}-${sanitized}`;
}

function isLocalUploadEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_LOCAL_MEDIA_UPLOADS === 'true';
}

function toPublicUploadPath(objectPath: string): string {
  // Store under /public/uploads/... and serve at /uploads/...
  const safe = objectPath.replace(/^[\\/]+/, '').replace(/\.\.(\\|\/)/g, '');
  if (!safe.startsWith('uploads/')) {
    return `uploads/${safe}`;
  }
  return safe;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const name = normalizeString(body.name).trim();
    const size = typeof body.size === 'number' ? body.size : 0;
    const contentType = normalizeString(body.contentType).trim();

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    if (!contentType) {
      return NextResponse.json({ error: 'contentType is required' }, { status: 400 });
    }

    if (size <= 0) {
      return NextResponse.json({ error: 'size must be greater than 0' }, { status: 400 });
    }

    const maxSize = 100 * 1024 * 1024;
    if (size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 100MB limit' }, { status: 400 });
    }

    const objectKey = generateObjectKey(name);
    const type = getMediaType(contentType);

    try {
      const uploadURL = await getPresignedUploadUrl(objectKey, contentType);
      const publicUrl = getPublicUrlForKey(objectKey);

      return NextResponse.json({
        uploadURL,
        objectPath: objectKey,
        publicUrl,
        metadata: {
          name,
          size,
          contentType,
          type,
        },
        storage: {
          mode: 's3',
        },
      });
    } catch (storageError) {
      console.error('[POST /api/admin/media/upload] Storage Error:', storageError);

      if (!isLocalUploadEnabled()) {
        return NextResponse.json(
          {
            error:
              'Object storage is not configured. Configure AWS S3 env vars (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET) or enable local uploads with ALLOW_LOCAL_MEDIA_UPLOADS=true (dev-only).',
          },
          { status: 503 }
        );
      }

      const localObjectPath = toPublicUploadPath(`uploads/${objectKey}`);
      const uploadURL = `/api/admin/media/upload?local=1&objectPath=${encodeURIComponent(localObjectPath)}`;
      const publicUrl = `/${localObjectPath}`;

      return NextResponse.json({
        uploadURL,
        objectPath: localObjectPath,
        publicUrl,
        metadata: {
          name,
          size,
          contentType,
          type,
        },
        storage: {
          mode: 'local',
        },
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('[POST /api/admin/media/upload] Error:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const local = searchParams.get('local') === '1';
    const objectPathRaw = normalizeString(searchParams.get('objectPath')).trim();

    if (!local) {
      return NextResponse.json({ error: 'Invalid upload mode' }, { status: 400 });
    }

    if (!isLocalUploadEnabled()) {
      return NextResponse.json({ error: 'Local uploads are disabled' }, { status: 403 });
    }

    if (!objectPathRaw) {
      return NextResponse.json({ error: 'objectPath is required' }, { status: 400 });
    }

    const objectPath = toPublicUploadPath(objectPathRaw);
    if (!objectPath.startsWith('uploads/')) {
      return NextResponse.json({ error: 'Invalid objectPath' }, { status: 400 });
    }

    const contentType = normalizeString(request.headers.get('content-type')).trim();
    if (!contentType) {
      return NextResponse.json({ error: 'content-type header is required' }, { status: 400 });
    }

    const buf = Buffer.from(await request.arrayBuffer());
    const maxSize = 100 * 1024 * 1024;
    if (buf.length <= 0) {
      return NextResponse.json({ error: 'Empty upload' }, { status: 400 });
    }
    if (buf.length > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 100MB limit' }, { status: 400 });
    }

    const absoluteTarget = path.join(process.cwd(), 'public', objectPath);
    const absoluteDir = path.dirname(absoluteTarget);
    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absoluteTarget, buf);

    return NextResponse.json({ success: true, publicUrl: `/${objectPath}` }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('[PUT /api/admin/media/upload] Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
