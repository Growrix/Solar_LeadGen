import crypto from 'crypto';
import type { PrismaClient } from '@prisma/client';
import { expandProviderIdsForLookup, normalizeNewsProviderId } from './provider-id';

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function b64urlDecode(value: string): Buffer {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const full = padded + '='.repeat(padLen);
  return Buffer.from(full, 'base64');
}

function parseMasterKey(raw: string): Buffer {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('Key Vault not configured: missing master key');

  const asHex = trimmed.startsWith('hex:') ? trimmed.slice(4) : null;
  const tryHex = (hex: string) => {
    if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
    if (hex.length !== 64) return null;
    return Buffer.from(hex, 'hex');
  };

  if (asHex) {
    const buf = tryHex(asHex);
    if (!buf) throw new Error('Invalid Key Vault master key (hex must be 64 chars)');
    return buf;
  }

  const hexBuf = tryHex(trimmed);
  if (hexBuf) return hexBuf;

  // Try base64/base64url
  try {
    const buf = Buffer.from(trimmed, 'base64');
    if (buf.length === 32) return buf;
  } catch {
    // ignore
  }

  try {
    const buf = b64urlDecode(trimmed);
    if (buf.length === 32) return buf;
  } catch {
    // ignore
  }

  throw new Error('Invalid Key Vault master key (must be 32 bytes: base64, base64url, or 64-char hex)');
}

export function getNewsKeyVaultMasterKeyOrNull(): Buffer | null {
  const raw =
    process.env.NEWS_ENGINE_KEY_VAULT_MASTER_KEY ??
    process.env.NEWS_KEY_VAULT_MASTER_KEY ??
    '';

  try {
    return raw.trim() ? parseMasterKey(raw) : null;
  } catch {
    return null;
  }
}

export function getNewsKeyVaultMasterKey(): Buffer {
  const raw =
    process.env.NEWS_ENGINE_KEY_VAULT_MASTER_KEY ??
    process.env.NEWS_KEY_VAULT_MASTER_KEY;

  if (!raw) throw new Error('Key Vault not configured: missing NEWS_ENGINE_KEY_VAULT_MASTER_KEY');
  return parseMasterKey(raw);
}

export function encryptWithNewsMasterKey(plaintext: string): string {
  const key = getNewsKeyVaultMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `v1:${b64urlEncode(iv)}:${b64urlEncode(tag)}:${b64urlEncode(ciphertext)}`;
}

export function decryptWithNewsMasterKey(ciphertext: string): string {
  const key = getNewsKeyVaultMasterKey();
  const parts = ciphertext.split(':');
  if (parts.length !== 4 || parts[0] !== 'v1') {
    throw new Error('Invalid encrypted key format');
  }

  const iv = b64urlDecode(parts[1]);
  const tag = b64urlDecode(parts[2]);
  const data = b64urlDecode(parts[3]);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  if (!plaintext.trim()) throw new Error('Decrypted key was empty');
  return plaintext;
}

export function maskRawKey(rawKey: string): string {
  const trimmed = rawKey.trim();
  if (!trimmed) return '••••';
  const last4 = trimmed.length >= 4 ? trimmed.slice(-4) : trimmed;
  return `••••${last4}`;
}

export function tryMaskEncryptedKey(encryptedKey: string): string {
  const master = getNewsKeyVaultMasterKeyOrNull();
  if (!master) return '••••';
  try {
    const raw = decryptWithNewsMasterKey(encryptedKey);
    return maskRawKey(raw);
  } catch {
    return '••••';
  }
}

export type ResolvedNewsApiKey = {
  provider: string;
  apiKeyId: string;
  label: string;
  rawKey: string;
};

function isLikelyTestOrDummyKey(rawKey: string, label: string): boolean {
  const key = rawKey.trim().toLowerCase();

  // Playwright seeds dummy keys like: sk-e2e-<timestamp>-dummy
  // Only treat a key as "dummy" when the raw key itself looks fake.
  // Labels (e.g. "E2E Drafting Key") may be used for real keys.
  if (key.includes('dummy')) return true;
  if (key.startsWith('sk-e2e-')) return true;

  return false;
}

export async function resolveNewsApiKeyForPool(
  prisma: PrismaClient,
  provider: string,
  pool: 'RESEARCH' | 'DRAFTING' | 'IMAGES'
): Promise<ResolvedNewsApiKey | null> {
  if (!getNewsKeyVaultMasterKeyOrNull()) return null;

  const providerId = normalizeNewsProviderId(provider);
  if (!providerId) return null;

  const providerIds = expandProviderIdsForLookup(providerId);

  const candidates = await prisma.newsApiKey.findMany({
    where: {
      enabled: true,
      provider: { in: providerIds },
      pools: { has: pool },
    },
    orderBy: [{ lastUsedAt: 'asc' }, { createdAt: 'asc' }],
    take: 25,
    select: { id: true, provider: true, label: true, encryptedKey: true },
  });

  for (const candidate of candidates) {
    let rawKey = '';
    try {
      rawKey = decryptWithNewsMasterKey(candidate.encryptedKey);
    } catch {
      continue;
    }

    if (isLikelyTestOrDummyKey(rawKey, candidate.label)) {
      continue;
    }

    await prisma.newsApiKey
      .update({ where: { id: candidate.id }, data: { lastUsedAt: new Date() } })
      .catch(() => null);

    return {
      provider: candidate.provider,
      apiKeyId: candidate.id,
      label: candidate.label,
      rawKey,
    };
  }

  return null;
}

export async function markNewsApiKeySuccess(prisma: PrismaClient, apiKeyId: string): Promise<void> {
  await prisma.newsApiKey
    .update({ where: { id: apiKeyId }, data: { lastSuccessAt: new Date(), lastErrorAt: null, lastError: null } })
    .catch(() => null);
}

export async function markNewsApiKeyError(prisma: PrismaClient, apiKeyId: string, error: string): Promise<void> {
  await prisma.newsApiKey
    .update({ where: { id: apiKeyId }, data: { lastErrorAt: new Date(), lastError: error.slice(0, 500) } })
    .catch(() => null);
}
