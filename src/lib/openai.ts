import crypto from 'crypto';

type OpenAiCallOptions = {
  system: string;
  prompt: string;
  modelOverride?: string;
  apiKeyOverride?: string;
  temperature?: number;
};

export type OpenAiModelType =
  | 'chat'
  | 'reasoning'
  | 'image'
  | 'embedding'
  | 'audio'
  | 'moderation'
  | 'rerank'
  | 'other';

export type OpenAiModelInfo = {
  id: string;
  type: OpenAiModelType;
  label: string;
};

function extractOpenAiErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;

  const anyData = data as any;
  const message = anyData?.error?.message;
  if (typeof message === 'string' && message.trim()) return message.trim();

  const topMessage = anyData?.message;
  if (typeof topMessage === 'string' && topMessage.trim()) return topMessage.trim();

  return null;
}

function extractResponsesOutputText(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;

  const anyData = data as any;

  if (typeof anyData.output_text === 'string' && anyData.output_text.trim()) {
    return anyData.output_text;
  }

  const output = anyData.output;
  if (!Array.isArray(output)) return null;

  const chunks: string[] = [];

  for (const item of output) {
    const content = item?.content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      const text = part?.text;
      if (typeof text === 'string' && text.trim()) {
        chunks.push(text);
      }
    }
  }

  const joined = chunks.join('\n').trim();
  return joined ? joined : null;
}

function extractChatCompletionsOutputText(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const anyData = data as any;
  const content = anyData?.choices?.[0]?.message?.content;
  return typeof content === 'string' && content.trim() ? content : null;
}

export async function callOpenAiText(options: OpenAiCallOptions): Promise<{ text: string; modelUsed: string }>
{
  const apiKey = options.apiKeyOverride?.trim() || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('AI not configured: missing OPENAI_API_KEY');
  }

  const model = options.modelOverride?.trim() || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const temperature = typeof options.temperature === 'number' ? options.temperature : 0.4;
  const isReasoningModel = model.toLowerCase().startsWith('o');

  const body: Record<string, unknown> = {
    model,
    input: [
      {
        role: 'system',
        content: [{ type: 'input_text', text: options.system }],
      },
      {
        role: 'user',
        content: [{ type: 'input_text', text: options.prompt }],
      },
    ],
  };

  // Reasoning models (e.g. o3-mini) may reject sampling params like temperature.
  if (!isReasoningModel) {
    body.temperature = temperature;
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(extractOpenAiErrorMessage(data) || 'AI request failed');
  }

  const text =
    extractResponsesOutputText(data) ||
    extractChatCompletionsOutputText(data);

  if (!text || !text.trim()) {
    throw new Error('AI response was empty');
  }

  return { text, modelUsed: model };
}

export async function callOpenAiJson(options: OpenAiCallOptions): Promise<{ raw: string; modelUsed: string }>
{
  const { text, modelUsed } = await callOpenAiText(options);
  return { raw: text, modelUsed };
}

type OpenAiModelsCache = {
  at: number;
  models: OpenAiModelInfo[];
};

const openAiModelsCache = new Map<string, OpenAiModelsCache>();
const openAiModelsInFlight = new Map<string, Promise<OpenAiModelInfo[]>>();

function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

function inferOpenAiModelType(id: string): OpenAiModelType {
  const v = id.trim().toLowerCase();
  if (!v) return 'other';

  if (v.startsWith('dall-e-') || v.startsWith('gpt-image-')) return 'image';
  if (v.startsWith('text-embedding-') || v.includes('embedding')) return 'embedding';
  if (v.startsWith('whisper-') || v.startsWith('gpt-4o-transcribe') || v.startsWith('gpt-4o-mini-transcribe')) return 'audio';
  if (v.startsWith('tts-') || v.includes('audio')) return 'audio';
  if (v.startsWith('omni-moderation') || v.includes('moderation')) return 'moderation';
  if (v.startsWith('rerank-') || v.includes('rerank')) return 'rerank';
  if (v.startsWith('o') && /^(o\d|o\d-)/.test(v)) return 'reasoning';
  if (v.startsWith('gpt-')) return 'chat';

  return 'other';
}

function toTitleCaseToken(token: string): string {
  const t = token.trim();
  if (!t) return '';
  if (t.toLowerCase() === 'gpt') return 'GPT';
  if (t.toLowerCase() === 'dall') return 'DALL';
  return t.length <= 3 ? t.toUpperCase() : t[0].toUpperCase() + t.slice(1);
}

function friendlyLabelForOpenAiModel(id: string, type: OpenAiModelType): string {
  const raw = id.trim();
  const v = raw.toLowerCase();

  // Explicit friendly names for common models.
  const known: Record<string, string> = {
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o mini',
    'o3-mini': 'O3 mini',
    'o3': 'O3',
    'dall-e-3': 'DALL·E 3',
    'dall-e-2': 'DALL·E 2',
    'text-embedding-3-large': 'Text Embedding 3 Large',
    'text-embedding-3-small': 'Text Embedding 3 Small',
  };

  const base = known[v];
  if (base) return `${base} (${type.toUpperCase()})`;

  // Best-effort “prettify” for unknown/new models.
  const tokens = raw.split(/[-_]/g).filter(Boolean);
  const pretty = tokens.map(toTitleCaseToken).join(' ');
  return pretty ? `${pretty} (${type.toUpperCase()})` : `${raw} (${type.toUpperCase()})`;
}

async function listOpenAiModelsRaw(apiKey: string): Promise<OpenAiModelInfo[]> {
  const response = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = (await response.json().catch(() => null)) as any;

  if (!response.ok) {
    throw new Error(extractOpenAiErrorMessage(data) || `OpenAI models list failed (${response.status})`);
  }

  const models: OpenAiModelInfo[] = [];
  const items = Array.isArray(data?.data) ? data.data : [];
  for (const item of items) {
    const id = item?.id;
    if (typeof id === 'string' && id.trim()) {
      const trimmed = id.trim();
      const type = inferOpenAiModelType(trimmed);
      models.push({ id: trimmed, type, label: friendlyLabelForOpenAiModel(trimmed, type) });
    }
  }

  // Stable ordering for UI: type group, then id.
  const typeOrder: Record<OpenAiModelType, number> = {
    chat: 1,
    reasoning: 2,
    image: 3,
    embedding: 4,
    audio: 5,
    moderation: 6,
    rerank: 7,
    other: 8,
  };

  const byId = new Map<string, OpenAiModelInfo>();
  for (const m of models) byId.set(m.id, m);

  const deduped = Array.from(byId.values());
  deduped.sort((a, b) => {
    const t = (typeOrder[a.type] ?? 999) - (typeOrder[b.type] ?? 999);
    if (t !== 0) return t;
    return a.id.localeCompare(b.id);
  });

  return deduped;
}

export async function listOpenAiModelsDetailedCached(input?: {
  apiKeyOverride?: string;
  ttlMs?: number;
}): Promise<{ models: OpenAiModelInfo[]; cached: boolean }>
{
  const apiKey = input?.apiKeyOverride?.trim() || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('AI not configured: missing OPENAI_API_KEY');
  }

  const apiKeyHash = hashApiKey(apiKey);

  const ttlMs = typeof input?.ttlMs === 'number' && Number.isFinite(input.ttlMs) ? Math.max(0, input.ttlMs) : 10 * 60 * 1000;
  const now = Date.now();

  const existing = openAiModelsCache.get(apiKeyHash);
  if (existing && now - existing.at <= ttlMs) {
    return { models: existing.models, cached: true };
  }

  let inFlight = openAiModelsInFlight.get(apiKeyHash);
  if (!inFlight) {
    inFlight = listOpenAiModelsRaw(apiKey)
      .then((models) => {
        openAiModelsCache.set(apiKeyHash, { at: Date.now(), models });
        return models;
      })
      .finally(() => {
        openAiModelsInFlight.delete(apiKeyHash);
      });
    openAiModelsInFlight.set(apiKeyHash, inFlight);
  }

  const models = await inFlight;
  return { models, cached: false };
}

export async function listOpenAiModelsCached(input?: {
  apiKeyOverride?: string;
  ttlMs?: number;
}): Promise<{ models: string[]; cached: boolean }>
{
  const { models, cached } = await listOpenAiModelsDetailedCached(input);
  return { models: models.map((m) => m.id), cached };
}

export async function assertOpenAiModelIdIsValid(modelId: string): Promise<void> {
  const trimmed = modelId.trim();
  if (!trimmed) throw new Error('modelId is required');

  const { models } = await listOpenAiModelsCached();
  if (!models.includes(trimmed)) {
    throw new Error(`Unsupported OpenAI modelId: ${trimmed}`);
  }
}
