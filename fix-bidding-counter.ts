import { prisma } from './src/lib/prisma';

async function fixBiddingCounter() {
  console.log('===== FIXING BIDDING COUNTER =====\n');
  
  // Get homeowner
  const homeowner = await prisma.user.findUnique({
    where: { email: 'homeowners5@gmail.com' },
    select: {
      id: true,
      email: true,
      biddingLeadsSubmitted: true,
      biddingLeadsLimit: true,
    },
  });

  if (!homeowner) {
    console.error('❌ Homeowner not found!');
    return;
  }

  console.log('📊 Current Status:');
  console.log(`   biddingLeadsSubmitted: ${homeowner.biddingLeadsSubmitted}`);
  console.log(`   biddingLeadsLimit: ${homeowner.biddingLeadsLimit}`);

  // Count actual BIDDING leads
  const actualBiddingCount = await prisma.lead.count({
    where: {
      homeownerId: homeowner.id,
      quoteType: 'BIDDING',
    },
  });

  console.log(`   Actual BIDDING leads in DB: ${actualBiddingCount}`);

  // Reset counter to match reality
  const updated = await prisma.user.update({
    where: { id: homeowner.id },
    data: {
      biddingLeadsSubmitted: actualBiddingCount,
    },
  });

  console.log('\n✅ Counter Fixed:');
  console.log(JSON.stringify({
    email: updated.email,
    biddingLeadsSubmitted: (updated as any).biddingLeadsSubmitted,
    biddingLeadsLimit: (updated as any).biddingLeadsLimit,
    canCreateMore: (updated as any).biddingLeadsSubmitted < (updated as any).biddingLeadsLimit,
  }, null, 2));
}

fixBiddingCounter()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
