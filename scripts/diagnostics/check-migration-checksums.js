const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

function sha256Hex(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const migrations = [
      '20251215103333_written_quote',
      '20251222061057_add_written_quotes_with_negotiation',
    ];

    const local = migrations.map((name) => {
      const filePath = path.join(__dirname, '..', '..', 'prisma', 'migrations', name, 'migration.sql');
      const sql = fs.readFileSync(filePath, 'utf8');
      return { migration_name: name, filePath, checksum: sha256Hex(sql) };
    });

    const db = await prisma.$queryRawUnsafe(
      "SELECT migration_name, checksum, finished_at, rolled_back_at, applied_steps_count FROM _prisma_migrations WHERE migration_name IN ('20251215103333_written_quote','20251222061057_add_written_quotes_with_negotiation') ORDER BY migration_name"
    );

    console.log(JSON.stringify({ local, db }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
