-- CreateEnum
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'BOUNCED', 'SPAM_REPORT', 'FAILED');

-- CreateTable
CREATE TABLE "email_deliveries" (
    "id" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientRole" "UserRole",
    "recipientUserId" TEXT,
    "subject" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "notificationId" TEXT,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'sendgrid',
    "providerMessageId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "spamReportedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "metadata" JSONB,

    CONSTRAINT "email_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_deliveries_recipientEmail_idx" ON "email_deliveries"("recipientEmail");

-- CreateIndex
CREATE INDEX "email_deliveries_recipientUserId_idx" ON "email_deliveries"("recipientUserId");

-- CreateIndex
CREATE INDEX "email_deliveries_status_idx" ON "email_deliveries"("status");

-- CreateIndex
CREATE INDEX "email_deliveries_messageType_idx" ON "email_deliveries"("messageType");

-- CreateIndex
CREATE INDEX "email_deliveries_notificationId_idx" ON "email_deliveries"("notificationId");

-- CreateIndex
CREATE INDEX "email_deliveries_sentAt_idx" ON "email_deliveries"("sentAt");
