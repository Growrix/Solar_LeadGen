const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

function sha256Hex(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function readMigrationChecksum(migrationName) {
  const filePath = path.join(__dirname, '..', '..', 'prisma', 'migrations', migrationName, 'migration.sql');
  const sql = fs.readFileSync(filePath, 'utf8');
  return sha256Hex(sql);
}

async function main() {
  const prisma = new PrismaClient();
  const m1 = '20251215103333_written_quote';
  const m2 = '20251222061057_add_written_quotes_with_negotiation';

  const checksum1 = readMigrationChecksum(m1);
  const checksum2 = readMigrationChecksum(m2);

  try {
    const before = await prisma.$queryRawUnsafe(
      "SELECT id, migration_name, checksum, finished_at, rolled_back_at, applied_steps_count FROM _prisma_migrations WHERE migration_name IN ('20251215103333_written_quote','20251222061057_add_written_quotes_with_negotiation') ORDER BY migration_name, finished_at NULLS FIRST"
    );

    // Remove any rolled-back rows for m2 (keep the applied row)
    await prisma.$executeRawUnsafe(
      "DELETE FROM _prisma_migrations WHERE migration_name = '20251222061057_add_written_quotes_with_negotiation' AND rolled_back_at IS NOT NULL"
    );

    // Update checksums to match local files
    await prisma.$executeRawUnsafe(
      "UPDATE _prisma_migrations SET checksum = $1 WHERE migration_name = '20251215103333_written_quote'",
      checksum1
    );

    await prisma.$executeRawUnsafe(
      "UPDATE _prisma_migrations SET checksum = $1 WHERE migration_name = '20251222061057_add_written_quotes_with_negotiation'",
      checksum2
    );

    const after = await prisma.$queryRawUnsafe(
      "SELECT id, migration_name, checksum, finished_at, rolled_back_at, applied_steps_count FROM _prisma_migrations WHERE migration_name IN ('20251215103333_written_quote','20251222061057_add_written_quotes_with_negotiation') ORDER BY migration_name, finished_at NULLS FIRST"
    );

    console.log(JSON.stringify({ checksum1, checksum2, before, after }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
