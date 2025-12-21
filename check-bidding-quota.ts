import { prisma } from './src/lib/prisma';

async function checkBiddingQuota() {
  console.log('===== BIDDING QUOTA AUDIT =====\n');
  
  // Get homeowner data
  const homeowner = await prisma.user.findUnique({
    where: { email: 'homeowners5@gmail.com' },
    select: {
      id: true,
      email: true,
      name: true,
      leadSubmissionLimit: true,
      biddingLeadsLimit: true,
      leadSubmissionCount: true,
      biddingLeadsSubmitted: true,
    },
  });

  if (!homeowner) {
    console.error('❌ Homeowner not found!');
    return;
  }

  console.log('📊 Homeowner Quota Status:');
  console.log(JSON.stringify(homeowner, null, 2));

  // Get all leads
  const leads = await prisma.lead.findMany({
    where: { homeownerId: homeowner.id },
    select: {
      id: true,
      quoteType: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('\n📋 Lead History:');
  console.log(JSON.stringify(leads, null, 2));

  // Count by type
  const biddingLeads = leads.filter(l => l.quoteType === 'BIDDING');
  const callVisitLeads = leads.filter(l => l.quoteType === 'CALL_VISIT');
  const writtenQuoteLeads = leads.filter(l => l.quoteType === 'WRITTEN_QUOTE');

  console.log('\n📈 Lead Breakdown:');
  console.log(`- BIDDING leads: ${biddingLeads.length}`);
  console.log(`- CALL_VISIT leads: ${callVisitLeads.length}`);
  console.log(`- WRITTEN_QUOTE leads: ${writtenQuoteLeads.length}`);
  console.log(`- TOTAL leads: ${leads.length}`);

  console.log('\n🔍 Quota Validation:');
  console.log(`- biddingLeadsSubmitted (DB): ${homeowner.biddingLeadsSubmitted}`);
  console.log(`- biddingLeadsLimit (DB): ${homeowner.biddingLeadsLimit}`);
  console.log(`- Actual BIDDING leads in DB: ${biddingLeads.length}`);
  console.log(`- Can create more BIDDING? ${(homeowner.biddingLeadsSubmitted || 0) < (homeowner.biddingLeadsLimit || 1)}`);

  if ((homeowner.biddingLeadsSubmitted || 0) !== biddingLeads.length) {
    console.log('\n⚠️  MISMATCH DETECTED!');
    console.log(`   Counter says: ${homeowner.biddingLeadsSubmitted} bidding leads`);
    console.log(`   Actual count: ${biddingLeads.length} bidding leads`);
  }

  console.log('\n✅ Audit complete');
}

checkBiddingQuota()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
