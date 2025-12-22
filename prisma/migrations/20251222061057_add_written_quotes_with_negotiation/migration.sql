-- CreateTable
CREATE TABLE "written_quotes" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "installerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "capacityOffer" DOUBLE PRECISION,
    "expectedInstallDate" TIMESTAMP(3),
    "notes" TEXT,
    "panelBrand" TEXT,
    "inverterBrand" TEXT,
    "batteryBrand" TEXT,
    "batteryCapacity" TEXT,
    "includeGst" BOOLEAN NOT NULL DEFAULT true,
    "gstPercent" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "gstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "includeIncentive" BOOLEAN NOT NULL DEFAULT false,
    "incentiveAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalTotal" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "negotiationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "homeownerCounterAmount" DOUBLE PRECISION,
    "homeownerCounterAt" TIMESTAMP(3),
    "installerRevisedAmount" DOUBLE PRECISION,
    "installerRevisedAt" TIMESTAMP(3),
    "agreedAmount" DOUBLE PRECISION,
    "agreedAt" TIMESTAMP(3),
    "agreedBy" TEXT,
    "selectedAt" TIMESTAMP(3),
    "purchasedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
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

    CONSTRAINT "written_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "written_quotes_leadId_idx" ON "written_quotes"("leadId");

-- CreateIndex
CREATE INDEX "written_quotes_installerId_idx" ON "written_quotes"("installerId");

-- CreateIndex
CREATE INDEX "written_quotes_negotiationStatus_idx" ON "written_quotes"("negotiationStatus");

-- CreateIndex
CREATE INDEX "written_quotes_status_idx" ON "written_quotes"("status");

-- CreateIndex
CREATE INDEX "written_quotes_createdAt_idx" ON "written_quotes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "written_quotes_leadId_installerId_key" ON "written_quotes"("leadId", "installerId");

-- AddForeignKey
ALTER TABLE "written_quotes" ADD CONSTRAINT "written_quotes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "written_quotes" ADD CONSTRAINT "written_quotes_installerId_fkey" FOREIGN KEY ("installerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
