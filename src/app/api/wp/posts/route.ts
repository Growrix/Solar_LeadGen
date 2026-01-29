import { NextResponse } from 'next/server';
import { wpFetch } from '@/lib/wordpress/wpFetch';
import type { WpPost } from '@/lib/wordpress/types';

function clampInt(value: string | null, fallback: number, min: number, max: number) {
  const n = value ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const page = clampInt(url.searchParams.get('page'), 1, 1, 1000);
    const per_page = clampInt(url.searchParams.get('per_page'), 10, 1, 100);

    const search = url.searchParams.get('search') ?? undefined;
    const slug = url.searchParams.get('slug') ?? undefined;
    const status = url.searchParams.get('status') ?? 'publish';
    const embed = url.searchParams.get('_embed') ?? '1';

    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('per_page', String(per_page));
    qs.set('status', status);
    if (embed) qs.set('_embed', embed);

    if (search) qs.set('search', search);
    if (slug) qs.set('slug', slug);

    // You can add more pass-through params later (categories, tags, etc.)

    const { data, response } = await wpFetch<WpPost[]>(`/wp/v2/posts?${qs.toString()}`);

    const total = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');

    return NextResponse.json(
      {
        items: data,
        page,
        per_page,
        total: total ? Number(total) : undefined,
        totalPages: totalPages ? Number(totalPages) : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
