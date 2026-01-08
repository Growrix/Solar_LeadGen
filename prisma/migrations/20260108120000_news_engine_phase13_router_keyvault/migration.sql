-- Phase 13 (2026-01-08): AI Router + Key Vault + Provenance/Image Controls
-- Safe additive changes only.

-- Create enums
DO $$ BEGIN
  CREATE TYPE "NewsAiTaskType" AS ENUM (
    'research_deep',
    'research_fast',
    'draft_longform',
    'rewrite',
    'seo',
    'dedup_semantic',
    'image_prompt',
    'image_generate'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "NewsApiKeyPool" AS ENUM (
    'RESEARCH',
    'DRAFTING',
    'IMAGES'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- New tables
CREATE TABLE IF NOT EXISTS "news_model_profiles" (
  "id" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "modelId" TEXT NOT NULL,
  "useCaseTags" TEXT[] NOT NULL,
  "costTier" TEXT NOT NULL DEFAULT '',
  "jsonModeRequired" BOOLEAN NOT NULL DEFAULT false,
  "maxTokens" INTEGER,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "news_model_profiles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "news_model_profiles_enabled_idx" ON "news_model_profiles"("enabled");
CREATE INDEX IF NOT EXISTS "news_model_profiles_createdAt_idx" ON "news_model_profiles"("createdAt");

CREATE TABLE IF NOT EXISTS "news_model_router_defaults" (
  "taskType" "NewsAiTaskType" NOT NULL,
  "modelProfileId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "news_model_router_defaults_pkey" PRIMARY KEY ("taskType")
);

DO $$ BEGIN
  ALTER TABLE "news_model_router_defaults"
    ADD CONSTRAINT "news_model_router_defaults_modelProfileId_fkey"
    FOREIGN KEY ("modelProfileId") REFERENCES "news_model_profiles"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "news_api_keys" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "pools" "NewsApiKeyPool"[] NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "encryptedKey" TEXT NOT NULL,

  "lastUsedAt" TIMESTAMP(3),
  "lastSuccessAt" TIMESTAMP(3),
  "lastErrorAt" TIMESTAMP(3),
  "lastError" TEXT,

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "news_api_keys_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "news_api_keys_enabled_idx" ON "news_api_keys"("enabled");
CREATE INDEX IF NOT EXISTS "news_api_keys_provider_idx" ON "news_api_keys"("provider");
CREATE INDEX IF NOT EXISTS "news_api_keys_createdAt_idx" ON "news_api_keys"("createdAt");

-- Extend existing tables
ALTER TABLE "news_items"
  ADD COLUMN IF NOT EXISTS "ogImageApprovalRequired" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "ogImageApprovedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "ogImageApprovedById" TEXT;

DO $$ BEGIN
  ALTER TABLE "news_items"
    ADD CONSTRAINT "news_items_ogImageApprovedById_fkey"
    FOREIGN KEY ("ogImageApprovedById") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "news_ai_request_logs"
  ADD COLUMN IF NOT EXISTS "taskType" "NewsAiTaskType",
  ADD COLUMN IF NOT EXISTS "modelProfileId" TEXT,
  ADD COLUMN IF NOT EXISTS "apiKeyId" TEXT,
  ADD COLUMN IF NOT EXISTS "durationMs" INTEGER;

DO $$ BEGIN
  ALTER TABLE "news_ai_request_logs"
    ADD CONSTRAINT "news_ai_request_logs_modelProfileId_fkey"
    FOREIGN KEY ("modelProfileId") REFERENCES "news_model_profiles"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "news_ai_request_logs"
    ADD CONSTRAINT "news_ai_request_logs_apiKeyId_fkey"
    FOREIGN KEY ("apiKeyId") REFERENCES "news_api_keys"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "news_ai_request_logs_taskType_idx" ON "news_ai_request_logs"("taskType");
CREATE INDEX IF NOT EXISTS "news_ai_request_logs_modelProfileId_idx" ON "news_ai_request_logs"("modelProfileId");
CREATE INDEX IF NOT EXISTS "news_ai_request_logs_apiKeyId_idx" ON "news_ai_request_logs"("apiKeyId");
