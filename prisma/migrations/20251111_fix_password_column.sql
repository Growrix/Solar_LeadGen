-- Fix Auth Part A schema inconsistencies
-- Add password column and fix clerkId

-- Add password column (nullable initially for existing users)
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "password" TEXT;

-- Make clerkId nullable (moving away from Clerk)
ALTER TABLE "users" 
ALTER COLUMN "clerkId" DROP NOT NULL;

-- Drop the unique constraint on clerkId if it exists
DROP INDEX IF EXISTS "users_clerkId_key";

-- Drop the index on clerkId if it exists
DROP INDEX IF EXISTS "users_clerkId_idx";
