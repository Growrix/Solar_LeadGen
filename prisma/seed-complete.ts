/**
 * Comprehensive Database Seed Script
 * 
 * Creates test data for all user roles:
 * - 1 Admin (already exists from seed-admin.ts)
 * - 2 Installers (1 verified, 1 pending)
 * - 2 Homeowners (1 verified, 1 unverified)
 * - 10 Sample Leads (various states)
 * 
 * Usage: npm run seed:complete
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...\n');

  // ===================================================================
  // STEP 1: Check for Admin User
  // ===================================================================
  console.log('📋 Step 1: Checking for admin user...');
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (adminUser) {
    console.log(`✅ Admin user already exists: ${adminUser.email}`);
  } else {
    console.log('❌ No admin user found! Run `npm run seed:admin` first.');
    throw new Error('Admin user required before seeding test data');
  }

  // ===================================================================
  // STEP 2: Create Installer Test Users
  // ===================================================================
  console.log('\n📋 Step 2: Creating installer test users...');

  // Installer 1: Verified, active
  const installer1 = await prisma.user.upsert({
    where: { email: 'installer1@test.com' },
    update: {},
    create: {
      email: 'installer1@test.com',
      name: 'Solar Pro Installations',
      role: 'INSTALLER',
      isActive: true,
      installerVerified: true,
      companyName: 'Solar Pro Installations',
      businessAddress: '123 Solar Street, Austin, TX 78701',
      phone: '+1-555-0101',
      postcode: '78701',
    },
  });

  console.log(`✅ Created installer 1: ${installer1.email} (VERIFIED)`);

  // Installer 2: Pending verification
  const installer2 = await prisma.user.upsert({
    where: { email: 'installer2@test.com' },
    update: {},
    create: {
      email: 'installer2@test.com',
      name: 'Green Energy Solutions',
      role: 'INSTALLER',
      isActive: true,
      installerVerified: false, // Pending verification
      companyName: 'Green Energy Solutions',
      businessAddress: '456 Eco Drive, San Diego, CA 92101',
      phone: '+1-555-0102',
      postcode: '92101',
    },
  });

  console.log(`✅ Created installer 2: ${installer2.email} (PENDING VERIFICATION)`);

  // ===================================================================
  // STEP 3: Create Homeowner Test Users
  // ===================================================================
  console.log('\n📋 Step 3: Creating homeowner test users...');

  // Homeowner 1: Verified phone
  const homeowner1 = await prisma.user.upsert({
    where: { email: 'homeowner1@test.com' },
    update: {},
    create: {
      email: 'homeowner1@test.com',
      name: 'John Smith',
      role: 'HOMEOWNER',
      isActive: true,
      phone: '+1-555-1001',
      phoneVerified: true,
      postcode: '85001',
    },
  });

  console.log(`✅ Created homeowner 1: ${homeowner1.email} (PHONE VERIFIED)`);

  // Homeowner 2: Unverified phone
  const homeowner2 = await prisma.user.upsert({
    where: { email: 'homeowner2@test.com' },
    update: {},
    create: {
      email: 'homeowner2@test.com',
      name: 'Jane Doe',
      role: 'HOMEOWNER',
      isActive: true,
      phone: '+1-555-1002',
      phoneVerified: false, // Not verified yet
      postcode: '98101',
    },
  });

  console.log(`✅ Created homeowner 2: ${homeowner2.email} (PHONE NOT VERIFIED)`);

  // ===================================================================
  // STEP 4: Create Sample Leads
  // ===================================================================
  console.log('\n📋 Step 4: Creating sample leads...');

  const leadData = [
    // Lead 1: DRAFT - Just submitted by homeowner1
    {
      homeownerId: homeowner1.id,
      projectType: 'RESIDENTIAL',
      propertyType: 'SINGLE_FAMILY',
      postcode: '85001',
      location: 'Phoenix',
      state: 'AZ',
      address: '789 Sunshine Lane, Phoenix, AZ 85001',
      energyBill: 150.00,
      billType: 'MONTHLY',
      roofType: 'ASPHALT_SHINGLE',
      budgetRange: '20000-30000',
      desiredOffset: 80,
      status: 'DRAFT' as const,
      visibility: 'HIDDEN' as const,
      additionalNotes: 'Homeowner interested in quick installation',
    },
    // Lead 2: PENDING_APPROVAL - Awaiting admin approval
    {
      homeownerId: homeowner1.id,
      projectType: 'RESIDENTIAL',
      propertyType: 'SINGLE_FAMILY',
      postcode: '85001',
      location: 'Phoenix',
      state: 'AZ',
      address: '789 Sunshine Lane, Phoenix, AZ 85001',
      energyBill: 200.00,
      billType: 'MONTHLY',
      roofType: 'METAL',
      budgetRange: '25000-35000',
      desiredOffset: 100,
      batteryRequired: true,
      batteryCapacity: '10kWh',
      status: 'PENDING_APPROVAL' as const,
      visibility: 'HIDDEN' as const,
      additionalNotes: 'Premium lead - metal roof, excellent condition',
    },
    // Lead 3: APPROVED - Ready for marketplace
    {
      homeownerId: homeowner2.id,
      projectType: 'RESIDENTIAL',
      propertyType: 'SINGLE_FAMILY',
      postcode: '98101',
      location: 'Seattle',
      state: 'WA',
      address: '321 Green Avenue, Seattle, WA 98101',
      energyBill: 175.00,
      billType: 'MONTHLY',
      roofType: 'TILE',
      budgetRange: '20000-30000',
      desiredOffset: 90,
      status: 'APPROVED' as const,
      visibility: 'PUBLIC' as const,
      leadPrice: 50.00,
      approvedAt: new Date(),
      additionalNotes: 'Approved and visible in marketplace',
    },
    // Lead 4: PURCHASED by installer1
    {
      homeownerId: homeowner2.id,
      installerId: installer1.id,
      projectType: 'RESIDENTIAL',
      propertyType: 'TOWNHOUSE',
      postcode: '98101',
      location: 'Seattle',
      state: 'WA',
      address: '321 Green Avenue, Seattle, WA 98101',
      energyBill: 120.00,
      billType: 'MONTHLY',
      roofType: 'ASPHALT_SHINGLE',
      budgetRange: '15000-25000',
      desiredOffset: 75,
      status: 'PURCHASED' as const,
      visibility: 'PRIVATE' as const,
      purchasedAt: new Date(),
      leadPrice: 35.00,
      purchaseStatus: 'COMPLETED' as const,
      additionalNotes: 'Lead purchased by Solar Pro Installations',
    },
    // Lead 5: Additional sample leads
    ...Array.from({ length: 6 }, (_, i) => ({
      homeownerId: i % 2 === 0 ? homeowner1.id : homeowner2.id,
      projectType: 'RESIDENTIAL',
      propertyType: 'SINGLE_FAMILY' as const,
      postcode: i % 2 === 0 ? '85001' : '98101',
      location: i % 2 === 0 ? 'Phoenix' : 'Seattle',
      state: i % 2 === 0 ? 'AZ' : 'WA',
      address: i % 2 === 0 ? '789 Sunshine Lane, Phoenix, AZ 85001' : '321 Green Avenue, Seattle, WA 98101',
      energyBill: 150 + i * 10,
      billType: 'MONTHLY',
      roofType: ['ASPHALT_SHINGLE', 'METAL', 'TILE'][i % 3] as any,
      budgetRange: '20000-30000',
      desiredOffset: 75 + i * 5,
      status: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED'][i % 3] as any,
      visibility: ['HIDDEN', 'HIDDEN', 'PUBLIC'][i % 3] as any,
      leadPrice: i % 3 === 2 ? 45.00 : undefined,
      additionalNotes: `Sample lead ${i + 5}`,
    })),
  ];

  for (const [index, data] of leadData.entries()) {
    await prisma.lead.create({ data });
    console.log(`✅ Created lead ${index + 1}: ${data.status} - ${data.propertyType}`);
  }

  // ===================================================================
  // STEP 5: Summary
  // ===================================================================
  console.log('\n' + '='.repeat(70));
  console.log('🎉 SEED COMPLETE! Database populated with test data.');
  console.log('='.repeat(70));

  console.log('\n📊 Summary:');
  console.log(`   - Admin Users: 1 (${adminUser.email})`);
  console.log(`   - Installers: 2 (1 verified, 1 pending)`);
  console.log(`   - Homeowners: 2 (1 phone verified, 1 unverified)`);
  console.log(`   - Leads: ${leadData.length}`);
  console.log(`     • DRAFT: ${leadData.filter(l => l.status === 'DRAFT').length}`);
  console.log(`     • PENDING_APPROVAL: ${leadData.filter(l => l.status === 'PENDING_APPROVAL').length}`);
  console.log(`     • APPROVED: ${leadData.filter(l => l.status === 'APPROVED').length}`);
  console.log(`     • PURCHASED: ${leadData.filter(l => l.status === 'PURCHASED').length}`);

  console.log('\n🔑 Test Credentials:');
  console.log('\n   ADMIN:');
  console.log(`   - Email: ${adminUser.email}`);
  console.log(`   - Access: /admin (all dashboards)`);

  console.log('\n   INSTALLER 1 (VERIFIED):');
  console.log(`   - Email: ${installer1.email}`);
  console.log(`   - Business: Solar Pro Installations`);
  console.log(`   - Access: /installer (can purchase leads)`);

  console.log('\n   INSTALLER 2 (PENDING):');
  console.log(`   - Email: ${installer2.email}`);
  console.log(`   - Business: Green Energy Solutions`);
  console.log(`   - Access: /installer (limited - pending verification)`);

  console.log('\n   HOMEOWNER 1 (VERIFIED):');
  console.log(`   - Email: ${homeowner1.email}`);
  console.log(`   - Name: John Smith`);
  console.log(`   - Access: /homeowner (can submit leads)`);

  console.log('\n   HOMEOWNER 2 (UNVERIFIED):');
  console.log(`   - Email: ${homeowner2.email}`);
  console.log(`   - Name: Jane Doe`);
  console.log(`   - Access: /homeowner (phone verification required)`);

  console.log('\n📝 Next Steps:');
  console.log('   1. Test login with each role → verify correct dashboard redirect');
  console.log('   2. Test lead submission → purchase → contact flow');
  console.log('   3. Test admin approval/rejection of leads');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
