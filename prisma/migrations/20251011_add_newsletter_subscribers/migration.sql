-- =============================================
-- Migration: Add Newsletter Subscribers Table
-- Created: 2025-10-11
-- Purpose: This migration creates the 'newsletter_subscribers' table
--          for storing newsletter signup data, including email, status,
--          and subscription/unsubscription timestamps.
--
-- Key Points:
-- - Each subscriber has a unique ID (cuid string)
-- - Email is unique (no duplicates allowed)
-- - 'isActive' is a soft-delete flag (true = active, false = unsubscribed)
-- - 'unsubscribedAt' is null unless user unsubscribes
-- - Index on email for fast lookups
-- =============================================

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");
