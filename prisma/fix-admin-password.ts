// ============================================================================
// FIX ADMIN PASSWORD AFTER DATABASE RESET
// ============================================================================
// This script updates the admin password to: Admin123!Secure
// Run after database reset when you can't login
//
// USAGE: npx tsx prisma/fix-admin-password.ts
// ============================================================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password after database reset...\n');

    const adminEmail = 'admin@solarmatch.com';
    const adminPassword = 'Admin123!Secure';

    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!admin) {
      console.error('❌ Admin user not found!');
      console.log('💡 Run: npx tsx prisma/seed-admin.ts first\n');
      process.exit(1);
    }

    console.log('✅ Admin user found:', admin.email);
    console.log('📝 Admin ID:', admin.id);
    console.log('👤 Admin Name:', admin.name);
    console.log('🔑 Current password hash:', admin.password?.substring(0, 20) + '...\n');

    // Hash the new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hashed successfully\n');

    // Update the admin password
    console.log('💾 Updating admin password in database...');
    const updated = await prisma.user.update({
      where: { email: adminEmail },
      data: { password: hashedPassword }
    });

    console.log('✅ Admin password updated successfully!\n');
    console.log('🎯 LOGIN CREDENTIALS:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('\n📍 Login URL: http://localhost:3000/admin/login');
    console.log('\n⚠️  IMPORTANT: Clear your browser cookies before logging in!');
    console.log('   DevTools (F12) → Application → Cookies → Delete all\n');

    // Verify the password works
    console.log('🧪 Verifying password...');
    const isValid = await bcrypt.compare(adminPassword, updated.password!);
    
    if (isValid) {
      console.log('✅ Password verification successful!\n');
    } else {
      console.error('❌ Password verification failed!\n');
      process.exit(1);
    }

    console.log('✅ All done! You can now login with the credentials above.\n');

  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminPassword();
