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

  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
  type DayKey = (typeof dayKeys)[number];
  type TimeRange = { id?: string; start: string; end: string };
  type PublishWindowsV2 = {
    timezone: string;
    days: Record<DayKey, { enabled: boolean; ranges: TimeRange[] }>;
    jitterMinutes?: number;
    blackoutDates?: string[];
  };

  const normalizePublishWindowsV2 = (value: unknown): { v: PublishWindowsV2 | null; warnings: string[] } => {
    const localWarnings: string[] = [];
    if (!value || typeof value !== 'object' || Array.isArray(value)) return { v: null, warnings: localWarnings };
    const pw = value as Record<string, unknown>;

    const timezone = typeof pw.timezone === 'string' && pw.timezone.trim() ? pw.timezone.trim() : 'UTC';
    const jitterMinutesRaw = pw.jitterMinutes;
    const jitterMinutes =
      typeof jitterMinutesRaw === 'number' && Number.isFinite(jitterMinutesRaw)
        ? Math.max(0, Math.min(240, Math.round(jitterMinutesRaw)))
        : 0;

    const blackoutDatesRaw = Array.isArray(pw.blackoutDates) ? pw.blackoutDates : [];
    const blackoutDates = blackoutDatesRaw
      .filter((d) => typeof d === 'string')
      .map((d) => d.trim())
      .filter(Boolean)
      .slice(0, 400);

    const daysRaw = pw.days;
    if (!daysRaw || typeof daysRaw !== 'object' || Array.isArray(daysRaw)) {
      localWarnings.push('config.publishWindowsV2.days must be an object (removed publishWindowsV2)');
      return { v: null, warnings: localWarnings };
    }

    const days: PublishWindowsV2['days'] = {
      mon: { enabled: false, ranges: [] },
      tue: { enabled: false, ranges: [] },
      wed: { enabled: false, ranges: [] },
      thu: { enabled: false, ranges: [] },
      fri: { enabled: false, ranges: [] },
      sat: { enabled: false, ranges: [] },
      sun: { enabled: false, ranges: [] },
    };

    for (const k of dayKeys) {
      const rawDay = (daysRaw as any)[k];
      if (!rawDay || typeof rawDay !== 'object' || Array.isArray(rawDay)) continue;
      const enabled = typeof (rawDay as any).enabled === 'boolean' ? Boolean((rawDay as any).enabled) : false;
      const rangesRaw = Array.isArray((rawDay as any).ranges) ? (rawDay as any).ranges : [];
      const ranges = rangesRaw
        .filter((r: any) => r && typeof r === 'object')
        .map((r: any) => ({
          id: typeof r.id === 'string' && r.id.trim() ? r.id.trim() : undefined,
          start: typeof r.start === 'string' ? r.start.trim() : '',
          end: typeof r.end === 'string' ? r.end.trim() : '',
        }))
        .filter((r: any) => !!r.start && !!r.end)
        .slice(0, 60);

      days[k] = { enabled, ranges };
    }

    return {
      v: {
        timezone,
        days,
        jitterMinutes,
        blackoutDates,
      },
      warnings: localWarnings,
    };
  };

  const deriveWindowsFromPublishWindowsV2 = (pw: PublishWindowsV2): string[] => {
    // Best-effort derivation for backward compatibility.
    // Note: timezone is preserved but not applied during derivation.
    const blackout = new Set((pw.blackoutDates ?? []).map((d) => d.trim()).filter(Boolean));
    const dayDefs: Array<{ key: DayKey; jsDay: number }> = [
      { key: 'mon', jsDay: 1 },
      { key: 'tue', jsDay: 2 },
      { key: 'wed', jsDay: 3 },
      { key: 'thu', jsDay: 4 },
      { key: 'fri', jsDay: 5 },
      { key: 'sat', jsDay: 6 },
      { key: 'sun', jsDay: 0 },
    ];

    const now = new Date();
    const windows: Array<{ startsAt: Date; window: string }> = [];
    const scanDays = 35;

    for (let i = 0; i < scanDays; i += 1) {
      const dayDate = new Date(now);
      dayDate.setHours(0, 0, 0, 0);
      dayDate.setDate(dayDate.getDate() + i);

      const yyyy = String(dayDate.getFullYear());
      const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dd = String(dayDate.getDate()).padStart(2, '0');
      const ymd = `${yyyy}-${mm}-${dd}`;
      if (blackout.has(ymd)) continue;

      const jsDay = dayDate.getDay();
      const def = dayDefs.find((d) => d.jsDay === jsDay);
      if (!def) continue;
      const dayCfg = pw.days[def.key];
      if (!dayCfg.enabled) continue;

      for (const range of dayCfg.ranges) {
        if (!range.start || !range.end) continue;
        if (range.end <= range.start) continue;

        const [sh, sm] = range.start.split(':').map((v) => parseInt(v, 10));
        if (Number.isNaN(sh) || Number.isNaN(sm)) continue;

        const startsAt = new Date(dayDate);
        startsAt.setHours(sh, sm, 0, 0);
        if (startsAt <= now) continue;

        windows.push({
          startsAt,
          window: `${ymd} • ${range.start} - ${range.end}`,
        });
      }
    }

    windows.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    return windows.map((w) => w.window).slice(0, 500);
  };

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

  if ('publishWindowsV2' in obj) {
    const { v, warnings: pwWarnings } = normalizePublishWindowsV2(obj.publishWindowsV2);
    warnings.push(...pwWarnings);

    if (v) {
      normalized.publishWindowsV2 = v;

      const existingWindows = Array.isArray(normalized.windows)
        ? (normalized.windows as any[]).filter((w) => typeof w === 'string')
        : [];

      if (existingWindows.length === 0) {
        const derived = deriveWindowsFromPublishWindowsV2(v);
        normalized.windows = derived;
        if (derived.length > 0) {
          warnings.push('config.windows was derived from publishWindowsV2 for compatibility (timezone not applied)');
        }
      }
    } else {
      delete normalized.publishWindowsV2;
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
