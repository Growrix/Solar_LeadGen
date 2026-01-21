type UnsplashSearchResult = {
  imageUrl: string;
  attribution: {
    source: 'unsplash';
    imagePageUrl: string | null;
    photographerName: string | null;
    photographerUrl: string | null;
  };
};

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getUnsplashAccessKey(): string {
  const key =
    normalizeString(process.env.UNSPLASH_ACCESS_KEY) ||
    normalizeString(process.env.UNSPLASH_ACCESS_KEY_ID) ||
    normalizeString(process.env.IMAGE_PROVIDER_ACCESS_KEY);

  if (!key) {
    throw new Error('Missing Unsplash access key. Set UNSPLASH_ACCESS_KEY in .env');
  }

  // Log key length for debugging (never log the actual key)
  console.log(`[Unsplash] Access key configured (length: ${key.length} chars)`);

  return key;
}

function buildLandscapeOgUrlFromRaw(rawUrl: string): string {
  const url = new URL(rawUrl);
  // Produce a deterministic, OG-friendly landscape crop.
  url.searchParams.set('w', '1600');
  url.searchParams.set('h', '900');
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('crop', 'entropy');
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fm', 'jpg');
  url.searchParams.set('q', '85');
  return url.toString();
}

export async function searchUnsplashLandscapeImage(input: { query: string }): Promise<UnsplashSearchResult> {
  const accessKey = getUnsplashAccessKey();

  const q = normalizeString(input.query) || 'solar';
  const endpoint = new URL('https://api.unsplash.com/search/photos');
  endpoint.searchParams.set('query', q);
  endpoint.searchParams.set('orientation', 'landscape');
  endpoint.searchParams.set('per_page', '1');
  endpoint.searchParams.set('content_filter', 'high');

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      'Accept-Version': 'v1',
    },
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => null)) as any;

  if (!response.ok) {
    // Enhanced error logging for debugging auth issues
    console.error(`[Unsplash] API error ${response.status}:`, JSON.stringify(data, null, 2));
    
    const message = normalizeString(data?.errors?.[0]) || normalizeString(data?.error) || `Unsplash search failed (${response.status})`;
    const err = new Error(message) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  const first = data?.results?.[0];
  const rawUrl = normalizeString(first?.urls?.raw);
  if (!rawUrl) {
    const err = new Error('No Unsplash results for query') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  // Fire-and-forget download tracking (recommended by Unsplash API guidelines).
  const downloadLocation = normalizeString(first?.links?.download_location);
  if (downloadLocation) {
    void fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
      cache: 'no-store',
    }).catch(() => undefined);
  }

  const imagePageUrl = normalizeString(first?.links?.html) || null;
  const photographerName = normalizeString(first?.user?.name) || null;
  const photographerUrl = normalizeString(first?.user?.links?.html) || null;

  return {
    imageUrl: buildLandscapeOgUrlFromRaw(rawUrl),
    attribution: {
      source: 'unsplash',
      imagePageUrl,
      photographerName,
      photographerUrl,
    },
  };
}
