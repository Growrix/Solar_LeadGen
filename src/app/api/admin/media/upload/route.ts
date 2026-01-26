import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';

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
      const { ObjectStorageService } = await import('@/lib/replit_integrations/object_storage');
      const storage = new ObjectStorageService();
      
      const uploadURL = await storage.getPresignedUploadUrl(objectKey, contentType);
      const publicUrl = storage.getPublicUrl(objectKey);

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
      });
    } catch (storageError) {
      console.error('[POST /api/admin/media/upload] Object Storage Error:', storageError);
      
      return NextResponse.json(
        { error: 'Object storage is not configured. Please set up Replit Object Storage.' },
        { status: 503 }
      );
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
