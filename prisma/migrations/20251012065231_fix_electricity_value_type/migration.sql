/*
  Warnings:

  - Changed the type of `electricityValue` on the `guest_instant_quotes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "guest_instant_quotes" DROP COLUMN "electricityValue",
ADD COLUMN     "electricityValue" DOUBLE PRECISION NOT NULL;
