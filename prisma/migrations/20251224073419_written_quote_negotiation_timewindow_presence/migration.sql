-- AlterEnum
ALTER TYPE "LeadStatus" ADD VALUE 'NEGOTIATION_EXPIRED';

-- AlterTable
ALTER TABLE "written_quotes" ADD COLUMN     "adminExtensionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "adminLastExtendedAt" TIMESTAMP(3),
ADD COLUMN     "adminLastExtendedBy" TEXT,
ADD COLUMN     "homeownerExtensionUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "homeownerModalActiveAt" TIMESTAMP(3),
ADD COLUMN     "installerExtensionUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "installerModalActiveAt" TIMESTAMP(3),
ADD COLUMN     "negotiationDeadlineAt" TIMESTAMP(3),
ADD COLUMN     "negotiationExpiredAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "written_quotes_negotiationDeadlineAt_idx" ON "written_quotes"("negotiationDeadlineAt");
