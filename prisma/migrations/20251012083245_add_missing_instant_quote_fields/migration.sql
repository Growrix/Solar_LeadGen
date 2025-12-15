-- AlterTable
ALTER TABLE "guest_instant_quotes" ADD COLUMN     "additionalArrays" JSONB,
ADD COLUMN     "backupCritical" TEXT,
ADD COLUMN     "customBatteryCapacity" TEXT;
