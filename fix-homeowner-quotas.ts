import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixQuotas() {
  try {
    console.log('🔧 Checking homeowner quota values...\n');

    // Get all homeowners (these fields have defaults so can't be null)
    // Just verify they exist
    const homeowners = await prisma.user.findMany({
      where: {
        role: 'HOMEOWNER',
      },
      select: {
        id: true,
        email: true,
        leadSubmissionLimit: true,
        biddingLeadsLimit: true,
      },
    });

    console.log(`Found ${homeowners.length} homeowners:\n`);
    
    // Since these fields have @default values in schema, they can't be null
    // Just display current values
    for (const user of homeowners) {
      console.log(`📧 ${user.email}`);
      console.log(`   leadSubmissionLimit=${user.leadSubmissionLimit}, biddingLeadsLimit=${user.biddingLeadsLimit}\n`);
    }

    console.log('\n✅ All homeowner quotas:');
    console.table(homeowners);

  } catch (error) {
    console.error('❌ Error fixing quotas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixQuotas();
