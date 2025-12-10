// Quick database check script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLeads() {
  try {
    // Get the most recent 5 leads with their homeowner data
    const leads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        address: true,
        createdAt: true,
        homeownerId: true,
        homeowner: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    console.log('\n=== RECENT LEADS DATA ===\n');
    leads.forEach((lead, index) => {
      console.log(`Lead #${index + 1} (ID: ${lead.id.substring(0, 12)}...)`);
      console.log(`  Created: ${lead.createdAt.toLocaleString()}`);
      console.log(`  lead.name: ${lead.name || 'NULL'}`);
      console.log(`  lead.phoneNumber: ${lead.phoneNumber || 'NULL'}`);
      console.log(`  lead.address: ${lead.address || 'NULL'}`);
      console.log(`  homeowner.name: ${lead.homeowner?.name || 'NULL'}`);
      console.log(`  homeowner.phone: ${lead.homeowner?.phone || 'NULL'}`);
      console.log(`  homeowner.email: ${lead.homeowner?.email || 'NULL'}`);
      console.log('');
    });

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkLeads();
