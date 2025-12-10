// ============================================================================
// INSTALLER REGISTRATION API
// ============================================================================
// POST /api/auth/register/installer
// Creates a new installer account with business details
// ============================================================================

import { NextRequest, NextResponse } from"next/server";
import { prisma } from"@/lib/prisma";
import bcrypt from"bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // ========================================================================
    // VALIDATION - MINIMAL SIGNUP (email + password only)
    // Part A spec: Move business fields to protected onboarding flow
    // ========================================================================
    
    // Check required fields (minimal signup per Part A spec)
    if (!email || !password) {
      return NextResponse.json(
        { error:"Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error:"Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error:"Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check password complexity
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasNumber || !hasLetter) {
      return NextResponse.json(
        { 
          error:"Password must contain at least one letter and one number" 
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // CHECK IF USER ALREADY EXISTS
    // ========================================================================
    
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error:"An account with this email already exists" },
        { status: 409 } // 409 Conflict
      );
    }

    // ========================================================================
    // HASH PASSWORD
    // ========================================================================
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ========================================================================
    // CREATE INSTALLER USER IN DATABASE
    // ========================================================================
    // ⚡ MINIMAL SIGNUP (email + password only) - Part A spec
    // Business fields (companyName, contactName, phone, businessAddress, postcode)
    // will be collected in protected /installer/onboarding flow (Phase 4)
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role:"INSTALLER", // Set role as INSTALLER
        isActive: true,
        // name, companyName, phone, businessAddress, postcode → deferred to onboarding
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // ========================================================================
    // RETURN SUCCESS RESPONSE
    // ========================================================================
    
    return NextResponse.json(
      {
        success: true,
        message:"Installer account created successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error("Installer registration error:", error);
    
    return NextResponse.json(
      { 
        error:"An error occurred during registration. Please try again." 
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// WHAT THIS API ENABLES
// ============================================================================
// 1. Installers can create accounts with minimal signup (email + password only)
// 2. Password complexity validation (8+ chars, letter + number)
// 3. User role automatically set to INSTALLER
// 4. Business profile completion deferred to /installer/onboarding (Phase 4)
// 
// MINIMAL SIGNUP FIELDS (Part A):
// - Email: Login credential and unique identifier
// - Password: Hashed with bcrypt (10 rounds)
//
// DEFERRED FIELDS (collected in /installer/onboarding):
// - Company Name: Business name for display
// - Contact Name: Person to contact  
// - Phone: For quick contact
// - Business Address: Service area determination
// - Postcode: Lead location matching
//
// NEXT STEPS:
// - After successful registration, frontend should:
//   1. Call signIn() from next-auth to log the user in
//   2. Redirect to /installer/onboarding (if !profileComplete)
//   3. After onboarding complete, redirect to /installer/dashboard
// ============================================================================
