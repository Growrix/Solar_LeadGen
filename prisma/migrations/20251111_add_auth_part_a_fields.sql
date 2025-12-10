-- Migration: Add Auth Part A+B fields
-- This adds the new authentication fields to support email verification, 
-- password reset, and installer onboarding

-- Add new columns to users table
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "profileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- Create EmailVerificationToken table
CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- Create PasswordResetToken table
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- Create InstallerProfile table
CREATE TABLE IF NOT EXISTS "installer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "businessAddress" TEXT,
    "postcode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installer_profiles_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "email_verification_tokens_token_key" ON "email_verification_tokens"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "email_verification_tokens_userId_key" ON "email_verification_tokens"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

CREATE UNIQUE INDEX IF NOT EXISTS "installer_profiles_userId_key" ON "installer_profiles"("userId");

-- Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'email_verification_tokens_userId_fkey'
    ) THEN
        ALTER TABLE "email_verification_tokens" 
        ADD CONSTRAINT "email_verification_tokens_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'password_reset_tokens_userId_fkey'
    ) THEN
        ALTER TABLE "password_reset_tokens" 
        ADD CONSTRAINT "password_reset_tokens_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'installer_profiles_userId_fkey'
    ) THEN
        ALTER TABLE "installer_profiles" 
        ADD CONSTRAINT "installer_profiles_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
