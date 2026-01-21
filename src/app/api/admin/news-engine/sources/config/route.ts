import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth/authorization';
import { getSettings, setSetting } from '@/lib/services/settings-service';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

const KEY_SOURCES_CONFIG_JSON = 'news.sources.config_json';

type SourcesConfig = {
  researchWeights: { web: number; social: number; journals: number };
  researchEnabled: { web: boolean; social: boolean; journals: boolean };
  rules: { deduplication: boolean; verifyPayload: boolean };
  minSources: number;
  countries: string[];
  blacklist: string;
};

function safeParseJson(raw: string | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeConfig(raw: unknown): SourcesConfig {
  const fallback: SourcesConfig = {
    researchWeights: { web: 70, social: 30, journals: 50 },
    researchEnabled: { web: true, social: true, journals: true },
    rules: { deduplication: true, verifyPayload: false },
    minSources: 3,
    countries: ['USA', 'UK', 'Japan', 'Germany'],
    blacklist: '',
  };

  if (!raw || typeof raw !== 'object') return fallback;
  const obj = raw as Record<string, unknown>;

  const next: SourcesConfig = { ...fallback };

  const weights = obj.researchWeights;
  if (weights && typeof weights === 'object') {
    const w = weights as Record<string, unknown>;
    for (const key of ['web', 'social', 'journals'] as const) {
      const v = w[key];
      if (typeof v === 'number' && Number.isFinite(v)) next.researchWeights[key] = Math.max(0, Math.min(100, Math.floor(v)));
    }
  }

  const enabled = obj.researchEnabled;
  if (enabled && typeof enabled === 'object') {
    const e = enabled as Record<string, unknown>;
    for (const key of ['web', 'social', 'journals'] as const) {
      const v = e[key];
      if (typeof v === 'boolean') next.researchEnabled[key] = v;
    }
  }

  const rules = obj.rules;
  if (rules && typeof rules === 'object') {
    const r = rules as Record<string, unknown>;
    if (typeof r.deduplication === 'boolean') next.rules.deduplication = r.deduplication;
    if (typeof r.verifyPayload === 'boolean') next.rules.verifyPayload = r.verifyPayload;
  }

  if (typeof obj.minSources === 'number' && Number.isFinite(obj.minSources)) {
    next.minSources = Math.max(0, Math.floor(obj.minSources));
  }

  if (Array.isArray(obj.countries)) {
    next.countries = obj.countries
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 30);
    if (next.countries.length === 0) next.countries = fallback.countries;
  }

  if (typeof obj.blacklist === 'string') next.blacklist = obj.blacklist;

  return next;
}

// GET /api/admin/news-engine/sources/config
export async function GET() {
  try {
    await requireAdmin();

    const settings = await getSettings([KEY_SOURCES_CONFIG_JSON]);
    const parsed = safeParseJson(settings[KEY_SOURCES_CONFIG_JSON]);

    return NextResponse.json({ config: normalizeConfig(parsed) });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('❌ [GET /api/admin/news-engine/sources/config] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sources config' }, { status: 500 });
  }
}

// PUT /api/admin/news-engine/sources/config
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const body = (await request.json().catch(() => null)) as unknown;

    const raw = body && typeof body === 'object' && 'config' in (body as any) ? (body as any).config : null;
    const config = normalizeConfig(raw);

    await setSetting(KEY_SOURCES_CONFIG_JSON, JSON.stringify(config), auth.userId, 'News Engine sources config JSON');

    await writeNewsAuditLog({
      action: 'news_sources_config_updated',
      actorId: auth.userId,
      metadata: { key: KEY_SOURCES_CONFIG_JSON },
    });

    return NextResponse.json({ config });
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

    console.error('❌ [PUT /api/admin/news-engine/sources/config] Error:', error);
    return NextResponse.json({ error: 'Failed to update sources config' }, { status: 500 });
  }
}
