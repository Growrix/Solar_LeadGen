export function normalizeNewsProviderId(provider: string): string {
  const raw = (provider || '').trim();
  if (!raw) return 'other';
  const v = raw.toLowerCase();

  // Back-compat for older UI values.
  if (v === 'openai') return 'openai';
  if (v === 'other') return 'other';

  // Common aliases.
  if (v === 'google' || v === 'google-gemini' || v === 'google_gemini' || v === 'gemini' || v === 'google gemini') return 'gemini';
  if (v === 'anthropic' || v === 'claude') return 'anthropic';
  if (v === 'deepseek') return 'deepseek';
  if (v === 'xai' || v === 'x-ai') return 'xai';
  if (v === 'azure' || v === 'azure-openai' || v === 'azure openai') return 'azure-openai';
  if (v === 'aws' || v === 'bedrock' || v === 'aws-bedrock' || v === 'aws bedrock') return 'bedrock';
  if (v === 'openrouter' || v === 'open-router') return 'openrouter';
  if (v === 'vertex' || v === 'vertexai' || v === 'vertex ai') return 'vertexai';

  // Generic normalization: keep it stable and URL-safe.
  return (
    v
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'other'
  );
}

export function expandProviderIdsForLookup(provider: string): string[] {
  const normalized = normalizeNewsProviderId(provider);
  const aliases = new Set<string>([normalized]);

  if (normalized === 'gemini') {
    aliases.add('google');
    aliases.add('google-gemini');
    aliases.add('google_gemini');
    aliases.add('google gemini');
  }

  if (normalized === 'openai') {
    aliases.add('open_ai');
  }

  return Array.from(aliases);
}
