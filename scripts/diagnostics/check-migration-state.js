const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const table = await prisma.$queryRawUnsafe(
      "SELECT to_regclass('public.written_quotes')::text AS tbl"
    );

    const columns = await prisma.$queryRawUnsafe(
      "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='written_quotes' ORDER BY ordinal_position"
    );

    const indexes = await prisma.$queryRawUnsafe(
      "SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename='written_quotes' ORDER BY indexname"
    );

    const constraints = await prisma.$queryRawUnsafe(
      "SELECT conname, contype, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = 'public.written_quotes'::regclass ORDER BY conname"
    );

    const migration = await prisma.$queryRawUnsafe(
      "SELECT migration_name, finished_at, rolled_back_at, applied_steps_count, logs FROM _prisma_migrations WHERE migration_name = '20251222061057_add_written_quotes_with_negotiation'"
    );

    console.log(JSON.stringify({ table, columns, indexes, constraints, migration }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
