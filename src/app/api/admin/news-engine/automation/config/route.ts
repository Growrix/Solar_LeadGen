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
      const configJson = body.config === null ? '' : JSON.stringify(body.config);
      updates.push(setSetting(KEY_CONFIG_JSON, configJson, auth.userId, 'News Engine automation config JSON'));
    }

    await Promise.all(updates);

    await writeNewsAuditLog({
      action: 'news_automation_config_updated',
      actorId: auth.userId,
      metadata: { keysUpdated: updates.length },
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
