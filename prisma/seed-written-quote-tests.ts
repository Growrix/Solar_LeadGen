import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean up all test data for a deterministic seed
  await prisma.writtenQuoteEvent.deleteMany({});
  await prisma.writtenQuote.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { in: ['installer@test.com', 'homeowner@test.com'] } } });

  const installer = await prisma.user.create({
    data: {
      id: 'cmj9nasmc0000i1wwhokf13wc',
      email: 'installer@test.com',
      password: await bcrypt.hash('password', 10),
      name: 'Test Installer',
      role: 'INSTALLER',
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const homeowner = await prisma.user.create({
    data: {
      id: 'cmiviuq7b0002i1hco4mjnoeg',
      email: 'homeowner@test.com',
      password: await bcrypt.hash('password', 10),
      name: 'John Smith',
      role: 'HOMEOWNER',
      isActive: true,
      emailVerified: new Date(),
    },
  });

  // Create lead WITHOUT installer (for testing installer assignment flow)
  const lead = await prisma.lead.create({
    data: {
      id: 'test-lead-written-quote',
      homeownerId: homeowner.id,
      installerId: installer.id,  // Assign installer so they can submit quote
      status: 'PURCHASED',
      quoteType: 'WRITTEN_QUOTE',  // Written quote lead type
      projectType: 'SOLAR',
      propertyType: 'RESIDENTIAL',
      postcode: '3000',
      location: 'Melbourne VIC',
      state: 'VIC',
      address: '123 Test St',
      energyBill: 200,
      billType: 'QUARTERLY',
      roofType: 'TILE',
      budgetRange: '8000-10000',
      desiredOffset: 80,
      purchasedAt: new Date(Date.now() - 3600000),  // Purchased 1 hour ago
      approvedAt: new Date(Date.now() - 7200000),   // Approved 2 hours ago
      leadPrice: 15,
      createdAt: new Date(Date.now() - 7200000),
      updatedAt: new Date(),
    },
  });

  // DO NOT create written quote here - let the E2E test create it through the UI
  // This ensures tests follow the actual user flow

  console.log('✅ SEED COMPLETE!');
  console.log('Login: installer@test.com / homeowner@test.com (password: password)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
