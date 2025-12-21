import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixQuotas() {
  try {
    console.log('🔧 Setting proper quota values for homeowner...\n');

    // Update homeowner with correct field names from schema
    const updated = await prisma.user.update({
      where: { email: 'homeowners5@gmail.com' },
      data: {
        leadSubmissionLimit: 5,      // Default: 5 leads
        biddingLeadsLimit: 1,         // Default: 1 bidding lead
        leadSubmissionCount: 0        // Reset count
      },
    });

    console.log('✅ Quotas updated:');
    console.log({
      email: updated.email,
      leadSubmissionLimit: updated.leadSubmissionLimit,
      biddingLeadsLimit: updated.biddingLeadsLimit,
      leadSubmissionCount: updated.leadSubmissionCount
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixQuotas();
