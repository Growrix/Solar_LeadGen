// ============================================================================
// ADMIN USER SEEDING SCRIPT
// ============================================================================
// This script creates the initial admin user for the SolarMatch platform.
// Run this to create your first admin account for development/production.
//
// USAGE:
//   npm run seed:admin
//   OR
//   npx tsx prisma/seed-admin.ts
//
// WHAT IT DOES:
// 1. Checks if admin already exists
// 2. Creates admin user with secure hashed password
// 3. Sets role to ADMIN
// 4. Activates the account
//
// SECURITY:
// - Password is hashed with bcrypt (10 rounds)
// - Email must be unique
// - Can be run multiple times safely
// ============================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('🔐 Starting Admin User Seeding...\n');

    // ========================================================================
    // ADMIN CREDENTIALS
    // ========================================================================
    // IMPORTANT: Change these for production!
    // You can also use environment variables:
    // const email = process.env.ADMIN_EMAIL || 'admin@solarmatch.com';
    // const password = process.env.ADMIN_PASSWORD || 'Admin123!Secure';
    // ========================================================================
    
    const adminEmail = 'admin@solarmatch.com';
    const adminPassword = 'Admin123!Secure';
    const adminName = 'SolarMatch Admin';

    // ========================================================================
    // CHECK IF ADMIN ALREADY EXISTS
    // ========================================================================
    console.log(`📧 Checking if admin exists: ${adminEmail}`);
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Active: ${existingAdmin.isActive}`);
      console.log(`   Created: ${existingAdmin.createdAt}\n`);
      
      // Ask if they want to reset the password
      console.log('💡 To reset the password, delete this user first or use a different email.\n');
      
      return;
    }

    // ========================================================================
    // HASH PASSWORD
    // ========================================================================
    console.log('🔒 Hashing password securely...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hashed successfully\n');

    // ========================================================================
    // CREATE ADMIN USER
    // ========================================================================
    console.log('👤 Creating admin user in database...');
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
        isActive: true,
        emailVerified: new Date(), // Auto-verify admin email
      },
    });

    console.log('✅ Admin user created successfully!\n');

    // ========================================================================
    // DISPLAY CREDENTIALS
    // ========================================================================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 ADMIN ACCOUNT CREATED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Email:    ${admin.email}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Name:     ${admin.name}`);
    console.log(`Role:     ${admin.role}`);
    console.log(`ID:       ${admin.id}`);
    console.log(`Created:  ${admin.createdAt}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    console.log('⚠️  Change the password after first login in production!\n');

    // ========================================================================
    // NEXT STEPS
    // ========================================================================
    console.log('📝 NEXT STEPS:');
    console.log('1. Go to: http://localhost:3000/admin');
    console.log('2. Login with the credentials above');
    console.log('3. Access the admin dashboard');
    console.log('4. Create additional admin users if needed\n');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================================================
// RUN THE SEEDING SCRIPT
// ============================================================================
seedAdmin()
  .then(() => {
    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
