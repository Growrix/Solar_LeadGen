/**
 * Seed Settings Table
 * 
 * Purpose: Initialize system settings with default values
 * Used for: First-time setup, reset to defaults, testing
 * 
 * Settings include:
 * - Lead approval mode (manual/auto)
 * - Default lead pricing
 * - Lead expiry duration
 * - OTP rate limits
 * - Automation rules
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting settings seed...');

  // Default system settings
  const defaultSettings = [
    {
      key: 'APPROVAL_MODE',
      value: 'MANUAL',
      description: 'Lead approval mode: MANUAL (admin reviews each lead) or AUTO (automation rules apply)',
    },
    {
      key: 'LEAD_PRICE_CALL_VISIT',
      value: '25.00',
      description: 'Default price in £ for Call/Visit quote type leads',
    },
    {
      key: 'LEAD_PRICE_WRITTEN_QUOTE',
      value: '50.00',
      description: 'Default price in £ for Written Quote type leads',
    },
    {
      key: 'LEAD_PRICE_BIDDING',
      value: '75.00',
      description: 'Default price in £ for Competitive Bidding quote type leads (premium pricing)',
    },
    {
      key: 'LEAD_EXPIRY_DAYS',
      value: '30',
      description: 'Number of days before an approved lead expires',
    },
    {
      key: 'LEAD_COUNTDOWN_DEFAULT_DAYS',
      value: '7',
      description: 'Default countdown timer duration (in days) when admin approves a lead with countdown enabled',
    },
    {
      key: 'OTP_RATE_LIMIT_PER_HOUR',
      value: '3',
      description: 'Maximum OTP verification requests per hour per phone number',
    },
    {
      key: 'OTP_EXPIRY_MINUTES',
      value: '10',
      description: 'OTP code expiry time in minutes',
    },
    {
      key: 'MAX_LEAD_SUBMISSIONS_BEFORE_VERIFICATION',
      value: '1',
      description: 'Number of leads a homeowner can submit before phone verification is required',
    },
    {
      key: 'MAX_LEAD_SUBMISSIONS_TOTAL',
      value: '5',
      description: 'Maximum total leads a homeowner can submit (even after verification)',
    },
    {
      key: 'AUTO_APPROVAL_ENABLED',
      value: 'false',
      description: 'Enable/disable automation rules for lead approval (only works in AUTO mode)',
    },
    {
      key: 'AUTO_APPROVAL_RULES',
      value: JSON.stringify([
        {
          id: 'rule-1',
          name: 'Auto-approve verified residential leads',
          conditions: {
            quoteType: 'residential',
            phoneVerified: true,
            excludePostcodes: [],
          },
          actions: {
            approve: true,
            setPrice: null, // null = use default pricing
            assignTo: 'all', // 'all' or specific installer IDs
          },
          enabled: false,
        },
      ]),
      description: 'JSON array of automation rules for lead approval (only applies in AUTO mode)',
    },
    {
      key: 'STRIPE_LEAD_PURCHASE_SUCCESS_URL',
      value: '/installer/purchased-leads?success=true',
      description: 'URL to redirect after successful Stripe payment',
    },
    {
      key: 'STRIPE_LEAD_PURCHASE_CANCEL_URL',
      value: '/installer/marketplace?cancelled=true',
      description: 'URL to redirect if Stripe payment is cancelled',
    },
    {
      key: 'NOTIFICATION_EMAIL_ENABLED',
      value: 'true',
      description: 'Enable/disable email notifications (SendGrid)',
    },
    {
      key: 'NOTIFICATION_PUSHER_ENABLED',
      value: 'true',
      description: 'Enable/disable real-time push notifications (Pusher)',
    },
    {
      key: 'CHAT_ENABLED',
      value: 'true',
      description: 'Enable/disable chat feature between homeowners and installers',
    },
    {
      key: 'ADMIN_EMAIL',
      value: 'admin@solarmatch.com',
      description: 'Admin email for system notifications',
    },
  ];

  // Upsert settings (create or update)
  for (const setting of defaultSettings) {
    try {
      await prisma.settings.upsert({
        where: { key: setting.key },
        update: {
          // Don't overwrite value if already exists, only description
          description: setting.description,
          updatedAt: new Date(),
        },
        create: {
          key: setting.key,
          value: setting.value,
          description: setting.description,
        },
      });
      console.log(`✅ Seeded setting: ${setting.key}`);
    } catch (error) {
      console.error(`❌ Failed to seed setting ${setting.key}:`, error);
    }
  }

  console.log('✅ Settings seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Settings seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
