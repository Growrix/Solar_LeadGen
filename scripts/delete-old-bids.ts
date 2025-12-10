/**
 * Delete Old Bids Script
 * Removes bids with NULL JSON fields (old test data before Phase 13B fix)
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteOldBids() {
  console.log('🔍 Finding bids with NULL systemData...');

  const oldBids = await prisma.bid.findMany({
    where: {
      systemData: { equals: Prisma.JsonNull }
    },
    select: {
      id: true,
      leadId: true,
      installerId: true,
      amount: true,
      createdAt: true
    }
  });

  console.log(`📊 Found ${oldBids.length} old bids with NULL JSON fields`);

  if (oldBids.length === 0) {
    console.log('✅ No old bids to delete. Database is clean.');
    return;
  }

  console.log('\n📋 Old bids to delete:');
  oldBids.forEach((bid, index) => {
    console.log(`  ${index + 1}. Bid ID: ${bid.id}`);
    console.log(`     Lead ID: ${bid.leadId}`);
    console.log(`     Installer ID: ${bid.installerId}`);
    console.log(`     Amount: $${bid.amount}`);
    console.log(`     Created: ${bid.createdAt}`);
    console.log('');
  });

  console.log('🗑️  Deleting old bids...');

  const result = await prisma.bid.deleteMany({
    where: {
      systemData: { equals: Prisma.JsonNull }
    }
  });

  console.log(`✅ Successfully deleted ${result.count} old bids`);
  console.log('📊 Database ready for new test submissions');
}

deleteOldBids()
  .then(() => {
    console.log('\n✨ Cleanup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
