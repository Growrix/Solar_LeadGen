import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/authorization';
import { searchUnsplashLandscapeImage } from '@/lib/news-engine/unsplash';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/news-engine/free-image/unsplash?q=...
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const q = request.nextUrl.searchParams.get('q')?.trim() || '';

    const result = await searchUnsplashLandscapeImage({ query: q });

    return NextResponse.json({
      ok: true,
      imageUrl: result.imageUrl,
      attribution: result.attribution,
    });
  } catch (error) {
    // Handle admin auth errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    const status = typeof (error as any)?.status === 'number' ? Number((error as any).status) : 500;
    const message = error instanceof Error ? error.message : 'Failed to find a free image';
    
    // Provide user-friendly message for OAuth/auth errors from Unsplash
    if (status === 401 && message.toLowerCase().includes('oauth')) {
      return NextResponse.json({ 
        error: 'Unsplash API key is invalid. Please check UNSPLASH_ACCESS_KEY in .env file.',
        details: message 
      }, { status: 401 });
    }
    
    return NextResponse.json({ error: message }, { status });
  }
}
