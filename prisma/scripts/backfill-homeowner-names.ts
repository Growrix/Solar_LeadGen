/**
 * Backfill Script: Homeowner Names from Leads
 * Phase 21.2 - Run this script to populate missing User.name values
 * 
 * Usage: npx tsx prisma/scripts/backfill-homeowner-names.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting homeowner name backfill...\n');

  // STEP 1: Count users with NULL names
  console.log('📊 STEP 1: Checking current state...');
  const nullNameCount = await prisma.user.count({
    where: {
      role: 'HOMEOWNER',
      name: null,
    },
  });

  const totalHomeowners = await prisma.user.count({
    where: { role: 'HOMEOWNER' },
  });

  console.log(`   - Total homeowners: ${totalHomeowners}`);
  console.log(`   - Homeowners with NULL names: ${nullNameCount}`);
  console.log(`   - Percentage: ${((nullNameCount / totalHomeowners) * 100).toFixed(2)}%\n`);

  if (nullNameCount === 0) {
    console.log('✅ No NULL names found! All homeowners already have names.');
    return;
  }

  // STEP 2: Preview which users will be updated
  console.log('🔍 STEP 2: Preview of users to be updated...');
  const usersToUpdate = await prisma.$queryRaw<Array<{
    user_id: string;
    user_email: string;
    current_name: string | null;
    lead_name: string;
    lead_created: Date;
  }>>`
    SELECT 
      u.id as user_id,
      u.email as user_email,
      u.name as current_name,
      l.name as lead_name,
      l."createdAt" as lead_created
    FROM users u
    INNER JOIN LATERAL (
      SELECT name, "createdAt"
      FROM leads 
      WHERE "homeownerId" = u.id 
        AND name IS NOT NULL
      ORDER BY "createdAt" ASC
      LIMIT 1
    ) l ON true
    WHERE u.role = 'HOMEOWNER' 
      AND u.name IS NULL
    LIMIT 10
  `;

  console.log(`   Found ${usersToUpdate.length} users (showing first 10):`);
  usersToUpdate.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.user_email} -> "${user.lead_name}"`);
  });
  console.log();

  // STEP 3: Perform the backfill
  console.log('💾 STEP 3: Performing backfill update...');
  const updateResult = await prisma.$executeRaw`
    UPDATE users u
    SET name = (
      SELECT l.name 
      FROM leads l 
      WHERE l."homeownerId" = u.id 
        AND l.name IS NOT NULL 
      ORDER BY l."createdAt" ASC 
      LIMIT 1
    )
    WHERE u.role = 'HOMEOWNER' 
      AND u.name IS NULL
      AND EXISTS (
        SELECT 1 FROM leads l 
        WHERE l."homeownerId" = u.id 
          AND l.name IS NOT NULL
      )
  `;

  console.log(`   ✅ Updated ${updateResult} user records\n`);

  // STEP 4: Verify the update
  console.log('✔️  STEP 4: Verifying update...');
  const remainingNullNames = await prisma.user.count({
    where: {
      role: 'HOMEOWNER',
      name: null,
    },
  });

  console.log(`   - Remaining NULL names: ${remainingNullNames}`);
  console.log(`   - Successfully backfilled: ${nullNameCount - remainingNullNames}`);
  
  if (remainingNullNames > 0) {
    console.log(`   ⚠️  Note: ${remainingNullNames} users still have NULL names (likely no leads yet)\n`);
  } else {
    console.log(`   ✅ All homeowners with leads now have names!\n`);
  }

  // STEP 5: Show recent updates
  console.log('📋 STEP 5: Recent updates (last 10)...');
  const recentUpdates = await prisma.user.findMany({
    where: {
      role: 'HOMEOWNER',
      name: { not: null },
      updatedAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  recentUpdates.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.email} -> "${user.name}"`);
  });

  console.log('\n✅ Backfill complete!');
}

main()
  .catch((error) => {
    console.error('❌ Error during backfill:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
