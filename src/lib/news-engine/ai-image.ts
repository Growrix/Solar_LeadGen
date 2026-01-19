import { uploadFile, getPublicUrlForKey } from '@/lib/s3';
import { ingestOgImageToS3 } from '@/lib/news-engine/og-image';
import { normalizeNewsProviderId } from '@/lib/news-engine/provider-id';

function normalizeProvider(provider: string): string {
  return normalizeNewsProviderId(provider);
}

function getEnvKeyNameForOpenAiCompatBaseUrl(provider: string): string {
  const token = normalizeProvider(provider)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_');
  return `NEWS_ENGINE_OPENAI_COMPAT_BASE_URL_${token}`;
}

function getOpenAiCompatBaseUrl(provider: string): string | null {
  const key = getEnvKeyNameForOpenAiCompatBaseUrl(provider);
  const direct = (process.env[key] || '').trim();
  if (direct) return direct;

  const fallback = (process.env.NEWS_ENGINE_OPENAI_COMPAT_BASE_URL || '').trim();
  return fallback || null;
}

function getGeminiEnvKey(): string {
  return (
    (process.env.GEMINI_API_KEY || '').trim() ||
    (process.env.GOOGLE_GEMINI_API_KEY || '').trim() ||
    (process.env.GOOGLE_API_KEY || '').trim()
  );
}

type OpenAiImagesResponse = {
  data?: Array<{ url?: string; b64_json?: string }>;
  error?: { message?: string };
};

async function generateOpenAiCompatImage(input: {
  baseUrl: string;
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<{ url?: string; b64?: string }> {
  const url = `${input.baseUrl.replace(/\/+$/, '')}/v1/images/generations`;

  const baseBody = {
    model: input.model,
    prompt: input.prompt,
    n: 1,
    size: '1024x1024',
  };

  async function post(body: any): Promise<{ response: Response; data: OpenAiImagesResponse | null }> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => null)) as OpenAiImagesResponse | null;
    return { response, data };
  }

  // Prefer base64 to avoid transient remote URL fetch issues.
  let attempt = await post({ ...baseBody, response_format: 'b64_json' });

  if (!attempt.response.ok) {
    const msg = (attempt.data?.error?.message || '').toLowerCase();
    const unknownParam = msg.includes('unknown parameter') && msg.includes('response_format');
    if (attempt.response.status === 400 && unknownParam) {
      attempt = await post(baseBody);
    }
  }

  if (!attempt.response.ok) {
    const message = attempt.data?.error?.message || `Image generation failed (${attempt.response.status})`;
    const err = new Error(message) as Error & { status?: number };
    err.status = attempt.response.status;
    throw err;
  }

  const first = attempt.data?.data?.[0];
  const outUrl = typeof first?.url === 'string' ? first.url.trim() : '';
  const outB64 = typeof first?.b64_json === 'string' ? first.b64_json.trim() : '';

  if (outB64) return { b64: outB64 };
  if (outUrl) return { url: outUrl };

  throw new Error('Image generation returned no usable payload');
}

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType?: string;
          data?: string;
        };
      }>;
    };
  }>;
  error?: { message?: string };
};

async function generateGeminiImage(input: {
  apiKey: string;
  model: string;
  prompt: string;
}): Promise<{ mimeType: string; b64: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
      // Best-effort: some Gemini/Imagen models return inlineData image parts.
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 64,
      },
    }),
  });

  const data = (await response.json().catch(() => null)) as GeminiGenerateContentResponse | null;

  if (!response.ok) {
    const msg = data?.error?.message || `Gemini image generation failed (${response.status})`;
    const err = new Error(msg) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    const mimeType = (p?.inlineData?.mimeType || '').trim();
    const b64 = (p?.inlineData?.data || '').trim();
    if (mimeType.startsWith('image/') && b64) {
      return { mimeType, b64 };
    }
  }

  throw new Error('Gemini did not return an image payload (inlineData)');
}

function buildOgImageKey(itemId: string, contentType: string): string {
  const ext =
    contentType.includes('png') ? '.png' : contentType.includes('webp') ? '.webp' : contentType.includes('jpeg') ? '.jpg' : '.png';
  return `news-engine/og-images/${encodeURIComponent(itemId)}/${Date.now()}${ext}`;
}

async function uploadBase64ToS3(input: {
  itemId: string;
  mimeType: string;
  b64: string;
}): Promise<{ key: string; url: string }> {
  const buffer = Buffer.from(input.b64, 'base64');
  const key = buildOgImageKey(input.itemId, input.mimeType);
  await uploadFile(buffer, key, input.mimeType);
  return { key, url: getPublicUrlForKey(key) };
}

function isAuthOrKeyError(err: unknown): boolean {
  const status = typeof (err as any)?.status === 'number' ? Number((err as any).status) : null;
  const message = err instanceof Error ? err.message : '';
  const lower = message.toLowerCase();
  if (status === 401 || status === 403) return true;
  if (lower.includes('invalid api key')) return true;
  if (lower.includes('missing') && lower.includes('api key')) return true;
  return false;
}

export async function generateNewsEngineImageToS3(input: {
  itemId: string;
  provider: string;
  model: string;
  prompt: string;
  apiKeyOverride?: string | null;
}): Promise<{ url: string; key?: string; sourceUrl?: string; contentType?: string; providerUsed: string; modelUsed: string }>{
  const provider = normalizeProvider(input.provider) || 'openai';
  const model = (input.model || '').trim();
  if (!model) throw new Error('Image model is required');

  if (provider === 'gemini') {
    const apiKey = input.apiKeyOverride?.trim() || getGeminiEnvKey();
    if (!apiKey) throw new Error('AI not configured: missing GEMINI_API_KEY (or Key Vault Gemini key)');

    const { mimeType, b64 } = await generateGeminiImage({ apiKey, model, prompt: input.prompt });
    const uploaded = await uploadBase64ToS3({ itemId: input.itemId, mimeType, b64 });
    return { url: uploaded.url, key: uploaded.key, contentType: mimeType, providerUsed: provider, modelUsed: model };
  }

  const isOpenAi = provider === 'openai';
  const baseUrl = isOpenAi ? 'https://api.openai.com' : getOpenAiCompatBaseUrl(provider);
  if (!baseUrl) {
    const envKey = getEnvKeyNameForOpenAiCompatBaseUrl(provider);
    throw new Error(`Unsupported image provider: ${provider}. Configure ${envKey} (or NEWS_ENGINE_OPENAI_COMPAT_BASE_URL) for OpenAI-compatible image APIs.`);
  }

  const apiKey = (input.apiKeyOverride || '').trim() || (isOpenAi ? (process.env.OPENAI_API_KEY || '').trim() : '');
  if (!apiKey) {
    throw new Error(
      isOpenAi
        ? 'Missing OpenAI API key. Set OPENAI_API_KEY in .env (or configure News Engine Key Vault keys for the IMAGES pool).'
        : `AI not configured: missing Key Vault key for provider ${provider}`
    );
  }

  const out = await generateOpenAiCompatImage({ baseUrl, apiKey, model, prompt: input.prompt });

  if (out.b64) {
    const uploaded = await uploadBase64ToS3({ itemId: input.itemId, mimeType: 'image/png', b64: out.b64 });
    return { url: uploaded.url, key: uploaded.key, contentType: 'image/png', providerUsed: provider, modelUsed: model };
  }

  if (out.url) {
    // Fetch + ingest into S3 for stability.
    const ingested = await ingestOgImageToS3({ itemId: input.itemId, imageUrl: out.url });
    return {
      url: ingested.url,
      key: ingested.key,
      sourceUrl: ingested.sourceUrl,
      contentType: ingested.contentType,
      providerUsed: provider,
      modelUsed: model,
    };
  }

  throw new Error('Image generation returned no usable payload');
}

export function shouldFallbackFromAiImageError(err: unknown): boolean {
  // Never hide auth/missing key issues behind a free-image fallback.
  if (isAuthOrKeyError(err)) return false;

  const status = typeof (err as any)?.status === 'number' ? Number((err as any).status) : null;
  const message = err instanceof Error ? err.message : '';
  const lower = message.toLowerCase();

  if (status === 429 || status === 500 || status === 502 || status === 503 || status === 504) return true;
  if (lower.includes('does not exist') && lower.includes('model')) return true;
  if (lower.includes('not found') && lower.includes('model')) return true;
  if (lower.includes('do not have access') && lower.includes('model')) return true;
  if (lower.includes('not authorized') && lower.includes('model')) return true;

  return false;
}
