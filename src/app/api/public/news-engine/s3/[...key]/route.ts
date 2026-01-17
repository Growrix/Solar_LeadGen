import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function decodeKeyPath(segments: string[]): string {
  return segments.map((seg) => decodeURIComponent(seg)).join('/');
}

// Public read proxy for News Engine assets stored in S3.
// This avoids requiring the S3 bucket to be publicly readable.
export async function GET(_request: NextRequest, context: { params: Promise<{ key: string[] }> }) {
  try {
    const { key: keySegments } = await context.params;
    const key = decodeKeyPath(keySegments || []);

    // Safety: only allow reading News Engine OG images.
    if (!key.startsWith('news-engine/og-images/')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const bucket = (process.env.AWS_S3_BUCKET || '').trim();
    if (!bucket) {
      return NextResponse.json({ error: 'S3 not configured' }, { status: 500 });
    }

    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const body = response.Body;
    if (!body) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', response.ContentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    // NextResponse supports Node.js Readable as the body in nodejs runtime.
    return new NextResponse(body as any, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
