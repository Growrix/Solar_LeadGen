-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('DRAFT', 'PENDING_PHONE', 'PENDING_APPROVAL', 'APPROVED', 'PURCHASED', 'QUOTED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "LeadVisibility" AS ENUM ('HIDDEN', 'PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_LEAD', 'LEAD_PURCHASED', 'LEAD_APPROVED', 'LEAD_REJECTED', 'NEW_QUOTE', 'NEW_MESSAGE', 'QUOTE_ACCEPTED', 'QUOTE_REJECTED', 'PAYMENT_RECEIVED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "QuoteType" AS ENUM ('FORMAL', 'INFORMAL');

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "homeownerId" TEXT NOT NULL,
    "installerId" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "LeadVisibility" NOT NULL DEFAULT 'HIDDEN',
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT,
    "projectType" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "address" TEXT,
    "energyBill" DOUBLE PRECISION NOT NULL,
    "billType" TEXT NOT NULL,
    "roofType" TEXT NOT NULL,
    "budgetRange" TEXT NOT NULL,
    "desiredOffset" INTEGER NOT NULL,
    "batteryRequired" BOOLEAN NOT NULL DEFAULT false,
    "batteryCapacity" TEXT,
    "timeframe" TEXT,
    "additionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "purchasedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "flaggedReason" TEXT,
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "leadPrice" DOUBLE PRECISION,
    "purchaseStatus" "PurchaseStatus",
    "stripePaymentIntentId" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_verifications" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "verificationSid" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "install_documents" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "install_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" "UserRole" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "installerId" TEXT NOT NULL,
    "quoteType" "QuoteType" NOT NULL,
    "systemSize" DOUBLE PRECISION NOT NULL,
    "panelBrand" TEXT,
    "inverterBrand" TEXT,
    "batteryBrand" TEXT,
    "batteryCapacity" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "federalRebate" DOUBLE PRECISION,
    "stateRebate" DOUBLE PRECISION,
    "finalPrice" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "paybackYears" DOUBLE PRECISION,
    "annualSavings" DOUBLE PRECISION,
    "warranty" TEXT,
    "installTimeline" TEXT,
    "attachmentS3Keys" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_feedback" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "communicationRating" INTEGER,
    "timelinessRating" INTEGER,
    "professionalismRating" INTEGER,
    "comments" TEXT,
    "wouldRecommend" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_homeownerId_idx" ON "leads"("homeownerId");

-- CreateIndex
CREATE INDEX "leads_installerId_idx" ON "leads"("installerId");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_visibility_idx" ON "leads"("visibility");

-- CreateIndex
CREATE INDEX "leads_postcode_idx" ON "leads"("postcode");

-- CreateIndex
CREATE INDEX "leads_state_idx" ON "leads"("state");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE INDEX "leads_expiresAt_idx" ON "leads"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "phone_verifications_leadId_key" ON "phone_verifications"("leadId");

-- CreateIndex
CREATE INDEX "phone_verifications_phoneNumber_idx" ON "phone_verifications"("phoneNumber");

-- CreateIndex
CREATE INDEX "phone_verifications_leadId_idx" ON "phone_verifications"("leadId");

-- CreateIndex
CREATE INDEX "install_documents_leadId_idx" ON "install_documents"("leadId");

-- CreateIndex
CREATE INDEX "chat_messages_leadId_idx" ON "chat_messages"("leadId");

-- CreateIndex
CREATE INDEX "chat_messages_senderId_idx" ON "chat_messages"("senderId");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- CreateIndex
CREATE INDEX "quotes_leadId_idx" ON "quotes"("leadId");

-- CreateIndex
CREATE INDEX "quotes_installerId_idx" ON "quotes"("installerId");

-- CreateIndex
CREATE INDEX "quotes_status_idx" ON "quotes"("status");

-- CreateIndex
CREATE INDEX "quotes_createdAt_idx" ON "quotes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "lead_feedback_leadId_key" ON "lead_feedback"("leadId");

-- CreateIndex
CREATE INDEX "lead_feedback_leadId_idx" ON "lead_feedback"("leadId");

-- CreateIndex
CREATE INDEX "lead_feedback_overallRating_idx" ON "lead_feedback"("overallRating");

-- CreateIndex
CREATE INDEX "audit_logs_leadId_idx" ON "audit_logs"("leadId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_key_idx" ON "settings"("key");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_homeownerId_fkey" FOREIGN KEY ("homeownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_installerId_fkey" FOREIGN KEY ("installerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_verifications" ADD CONSTRAINT "phone_verifications_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "install_documents" ADD CONSTRAINT "install_documents_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_installerId_fkey" FOREIGN KEY ("installerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_feedback" ADD CONSTRAINT "lead_feedback_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
