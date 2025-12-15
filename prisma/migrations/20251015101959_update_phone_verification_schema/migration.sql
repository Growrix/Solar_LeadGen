/*
  Warnings:

  - You are about to drop the column `isVerified` on the `phone_verifications` table. All the data in the column will be lost.
  - You are about to drop the column `leadId` on the `phone_verifications` table. All the data in the column will be lost.
  - Added the required column `code` to the `phone_verifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `phone_verifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."phone_verifications" DROP CONSTRAINT "phone_verifications_leadId_fkey";

-- DropIndex
DROP INDEX "public"."phone_verifications_leadId_idx";

-- DropIndex
DROP INDEX "public"."phone_verifications_leadId_key";

-- AlterTable
ALTER TABLE "phone_verifications" DROP COLUMN "isVerified",
DROP COLUMN "leadId",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "phone_verifications_userId_idx" ON "phone_verifications"("userId");

-- CreateIndex
CREATE INDEX "phone_verifications_status_idx" ON "phone_verifications"("status");

-- AddForeignKey
ALTER TABLE "phone_verifications" ADD CONSTRAINT "phone_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
