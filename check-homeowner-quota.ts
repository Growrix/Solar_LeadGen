import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find the homeowner user
  const homeowner = await prisma.user.findFirst({
    where: { role: 'HOMEOWNER' },
    select: {
      id: true,
      email: true,
      name: true,
      leadSubmissionLimit: true,
      biddingLeadsLimit: true,
      leadSubmissionCount: true,
    },
  });

  console.log('Homeowner Details:');
  console.table(homeowner);

  // Count leads by type for this homeowner
  const leadsByType = await prisma.lead.groupBy({
    by: ['quoteType'],
    where: { homeownerId: homeowner?.id },
    _count: { id: true },
  });

  console.log('\nLeads by Type:');
  console.table(leadsByType);

  // Get all leads
  const allLeads = await prisma.lead.findMany({
    where: { homeownerId: homeowner?.id },
    select: {
      id: true,
      quoteType: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('\nAll Homeowner Leads:');
  console.table(allLeads);

  await prisma.$disconnect();
}

main();
