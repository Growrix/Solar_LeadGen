import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      status: true,
      quoteType: true,
      installerId: true,
      purchasedAt: true,
      createdAt: true,
    },
  });

  console.log('Recent leads:');
  console.table(leads);

  await prisma.$disconnect();
}

main();
