const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    const password = 'Admin123!Secure';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Generated hash:', hashedPassword);
    
    // Update admin password
    const result = await prisma.user.update({
      where: {
        email: 'rayisselectricalandsolar@gmail.com'
      },
      data: {
        password: hashedPassword
      }
    });
    
    console.log('✅ Admin password updated successfully');
    console.log('Email:', result.email);
    console.log('Role:', result.role);
    
    // Verify the hash works
    const isValid = await bcrypt.compare(password, hashedPassword);
    console.log('✅ Password verification:', isValid ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword();
