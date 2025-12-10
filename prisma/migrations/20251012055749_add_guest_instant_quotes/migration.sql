-- CreateTable
CREATE TABLE "guest_instant_quotes" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quoteType" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "electricityUsageType" TEXT NOT NULL,
    "electricityValue" TEXT NOT NULL,
    "roofType" TEXT NOT NULL,
    "budgetRange" TEXT NOT NULL,
    "panelOrientation" TEXT NOT NULL,
    "roofTilt" TEXT NOT NULL,
    "shadingLevel" TEXT NOT NULL,
    "desiredOffset" INTEGER NOT NULL,
    "usagePattern" TEXT,
    "batteryIncluded" BOOLEAN NOT NULL DEFAULT false,
    "batteryCapacity" TEXT,
    "batteryBrand" TEXT,
    "batteryUsage" TEXT,
    "includeVPP" BOOLEAN NOT NULL DEFAULT false,
    "peakDemand" TEXT,
    "isThreePhase" BOOLEAN NOT NULL DEFAULT false,
    "projectPriority" TEXT,
    "retailer" TEXT,
    "tariffPlan" TEXT,
    "customRetailRate" TEXT,
    "customFeedInRate" TEXT,
    "panelBrand" TEXT,
    "includeOptimizers" BOOLEAN NOT NULL DEFAULT false,
    "includeMicroinverters" BOOLEAN NOT NULL DEFAULT false,
    "includeEVCharging" BOOLEAN NOT NULL DEFAULT false,
    "includeSmartHome" BOOLEAN NOT NULL DEFAULT false,
    "includeGridServices" BOOLEAN NOT NULL DEFAULT false,
    "hasExistingSystem" BOOLEAN NOT NULL DEFAULT false,
    "existingSystemSize" TEXT,
    "systemSizeOverride" TEXT,
    "results" JSONB NOT NULL,
    "adminNotes" TEXT,
    "isConverted" BOOLEAN NOT NULL DEFAULT false,
    "conversionDate" TIMESTAMP(3),

    CONSTRAINT "guest_instant_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guest_instant_quotes_createdAt_idx" ON "guest_instant_quotes"("createdAt");

-- CreateIndex
CREATE INDEX "guest_instant_quotes_state_idx" ON "guest_instant_quotes"("state");

-- CreateIndex
CREATE INDEX "guest_instant_quotes_quoteType_idx" ON "guest_instant_quotes"("quoteType");

-- CreateIndex
CREATE INDEX "guest_instant_quotes_sessionId_idx" ON "guest_instant_quotes"("sessionId");
