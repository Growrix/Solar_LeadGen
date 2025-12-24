-- Reconstructed migration (non-destructive)
-- This migration exists in the database migration history but was missing locally.
-- It reflects the current baseline schema for written_quotes.

-- CreateTable
CREATE TABLE "written_quotes" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "installerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "systemData" JSONB,
    "productsData" JSONB,
    "lineItems" JSONB,
    "assumptions" JSONB,
    "roofData" JSONB,
    "calculations" JSONB,
    "importMeta" JSONB,
    "installerContact" JSONB,
    "rejectedAt" TIMESTAMP(3),
    "agreedAmount" DOUBLE PRECISION,
    "agreedAt" TIMESTAMP(3),
    "agreedBy" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "batteryBrand" TEXT,
    "batteryCapacity" TEXT,
    "capacityOffer" DOUBLE PRECISION,
    "expectedInstallDate" TIMESTAMP(3),
    "finalTotal" DOUBLE PRECISION NOT NULL,
    "gstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gstPercent" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "homeownerCounterAmount" DOUBLE PRECISION,
    "homeownerCounterAt" TIMESTAMP(3),
    "incentiveAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "includeGst" BOOLEAN NOT NULL DEFAULT true,
    "includeIncentive" BOOLEAN NOT NULL DEFAULT false,
    "installerRevisedAmount" DOUBLE PRECISION,
    "installerRevisedAt" TIMESTAMP(3),
    "inverterBrand" TEXT,
    "negotiationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "panelBrand" TEXT,
    "purchasedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "selectedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',

    "homeownerCounterCount" INTEGER NOT NULL DEFAULT 0,
    "installerRevisionCount" INTEGER NOT NULL DEFAULT 0,
    "negotiationTurnCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "written_quotes_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "written_quotes_leadId_idx" ON "written_quotes"("leadId");
CREATE INDEX "written_quotes_installerId_idx" ON "written_quotes"("installerId");
CREATE INDEX "written_quotes_negotiationStatus_idx" ON "written_quotes"("negotiationStatus");
CREATE INDEX "written_quotes_status_idx" ON "written_quotes"("status");
CREATE INDEX "written_quotes_createdAt_idx" ON "written_quotes"("createdAt");
CREATE UNIQUE INDEX "written_quotes_leadId_installerId_key" ON "written_quotes"("leadId", "installerId");

-- Foreign keys
ALTER TABLE "written_quotes" ADD CONSTRAINT "written_quotes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "written_quotes" ADD CONSTRAINT "written_quotes_installerId_fkey" FOREIGN KEY ("installerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
