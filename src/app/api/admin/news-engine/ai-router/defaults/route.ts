import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { NEWS_AI_TASK_TYPES, type NewsAiTaskType, ensureDefaultModelProfiles } from '@/lib/news-engine/ai-router';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isTaskType(value: string): value is NewsAiTaskType {
  return (NEWS_AI_TASK_TYPES as string[]).includes(value);
}

// GET /api/admin/news-engine/ai-router/defaults
export async function GET() {
  try {
    await requireAdmin();
    await ensureDefaultModelProfiles(prisma);

    const rows = await prisma.newsModelRouterDefault.findMany({
      select: {
        taskType: true,
        modelProfileId: true,
      },
    });

    const defaults: Record<string, string | null> = {};
    for (const t of NEWS_AI_TASK_TYPES) defaults[t] = null;
    for (const r of rows) defaults[r.taskType] = r.modelProfileId;

    return NextResponse.json({ defaults });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('❌ [GET /api/admin/news-engine/ai-router/defaults] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch AI router defaults' }, { status: 500 });
  }
}

// PUT /api/admin/news-engine/ai-router/defaults
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const body = (await request.json().catch(() => null)) as any;

    const incoming = body?.defaults && typeof body.defaults === 'object' ? (body.defaults as Record<string, unknown>) : null;
    if (!incoming) return NextResponse.json({ error: 'defaults is required' }, { status: 400 });

    const tasks = Object.keys(incoming);

    const warnings: string[] = [];

    await prisma.$transaction(async (tx) => {
      for (const key of tasks) {
        const taskType = normalizeString(key);
        if (!taskType || !isTaskType(taskType)) continue;

        const modelProfileId = normalizeString(incoming[key]);

        if (!modelProfileId) {
          await tx.newsModelRouterDefault.delete({ where: { taskType } }).catch(() => null);
          continue;
        }

        const exists = await tx.newsModelProfile.findFirst({
          where: { id: modelProfileId, enabled: true },
          select: { id: true },
        });

        if (!exists) {
          // Stale UI state or deleted/disabled profile. Do not fail the entire save.
          // Clear the default for this task so the UI can recover gracefully.
          warnings.push(`Cleared invalid modelProfileId for ${taskType}`);
          await tx.newsModelRouterDefault.delete({ where: { taskType } }).catch(() => null);
          continue;
        }

        await tx.newsModelRouterDefault.upsert({
          where: { taskType },
          create: { taskType, modelProfileId },
          update: { modelProfileId },
        });
      }
    });

    await writeNewsAuditLog({
      action: 'news_ai_router_defaults_updated',
      actorId: auth.userId,
      metadata: { updated: tasks.length },
    });

    const resp = await GET();
    const json = (await resp.json().catch(() => null)) as any;
    return NextResponse.json({ ...(json ?? {}), warnings }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      return NextResponse.json({ error: 'Database schema missing required tables. Apply migrations and retry.' }, { status: 500 });
    }

    const msg = error instanceof Error ? error.message : 'Failed to update AI router defaults';
    console.error('❌ [PUT /api/admin/news-engine/ai-router/defaults] Error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
