// ============================================================================
// NEWSLETTER SUBSCRIPTION API ROUTE
// ============================================================================
// This file handles HTTP requests for newsletter subscriptions.
// 
// FILE LOCATION MATTERS:
// - Next.js uses file-based routing for APIs
// - This file: src/app/api/newsletter/subscribe/route.ts
// - Creates endpoint: http://localhost:3000/api/newsletter/subscribe
// - The file MUST be named"route.ts" (Next.js convention)
//
// TEACHING NOTE: API routes are"server-side" code. They run on the server,
// not in the browser. This means they can safely access databases and secrets.
// ============================================================================

import { NextResponse } from 'next/server';
// TEACHING NOTE: NextResponse is Next.js's helper for sending HTTP responses
// It makes it easy to send JSON, set status codes, and handle errors

import { prisma } from '@/lib/prisma';
// TEACHING NOTE: Import our Prisma client to talk to the database
// The '@/' is a shortcut for 'src/' (configured in tsconfig.json)

// ============================================================================
// POST HANDLER - Subscribe to Newsletter
// ============================================================================
// This function runs when someone sends a POST request to this endpoint.
// POST is used for creating new data (in this case, a new subscriber).
//
// FLOW:
// 1. Extract email from request body
// 2. Validate email format
// 3. Check if email already exists
// 4. Create new subscriber in database
// 5. Send success response
// ============================================================================

export async function POST(request: Request) {
  // TEACHING NOTE:"async" means this function can"await" promises
  // Database operations take time, so we use await to wait for them
  
  try {
    // TRY-CATCH BLOCK
    // TEACHING NOTE: Wraps risky code (database calls, network requests)
    // If anything fails, the"catch" block handles the error gracefully
    
    // --------------------------------------------------------------------------
    // STEP 1: EXTRACT EMAIL FROM REQUEST BODY
    // --------------------------------------------------------------------------
    const body = await request.json();
    // TEACHING NOTE: request.json() converts the HTTP body into a JavaScript object
    // If the frontend sends: {"email":"user@example.com" }
    // This becomes: body = { email:"user@example.com" }
    
    const { email } = body;
    // TEACHING NOTE: Destructuring - extracts email from body object
    // Same as: const email = body.email;
    
    // --------------------------------------------------------------------------
    // STEP 2: VALIDATE EMAIL
    // --------------------------------------------------------------------------
    
    // Check if email was provided
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    // TEACHING NOTE: 400 ="Bad Request" (client sent invalid data)
    // The function stops here and sends this response immediately
    
    // Check email format with comprehensive regex
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    // TEACHING NOTE: This pattern checks for:
    // - Alphanumeric characters, dots, hyphens, underscores before @
    // - @ symbol (required)
    // - Alphanumeric characters, dots, hyphens in domain
    // - Dot before TLD
    // - TLD must be 2-6 letters only (com, net, org, etc.)
    // Example valid: user@example.com, user.name@company.co.uk
    // Example invalid: user@, @example.com, user@domain.comm, user@gail.com
    
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Additional validation: reject common typos in popular email domains
    const domain = email.split('@')[1]?.toLowerCase();
    const commonTypos = [
      'gmial.com', 'gmai.com', 'gmail.co', 'gmail.comm', 'gail.com',
      'yahooo.com', 'yaho.com', 'hotmial.com', 'hotmai.com', 'outloo.com'
    ];
    
    if (domain && commonTypos.includes(domain)) {
      return NextResponse.json(
        { error: 'Invalid email address. Please check for typos.' },
        { status: 400 }
      );
    }
    
    // --------------------------------------------------------------------------
    // STEP 3: CHECK IF EMAIL ALREADY EXISTS
    // --------------------------------------------------------------------------
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    // TEACHING NOTE: findUnique() searches for ONE record by a unique field
    //"where: { email }" is shorthand for"where: { email: email }"
    // Returns the subscriber if found, or null if not found
    
    if (existing) {
      // Email already exists in database
      
      if (!existing.isActive) {
        // They unsubscribed before, let's reactivate them
        const updated = await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            isActive: true,
            subscribedAt: new Date(),  // Reset subscription date
            unsubscribedAt: null,       // Clear unsubscribe date
          },
        });
        // TEACHING NOTE: update() changes existing data
        //"data" is what we want to change
        // new Date() creates a timestamp of right now
        
        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been resubscribed.',
          subscriber: updated,
        });
      }
      
      // They're already subscribed
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      );
      // TEACHING NOTE: 409 ="Conflict" (resource already exists)
    }
    
    // --------------------------------------------------------------------------
    // STEP 4: CREATE NEW SUBSCRIBER
    // --------------------------------------------------------------------------
    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email },
    });
    // TEACHING NOTE: create() adds a new record to the database
    // We only need to provide"email" because:
    // - id is auto-generated (@default(cuid()))
    // - subscribedAt is auto-set (@default(now()))
    // - isActive is auto-set to true (@default(true))
    // - unsubscribedAt is optional (null by default)
    
    // The returned"subscriber" object contains all fields including generated ones
    
    // --------------------------------------------------------------------------
    // STEP 5: SEND SUCCESS RESPONSE
    // --------------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing! Check your inbox for the latest solar news.',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
      },
    });
    // TEACHING NOTE: We only send id and email to the frontend
    // No need to send internal fields like isActive, timestamps
    // Status code defaults to 200 (success) when not specified
    
  } catch (error) {
    // CATCH BLOCK - Handles any errors that occurred in the try block
    // TEACHING NOTE: This could be database errors, network issues, etc.
    
    console.error('Newsletter subscription error:', error);
    // TEACHING NOTE: Log the error to the server console (for debugging)
    // In production, you'd also log to an error tracking service (Sentry, etc.)
    
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
    // TEACHING NOTE: 500 ="Internal Server Error" (something broke on our end)
    // Never expose the actual error details to users (security risk!)
  }
}

// ============================================================================
// GET HANDLER - List All Subscribers
// ============================================================================
// This function runs when someone sends a GET request to this endpoint.
// GET is used for reading/retrieving data (not changing anything).
//
// WARNING: In a real app, this should require admin authentication!
// Anyone can access this endpoint and see all subscribers.
// For learning purposes, we're keeping it simple.
// ============================================================================

export async function GET() {
  try {
    // --------------------------------------------------------------------------
    // FETCH ALL SUBSCRIBERS (BOTH ACTIVE AND UNSUBSCRIBED)
    // --------------------------------------------------------------------------
    const subscribers = await prisma.newsletterSubscriber.findMany({
      // TEACHING NOTE: Removed where clause to get ALL subscribers
      // Admin dashboard needs to see both active and unsubscribed
      
      select: {
        id: true,
        email: true,
        subscribedAt: true,
        isActive: true,
        unsubscribedAt: true,
      },
      // TEACHING NOTE: select{} chooses which fields to return
      // We need isActive and unsubscribedAt for the admin dashboard
      // to correctly display subscriber status
      
      orderBy: { subscribedAt: 'desc' },
      // TEACHING NOTE: Sort by newest subscribers first
      // 'desc' = descending (newest to oldest)
      // 'asc' = ascending (oldest to newest)
    });
    
    // --------------------------------------------------------------------------
    // RETURN SUBSCRIBERS LIST
    // --------------------------------------------------------------------------
    return NextResponse.json({
      success: true,
      count: subscribers.length,  // How many subscribers
      subscribers,                 // The actual list
    });
    // TEACHING NOTE: This returns an array of subscriber objects
    // Example: { success: true, count: 3, subscribers: [{...}, {...}, {...}] }
    
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HTTP STATUS CODES REFERENCE
// ============================================================================
// 200 - OK (success)
// 201 - Created (resource created successfully)
// 400 - Bad Request (client sent invalid data)
// 401 - Unauthorized (needs authentication)
// 403 - Forbidden (authenticated but no permission)
// 404 - Not Found (resource doesn't exist)
// 409 - Conflict (resource already exists)
// 500 - Internal Server Error (something broke on server)
// ============================================================================

// ============================================================================
// HOW TO TEST THIS API
// ============================================================================
//
// Option 1: Use your UI (once we update NewsletterSignup.tsx)
//
// Option 2: Use browser
// - Open: http://localhost:3000/api/newsletter/subscribe (for GET)
//
// Option 3: Use curl (command line)
// curl -X POST http://localhost:3000/api/newsletter/subscribe \
//   -H"Content-Type: application/json" \
//   -d '{"email":"test@example.com"}'
//
// Option 4: Use Postman or Thunder Client (VS Code extension)
// - Create new POST request
// - URL: http://localhost:3000/api/newsletter/subscribe
// - Body: {"email":"test@example.com" }
// - Send!
// ============================================================================

// ============================================================================
// NEXT STEPS FOR IMPROVEMENT
// ============================================================================
// 1. Add rate limiting (prevent spam)
// 2. Add CAPTCHA (prevent bots)
// 3. Send confirmation email
// 4. Add authentication for GET endpoint
// 5. Add pagination for GET (limit results)
// 6. Add search/filter for GET
// 7. Add DELETE endpoint for unsubscribe
// 8. Log subscription events for analytics
// ============================================================================
