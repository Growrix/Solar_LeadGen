/**
 * POST /api/webhooks/stripe
 * 
 * T064: Stripe Webhook Handler
 * Handles Stripe payment events (payment_intent.succeeded, payment_intent.payment_failed)
 * 
 * 🔴 DEVELOPMENT MODE: Webhook not required when STRIPE_BYPASS_MODE=true
 * In bypass mode, purchases are confirmed directly via API
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { confirmPurchase } from '@/lib/services/purchase-service';
import { createAuditLog } from '@/lib/services/audit-logger';
import { prisma } from '@/lib/prisma';

const STRIPE_BYPASS_MODE = process.env.STRIPE_BYPASS_MODE === 'true';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // In bypass mode, webhook is not used
    if (STRIPE_BYPASS_MODE) {
      return NextResponse.json({
        message: 'Stripe webhook disabled in bypass mode',
        bypassed: true
      });
    }

    // 1. Get raw body for signature verification
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // 2. Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // 3. Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;
      const { leadId, installerId } = paymentIntent.metadata;

      if (!leadId || !installerId) {
        console.error('Missing metadata in payment intent:', paymentIntent.id);
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        );
      }

      // Confirm the purchase
      const result = await confirmPurchase({
        leadId,
        installerId,
        paymentIntentId: paymentIntent.id
      });

      if (!result.success) {
        console.error('Failed to confirm purchase:', result.error);
        
        // Log failed confirmation
        await createAuditLog({
          action: 'PAYMENT_CONFIRMATION_FAILED',
          entityType: 'LEAD',
          entityId: leadId,
          leadId: leadId,
          userId: installerId,
          metadata: {
            paymentIntentId: paymentIntent.id,
            error: result.error
          }
        });

        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      console.log('✅ Purchase confirmed via webhook:', leadId);
    }

    // 4. Handle payment_intent.payment_failed event
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as any;
      const { leadId, installerId } = paymentIntent.metadata;

      if (leadId && installerId) {
        // Update lead status back to available
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            purchaseStatus: 'FAILED',
            stripePaymentIntentId: paymentIntent.id
          }
        });

        // Log failed payment
        await createAuditLog({
          action: 'PAYMENT_FAILED',
          entityType: 'LEAD',
          entityId: leadId,
          leadId: leadId,
          userId: installerId,
          metadata: {
            paymentIntentId: paymentIntent.id,
            error: paymentIntent.last_payment_error?.message
          }
        });

        console.log('❌ Payment failed for lead:', leadId);
      }
    }

    // 5. Return success response
    return NextResponse.json({ 
      received: true,
      eventType: event.type 
    });

  } catch (error: any) {
    console.error('Webhook handler error:', error);
    
    return NextResponse.json(
      { 
        error: 'Webhook handler error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhook signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
