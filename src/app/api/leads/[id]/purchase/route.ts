/**
 * POST /api/leads/[id]/purchase
 * 
 * T063: Lead Purchase API Endpoint
 * Allows verified installers to purchase leads
 * 
 * 🔴 DEVELOPMENT MODE: Supports Stripe bypass for testing
 * Set STRIPE_BYPASS_MODE=true in .env to skip payment processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  createPurchaseIntent, 
  confirmPurchase 
} from '@/lib/services/purchase-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Role check - only installers can purchase leads
    if (session.user.role !== 'INSTALLER') {
      return NextResponse.json(
        { error: 'Only installers can purchase leads' },
        { status: 403 }
      );
    }

    // 3. Verification check - installer must be verified
    if (!session.user.installerVerified) {
      return NextResponse.json(
        { error: 'Installer verification required to purchase leads' },
        { status: 403 }
      );
    }

    const leadId = params.id;
    const installerId = session.user.id;
    const installerEmail = session.user.email || '';

    // 4. Parse request body
    const body = await request.json();
    const { action } = body; // 'initiate' or 'confirm'

    // 5. Handle purchase initiation
    if (action === 'initiate' || !action) {
      const result = await createPurchaseIntent({
        leadId,
        installerId,
        installerEmail
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to initiate purchase' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        clientSecret: result.clientSecret,
        leadPrice: result.leadPrice,
        bypassed: result.bypassed,
        message: result.bypassed 
          ? '🔧 Development mode: Payment bypassed' 
          : 'Payment intent created'
      });
    }

    // 6. Handle purchase confirmation
    if (action === 'confirm') {
      const { paymentIntentId } = body;

      const result = await confirmPurchase({
        leadId,
        installerId,
        paymentIntentId
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to confirm purchase' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        lead: result.lead,
        bypassed: result.bypassed,
        message: result.bypassed
          ? '🔧 Development mode: Purchase confirmed without payment'
          : 'Purchase confirmed successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use"initiate" or"confirm"' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Lead purchase error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
