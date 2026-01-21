-- Phase 14: Persist OG image health check result fields

ALTER TABLE "news_items"
ADD COLUMN "ogImageLastCheckedAt" TIMESTAMP(3),
ADD COLUMN "ogImageLastCheckStatus" TEXT,
ADD COLUMN "ogImageLastCheckError" TEXT;
