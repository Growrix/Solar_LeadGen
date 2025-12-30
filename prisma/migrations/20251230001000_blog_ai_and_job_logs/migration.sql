-- CreateEnum
CREATE TYPE "BlogJobType" AS ENUM ('PUBLISH_SCHEDULED', 'N8N_CREATE_DRAFT', 'N8N_SCHEDULE_POST');

-- CreateEnum
CREATE TYPE "BlogJobStatus" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateTable
CREATE TABLE "blog_ai_request_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_ai_request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_job_logs" (
    "id" TEXT NOT NULL,
    "type" "BlogJobType" NOT NULL,
    "status" "BlogJobStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "meta" JSONB,
    "error" TEXT,

    CONSTRAINT "blog_job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blog_ai_request_logs_createdAt_idx" ON "blog_ai_request_logs"("createdAt");

-- CreateIndex
CREATE INDEX "blog_ai_request_logs_userId_idx" ON "blog_ai_request_logs"("userId");

-- CreateIndex
CREATE INDEX "blog_job_logs_startedAt_idx" ON "blog_job_logs"("startedAt");

-- CreateIndex
CREATE INDEX "blog_job_logs_type_idx" ON "blog_job_logs"("type");

-- CreateIndex
CREATE INDEX "blog_job_logs_status_idx" ON "blog_job_logs"("status");

-- AddForeignKey
ALTER TABLE "blog_ai_request_logs" ADD CONSTRAINT "blog_ai_request_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
