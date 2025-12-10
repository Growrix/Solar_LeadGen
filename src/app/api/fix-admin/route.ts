import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Set the password
    const password = 'Admin123!Secure';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update admin user with password
    const updatedAdmin = await prisma.user.update({
      where: { email: 'admin@solarmatch.com' },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      }
    });

    // Verify it worked
    const isValid = await bcrypt.compare(password, updatedAdmin.password!);

    return NextResponse.json({
      success: true,
      passwordSet: true,
      passwordTest: isValid,
      message: isValid ? 'Password set successfully! Try logging in now.' : 'Password set but verification failed'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
