import { prisma } from './src/lib/prisma';

async function main() {
  console.log('\n🔍 Checking WRITTEN_QUOTE leads status...\n');

  const leads = await prisma.lead.findMany({
    where: {
      quoteType: 'WRITTEN_QUOTE'
    },
    select: {
      id: true,
      status: true,
      purchasedAt: true,
      installerId: true,
      homeownerId: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });

  if (leads.length === 0) {
    console.log('❌ No WRITTEN_QUOTE leads found');
    return;
  }

  console.log(`Found ${leads.length} WRITTEN_QUOTE leads:\n`);
  
  leads.forEach((lead, idx) => {
    console.log(`Lead #${idx + 1}:`);
    console.log(`  ID: ${lead.id}`);
    console.log(`  Status: ${lead.status}`);
    console.log(`  purchasedAt: ${lead.purchasedAt}`);
    console.log(`  installerId: ${lead.installerId}`);
    console.log(`  homeownerId: ${lead.homeownerId}`);
    console.log(`  Problem: ${lead.status !== 'PURCHASED' && lead.installerId ? 'YES - has installerId but status not PURCHASED' : 'NO'}`);
    console.log('');
  });

  // Find lead assignments
  const assignments = await prisma.leadAssignment.findMany({
    where: {
      leadId: { in: leads.map(l => l.id) }
    },
    select: {
      leadId: true,
      installerId: true,
      assignedAt: true
    }
  });

  console.log(`\nFound ${assignments.length} assignments for these leads\n`);

  await prisma.$disconnect();
}

main().catch(console.error);
