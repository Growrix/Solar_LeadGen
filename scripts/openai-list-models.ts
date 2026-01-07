/**
 * Lists models available to the configured OPENAI_API_KEY.
 * Run:
 *   npx tsx scripts/openai-list-models.ts
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnvFallback(): void {
  const envPath = resolve(process.cwd(), '.env');
  let raw = '';
  try {
    raw = readFileSync(envPath, 'utf8');
  } catch {
    return;
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (!key) continue;
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

async function main() {
  loadDotEnvFallback();

  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY in environment/.env');
  }

  const res = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok) {
    const msg = json?.error?.message ? String(json.error.message) : `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const ids = Array.isArray(json?.data) ? json.data.map((m: any) => m?.id).filter((v: any) => typeof v === 'string') : [];
  ids.sort();

  console.log(ids.join('\n'));
  console.log(`\nTOTAL=${ids.length}`);
}

main().catch((e) => {
  console.error('❌ Failed to list models');
  console.error(e);
  process.exit(1);
});
