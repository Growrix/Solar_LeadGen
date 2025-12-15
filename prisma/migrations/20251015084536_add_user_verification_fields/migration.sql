-- AlterTable
ALTER TABLE "users" ADD COLUMN     "installerVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leadSubmissionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
