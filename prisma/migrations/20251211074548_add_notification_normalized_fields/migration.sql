-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'ASSIGNMENT_WINDOW_STARTED';
ALTER TYPE "NotificationType" ADD VALUE 'ASSIGNMENT_WINDOW_ENDED';
ALTER TYPE "NotificationType" ADD VALUE 'LEAD_CONFIG_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'NEW_OPPORTUNITY';
ALTER TYPE "NotificationType" ADD VALUE 'BID_OUTCOME_NOT_SELECTED';
ALTER TYPE "NotificationType" ADD VALUE 'DATA_UPDATE';
ALTER TYPE "NotificationType" ADD VALUE 'REQUEST_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'RESPONSES_AVAILABLE';
ALTER TYPE "NotificationType" ADD VALUE 'SELECTION_CONFIRMED';
ALTER TYPE "NotificationType" ADD VALUE 'APPOINTMENT_SUGGESTED';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "messageKey" TEXT,
ADD COLUMN     "role" "UserRole",
ADD COLUMN     "routeKey" TEXT,
ADD COLUMN     "routeParams" JSONB;

-- CreateIndex
CREATE INDEX "notifications_role_idx" ON "notifications"("role");
