import { callOpenAiJson } from '@/lib/openai';
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

type OpenAiCompatResponse = {
  choices?: Array<{ message?: { content?: string | null } | null } | null>;
  error?: { message?: string };
};

async function callOpenAiCompatJson(input: {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  system: string;
  prompt: string;
  temperature?: number;
}): Promise<{ raw: string; modelUsed: string }> {
  const url = `${input.baseUrl.replace(/\/+$/, '')}/v1/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model: input.model,
      messages: [
        { role: 'system', content: input.system },
        { role: 'user', content: input.prompt },
      ],
      temperature: typeof input.temperature === 'number' ? input.temperature : 0.4,
    }),
  });

  const data = (await response.json().catch(() => null)) as OpenAiCompatResponse | null;

  if (!response.ok) {
    const msg = data?.error?.message || `AI request failed (${response.status})`;
    throw new Error(`${normalizeProvider(input.provider)}: ${msg}`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error(`${normalizeProvider(input.provider)}: empty response`);
  }

  return { raw: content, modelUsed: input.model };
}

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message?: string };
};

async function callGeminiJson(input: {
  apiKey: string;
  model: string;
  system: string;
  prompt: string;
  temperature?: number;
}): Promise<{ raw: string; modelUsed: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`;

  const merged = input.system
    ? `SYSTEM:\n${input.system}\n\nUSER:\n${input.prompt}`
    : input.prompt;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: merged }] }],
      generationConfig: {
        temperature: typeof input.temperature === 'number' ? input.temperature : 0.4,
        maxOutputTokens: 2048,
      },
    }),
  });

  const data = (await response.json().catch(() => null)) as GeminiGenerateResponse | null;

  if (!response.ok) {
    const msg = data?.error?.message || `Gemini request failed (${response.status})`;
    throw new Error(`gemini: ${msg}`);
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => (typeof p?.text === 'string' ? p.text : ''))
      .join('') ||
    '';

  if (!text.trim()) {
    throw new Error('gemini: empty response');
  }

  return { raw: text, modelUsed: input.model };
}

export async function callNewsAiJson(input: {
  provider: string;
  model: string;
  apiKeyOverride?: string | null;
  system: string;
  prompt: string;
  temperature?: number;
}): Promise<{ raw: string; modelUsed: string; providerUsed: string }> {
  const provider = normalizeProvider(input.provider) || 'openai';
  const model = (input.model || '').trim();
  if (!model) throw new Error('AI model is required');

  if (provider === 'openai') {
    const { raw, modelUsed } = await callOpenAiJson({
      system: input.system,
      prompt: input.prompt,
      modelOverride: model,
      apiKeyOverride: input.apiKeyOverride?.trim() || undefined,
      temperature: input.temperature,
    });
    return { raw, modelUsed, providerUsed: provider };
  }

  if (provider === 'gemini') {
    const apiKey = input.apiKeyOverride?.trim() || getGeminiEnvKey();
    if (!apiKey) throw new Error('AI not configured: missing GEMINI_API_KEY (or Key Vault Gemini key)');
    const { raw, modelUsed } = await callGeminiJson({
      apiKey,
      model,
      system: input.system,
      prompt: input.prompt,
      temperature: input.temperature,
    });
    return { raw, modelUsed, providerUsed: provider };
  }

  const baseUrl = getOpenAiCompatBaseUrl(provider);
  if (!baseUrl) {
    const envKey = getEnvKeyNameForOpenAiCompatBaseUrl(provider);
    throw new Error(
      `Unsupported provider: ${provider}. Configure ${envKey} (or NEWS_ENGINE_OPENAI_COMPAT_BASE_URL) to use OpenAI-compatible APIs.`
    );
  }

  const apiKey = input.apiKeyOverride?.trim() || '';
  if (!apiKey) {
    throw new Error(`AI not configured: missing Key Vault key for provider ${provider}`);
  }

  const { raw, modelUsed } = await callOpenAiCompatJson({
    provider,
    baseUrl,
    apiKey,
    model,
    system: input.system,
    prompt: input.prompt,
    temperature: input.temperature,
  });

  return { raw, modelUsed, providerUsed: provider };
}
