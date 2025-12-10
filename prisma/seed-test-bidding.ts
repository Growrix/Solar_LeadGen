import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for bidding flow testing...');

  // Clear existing data (ENABLED for re-seeding)
  console.log('🗑️  Clearing existing seed data...');
  await prisma.leadAssignment.deleteMany({ where: { assignedBy: { in: [] } } }); // Delete all if needed
  await prisma.bid.deleteMany({});
  await prisma.leadAssignment.deleteMany({});
  await prisma.lead.deleteMany({});
  // Keep users or delete: await prisma.user.deleteMany({ where: { email: { in: ['admin@solarmatch.com', 'mohammad@installer.com', 'homeowner@test.com'] } } });
  console.log('✅ Existing data cleared');

  // 1. Create Admin User
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@solarmatch.com' },
    update: {},
    create: {
      email: 'admin@solarmatch.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Admin created:', admin.email);

  // 2. Create Installer User (Mohammad)
  console.log('Creating installer user...');
  const installerPassword = await bcrypt.hash('installer123', 10);
  const installer = await prisma.user.upsert({
    where: { email: 'mohammad@installer.com' },
    update: {},
    create: {
      email: 'mohammad@installer.com',
      password: installerPassword,
      name: 'Mohammad',
      role: 'INSTALLER',
      companyName: 'Solar Solutions QLD',
      phone: '0412345678',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Installer created:', installer.email);

  // 3. Create Homeowner User
  console.log('Creating homeowner user...');
  const homeownerPassword = await bcrypt.hash('homeowner123', 10);
  const homeowner = await prisma.user.upsert({
    where: { email: 'homeowner@test.com' },
    update: {},
    create: {
      email: 'homeowner@test.com',
      password: homeownerPassword,
      name: 'John Smith',
      role: 'HOMEOWNER',
      phone: '0487654321',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Homeowner created:', homeowner.email);

  // 4. Create Test Leads (APPROVED status for bidding)
  console.log('Creating test leads...');
  
  const lead1 = await prisma.lead.create({
    data: {
      homeownerId: homeowner.id,
      name: 'John Smith',
      phoneNumber: '0487654321',
      postcode: '4214',
      location: 'Ashmore, QLD 4214',
      state: 'QLD',
      propertyType: 'HOUSE',
      projectType: 'Residential',
      energyBill: 350,
      billType: 'monthly',
      roofType: 'TILE',
      budgetRange: '$8k-15k',
      desiredOffset: 80,
      timeframe: 'ASAP',
      status: 'APPROVED',
      visibility: 'PUBLIC',
      additionalNotes: 'Interested in battery storage, north-facing roof',
      // InstantQuote data
      quoteData: {
        systemData: {
        systemSize: 6.6,
        systemType: 'Grid-Connected Residential',
        panels: { brand: 'Longi', model: 'LR5-72HBD 540W', quantity: 12, wattage: 540 },
        inverter: { brand: 'Fronius', model: 'Symo 6.0-3-M', quantity: 1, capacity: 6.0 },
        battery: null,
      },
      roofData: {
        roofType: 'Tile',
        roofPitch: 22,
        orientation: 'North',
        shadeLevel: 'Minimal',
      },
        calculations: {
          estimatedCost: 12500,
          estimatedSavings: 1850,
          paybackPeriod: 6.8,
          roi: 14.8,
        },
      },
    },
  });
  console.log('✅ Lead 1 created:', lead1.location);

  const lead2 = await prisma.lead.create({
    data: {
      homeownerId: homeowner.id,
      name: 'John Smith',
      phoneNumber: '0487654321',
      postcode: '4220',
      location: 'Burleigh Heads, QLD 4220',
      state: 'QLD',
      propertyType: 'HOUSE',
      projectType: 'Residential',
      energyBill: 500,
      billType: 'monthly',
      roofType: 'COLORBOND',
      budgetRange: '$15k-25k',
      desiredOffset: 90,
      batteryRequired: true,
      batteryCapacity: '13.5 kWh',
      timeframe: '1-3 months',
      status: 'APPROVED',
      visibility: 'PUBLIC',
      additionalNotes: 'Large system with battery, east-west split',
      quoteData: {
        systemData: {
        systemSize: 10.0,
        systemType: 'Hybrid (Grid + Battery)',
        panels: { brand: 'Trina', model: 'Vertex S 425W', quantity: 24, wattage: 425 },
        inverter: { brand: 'Fronius', model: 'Primo GEN24 10.0', quantity: 1, capacity: 10.0 },
        battery: { brand: 'Tesla', model: 'Powerwall 2', capacity: 13.5, quantity: 1 },
      },
      roofData: {
        roofType: 'Colorbond',
        roofPitch: 15,
        orientation: 'East-West Split',
        shadeLevel: 'Moderate (trees)',
      },
        calculations: {
          estimatedCost: 22000,
          estimatedSavings: 3200,
          paybackPeriod: 6.9,
          roi: 14.5,
        },
      },
    },
  });
  console.log('✅ Lead 2 created:', lead2.location);

  const lead3 = await prisma.lead.create({
    data: {
      homeownerId: homeowner.id,
      name: 'John Smith',
      phoneNumber: '0487654321',
      postcode: '4225',
      location: 'Coolangatta, QLD 4225',
      state: 'QLD',
      propertyType: 'TOWNHOUSE',
      projectType: 'Residential',
      energyBill: 250,
      billType: 'monthly',
      roofType: 'TILE',
      budgetRange: '$8k-15k',
      desiredOffset: 75,
      timeframe: '3-6 months',
      status: 'APPROVED',
      visibility: 'PUBLIC',
      additionalNotes: 'Small system, budget-conscious, full sun',
      quoteData: {
        systemData: {
        systemSize: 5.0,
        systemType: 'Grid-Connected Residential',
        panels: { brand: 'JA Solar', model: 'JAM72S30 540W', quantity: 10, wattage: 540 },
        inverter: { brand: 'Solis', model: '5kW RHI-5K-48ES', quantity: 1, capacity: 5.0 },
        battery: null,
      },
      roofData: {
        roofType: 'Tile',
        roofPitch: 25,
        orientation: 'North',
        shadeLevel: 'None',
      },
        calculations: {
          estimatedCost: 9500,
          estimatedSavings: 1400,
          paybackPeriod: 6.8,
          roi: 14.7,
        },
      },
    },
  });
  console.log('✅ Lead 3 created:', lead3.location);

  // 5. Create Lead Assignments (Link leads to installer)
  console.log('Creating lead assignments...');
  
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48); // Expires in 48 hours

  const assignment1 = await prisma.leadAssignment.create({
    data: {
      leadId: lead1.id,
      installerId: installer.id,
      assignedBy: admin.id,
    },
  });
  console.log('✅ Assignment 1 created: Lead', lead1.id, '→ Installer', installer.id);

  const assignment2 = await prisma.leadAssignment.create({
    data: {
      leadId: lead2.id,
      installerId: installer.id,
      assignedBy: admin.id,
    },
  });
  console.log('✅ Assignment 2 created: Lead', lead2.id, '→ Installer', installer.id);

  const assignment3 = await prisma.leadAssignment.create({
    data: {
      leadId: lead3.id,
      installerId: installer.id,
      assignedBy: admin.id,
    },
  });
  console.log('✅ Assignment 3 created: Lead', lead3.id, '→ Installer', installer.id);

  console.log('\n✅ Database seed complete!');
  console.log('\n📊 Summary:');
  console.log('- Users:', 3, '(admin, installer, homeowner)');
  console.log('- Leads:', 3, '(Ashmore, Burleigh Heads, Coolangatta)');
  console.log('- Lead Assignments:', 3, '(all assigned to Mohammad)');
  console.log('\n🔐 Login Credentials:');
  console.log('Admin:', 'admin@solarmatch.com / admin123');
  console.log('Installer:', 'mohammad@installer.com / installer123');
  console.log('Homeowner:', 'homeowner@test.com / homeowner123');
  console.log('\n🚀 Next Steps:');
  console.log('1. Open Prisma Studio: npx prisma studio');
  console.log('2. Verify data in tables: User, Lead, LeadAssignment');
  console.log('3. Start dev server: npm run dev');
  console.log('4. Login as installer and check lead feed');
  console.log('5. Test bid submission on any lead');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
