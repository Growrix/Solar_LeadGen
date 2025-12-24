import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/authorization';
import { extendNegotiationByParty } from '@/lib/written-quotes/negotiation-window';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const auth = await requireAuth();

    if (auth.role !== 'HOMEOWNER' && auth.role !== 'INSTALLER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await extendNegotiationByParty({
      writtenQuoteId: id,
      userId: auth.userId,
      role: auth.role,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Unable to extend negotiation' }, { status: 403 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to extend negotiation' }, { status: 500 });
  }
}
