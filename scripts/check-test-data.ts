import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Checking Test Data ===\n');

  const homeowner = await prisma.user.findUnique({
    where: { id: 'cmiviuq7b0002i1hco4mjnoeg' },
    select: {email: true, name: true, role: true },
  });

  console.log('HOMEOWNER (cmiviuq7b0002i1hco4mjnoeg):');
  console.log(homeowner);

  const leads = await prisma.lead.findMany({
    where: { homeownerId: 'cmiviuq7b0002i1hco4mjnoeg' },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      status: true,
      quoteType: true,
      installerId: true,
      propertyType: true,
      postcode: true,
      createdAt: true,
    },
  });

  console.log('\nTOP 5 LEADS FOR DASHBOARD (ordered by createdAt DESC):', leads.length);
  leads.forEach((l, i) => {
    console.log(`Lead ${i+1}:`, l);
  });

  const writtenQuotes = await prisma.writtenQuote.findMany({
    where: { homeownerId: 'cmiviuq7b0002i1hco4mjnoeg' },
    select: {
      id: true,
      leadId: true,
      currentPrice: true,
      currentStatus: true,
    },
  });

  console.log('\nWRITTEN QUOTES FOR THIS HOMEOWNER:', writtenQuotes.length);
  writtenQuotes.forEach((wq, i) => {
    console.log(`Quote ${i+1}:`, wq);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
