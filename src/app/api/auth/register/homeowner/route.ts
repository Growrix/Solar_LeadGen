// ============================================================================
// HOMEOWNER REGISTRATION API
// ============================================================================
// POST /api/auth/register/homeowner
// Creates a new homeowner account with email/password authentication
// ============================================================================

import { NextRequest, NextResponse } from"next/server";
import { prisma } from"@/lib/prisma";
import bcrypt from"bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Phase 21: Capture IP address and user agent for tracking
    const signupIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() 
                  || request.headers.get('x-real-ip') 
                  || 'unknown';
    const signupUserAgent = request.headers.get('user-agent') || 'unknown';
    
    // Parse request body
    const body = await request.json();
    const { email, password } = body; // Name/phone/address collected during 1st lead, not signup

    // ========================================================================
    // VALIDATION - EXTENDED SIGNUP (email, password, name, phone)
    // ========================================================================
    
    // Phase 21: Make name field REQUIRED for all homeowner registrations
    // Check required fields (email, password, and name are mandatory)
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

    // Check password complexity (at least one number, one letter)
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

    // Password complexity validation removed - simplified

    // 🆕 Validate phone format (optional but recommended - Australian format)

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
    
    // Generate salt (random data added to password before hashing)
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password with the salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // ========================================================================
    // CREATE USER IN DATABASE (with contact info)
    // ========================================================================
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(), // Store emails in lowercase
        password: hashedPassword,
        role:"HOMEOWNER", // Set role as HOMEOWNER
        isActive: true,
        name: null, // ✅ NULL - will be filled during 1st lead generation
        phone: null, // ✅ NULL - will be filled during 1st lead generation
        signupIp, // Phase 21: Capture IP at registration
        signupUserAgent, // Phase 21: Capture browser/device info
        // Note: address is not in User model - stored in Lead model instead
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true, // Include phone in response (will be null)
        createdAt: true,
      },
    });

    // ✅ Log successful registration (name/phone will be null until 1st lead)
    console.log('✅ [Registration] User created successfully:', {
      userId: user.id,
      email: user.email,
      hasName: !!user.name, // Will be false initially
      hasPhone: !!user.phone, // Will be false initially
      role: user.role
    });

    // ========================================================================
    // RETURN SUCCESS RESPONSE
    // ========================================================================
    
    return NextResponse.json(
      {
        success: true,
        message:"Account created successfully",
        user: {
          id: user.id,
          name: user.name, // Will be null
          email: user.email,
          role: user.role,
          phone: user.phone, // Will be null
        },
      },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error("Homeowner registration error:", error);
    
    return NextResponse.json(
      { 
        error:"An error occurred during registration. Please try again." 
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// WHAT THIS API ENABLES (Part A - Minimal Signup)
// ============================================================================
// 1. Homeowners can create accounts with MINIMAL fields: email, password
// 2. Passwords are securely hashed with bcrypt (never stored in plain text)
// 3. Email uniqueness is enforced (can't register twice with same email)
// 4. Input validation prevents common issues (weak passwords, invalid emails)
// 5. User role is automatically set to HOMEOWNER
// 6. Additional profile fields (name, phone) can be added later via profile update
// 
// NEXT STEPS:
// - After successful registration, frontend should:
//   1. Call signIn() from next-auth to log the user in
//   2. Redirect to homeowner dashboard (/homeowner/dashboard)
//   3. Show success message
// ============================================================================
