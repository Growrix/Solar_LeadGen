import { execSync } from 'child_process';

export default async function globalSetup() {
  // Ensure tests that rely on seeded data actually run.
  process.env.TEST_WITH_SEED_DATA = process.env.TEST_WITH_SEED_DATA || '1';

  execSync('npx tsx prisma/seed-written-quote-tests.ts', {
    stdio: 'inherit',
  });
}
