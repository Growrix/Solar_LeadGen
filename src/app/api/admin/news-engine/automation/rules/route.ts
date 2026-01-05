import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

// GET /api/admin/news-engine/automation/rules
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const enabled = searchParams.get('enabled');

    const rules = await prisma.newsAutomationRule.findMany({
      where: {
        ...(enabled === '1' ? { enabled: true } : enabled === '0' ? { enabled: false } : {}),
      },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        name: true,
        enabled: true,
        config: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ rules });
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
          error: 'Database schema missing News Engine tables. Apply migrations and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [GET /api/admin/news-engine/automation/rules] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch automation rules' }, { status: 500 });
  }
}

// POST /api/admin/news-engine/automation/rules
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    const body = await request.json();

    const name = normalizeString(body.name).trim();
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const enabled = typeof body.enabled === 'boolean' ? body.enabled : true;
    const config = body.config && typeof body.config === 'object' ? body.config : null;

    const created = await prisma.newsAutomationRule.create({
      data: {
        name,
        enabled,
        config,
      },
      select: {
        id: true,
        name: true,
        enabled: true,
        config: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await writeNewsAuditLog({
      action: 'news_automation_rule_created',
      actorId: auth.userId,
      metadata: { ruleId: created.id, name: created.name, enabled: created.enabled },
    });

    return NextResponse.json({ rule: created }, { status: 201 });
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
          error: 'Database schema missing News Engine tables. Apply migrations and retry.',
        },
        { status: 500 }
      );
    }

    console.error('❌ [POST /api/admin/news-engine/automation/rules] Error:', error);
    return NextResponse.json({ error: 'Failed to create automation rule' }, { status: 500 });
  }
}
