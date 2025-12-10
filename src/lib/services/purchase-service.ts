/**
 * Purchase Service
 * Handles lead purchase transactions with Stripe integration
 * 
 * 🔴 DEVELOPMENT MODE: Supports Stripe bypass for testing without API keys
 * Set STRIPE_BYPASS_MODE=true in .env to enable bypass mode
 * 
 * Phase 5: User Story 3 - Installer Discovers and Purchases Lead
 */

import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { createAuditLog } from './audit-logger';
import { createNotification } from './notification-service';
import { getSetting, getSettingAsNumber } from './settings-service';
import type { Lead, User, PurchaseStatus } from '@prisma/client';

// Development bypass mode flag
const STRIPE_BYPASS_MODE = process.env.STRIPE_BYPASS_MODE === 'true';

interface CreatePurchaseIntentInput {
  leadId: string;
  installerId: string;
  installerEmail: string;
}

interface CreatePurchaseIntentResult {
  success: boolean;
  clientSecret?: string;
  leadPrice?: number;
  error?: string;
  bypassed?: boolean; // Indicates if payment was bypassed in dev mode
}

interface ConfirmPurchaseInput {
  leadId: string;
  installerId: string;
  paymentIntentId?: string; // Optional in bypass mode or admin assignment
  adminAssigned?: boolean; // Phase 7: Skip payment for admin-assigned leads
}

interface ConfirmPurchaseResult {
  success: boolean;
  lead?: Lead;
  error?: string;
  bypassed?: boolean;
}

/**
 * Create a Stripe Payment Intent for lead purchase
 * 🔴 DEV MODE: If STRIPE_BYPASS_MODE=true, returns mock client secret
 */
export async function createPurchaseIntent(
  input: CreatePurchaseIntentInput
): Promise<CreatePurchaseIntentResult> {
  try {
    const { leadId, installerId, installerEmail } = input;

    // 1. Verify lead exists and is available for purchase
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        homeowner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

    // 2. Check if lead is available (PUBLIC visibility, APPROVED status, not already purchased)
    if (lead.visibility !== 'PUBLIC') {
      return { success: false, error: 'Lead is not available for purchase' };
    }

    if (lead.status !== 'APPROVED') {
      return { success: false, error: 'Lead has not been approved yet' };
    }

    if (lead.installerId && lead.purchaseStatus === 'COMPLETED') {
      return { success: false, error: 'Lead has already been purchased' };
    }

    // 3. Prevent installer from purchasing their own lead (edge case)
    if (lead.installerId === installerId) {
      return { success: false, error: 'You have already purchased this lead' };
    }

    // 4. Get lead price from settings (based on quote type)
    const priceSettingKey =
      lead.quoteType === 'WRITTEN_QUOTE'
        ? 'LEAD_PRICE_WRITTEN_QUOTE'
        : 'LEAD_PRICE_CALL_VISIT';

    const leadPrice = await getSettingAsNumber(priceSettingKey);

    if (!leadPrice || leadPrice <= 0) {
      return { success: false, error: 'Lead price not configured' };
    }

    // 🔴 DEVELOPMENT MODE: Bypass Stripe and return mock payment intent
    if (STRIPE_BYPASS_MODE) {
      console.log('🔴 STRIPE BYPASS MODE: Skipping real payment intent creation');
      console.log(`Lead ${leadId} - Price: £${leadPrice} - Installer: ${installerId}`);

      // Update lead with pending purchase status
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          purchaseStatus: 'PENDING',
          stripePaymentIntentId: `pi_bypass_${Date.now()}`, // Mock payment intent ID
          leadPrice: leadPrice,
        },
      });

      // Audit log
      await createAuditLog({
        action: 'PAYMENT_INITIATED',
        entityType: 'lead',
        entityId: leadId,
        leadId: leadId,
        userId: installerId,
        metadata: {
          leadPrice,
          bypassed: true,
          message: 'Payment bypassed in development mode',
        },
      });

      return {
        success: true,
        clientSecret: `pi_bypass_${Date.now()}_secret_mock`, // Mock client secret
        leadPrice,
        bypassed: true,
      };
    }

    // 🟢 PRODUCTION MODE: Create real Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(leadPrice * 100), // Convert to pence (£25 = 2500 pence)
      currency: 'gbp',
      metadata: {
        leadId,
        installerId,
        quoteType: lead.quoteType,
        homeownerId: lead.homeownerId,
      },
      receipt_email: installerEmail,
      description: `Lead purchase: ${lead.quoteType} from ${lead.homeowner?.name || 'Homeowner'}`,
    });

    // Update lead with pending purchase status
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        purchaseStatus: 'PENDING',
        stripePaymentIntentId: paymentIntent.id,
        leadPrice: leadPrice,
      },
    });

    // Audit log
    await createAuditLog({
      action: 'PAYMENT_INITIATED',
      entityType: 'lead',
      entityId: leadId,
      leadId: leadId,
      userId: installerId,
      metadata: {
        paymentIntentId: paymentIntent.id,
        leadPrice,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret || undefined,
      leadPrice,
      bypassed: false,
    };
  } catch (error) {
    console.error('Error creating purchase intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment intent',
    };
  }
}

/**
 * Confirm lead purchase after successful payment
 * 🔴 DEV MODE: If STRIPE_BYPASS_MODE=true, confirms purchase without payment verification
 */
export async function confirmPurchase(
  input: ConfirmPurchaseInput
): Promise<ConfirmPurchaseResult> {
  try {
    const { leadId, installerId, paymentIntentId, adminAssigned = false } = input;

    // 1. Verify lead exists
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        homeowner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

    // Phase 7: Admin-assigned leads bypass payment and use different workflow
    if (adminAssigned) {
      console.log('✅ ADMIN ASSIGNED LEAD: Accepting assignment without payment');
      console.log(`Installer ${installerId} accepting assignment for lead ${leadId}`);

      // Verify installer has a pending assignment for this lead
      const assignment = await prisma.leadAssignment.findFirst({
        where: {
          leadId: leadId,
          installerId: installerId,
        },
      });

      if (!assignment) {
        return { success: false, error: 'No assignment found for this lead' };
      }

      // Update lead with completed assignment acceptance
      const updatedLead = await prisma.lead.update({
        where: { id: leadId },
        data: {
          installerId: installerId,
          purchasedAt: new Date(),
          status: 'PURCHASED',
          visibility: 'PRIVATE', // Lead becomes private after acceptance
        },
        include: {
          homeowner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Audit log with ASSIGNMENT_ACCEPTED action
      await createAuditLog({
        action: 'ASSIGNMENT_ACCEPTED',
        entityType: 'lead',
        entityId: leadId,
        leadId: leadId,
        userId: installerId,
        metadata: {
          adminAssigned: true,
          assignmentId: assignment.id,
          assignedBy: assignment.assignedBy,
          assignedAt: assignment.assignedAt.toISOString(),
        },
      });

      // Notify homeowner
      await createNotification({
        userId: lead.homeownerId,
        type: 'LEAD_PURCHASED',
        title: 'Your Lead Is Being Processed',
        message: `An installer has accepted your ${lead.quoteType?.replace('_', ' ').toLowerCase() || 'quote'} request.`,
        metadata: { leadId },
      });

      // Notify admin who assigned the lead
      if (assignment.assignedBy) {
        await createNotification({
          userId: assignment.assignedBy,
          type: 'ASSIGNMENT_ACCEPTED_COMPETITIVE',
          title: 'Assignment Accepted',
          message: `Installer has accepted the lead assignment for ${lead.location}, ${lead.state}.`,
          metadata: { leadId, installerId },
        });
      }

      return {
        success: true,
        lead: updatedLead,
        bypassed: true,
      };
    }

    // 2. Verify purchase is in PENDING status (for marketplace purchases)
    if (lead.purchaseStatus !== 'PENDING') {
      return { success: false, error: 'Lead purchase is not pending' };
    }

    // 🔴 DEVELOPMENT MODE: Bypass payment verification
    if (STRIPE_BYPASS_MODE) {
      console.log('🔴 STRIPE BYPASS MODE: Skipping payment verification');
      console.log(`Confirming purchase for lead ${leadId} by installer ${installerId}`);

      // Update lead with completed purchase
      const updatedLead = await prisma.lead.update({
        where: { id: leadId },
        data: {
          purchaseStatus: 'COMPLETED',
          installerId: installerId,
          purchasedAt: new Date(),
          status: 'PURCHASED',
          visibility: 'PRIVATE', // Lead becomes private after purchase
        },
        include: {
          homeowner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Audit log
      await createAuditLog({
        action: 'PAYMENT_COMPLETED',
        entityType: 'lead',
        entityId: leadId,
        leadId: leadId,
        userId: installerId,
        metadata: {
          bypassed: true,
          message: 'Payment bypassed in development mode',
        },
      });

      // Notify homeowner
      await createNotification({
        userId: lead.homeownerId,
        type: 'LEAD_PURCHASED',
        title: 'Your Lead Has Been Purchased',
        message: `An installer has purchased your ${(lead.quoteType || 'quote').replace('_', ' ').toLowerCase()} request.`,
        metadata: { leadId },
      });

      return {
        success: true,
        lead: updatedLead,
        bypassed: true,
      };
    }

    // 🟢 PRODUCTION MODE: Verify payment with Stripe
    if (!paymentIntentId) {
      return { success: false, error: 'Payment intent ID is required' };
    }

    // Verify payment intent matches lead
    if (lead.stripePaymentIntentId !== paymentIntentId) {
      return { success: false, error: 'Payment intent does not match lead' };
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return { success: false, error: 'Payment has not succeeded yet' };
    }

    // Update lead with completed purchase
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        purchaseStatus: 'COMPLETED',
        installerId: installerId,
        purchasedAt: new Date(),
        status: 'PURCHASED',
        visibility: 'PRIVATE', // Lead becomes private after purchase
      },
      include: {
        homeowner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Audit log
    await createAuditLog({
      action: 'PAYMENT_COMPLETED',
      entityType: 'lead',
      entityId: leadId,
      leadId: leadId,
      userId: installerId,
      metadata: {
        paymentIntentId,
        amount: paymentIntent.amount / 100,
      },
    });

    // Notify homeowner
    await createNotification({
      userId: lead.homeownerId,
      type: 'LEAD_PURCHASED',
      title: 'Your Lead Has Been Purchased',
      message: `An installer has purchased your ${(lead.quoteType || 'quote').replace('_', ' ').toLowerCase()} request.`,
      metadata: { leadId },
    });

    return {
      success: true,
      lead: updatedLead,
      bypassed: false,
    };
  } catch (error) {
    console.error('Error confirming purchase:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to confirm purchase',
    };
  }
}

/**
 * Prevent duplicate purchases of the same lead
 * Check if installer has already purchased or initiated purchase for this lead
 */
export async function preventDuplicatePurchase(
  leadId: string,
  installerId: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        installerId: true,
        purchaseStatus: true,
        stripePaymentIntentId: true,
      },
    });

    if (!lead) {
      return { allowed: false, reason: 'Lead not found' };
    }

    // Check if lead is already purchased by this installer
    if (lead.installerId === installerId && lead.purchaseStatus === 'COMPLETED') {
      return { allowed: false, reason: 'You have already purchased this lead' };
    }

    // Check if lead has a pending purchase (by anyone)
    if (lead.purchaseStatus === 'PENDING' && lead.stripePaymentIntentId) {
      return { allowed: false, reason: 'This lead has a pending purchase transaction' };
    }

    // Check if lead is already purchased by someone else
    if (lead.installerId && lead.installerId !== installerId && lead.purchaseStatus === 'COMPLETED') {
      return { allowed: false, reason: 'This lead has already been purchased by another installer' };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking duplicate purchase:', error);
    return { allowed: false, reason: 'Failed to verify purchase eligibility' };
  }
}

/**
 * Get purchase history for an installer
 */
export async function getInstallerPurchases(installerId: string): Promise<Lead[]> {
  try {
    const purchases = await prisma.lead.findMany({
      where: {
        installerId,
        purchaseStatus: 'COMPLETED',
      },
      include: {
        homeowner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        purchasedAt: 'desc',
      },
    });

    return purchases;
  } catch (error) {
    console.error('Error fetching installer purchases:', error);
    return [];
  }
}

/**
 * Handle failed payment (called by webhook)
 */
export async function handleFailedPayment(paymentIntentId: string): Promise<void> {
  try {
    const lead = await prisma.lead.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!lead) {
      console.error('Lead not found for failed payment:', paymentIntentId);
      return;
    }

    // Update lead status to FAILED
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        purchaseStatus: 'FAILED',
      },
    });

    // Audit log
    await createAuditLog({
      action: 'PAYMENT_FAILED',
      entityType: 'lead',
      entityId: lead.id,
      leadId: lead.id,
      userId: lead.homeownerId,
      metadata: {
        paymentIntentId,
      },
    });
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}
