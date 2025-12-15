// ============================================================================
// HOMEOWNER PROFILE API
// ============================================================================
// GET/PUT /api/homeowner/profile
// Allows authenticated homeowners to view and update their own profile
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ============================================================================
// GET - Fetch current user profile
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Fetch user profile from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        postcode: true,
        image: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Update current user profile
// ============================================================================
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, phone, postcode, image } = body;

    // ========================================================================
    // VALIDATION
    // ========================================================================
    const fieldErrors: Record<string, string> = {};

    // Validate name (required, 1-100 chars)
    if (!name || typeof name !== 'string') {
      fieldErrors.name = 'Name is required';
    } else if (name.trim().length < 1 || name.trim().length > 100) {
      fieldErrors.name = 'Name must be between 1 and 100 characters';
    }

    // Validate phone (optional, basic format check)
    if (phone !== null && phone !== undefined) {
      if (typeof phone !== 'string') {
        fieldErrors.phone = 'Phone must be a string';
      } else if (phone.trim().length > 0) {
        // Basic validation: allow numbers, spaces, +, -, ()
        const phoneRegex = /^[\d\s+\-()]+$/;
        if (!phoneRegex.test(phone) || phone.length > 20) {
          fieldErrors.phone = 'Invalid phone format (max 20 characters, numbers and +/-/() only)';
        }
      }
    }

    // Validate postcode (optional, max 12 chars)
    if (postcode !== null && postcode !== undefined) {
      if (typeof postcode !== 'string') {
        fieldErrors.postcode = 'Postcode must be a string';
      } else if (postcode.trim().length > 12) {
        fieldErrors.postcode = 'Postcode must be 12 characters or less';
      }
    }

    // Validate image action
    let imageUrl: string | null = undefined as any;
    if (image) {
      if (typeof image !== 'object' || !image.action) {
        fieldErrors.image = 'Image must have an action (set or remove)';
      } else if (image.action === 'set') {
        if (!image.url || typeof image.url !== 'string') {
          fieldErrors.image = 'Image URL is required when action is"set"';
        } else {
          imageUrl = image.url;
        }
      } else if (image.action === 'remove') {
        imageUrl = null;
      } else {
        fieldErrors.image = 'Invalid image action (must be"set" or"remove")';
      }
    }

    // Return validation errors if any
    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', fieldErrors },
        { status: 400 }
      );
    }

    // ========================================================================
    // UPDATE DATABASE
    // ========================================================================
    const updateData: any = {
      name: name.trim(),
      phone: phone?.trim() || null,
      postcode: postcode?.trim() || null,
    };

    // Only update image if action was provided
    if (imageUrl !== undefined) {
      updateData.image = imageUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        postcode: true,
        image: true,
        updatedAt: true,
      },
    });

    // ========================================================================
    // ✅ PHASE 21: SYNCHRONIZE DENORMALIZED LEAD FIELDS
    // ========================================================================
    // When user updates profile, sync name and phone to all their leads
    // This ensures admin dashboard always shows current user data
    // Fixes: Admin lead details showing stale/missing user info for leads 2-3
    await prisma.lead.updateMany({
      where: { homeownerId: session.user.id },
      data: {
        name: name.trim(),
        phoneNumber: phone?.trim() || null,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
    
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    // Handle Prisma not found error
    if ((error as any)?.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
