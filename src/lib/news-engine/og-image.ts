import { uploadFile, getPublicUrlForKey } from '@/lib/s3';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_HTML_BYTES = 512 * 1024; // 512KB
const FETCH_TIMEOUT_MS = 15000;

const DEFAULT_FETCH_HEADERS: Record<string, string> = {
  Accept: 'image/*,text/html;q=0.9,*/*;q=0.1',
  // Some hosts block requests with no UA; keep it generic.
  'User-Agent': 'Mozilla/5.0 (compatible; SolarMatchNewsEngine/1.0; +https://localhost)',
  // Helps with origins that expect a referrer for direct image fetch.
  Referer: 'https://localhost/',
};

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error('Image URL is required');
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('Image URL is invalid');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Image URL must be http or https');
  }
  return parsed.toString();
}

function encodeKeyPath(key: string): string {
  return key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function extensionFromContentType(contentType: string): string {
  const lower = contentType.toLowerCase();
  if (lower.includes('image/jpeg') || lower.includes('image/jpg')) return '.jpg';
  if (lower.includes('image/png')) return '.png';
  if (lower.includes('image/webp')) return '.webp';
  if (lower.includes('image/gif')) return '.gif';
  return '';
}

function resolveFirstMetaContent(html: string, metaKey: string): string | null {
  const key = metaKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Matches:
  // <meta property="og:image" content="...">
  // <meta content='...' property='og:image'>
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`, 'i'),
  ];

  for (const re of patterns) {
    const match = re.exec(html);
    if (match?.[1]) {
      const value = match[1].trim();
      if (value) return value;
    }
  }

  return null;
}

function resolveOgImageFromHtml(pageUrl: string, html: string): string | null {
  const raw =
    resolveFirstMetaContent(html, 'og:image') ||
    resolveFirstMetaContent(html, 'twitter:image') ||
    resolveFirstMetaContent(html, 'twitter:image:src');

  if (!raw) return null;

  try {
    return new URL(raw, pageUrl).toString();
  } catch {
    return null;
  }
}

async function fetchHtmlForOgImage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...DEFAULT_FETCH_HEADERS,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('text/html')) {
      return null;
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_HTML_BYTES) {
      return null;
    }

    const text = await response.text();
    if (text.length > MAX_HTML_BYTES) {
      return null;
    }

    return text;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchRemoteImage(
  url: string,
  depth: number = 0
): Promise<{ buffer: Buffer; contentType: string; finalUrl: string }> {
  if (depth > 2) {
    throw new Error('Unable to resolve an image from the provided URL');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const retryableStatuses = new Set([429, 500, 502, 503, 504]);
    let response: Response | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          ...DEFAULT_FETCH_HEADERS,
        },
        signal: controller.signal,
      });

      if (response.ok) break;

      if (!retryableStatuses.has(response.status) || attempt === 2) {
        throw new Error(`Image fetch failed (${response.status})`);
      }

      const backoffMs = 250 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, backoffMs));
    }

    if (!response || !response.ok) {
      throw new Error('Image fetch failed');
    }

    const contentType = response.headers.get('content-type') || '';
    const lowerType = contentType.toLowerCase();
    if (!lowerType.startsWith('image/')) {
      // Common case: user pastes a page URL (e.g., Unsplash photo page).
      // Try to resolve og:image from HTML and fetch that image instead.
      if (lowerType.includes('text/html')) {
        const html = await response.text();
        const ogImageUrl = resolveOgImageFromHtml(response.url || url, html);
        if (ogImageUrl) {
          return fetchRemoteImage(ogImageUrl, depth + 1);
        }
      } else {
        const html = await fetchHtmlForOgImage(response.url || url);
        if (html) {
          const ogImageUrl = resolveOgImageFromHtml(response.url || url, html);
          if (ogImageUrl) {
            return fetchRemoteImage(ogImageUrl, depth + 1);
          }
        }
      }

      throw new Error('Image URL did not return an image');
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_IMAGE_BYTES) {
      throw new Error('Image is too large');
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      throw new Error('Image is too large');
    }

    return {
      buffer: Buffer.from(arrayBuffer),
      contentType,
      finalUrl: response.url || url,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Image fetch timed out');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function buildOgImageKey(itemId: string, contentType: string): string {
  const ext = extensionFromContentType(contentType) || '.jpg';
  const timestamp = Date.now();
  return `news-engine/og-images/${encodeKeyPath(itemId)}/${timestamp}${ext}`;
}

export async function ingestOgImageToS3(input: {
  itemId: string;
  imageUrl: string;
}): Promise<{ key: string; url: string; contentType: string; sourceUrl: string }>{
  const normalizedUrl = normalizeUrl(input.imageUrl);
  const fetched = await fetchRemoteImage(normalizedUrl);
  const key = buildOgImageKey(input.itemId, fetched.contentType);
  await uploadFile(fetched.buffer, key, fetched.contentType);
  const url = getPublicUrlForKey(key);

  return {
    key,
    url,
    contentType: fetched.contentType,
    sourceUrl: fetched.finalUrl,
  };
}
