import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  const installer = await prisma.user.upsert({
    where: { email: 'installer@test.com' },
    update: {},
    create: {
      email: 'installer@test.com',
      password: await bcrypt.hash('password', 10),
      name: 'Test Installer',
      role: 'INSTALLER',
      isActive: true,
      emailVerified: new Date(),
    },
  });

  const homeowner = await prisma.user.upsert({
    where: { email: 'homeowner@test.com' },
    update: {},
    create: {
      email: 'homeowner@test.com',
      password: await bcrypt.hash('password', 10),
      name: 'Test Homeowner',
      role: 'HOMEOWNER',
      isActive: true,
      emailVerified: new Date(),
    },
  });

  let lead = await prisma.lead.findFirst({
    where: { homeownerId: homeowner.id },
  });

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        homeownerId: homeowner.id,
        installerId: installer.id,
        status: 'PURCHASED',
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
      },
    });
  }

  await prisma.writtenQuote.create({
    data: {
      leadId: lead.id,
      installerId: installer.id,
      homeownerId: homeowner.id,
      currentPrice: 8750,
      currentStatus: 'HOMEOWNER_TURN',
      lastActionBy: 'installer',
      lastActionAt: new Date(Date.now() - 600000),
      events: {
        create: [
          {
            actorId: installer.id,
            actorRole: 'INSTALLER',
            action: 'start',
            priceOffered: 9000,
            notes: 'Initial quote',
            timestamp: new Date(Date.now() - 3600000),
          },
          {
            actorId: homeowner.id,
            actorRole: 'HOMEOWNER',
            action: 'counter',
            priceOffered: 8500,
            notes: 'Better price',
            timestamp: new Date(Date.now() - 1800000),
          },
          {
            actorId: installer.id,
            actorRole: 'INSTALLER',
            action: 'offer',
            priceOffered: 8750,
            notes: 'Final offer',
            timestamp: new Date(Date.now() - 600000),
          },
        ],
      },
    },
  });

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
