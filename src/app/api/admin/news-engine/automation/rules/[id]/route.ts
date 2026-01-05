import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/authorization';
import { writeNewsAuditLog } from '@/lib/news-engine';

export const dynamic = 'force-dynamic';

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

// PUT /api/admin/news-engine/automation/rules/[id]
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();
    const body = await request.json();

    const id = params.id;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const data: Prisma.NewsAutomationRuleUpdateInput = {
      ...(typeof body.name === 'string' ? { name: normalizeString(body.name).trim() } : {}),
      ...(typeof body.enabled === 'boolean' ? { enabled: body.enabled } : {}),
      ...(body.config === null
        ? { config: null }
        : body.config && typeof body.config === 'object'
          ? { config: body.config }
          : {}),
    };

    const updated = await prisma.newsAutomationRule.update({
      where: { id },
      data,
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
      action: 'news_automation_rule_updated',
      actorId: auth.userId,
      metadata: { ruleId: updated.id, name: updated.name, enabled: updated.enabled },
    });

    return NextResponse.json({ rule: updated });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021') {
        return NextResponse.json(
          {
            error: 'Database schema missing News Engine tables. Apply migrations and retry.',
          },
          { status: 500 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
      }
    }

    console.error('❌ [PUT /api/admin/news-engine/automation/rules/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update automation rule' }, { status: 500 });
  }
}

// DELETE /api/admin/news-engine/automation/rules/[id]
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin();

    const id = params.id;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await prisma.newsAutomationRule.delete({ where: { id } });

    await writeNewsAuditLog({
      action: 'news_automation_rule_deleted',
      actorId: auth.userId,
      metadata: { ruleId: id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021') {
        return NextResponse.json(
          {
            error: 'Database schema missing News Engine tables. Apply migrations and retry.',
          },
          { status: 500 }
        );
      }
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
      }
    }

    console.error('❌ [DELETE /api/admin/news-engine/automation/rules/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to delete automation rule' }, { status: 500 });
  }
}
