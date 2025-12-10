-- CreateEnum
CREATE TYPE "LeadQuoteType" AS ENUM ('CALL_VISIT', 'WRITTEN_QUOTE');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "quoteType" "LeadQuoteType" NOT NULL DEFAULT 'CALL_VISIT';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "leadSubmissionLimit" INTEGER NOT NULL DEFAULT 5;

-- CreateIndex
CREATE INDEX "leads_quoteType_idx" ON "leads"("quoteType");
