import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth/authorization';
import { getNewsEnginePipelineStatus, getNewsEngineSettings, setNewsEnginePipelineStatus, setNewsEngineSetting, writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function parseNumber(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  const v = raw.trim().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return fallback;
}

// GET /api/admin/news-engine/settings
export async function GET() {
  try {
    await requireAdmin();

    const pipelineStatus = await getNewsEnginePipelineStatus();
    const raw = await getNewsEngineSettings();

    return NextResponse.json({
      pipelineStatus,
      settings: {
        regionLocale: raw['news.settings.region_locale'] || 'AU',
        dailyLimit: parseNumber(raw['news.settings.daily_limit'], 6),
        deduplicationEnabled: parseBool(raw['news.settings.deduplication_enabled'], true),
      },
      notifications: {
        enabled: parseBool(raw['news.notifications.enabled'], true),
      },
      ai: {
        provider: raw['news.ai.provider'] || '',
        model: raw['news.ai.model'] || '',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('❌ [GET /api/admin/news-engine/settings] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/admin/news-engine/settings
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const body = await request.json();

    const updates: Array<Promise<void>> = [];

    if (typeof body.pipelineStatus === 'string') {
      const upper = body.pipelineStatus.trim().toUpperCase();
      if (upper === 'NOMINAL' || upper === 'PAUSED' || upper === 'EMERGENCY_STOP') {
        updates.push(setNewsEnginePipelineStatus(upper, auth.userId));
      }
    }

    if (body.settings && typeof body.settings === 'object') {
      if (typeof body.settings.regionLocale === 'string') {
        updates.push(setNewsEngineSetting('news.settings.region_locale', body.settings.regionLocale.trim(), auth.userId));
      }
      if (typeof body.settings.dailyLimit === 'number' && Number.isFinite(body.settings.dailyLimit)) {
        updates.push(setNewsEngineSetting('news.settings.daily_limit', Math.max(0, Math.floor(body.settings.dailyLimit)), auth.userId));
      }
      if (typeof body.settings.deduplicationEnabled === 'boolean') {
        updates.push(setNewsEngineSetting('news.settings.deduplication_enabled', body.settings.deduplicationEnabled, auth.userId));
      }
    }

    if (body.notifications && typeof body.notifications === 'object') {
      if (typeof body.notifications.enabled === 'boolean') {
        updates.push(setNewsEngineSetting('news.notifications.enabled', body.notifications.enabled, auth.userId));
      }
    }

    if (body.ai && typeof body.ai === 'object') {
      if (typeof body.ai.provider === 'string') {
        updates.push(setNewsEngineSetting('news.ai.provider', body.ai.provider.trim(), auth.userId));
      }
      if (typeof body.ai.model === 'string') {
        updates.push(setNewsEngineSetting('news.ai.model', body.ai.model.trim(), auth.userId));
      }
    }

    await Promise.all(updates);

    await writeNewsAuditLog({
      action: 'news_engine_settings_updated',
      actorId: auth.userId,
      metadata: { updates: updates.length },
    });

    return GET();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json(
        {
          error: 'Database schema missing required tables. Apply migrations and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [PUT /api/admin/news-engine/settings] Error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
