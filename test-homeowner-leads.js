const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testHomeownerLeads() {
  console.log('=== TESTING HOMEOWNER LEAD DATA COPY ===\n');
  
  // Find homeowner31 and homeowner32
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['homeowners31@gmail.com', 'homeowners32@gmail.com']
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

  for (const user of users) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`User: ${user.email}`);
    console.log(`User.name: ${user.name || 'NULL'}`);
    console.log(`User.phone: ${user.phone || 'NULL'}`);
    console.log(`Total leads: ${user.leadsAsHomeowner.length}`);
    
    user.leadsAsHomeowner.forEach((lead, index) => {
      console.log(`\nLead #${index + 1} (${lead.id.substring(0, 12)}...)`);
      console.log(`  name: ${lead.name || 'NULL'}`);
      console.log(`  phoneNumber: ${lead.phoneNumber || 'NULL'}`);
      console.log(`  address: ${lead.address || 'NULL'}`);
    });

    // Predict what SHOULD happen with new lead
    if (user.leadsAsHomeowner.length > 0) {
      const firstLead = user.leadsAsHomeowner[0];
      console.log(`\n📝 If creating Lead #${user.leadsAsHomeowner.length + 1}:`);
      
      if (!user.name && (firstLead.name || firstLead.phoneNumber || firstLead.address)) {
        console.log('✅ SHOULD COPY from First Lead:');
        console.log(`   name: ${firstLead.name || 'NULL'}`);
        console.log(`   phone: ${firstLead.phoneNumber || 'NULL'}`);
        console.log(`   address: ${firstLead.address || 'NULL'}`);
      } else if (user.name) {
        console.log('✅ SHOULD USE User table:');
        console.log(`   name: ${user.name}`);
        console.log(`   phone: ${user.phone || 'NULL'}`);
      } else {
        console.log('⚠️ No data available - will be NULL');
      }
    }
  }

  await prisma.$disconnect();
}

testHomeownerLeads().catch(console.error);
