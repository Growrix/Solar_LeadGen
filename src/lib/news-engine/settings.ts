import { getSetting, getSettings, setSetting } from '@/lib/services/settings-service';

export const NEWS_ENGINE_SETTING_KEYS = {
  pipelineStatus: 'news.ops.pipeline_status',

  regionLocale: 'news.settings.region_locale',
  dailyLimit: 'news.settings.daily_limit',
  deduplicationEnabled: 'news.settings.deduplication_enabled',

  notificationsEnabled: 'news.notifications.enabled',

  aiProvider: 'news.ai.provider',
  aiModel: 'news.ai.model',
} as const;

export type NewsEnginePipelineStatusSetting = 'NOMINAL' | 'PAUSED' | 'EMERGENCY_STOP';

export async function getNewsEnginePipelineStatus(): Promise<NewsEnginePipelineStatusSetting> {
  try {
    const raw = await getSetting(NEWS_ENGINE_SETTING_KEYS.pipelineStatus);
    const upper = raw.trim().toUpperCase();
    if (upper === 'NOMINAL' || upper === 'PAUSED' || upper === 'EMERGENCY_STOP') {
      return upper;
    }
  } catch {
    // Key not seeded yet; default to NOMINAL.
  }
  return 'NOMINAL';
}

export async function setNewsEnginePipelineStatus(
  next: NewsEnginePipelineStatusSetting,
  userId?: string
): Promise<void> {
  await setSetting(NEWS_ENGINE_SETTING_KEYS.pipelineStatus, next, userId, 'News Engine pipeline status');
}

export async function getNewsEngineSettings() {
  return await getSettings([
    NEWS_ENGINE_SETTING_KEYS.regionLocale,
    NEWS_ENGINE_SETTING_KEYS.dailyLimit,
    NEWS_ENGINE_SETTING_KEYS.deduplicationEnabled,
    NEWS_ENGINE_SETTING_KEYS.notificationsEnabled,
    NEWS_ENGINE_SETTING_KEYS.aiProvider,
    NEWS_ENGINE_SETTING_KEYS.aiModel,
  ]);
}

export async function setNewsEngineSetting(key: string, value: string | number | boolean, userId?: string) {
  await setSetting(key, value, userId, 'News Engine setting');
}
