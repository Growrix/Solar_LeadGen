import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixQuotas() {
  try {
    console.log('🔧 Fixing homeowner quota values...\n');

    // Get all homeowners with undefined quotas
    const homeowners = await prisma.user.findMany({
      where: {
        role: 'HOMEOWNER',
        OR: [
          { quoteLimit: null },
          { biddingQuoteLimit: null },
        ],
      },
    });

    console.log(`Found ${homeowners.length} homeowners with undefined quotas:\n`);
    
    for (const user of homeowners) {
      console.log(`📧 ${user.email}`);
      console.log(`   Current: quoteLimit=${user.quoteLimit}, biddingQuoteLimit=${user.biddingQuoteLimit}`);
      
      // Update with defaults
      await prisma.user.update({
        where: { id: user.id },
        data: {
          quoteLimit: user.quoteLimit ?? 5,
          biddingQuoteLimit: user.biddingQuoteLimit ?? 1,
        },
      });
      
      console.log(`   ✅ Updated: quoteLimit=5, biddingQuoteLimit=1\n`);
    }

    // Verify the fix
    const fixed = await prisma.user.findMany({
      where: { role: 'HOMEOWNER' },
      select: {
        email: true,
        quoteLimit: true,
        biddingQuoteLimit: true,
      },
    });

    console.log('\n✅ All homeowners after fix:');
    console.table(fixed);

  } catch (error) {
    console.error('❌ Error fixing quotas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixQuotas();
