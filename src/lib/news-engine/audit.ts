import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type NewsEngineAuditAction =
  | 'news_item_created'
  | 'news_item_updated'
  | 'news_item_published_now'
  | 'news_item_auto_published'
  | 'news_item_scheduled'
  | 'news_item_rejected'
  | 'news_item_deleted'
  | 'news_item_purged'
  | 'news_item_regenerated'
  | 'news_item_rewrite_requested'
  | 'news_item_rewritten'
  | 'news_source_created'
  | 'news_source_updated'
  | 'news_source_deleted'
  | 'news_source_synced'
  | 'news_source_sync_failed'
  | 'news_research_synced'
  | 'news_research_sync_failed'
  | 'news_sources_config_updated'
  | 'news_ai_draft_generated'
  | 'news_ai_draft_failed'
  | 'news_automation_run_started'
  | 'news_automation_run_completed'
  | 'news_automation_rule_created'
  | 'news_automation_rule_updated'
  | 'news_automation_rule_deleted'
  | 'news_automation_config_updated'
  | 'news_engine_settings_updated'
  | 'news_ai_router_defaults_updated'
  | 'news_model_profile_created'
  | 'news_model_profile_updated'
  | 'news_model_profile_disabled'
  | 'news_key_vault_key_created'
  | 'news_key_vault_key_updated'
  | 'news_key_vault_key_deleted'
  | 'news_item_image_controls_updated'
  | 'news_pipeline_paused'
  | 'news_pipeline_resumed'
  | 'news_pipeline_emergency_stop';

export async function writeNewsAuditLog(input: {
  action: NewsEngineAuditAction;
  actorId?: string;
  itemId?: string;
  sourceId?: string;
  metadata?: Prisma.InputJsonValue;
  promptUsed?: string;
}): Promise<void> {
  try {
    await prisma.newsAuditLog.create({
      data: {
        action: input.action,
        actorId: input.actorId,
        itemId: input.itemId,
        sourceId: input.sourceId,
        metadata: input.metadata,
        promptUsed: input.promptUsed,
      },
    });
  } catch (error) {
    console.error('❌ [NewsEngine Audit] Failed to write audit log:', error);
  }
}
