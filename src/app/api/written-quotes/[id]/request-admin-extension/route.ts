import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/authorization';
import { requestAdminExtension } from '@/lib/written-quotes/negotiation-window';

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

    const result = await requestAdminExtension({
      writtenQuoteId: id,
      requesterUserId: auth.userId,
      requesterRole: auth.role,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Unable to request admin extension' }, { status: 403 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to request admin extension' }, { status: 500 });
  }
}
