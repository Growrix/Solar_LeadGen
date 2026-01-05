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
  | 'news_item_rewrite_requested'
  | 'news_source_created'
  | 'news_source_updated'
  | 'news_source_deleted'
  | 'news_automation_rule_created'
  | 'news_automation_rule_updated'
  | 'news_automation_rule_deleted'
  | 'news_automation_config_updated'
  | 'news_engine_settings_updated'
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
