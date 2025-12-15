-- CreateTable
CREATE TABLE "domain_events" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "metadata" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_history" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "previousState" TEXT,
    "nextState" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bid_history" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "previousState" TEXT,
    "nextState" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bid_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_history" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "previousState" TEXT,
    "nextState" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "domain_events_eventType_idx" ON "domain_events"("eventType");

-- CreateIndex
CREATE INDEX "domain_events_entityType_entityId_idx" ON "domain_events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "domain_events_actorId_idx" ON "domain_events"("actorId");

-- CreateIndex
CREATE INDEX "domain_events_timestamp_idx" ON "domain_events"("timestamp");

-- CreateIndex
CREATE INDEX "lead_history_leadId_idx" ON "lead_history"("leadId");

-- CreateIndex
CREATE INDEX "lead_history_actorId_idx" ON "lead_history"("actorId");

-- CreateIndex
CREATE INDEX "lead_history_timestamp_idx" ON "lead_history"("timestamp");

-- CreateIndex
CREATE INDEX "bid_history_bidId_idx" ON "bid_history"("bidId");

-- CreateIndex
CREATE INDEX "bid_history_actorId_idx" ON "bid_history"("actorId");

-- CreateIndex
CREATE INDEX "bid_history_timestamp_idx" ON "bid_history"("timestamp");

-- CreateIndex
CREATE INDEX "purchase_history_purchaseId_idx" ON "purchase_history"("purchaseId");

-- CreateIndex
CREATE INDEX "purchase_history_actorId_idx" ON "purchase_history"("actorId");

-- CreateIndex
CREATE INDEX "purchase_history_timestamp_idx" ON "purchase_history"("timestamp");
