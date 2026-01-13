import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth/authorization';
import { getSettings, setSetting } from '@/lib/services/settings-service';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

const KEY_AUTO_DRAFT = 'news.automation.auto_draft';
const KEY_AUTO_SCHEDULE = 'news.automation.auto_schedule';
const KEY_AUTO_PUBLISH = 'news.automation.auto_publish';
const KEY_CONFIG_JSON = 'news.automation.config_json';

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  const v = raw.trim().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return fallback;
}

function safeParseJson(raw: string | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeAutomationConfig(raw: unknown): { normalized: unknown; warnings: string[] } {
  const warnings: string[] = [];

  if (raw === null) return { normalized: null, warnings };
  if (raw === undefined) return { normalized: undefined, warnings };

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    warnings.push('config must be a JSON object (or null)');
    return { normalized: raw, warnings };
  }

  const obj = raw as Record<string, unknown>;
  const normalized: Record<string, unknown> = { ...obj };

  if ('windows' in obj) {
    const windowsRaw = obj.windows;
    if (!Array.isArray(windowsRaw)) {
      delete normalized.windows;
      warnings.push('config.windows must be an array of strings (removed)');
    } else {
      normalized.windows = windowsRaw
        .filter((v) => typeof v === 'string')
        .map((v) => v.trim())
        .filter(Boolean)
        .slice(0, 500);
    }
  }

  if ('operationalRules' in obj) {
    const rulesRaw = obj.operationalRules;
    if (!Array.isArray(rulesRaw)) {
      delete normalized.operationalRules;
      warnings.push('config.operationalRules must be an array (removed)');
    } else {
      normalized.operationalRules = rulesRaw.slice(0, 200);
    }
  }

  return { normalized, warnings };
}

// GET /api/admin/news-engine/automation/config
export async function GET() {
  try {
    await requireAdmin();

    const settings = await getSettings([KEY_AUTO_DRAFT, KEY_AUTO_SCHEDULE, KEY_AUTO_PUBLISH, KEY_CONFIG_JSON]);

    return NextResponse.json({
      automation: {
        autoDraft: parseBool(settings[KEY_AUTO_DRAFT], true),
        autoSchedule: parseBool(settings[KEY_AUTO_SCHEDULE], false),
        autoPublish: parseBool(settings[KEY_AUTO_PUBLISH], false),
      },
      config: safeParseJson(settings[KEY_CONFIG_JSON]),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('❌ [GET /api/admin/news-engine/automation/config] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch automation config' }, { status: 500 });
  }
}

// PUT /api/admin/news-engine/automation/config
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const body = await request.json();

    let configWarnings: string[] = [];

    const updates: Array<Promise<void>> = [];

    if (body.automation && typeof body.automation === 'object') {
      if (typeof body.automation.autoDraft === 'boolean') {
        updates.push(setSetting(KEY_AUTO_DRAFT, body.automation.autoDraft, auth.userId, 'News Engine automation: autoDraft'));
      }
      if (typeof body.automation.autoSchedule === 'boolean') {
        updates.push(setSetting(KEY_AUTO_SCHEDULE, body.automation.autoSchedule, auth.userId, 'News Engine automation: autoSchedule'));
      }
      if (typeof body.automation.autoPublish === 'boolean') {
        updates.push(setSetting(KEY_AUTO_PUBLISH, body.automation.autoPublish, auth.userId, 'News Engine automation: autoPublish'));
      }
    }

    if ('config' in body) {
      const { normalized, warnings } = normalizeAutomationConfig(body.config);
      configWarnings = warnings;
      const configJson = normalized === null ? '' : JSON.stringify(normalized);
      updates.push(setSetting(KEY_CONFIG_JSON, configJson, auth.userId, 'News Engine automation config JSON'));
    }

    await Promise.all(updates);

    await writeNewsAuditLog({
      action: 'news_automation_config_updated',
      actorId: auth.userId,
      metadata: { keysUpdated: updates.length, ...(configWarnings.length ? { warnings: configWarnings } : {}) },
    });

    const settings = await getSettings([KEY_AUTO_DRAFT, KEY_AUTO_SCHEDULE, KEY_AUTO_PUBLISH, KEY_CONFIG_JSON]);
    return NextResponse.json({
      automation: {
        autoDraft: parseBool(settings[KEY_AUTO_DRAFT], true),
        autoSchedule: parseBool(settings[KEY_AUTO_SCHEDULE], false),
        autoPublish: parseBool(settings[KEY_AUTO_PUBLISH], false),
      },
      config: safeParseJson(settings[KEY_CONFIG_JSON]),
    });
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

    console.error('❌ [PUT /api/admin/news-engine/automation/config] Error:', error);
    return NextResponse.json({ error: 'Failed to update automation config' }, { status: 500 });
  }
}
