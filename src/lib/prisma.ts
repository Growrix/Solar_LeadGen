// ============================================================================
// PRISMA CLIENT - SINGLETON PATTERN
// ============================================================================
// This file creates and exports a single instance of PrismaClient.
//
// WHY DO WE NEED THIS FILE?
// - PrismaClient manages database connections (limited resource)
// - Creating multiple instances wastes memory and connections
// - Next.js development hot-reloads code, which would create new instances
// - This pattern ensures we only have ONE client, even with hot-reload
//
// TEACHING NOTE: This is called the"Singleton Pattern" - a common design
// pattern that ensures only one instance of a class exists.
// ============================================================================

// Import the PrismaClient class from the generated code
import { PrismaClient } from '@prisma/client';
// TEACHING NOTE: After running"npx prisma generate", this gets auto-generated
// in node_modules/@prisma/client based on your schema.prisma

// ----------------------------------------------------------------------------
// TYPESCRIPT TYPE DEFINITIONS
// ----------------------------------------------------------------------------
// This tells TypeScript that globalThis might have a prisma property
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
// TEACHING NOTE:"globalThis" is a JavaScript object that persists between
// hot-reloads in development. We store our Prisma instance here.
// Without this, Next.js would create a new PrismaClient on every code change!

// ----------------------------------------------------------------------------
// CREATE OR REUSE PRISMA CLIENT
// ----------------------------------------------------------------------------
export const prisma =
  globalForPrisma.prisma ??  // If prisma exists in global, use it
  new PrismaClient({
    // Create new PrismaClient with configuration
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn']  // In development: only errors and warnings (query logs are too verbose for JWT)
      : ['error'],          // In production: only show errors (less noise)
  });
// TEACHING NOTE: The"??" is the"nullish coalescing operator"
// It means:"If left side is null/undefined, use right side"
// This ensures we reuse the existing client if it exists

// ----------------------------------------------------------------------------
// STORE IN GLOBAL FOR NEXT.JS HOT-RELOAD
// ----------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
// TEACHING NOTE: In development, save the client to globalThis
// This survives hot-reloads, preventing the"too many connections" error
// In production, we don't need this because there's no hot-reload

// ----------------------------------------------------------------------------
// WARM UP DATABASE CONNECTION (Development Only)
// ----------------------------------------------------------------------------
// Connect to database immediately on server startup to avoid slow first query
// This prevents the 18+ second delay on first session check
if (process.env.NODE_ENV === 'development') {
  prisma.$connect()
    .then(() => console.log('✅ [Prisma] Database connection warmed up'))
    .catch((err) => console.error('❌ [Prisma] Failed to warm up connection:', err));
}
// TEACHING NOTE: In production, let Prisma handle connection lazily
// But in development, pre-connect to avoid slow startup delays

// ============================================================================
// HOW TO USE THIS IN YOUR CODE
// ============================================================================
// Import this file wherever you need to talk to the database:
//
// import { prisma } from '@/lib/prisma';
//
// // Create a new record
// const subscriber = await prisma.newsletterSubscriber.create({
//   data: { email: 'user@example.com' }
// });
//
// // Find all records
// const allSubscribers = await prisma.newsletterSubscriber.findMany();
//
// // Find one record by email
// const subscriber = await prisma.newsletterSubscriber.findUnique({
//   where: { email: 'user@example.com' }
// });
//
// // Update a record
// const updated = await prisma.newsletterSubscriber.update({
//   where: { email: 'user@example.com' },
//   data: { isActive: false }
// });
//
// // Delete a record
// await prisma.newsletterSubscriber.delete({
//   where: { id: '123' }
// });
// ============================================================================

// ============================================================================
// COMMON PRISMA OPERATIONS
// ============================================================================
//
// CREATE (Add new data)
// ---------------------
// create()       - Create one record
// createMany()   - Create multiple records at once
//
// READ (Get data)
// ---------------
// findUnique()   - Find one record by unique field (id, email)
// findFirst()    - Find first matching record
// findMany()     - Find multiple records (with filters, sorting, pagination)
// count()        - Count how many records match
//
// UPDATE (Change existing data)
// -----------------------------
// update()       - Update one record
// updateMany()   - Update multiple records at once
// upsert()       - Update if exists, create if doesn't (update + insert)
//
// DELETE (Remove data)
// --------------------
// delete()       - Delete one record
// deleteMany()   - Delete multiple records
//
// ============================================================================
// QUERY MODIFIERS
// ============================================================================
//
// where: {}      - Filter results (like SQL WHERE)
// select: {}     - Choose which fields to return
// include: {}    - Include related data (joins)
// orderBy: {}    - Sort results
// take: 10       - Limit results (like SQL LIMIT)
// skip: 20       - Skip first X results (pagination)
//
// Example:
// const recent = await prisma.newsletterSubscriber.findMany({
//   where: { isActive: true },
//   select: { email: true, subscribedAt: true },
//   orderBy: { subscribedAt: 'desc' },
//   take: 10
// });
// ============================================================================
