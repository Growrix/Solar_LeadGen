-- CreateEnum
CREATE TYPE "NewsItemStatus" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'RESEARCH_DONE', 'DRAFT_READY', 'PUBLISHED', 'SCHEDULED', 'REJECTED', 'ERROR');

-- CreateEnum
CREATE TYPE "NewsItemSourceType" AS ENUM ('RSS_FEED', 'AI_AGENT', 'MANUAL_ENTRY');

-- AlterTable
ALTER TABLE "blog_categories" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "blog_posts" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "blog_tags" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "news_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" TIMESTAMP(3),
    "articleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "contentHtml" TEXT NOT NULL DEFAULT '',
    "status" "NewsItemStatus" NOT NULL DEFAULT 'DRAFT',
    "category" TEXT NOT NULL DEFAULT '',
    "relevanceScore" INTEGER NOT NULL DEFAULT 0,
    "aiModel" TEXT NOT NULL DEFAULT '',
    "sourceType" "NewsItemSourceType" NOT NULL DEFAULT 'MANUAL_ENTRY',
    "sourceId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "slug" TEXT,
    "tags" TEXT[],
    "deletedAt" TIMESTAMP(3),
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,

    CONSTRAINT "news_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_automation_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "itemId" TEXT,
    "sourceId" TEXT,
    "metadata" JSONB,
    "promptUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "news_sources_enabled_idx" ON "news_sources"("enabled");

-- CreateIndex
CREATE INDEX "news_sources_createdAt_idx" ON "news_sources"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "news_items_slug_key" ON "news_items"("slug");

-- CreateIndex
CREATE INDEX "news_items_status_idx" ON "news_items"("status");

-- CreateIndex
CREATE INDEX "news_items_publishedAt_idx" ON "news_items"("publishedAt");

-- CreateIndex
CREATE INDEX "news_items_scheduledFor_idx" ON "news_items"("scheduledFor");

-- CreateIndex
CREATE INDEX "news_items_deletedAt_idx" ON "news_items"("deletedAt");

-- CreateIndex
CREATE INDEX "news_items_sourceId_idx" ON "news_items"("sourceId");

-- CreateIndex
CREATE INDEX "news_items_createdById_idx" ON "news_items"("createdById");

-- CreateIndex
CREATE INDEX "news_automation_rules_enabled_idx" ON "news_automation_rules"("enabled");

-- CreateIndex
CREATE INDEX "news_audit_logs_action_idx" ON "news_audit_logs"("action");

-- CreateIndex
CREATE INDEX "news_audit_logs_actorId_idx" ON "news_audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "news_audit_logs_itemId_idx" ON "news_audit_logs"("itemId");

-- CreateIndex
CREATE INDEX "news_audit_logs_sourceId_idx" ON "news_audit_logs"("sourceId");

-- CreateIndex
CREATE INDEX "news_audit_logs_createdAt_idx" ON "news_audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "news_items" ADD CONSTRAINT "news_items_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "news_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_items" ADD CONSTRAINT "news_items_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_audit_logs" ADD CONSTRAINT "news_audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_audit_logs" ADD CONSTRAINT "news_audit_logs_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "news_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_audit_logs" ADD CONSTRAINT "news_audit_logs_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "news_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
