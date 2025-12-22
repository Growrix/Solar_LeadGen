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
        name: 'Test Written Quote Lead',
        email: homeowner.email!,
        phone: homeowner.phone || '+1-555-0000',
        postcode: homeowner.postcode || '12345',
        state: 'NSW',
        location: 'Sydney CBD',
        electricityUsageType: 'medium',
        roofType: 'tile',
        budgetRange: '$10k-$15k',
        panelOrientation: 'north',
        roofTilt: 'medium',
        shadingLevel: 'minimal',
        desiredOffset: 80,
        usagePattern: 'day',
        batteryIncluded: true,
        batteryCapacity: '10kWh',
        batteryBrand: 'Tesla Powerwall',
        batteryUsage: 'backup',
        peakDemand: 'medium',
        isThreePhase: false,
        projectPriority: 'normal',
        retailer: 'AGL',
        customRetailRate: '0.28',
        preferredContactMethod: 'email',
        preferredContactTime: 'afternoon',
        visibility: 'PUBLIC',
      },
    });
    console.log(`✅ Created test lead: ${lead.id}`);
  } else {
    console.log(`✅ Found existing test lead: ${lead.id}`);
  }

  // Create Written Quote with negotiation history
  console.log('\n📋 Creating Written Quote with negotiation history...');

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

  // Create new Written Quote
  const writtenQuote = await prisma.writtenQuote.create({
    data: {
      leadId: lead.id,
      installerId: installer.id,
      homeownerId: homeowner.id,
      status: 'OPEN',
      lastPriceByInstaller: 12000, // $12,000
      lastCounterByHomeowner: 10500, // $10,500
      responseSlaHours: 24,
    },
  });

  console.log(`✅ Created Written Quote: ${writtenQuote.id}`);

  // Create negotiation event history
  console.log('\n📋 Creating negotiation events...');

  const events = [
    {
      writtenQuoteId: writtenQuote.id,
      actorId: installer.id,
      actorRole: 'INSTALLER' as const,
      type: 'OFFER' as const,
      amount: 13000,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
    {
      writtenQuoteId: writtenQuote.id,
      actorId: homeowner.id,
      actorRole: 'HOMEOWNER' as const,
      type: 'COUNTER' as const,
      amount: 11000,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      writtenQuoteId: writtenQuote.id,
      actorId: installer.id,
      actorRole: 'INSTALLER' as const,
      type: 'OFFER' as const,
      amount: 12000,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      writtenQuoteId: writtenQuote.id,
      actorId: homeowner.id,
      actorRole: 'HOMEOWNER' as const,
      type: 'COUNTER' as const,
      amount: 10500,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
  ];

  for (const event of events) {
    await prisma.writtenQuoteEvent.create({
      data: event,
    });
  }

  console.log(`✅ Created ${events.length} negotiation events`);

  // Create a second Written Quote (closed/done deal)
  console.log('\n📋 Creating closed Written Quote...');

  const closedQuote = await prisma.writtenQuote.create({
    data: {
      leadId: lead.id,
      installerId: installer.id,
      homeownerId: homeowner.id,
      status: 'CLOSED',
      lastPriceByInstaller: 11500,
      lastCounterByHomeowner: 11500,
      closedBy: 'HOMEOWNER',
      closedAt: new Date(),
      responseSlaHours: 24,
    },
  });

  console.log(`✅ Created closed Written Quote: ${closedQuote.id}`);

  // Create done deal event
  await prisma.writtenQuoteEvent.create({
    data: {
      writtenQuoteId: closedQuote.id,
      actorId: homeowner.id,
      actorRole: 'HOMEOWNER',
      type: 'DONE_DEAL',
      amount: 11500,
      createdAt: new Date(),
    },
  });

  console.log('✅ Created DONE_DEAL event for closed quote');

  console.log('\n🎉 Written Quote seeding complete!\n');
  console.log('Summary:');
  console.log(`  - 1 OPEN Written Quote with 4 negotiation events`);
  console.log(`  - 1 CLOSED Written Quote with DONE_DEAL event`);
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
