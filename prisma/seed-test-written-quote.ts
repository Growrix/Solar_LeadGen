/**
 * Written Quote Test Data Seed Script
 * 
 * Creates sample Written Quotes with negotiation history
 * for testing the Written Quote flow
 * 
 * Usage: npx ts-node prisma/seed-test-written-quote.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Written Quote seed...\n');

  // Get existing test users
  console.log('📋 Fetching test users...');
  const installer = await prisma.user.findFirst({
    where: { role: 'INSTALLER' },
  });

  const homeowner = await prisma.user.findFirst({
    where: { role: 'HOMEOWNER' },
  });

  if (!installer || !homeowner) {
    console.log('❌ Test users not found! Run seed-complete.ts first.');
    return;
  }

  console.log(`✅ Found installer: ${installer.email}`);
  console.log(`✅ Found homeowner: ${homeowner.email}`);

  // Get or create a test lead
  console.log('\n📋 Finding or creating test lead...');
  let lead = await prisma.lead.findFirst({
    where: {
      homeownerId: homeowner.id,
      quoteType: 'WRITTEN_QUOTE',
    },
  });

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        homeownerId: homeowner.id,
        quoteType: 'WRITTEN_QUOTE',
        status: 'APPROVED',

        // Lead model required fields (schema.prisma)
        projectType: 'Residential',
        propertyType: 'Residential',
        postcode: homeowner.postcode || '2000',
        location: 'Sydney CBD',
        state: 'NSW',
        energyBill: 250,
        billType: 'monthly',
        roofType: 'tile',
        budgetRange: '$10k-$15k',
        desiredOffset: 80,

        // Optional fields
        name: 'Test Written Quote Lead',
        visibility: 'PUBLIC',
        batteryRequired: true,
        batteryCapacity: '10kWh',
      },
    });
    console.log(`✅ Created test lead: ${lead.id}`);
  } else {
    console.log(`✅ Found existing test lead: ${lead.id}`);
  }

  // Create Written Quote (with negotiation fields pre-populated)
  console.log('\n📋 Creating Written Quote (with negotiation fields)...');

  // Check if Written Quote already exists
  const existingQuote = await prisma.writtenQuote.findFirst({
    where: {
      leadId: lead.id,
      installerId: installer.id,
    },
  });

  if (existingQuote) {
    console.log(`⚠️  Written Quote already exists: ${existingQuote.id}`);
    console.log('   Skipping creation to avoid duplicates.');
    return;
  }

  const amount = 12000;
  const includeGst = true;
  const gstPercent = 10.0;
  const gstAmount = includeGst ? amount * (gstPercent / 100) : 0;
  const finalTotal = amount + gstAmount;

  // Create new Written Quote
  const writtenQuote = await prisma.writtenQuote.create({
    data: {
      leadId: lead.id,
      installerId: installer.id,
      amount,
      includeGst,
      gstPercent,
      gstAmount,
      includeIncentive: false,
      incentiveAmount: 0,
      finalTotal,
      status: 'SUBMITTED',

      // Negotiation fields (simulate homeowner counter already placed)
      negotiationStatus: 'HOMEOWNER_COUNTERED',
      homeownerCounterAmount: 10500,
      homeownerCounterAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Created Written Quote: ${writtenQuote.id}`);

  // Note: There is no WrittenQuoteEvent model in the current schema.
  // Negotiation history is represented by fields on WrittenQuote.

  // Create a second Written Quote to represent an agreed deal
  console.log('\n📋 Creating agreed Written Quote...');

  const agreedAmount = 11500;
  const agreedGstAmount = includeGst ? agreedAmount * (gstPercent / 100) : 0;
  const agreedFinalTotal = agreedAmount + agreedGstAmount;

  const agreedQuote = await prisma.writtenQuote.create({
    data: {
      leadId: lead.id,
      installerId: installer.id,
      amount: agreedAmount,
      includeGst,
      gstPercent,
      gstAmount: agreedGstAmount,
      includeIncentive: false,
      incentiveAmount: 0,
      finalTotal: agreedFinalTotal,
      status: 'SUBMITTED',
      negotiationStatus: 'AGREED',
      agreedAmount,
      agreedAt: new Date(),
      agreedBy: 'HOMEOWNER',
    },
  });

  console.log(`✅ Created agreed Written Quote: ${agreedQuote.id}`);

  console.log('\n🎉 Written Quote seeding complete!\n');
  console.log('Summary:');
  console.log(`  - 1 Written Quote with homeowner counter fields set`);
  console.log(`  - 1 Written Quote with agreed fields set`);
  console.log(`  - Lead ID: ${lead.id}`);
  console.log(`  - Installer: ${installer.email}`);
  console.log(`  - Homeowner: ${homeowner.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding Written Quote data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
