import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    // Get first homeowner
    const homeowner = await prisma.user.findFirst({
      where: { role: 'HOMEOWNER' },
    });

    if (!homeowner) {
      console.log('❌ No homeowner found');
      return;
    }

    console.log('✅ Homeowner found:', {
      email: homeowner.email,
      name: homeowner.name,
      leadSubmissionLimit: homeowner.leadSubmissionLimit,
      biddingLeadsLimit: homeowner.biddingLeadsLimit,
      leadSubmissionCount: homeowner.leadSubmissionCount,
    });

    // Count leads
    const totalLeads = await prisma.lead.count({
      where: { homeownerId: homeowner.id },
    });

    const biddingLeads = await prisma.lead.count({
      where: { homeownerId: homeowner.id, quoteType: 'BIDDING' },
    });

    const callVisitLeads = await prisma.lead.count({
      where: { homeownerId: homeowner.id, quoteType: 'CALL_VISIT' },
    });

    const writtenLeads = await prisma.lead.count({
      where: { homeownerId: homeowner.id, quoteType: 'WRITTEN_QUOTE' },
    });

    console.log('\n📊 Lead Counts:');
    console.log(`Total: ${totalLeads}`);
    console.log(`BIDDING: ${biddingLeads}`);
    console.log(`CALL_VISIT: ${callVisitLeads}`);
    console.log(`WRITTEN_QUOTE: ${writtenLeads}`);

    // Check if bidding quota exceeded
    const biddingLimit = homeowner.biddingLeadsLimit || 1;
    console.log(`\n🚦 Bidding Quota: ${biddingLeads}/${biddingLimit}`);
    if (biddingLeads >= biddingLimit) {
      console.log('❌ BIDDING QUOTA EXCEEDED!');
    } else {
      console.log('✅ Can create more bidding leads');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
