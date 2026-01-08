type OpenAiCallOptions = {
  system: string;
  prompt: string;
  modelOverride?: string;
  apiKeyOverride?: string;
  temperature?: number;
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
