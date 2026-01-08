import type { PrismaClient } from '@prisma/client';

export type NewsAiTaskType =
  | 'research_deep'
  | 'research_fast'
  | 'draft_longform'
  | 'rewrite'
  | 'seo'
  | 'dedup_semantic'
  | 'image_prompt'
  | 'image_generate';

export const NEWS_AI_TASK_TYPES: NewsAiTaskType[] = [
  'research_deep',
  'research_fast',
  'draft_longform',
  'rewrite',
  'seo',
  'dedup_semantic',
  'image_prompt',
  'image_generate',
];

export type ResolvedModelProfile = {
  provider: string;
  modelId: string;
  modelProfileId: string;
  displayName: string;
};

export async function resolveModelProfileForTask(
  prisma: PrismaClient,
  taskType: NewsAiTaskType
): Promise<ResolvedModelProfile | null> {
  const row = await prisma.newsModelRouterDefault.findUnique({
    where: { taskType },
    select: {
      taskType: true,
      modelProfile: {
        select: { id: true, enabled: true, provider: true, modelId: true, displayName: true },
      },
    },
  });

  const profile = row?.modelProfile;
  if (!profile || !profile.enabled) return null;

  return {
    provider: profile.provider,
    modelId: profile.modelId,
    modelProfileId: profile.id,
    displayName: profile.displayName,
  };
}

export async function ensureDefaultModelProfiles(prisma: PrismaClient): Promise<void> {
  const enabledCount = await prisma.newsModelProfile.count({ where: { enabled: true } });
  if (enabledCount > 0) return;

  const defaults: Array<{
    displayName: string;
    provider: string;
    modelId: string;
    useCaseTags: string[];
    costTier: string;
    jsonModeRequired: boolean;
    enabled: boolean;
  }> = [
    {
      displayName: 'OpenAI o3-mini',
      provider: 'openai',
      modelId: 'o3-mini',
      useCaseTags: ['research', 'drafting'],
      costTier: 'low',
      jsonModeRequired: false,
      enabled: true,
    },
    {
      displayName: 'OpenAI gpt-4o-mini',
      provider: 'openai',
      modelId: 'gpt-4o-mini',
      useCaseTags: ['research', 'drafting'],
      costTier: 'low',
      jsonModeRequired: false,
      enabled: true,
    },
    {
      displayName: 'OpenAI gpt-4o',
      provider: 'openai',
      modelId: 'gpt-4o',
      useCaseTags: ['drafting'],
      costTier: 'mid',
      jsonModeRequired: false,
      enabled: true,
    },
  ];

  await prisma.$transaction(async (tx) => {
    const existing = await tx.newsModelProfile.findMany({
      select: { id: true, provider: true, modelId: true },
    });

    const byProviderModel = new Map<string, { id: string; provider: string; modelId: string }>();
    for (const row of existing) {
      byProviderModel.set(`${row.provider}::${row.modelId}`, row);
    }

    for (const d of defaults) {
      const key = `${d.provider}::${d.modelId}`;
      const found = byProviderModel.get(key);
      if (found) {
        await tx.newsModelProfile.update({ where: { id: found.id }, data: { enabled: true } });
      } else {
        await tx.newsModelProfile.create({ data: d });
      }
    }
  });
}
