const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLeadCopy() {
  console.log('=== TESTING LEAD DATA COPY FROM FIRST LEAD ===\n');
  
  // Find a user with at least one lead
  const user = await prisma.user.findFirst({
    where: {
      leadsAsHomeowner: {
        some: {}
      }
    },
    include: {
      leadsAsHomeowner: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          phoneNumber: true,
          address: true,
          createdAt: true
        }
      }
    }
  });

  if (!user) {
    console.log('❌ No user with leads found');
    return;
  }

  console.log(`Testing with User: ${user.email}`);
  console.log(`User.name: ${user.name || 'NULL'}`);
  console.log(`User.phone: ${user.phone || 'NULL'}`);
  console.log(`Existing leads: ${user.leadsAsHomeowner.length}\n`);

  // Show first lead data
  const firstLead = user.leadsAsHomeowner[0];
  console.log('First Lead Data:');
  console.log(`  name: ${firstLead.name || 'NULL'}`);
  console.log(`  phoneNumber: ${firstLead.phoneNumber || 'NULL'}`);
  console.log(`  address: ${firstLead.address || 'NULL'}\n`);

  // Test: If we create a new lead now, will it copy from first lead?
  console.log('Scenario: User creates Lead #' + (user.leadsAsHomeowner.length + 1));
  
  if (!user.name && firstLead.name) {
    console.log('✅ SHOULD copy from first lead (User.name is NULL, firstLead.name exists)');
    console.log(`   Expected name: ${firstLead.name}`);
    console.log(`   Expected phone: ${firstLead.phoneNumber}`);
    console.log(`   Expected address: ${firstLead.address}`);
  } else if (user.name) {
    console.log('✅ SHOULD use User table data (User.name exists)');
    console.log(`   Expected name: ${user.name}`);
    console.log(`   Expected phone: ${user.phone}`);
  } else {
    console.log('⚠️ BOTH User.name and firstLead.name are NULL - will remain NULL');
  }

  await prisma.$disconnect();
}

testLeadCopy().catch(console.error);
