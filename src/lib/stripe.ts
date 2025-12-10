/**
 * Stripe Server-Side Client Singleton
 * 
 * Purpose: Process payments for lead purchases by installers
 * Used for: Creating payment intents, processing charges, handling webhooks
 * 
 * 🔴 DEVELOPMENT MODE: Supports bypass mode for testing without Stripe API keys
 * Set STRIPE_BYPASS_MODE=true in .env to skip Stripe initialization
 * 
 * Why singleton pattern?
 * - Reuses Stripe instance across requests (more efficient)
 * - Centralizes configuration
 * - Consistent error handling
 * 
 * Usage:
 *   import { stripe } from '@/lib/stripe';
 *   
 *   // Create payment intent
 *   const paymentIntent = await stripe.paymentIntents.create({
 *     amount: 5000, // £50.00 in pence
 *     currency: 'gbp',
 *     metadata: { leadId: '123' }
 *   });
 * 
 * Environment Variables:
 * - STRIPE_BYPASS_MODE: Set to 'true' to bypass Stripe (development only)
 * - STRIPE_SECRET_KEY: Your Stripe secret key (required if not in bypass mode)
 * - STRIPE_WEBHOOK_SECRET: Your Stripe webhook signing secret
 */

import Stripe from 'stripe';

const BYPASS_MODE = process.env.STRIPE_BYPASS_MODE === 'true';

// Validate environment variable at startup (unless in bypass mode)
if (!BYPASS_MODE && !process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required (or set STRIPE_BYPASS_MODE=true for development)');
}

/**
 * Stripe client singleton
 * 
 * Configured with:
 * - API version: Latest stable version
 * - TypeScript support: Full type safety
 * - App info: For Stripe dashboard identification
 * 
 * In bypass mode, this will be a mock Stripe instance
 */
export const stripe = BYPASS_MODE 
  ? null as any as Stripe // Bypass mode - no real Stripe client
  : new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-09-30.clover', // Use latest stable API version
      typescript: true,
      appInfo: {
        name: 'SolarMatch',
        version: '1.0.0',
      },
    });

/**
 * Helper function to create a payment intent for lead purchase
 * 
 * @param amount - Amount in pence (e.g., 5000 = £50.00)
 * @param leadId - The lead being purchased
 * @param installerId - The installer making the purchase
 * @returns Stripe PaymentIntent object
 * 
 * Example:
 *   const paymentIntent = await createLeadPaymentIntent(5000, 'lead-123', 'user-456');
 *   // Send paymentIntent.client_secret to frontend for confirmation
 */
export async function createLeadPaymentIntent(
  amount: number,
  leadId: string,
  installerId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount,
    currency: 'gbp', // British Pounds
    metadata: {
      leadId,
      installerId,
      type: 'lead_purchase',
    },
    description: `Lead purchase: ${leadId}`,
  });
}

/**
 * Helper function to verify Stripe webhook signature
 * 
 * @param body - Raw request body (string or buffer)
 * @param signature - Stripe-Signature header value
 * @returns Stripe event if signature is valid
 * @throws Error if signature is invalid
 * 
 * Why verify signatures?
 * - Ensures webhook came from Stripe (not an attacker)
 * - Prevents replay attacks
 * - Required for production security
 * 
 * Example:
 *   const event = await verifyWebhookSignature(rawBody, stripeSignature);
 *   if (event.type === 'payment_intent.succeeded') {
 *     // Handle successful payment
 *   }
 */
export async function verifyWebhookSignature(
  body: string | any, // Buffer type - using any to avoid Node.js type dependency
  signature: string
): Promise<Stripe.Event> {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
  }

  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('❌ [Stripe] Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Helper function to retrieve a payment intent by ID
 * 
 * @param paymentIntentId - The payment intent ID (starts with pi_)
 * @returns Stripe PaymentIntent object
 * 
 * Example:
 *   const paymentIntent = await getPaymentIntent('pi_123xyz');
 *   console.log('Status:', paymentIntent.status); // 'succeeded', 'pending', etc.
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Helper function to refund a payment
 * 
 * @param paymentIntentId - The payment intent ID to refund
 * @param reason - Reason for refund (optional)
 * @returns Stripe Refund object
 * 
 * Example:
 *   await refundPayment('pi_123xyz', 'Lead data was invalid');
 */
export async function refundPayment(
  paymentIntentId: string,
  reason?: string
): Promise<Stripe.Refund> {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason: reason ? 'requested_by_customer' : undefined,
    metadata: reason ? { reason } : undefined,
  });
}

/**
 * Currency formatting helper
 * 
 * Converts pence to pounds with proper formatting
 * 
 * @param amountInPence - Amount in pence (e.g., 5000)
 * @returns Formatted string (e.g.,"£50.00")
 * 
 * Example:
 *   formatCurrency(5000) //"£50.00"
 *   formatCurrency(12345) //"£123.45"
 */
export function formatCurrency(amountInPence: number): string {
  const pounds = amountInPence / 100;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pounds);
}
