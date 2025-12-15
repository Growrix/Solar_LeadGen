/**
 * Backfill Script: Signup IPs from AuditLog
 * Phase 21.9 - Backfill existing users' IP addresses from audit logs
 * 
 * Usage: npx tsx prisma/scripts/backfill-signup-ips.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting signup IP backfill from audit logs...\n');

  // STEP 1: Count users without signupIp
  console.log('📊 STEP 1: Checking current state...');
  const nullIpCount = await prisma.user.count({
    where: {
      role: 'HOMEOWNER',
      signupIp: null,
    },
  });

  const totalHomeowners = await prisma.user.count({
    where: { role: 'HOMEOWNER' },
  });

  console.log(`   - Total homeowners: ${totalHomeowners}`);
  console.log(`   - Homeowners without IP: ${nullIpCount}`);
  console.log(`   - Percentage: ${((nullIpCount / totalHomeowners) * 100).toFixed(2)}%\n`);

  if (nullIpCount === 0) {
    console.log('✅ All homeowners already have IP addresses tracked!');
    return;
  }

  // STEP 2: Preview backfill candidates
  console.log('🔍 STEP 2: Preview of IPs to be backfilled...');
  const previewData = await prisma.$queryRaw<Array<{
    user_id: string;
    user_email: string;
    earliest_ip: string;
    earliest_action: string;
    action_date: Date;
  }>>`
    SELECT 
      u.id as user_id,
      u.email as user_email,
      a."ipAddress" as earliest_ip,
      a.action as earliest_action,
      a."createdAt" as action_date
    FROM users u
    INNER JOIN LATERAL (
      SELECT "ipAddress", action, "createdAt"
      FROM "audit_logs"
      WHERE "userId" = u.id 
        AND "ipAddress" IS NOT NULL
      ORDER BY "createdAt" ASC
      LIMIT 1
    ) a ON true
    WHERE u.role = 'HOMEOWNER' 
      AND u."signupIp" IS NULL
    LIMIT 10
  `;

  console.log(`   Found ${previewData.length} users with audit log IPs (showing first 10):`);
  previewData.forEach((record, index) => {
    console.log(`   ${index + 1}. ${record.user_email} -> ${record.earliest_ip} (${record.earliest_action})`);
  });
  console.log();

  // STEP 3: Perform the backfill
  console.log('💾 STEP 3: Performing IP backfill from audit logs...');
  const updateResult = await prisma.$executeRaw`
    UPDATE users u
    SET "signupIp" = (
      SELECT a."ipAddress"
      FROM "audit_logs" a
      WHERE a."userId" = u.id
        AND a."ipAddress" IS NOT NULL
      ORDER BY a."createdAt" ASC
      LIMIT 1
    )
    WHERE u.role = 'HOMEOWNER' 
      AND u."signupIp" IS NULL
      AND EXISTS (
        SELECT 1 FROM "audit_logs" a 
        WHERE a."userId" = u.id 
          AND a."ipAddress" IS NOT NULL
      )
  `;

  console.log(`   ✅ Updated ${updateResult} user records\n`);

  // STEP 4: Verify the update
  console.log('✔️  STEP 4: Verifying backfill results...');
  const remainingNullIps = await prisma.user.count({
    where: {
      role: 'HOMEOWNER',
      signupIp: null,
    },
  });

  const homeownersWithIp = await prisma.user.count({
    where: {
      role: 'HOMEOWNER',
      signupIp: { not: null },
    },
  });

  console.log(`   - Homeowners with IP now: ${homeownersWithIp}`);
  console.log(`   - Remaining without IP: ${remainingNullIps}`);
  console.log(`   - Successfully backfilled: ${nullIpCount - remainingNullIps}`);
  console.log(`   - Coverage: ${((homeownersWithIp / totalHomeowners) * 100).toFixed(2)}%\n`);

  if (remainingNullIps > 0) {
    console.log(`   ℹ️  Note: ${remainingNullIps} users have no audit log entries (new accounts)\n`);
  } else {
    console.log(`   ✅ All homeowners now have IP tracking!\n`);
  }

  // STEP 5: Show recently updated users
  console.log('📋 STEP 5: Recently backfilled IPs (last 10)...');
  const recentUpdates = await prisma.user.findMany({
    where: {
      role: 'HOMEOWNER',
      signupIp: { not: null },
      updatedAt: {
        gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      },
    },
    select: {
      email: true,
      signupIp: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  if (recentUpdates.length > 0) {
    recentUpdates.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} -> ${user.signupIp}`);
    });
  } else {
    console.log('   No recent updates in the last 5 minutes.');
  }

  console.log('\n✅ IP backfill complete!');
  console.log('\n📊 Final Statistics:');
  console.log(`   - Total homeowners: ${totalHomeowners}`);
  console.log(`   - With IP tracking: ${homeownersWithIp} (${((homeownersWithIp / totalHomeowners) * 100).toFixed(2)}%)`);
  console.log(`   - Without IP: ${remainingNullIps} (${((remainingNullIps / totalHomeowners) * 100).toFixed(2)}%)`);
}

main()
  .catch((error) => {
    console.error('❌ Error during IP backfill:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
