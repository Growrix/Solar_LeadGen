-- CreateEnum
CREATE TYPE "NewsSourceKind" AS ENUM ('RSS_FEED');

-- CreateEnum
CREATE TYPE "NewsResearchKind" AS ENUM ('WEB', 'SOCIAL', 'JOURNAL', 'TREND');

-- CreateEnum
CREATE TYPE "NewsSourceEntryStatus" AS ENUM ('NEW', 'PROCESSED', 'IGNORED', 'ERROR');

-- CreateEnum
CREATE TYPE "NewsJobType" AS ENUM ('RSS_SYNC', 'RESEARCH_SYNC', 'AI_DRAFT', 'AI_REGENERATE', 'AUTO_RUN', 'AUTO_SCHEDULE', 'AUTO_PUBLISH', 'DEDUP_CLEANUP');

-- CreateEnum
CREATE TYPE "NewsJobStatus" AS ENUM ('SUCCESS', 'FAILURE');

-- AlterTable
ALTER TABLE "news_sources" ADD COLUMN     "errorCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "etag" TEXT,
ADD COLUMN     "fetchIntervalMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "kind" "NewsSourceKind" NOT NULL DEFAULT 'RSS_FEED',
ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "lastFetchedAt" TIMESTAMP(3),
ADD COLUMN     "lastModified" TEXT;

-- CreateTable
CREATE TABLE "news_source_entries" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "externalId" TEXT,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "NewsSourceEntryStatus" NOT NULL DEFAULT 'NEW',
    "error" TEXT,
    "rawJson" JSONB,
    "itemId" TEXT,

    CONSTRAINT "news_source_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_research_entries" (
    "id" TEXT NOT NULL,
    "kind" "NewsResearchKind" NOT NULL,
    "query" TEXT,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "NewsSourceEntryStatus" NOT NULL DEFAULT 'NEW',
    "error" TEXT,
    "rawJson" JSONB,
    "itemId" TEXT,

    CONSTRAINT "news_research_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_ai_request_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "itemId" TEXT,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_ai_request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_job_logs" (
    "id" TEXT NOT NULL,
    "type" "NewsJobType" NOT NULL,
    "status" "NewsJobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "meta" JSONB,
    "error" TEXT,

    CONSTRAINT "news_job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "news_source_entries_status_idx" ON "news_source_entries"("status");

-- CreateIndex
CREATE INDEX "news_source_entries_publishedAt_idx" ON "news_source_entries"("publishedAt");

-- CreateIndex
CREATE INDEX "news_source_entries_fetchedAt_idx" ON "news_source_entries"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "news_source_entries_sourceId_url_key" ON "news_source_entries"("sourceId", "url");

-- CreateIndex
CREATE INDEX "news_research_entries_kind_idx" ON "news_research_entries"("kind");

-- CreateIndex
CREATE INDEX "news_research_entries_status_idx" ON "news_research_entries"("status");

-- CreateIndex
CREATE INDEX "news_research_entries_publishedAt_idx" ON "news_research_entries"("publishedAt");

-- CreateIndex
CREATE INDEX "news_research_entries_fetchedAt_idx" ON "news_research_entries"("fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "news_research_entries_kind_url_key" ON "news_research_entries"("kind", "url");

-- CreateIndex
CREATE INDEX "news_ai_request_logs_createdAt_idx" ON "news_ai_request_logs"("createdAt");

-- CreateIndex
CREATE INDEX "news_ai_request_logs_actorId_idx" ON "news_ai_request_logs"("actorId");

-- CreateIndex
CREATE INDEX "news_ai_request_logs_itemId_idx" ON "news_ai_request_logs"("itemId");

-- CreateIndex
CREATE INDEX "news_job_logs_startedAt_idx" ON "news_job_logs"("startedAt");

-- CreateIndex
CREATE INDEX "news_job_logs_type_idx" ON "news_job_logs"("type");

-- CreateIndex
CREATE INDEX "news_job_logs_status_idx" ON "news_job_logs"("status");

-- AddForeignKey
ALTER TABLE "news_source_entries" ADD CONSTRAINT "news_source_entries_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "news_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_source_entries" ADD CONSTRAINT "news_source_entries_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "news_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_research_entries" ADD CONSTRAINT "news_research_entries_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "news_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_ai_request_logs" ADD CONSTRAINT "news_ai_request_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_ai_request_logs" ADD CONSTRAINT "news_ai_request_logs_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "news_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
