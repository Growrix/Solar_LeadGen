-- CreateTable
CREATE TABLE "lead_purchases" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "installerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentIntentId" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundedAt" TIMESTAMP(3),
    "refundReason" TEXT,

    CONSTRAINT "lead_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_purchases_leadId_idx" ON "lead_purchases"("leadId");

-- CreateIndex
CREATE INDEX "lead_purchases_installerId_idx" ON "lead_purchases"("installerId");

-- CreateIndex
CREATE INDEX "lead_purchases_purchasedAt_idx" ON "lead_purchases"("purchasedAt");
