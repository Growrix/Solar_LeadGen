import { Prisma, type PrismaClient } from '@prisma/client';
import type { NewsAiTaskType } from './ai-router';
import { resolveModelProfileForTask } from './ai-router';
import { markNewsApiKeyError, markNewsApiKeySuccess, resolveNewsApiKeyForPool } from './key-vault';

function shouldPreferKeyVaultKeys(): boolean {
  return (process.env.NEWS_ENGINE_PREFER_KEY_VAULT_KEYS || '').trim().toLowerCase() === 'true';
}

export type NewsAiKeyPool = 'RESEARCH' | 'DRAFTING' | 'IMAGES';

export type ResolvedNewsAiCallConfig = {
  provider: string;
  model: string;
  modelProfileId: string | null;
  modelProfileLabel: string | null;
  apiKeyOverride: string | null;
  apiKeyId: string | null;
  apiKeyLabel: string | null;
};

export async function resolveNewsAiCallConfig(
  prisma: PrismaClient,
  input: {
    taskType: NewsAiTaskType;
    pool: NewsAiKeyPool;
    fallbackProvider?: string;
    fallbackModel: string;
  }
): Promise<ResolvedNewsAiCallConfig> {
  try {
    const profile = await resolveModelProfileForTask(prisma, input.taskType);

    const provider = profile?.provider || input.fallbackProvider || 'openai';
    const model = profile?.modelId || input.fallbackModel;

    const envKeyPresent = Boolean((process.env.OPENAI_API_KEY || '').trim());
    const useKeyVault = shouldPreferKeyVaultKeys() || !envKeyPresent;
    const key = useKeyVault ? await resolveNewsApiKeyForPool(prisma, input.pool) : null;

    return {
      provider,
      model,
      modelProfileId: profile?.modelProfileId ?? null,
      modelProfileLabel: profile?.displayName ?? null,
      apiKeyOverride: key?.rawKey ?? null,
      apiKeyId: key?.apiKeyId ?? null,
      apiKeyLabel: key?.label ?? null,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return {
        provider: input.fallbackProvider || 'openai',
        model: input.fallbackModel,
        modelProfileId: null,
        modelProfileLabel: null,
        apiKeyOverride: null,
        apiKeyId: null,
        apiKeyLabel: null,
      };
    }
    throw error;
  }
}

export async function reportNewsAiKeySuccess(prisma: PrismaClient, apiKeyId: string | null): Promise<void> {
  if (!apiKeyId) return;
  await markNewsApiKeySuccess(prisma, apiKeyId);
}

export async function reportNewsAiKeyError(prisma: PrismaClient, apiKeyId: string | null, error: string): Promise<void> {
  if (!apiKeyId) return;
  await markNewsApiKeyError(prisma, apiKeyId, error);
}
