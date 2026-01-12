/*
  Warnings:

  - The primary key for the `news_model_router_defaults` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[taskType]` on the table `news_model_router_defaults` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "news_items" ADD COLUMN     "scheduleExpiresAt" TIMESTAMP(3),
ADD COLUMN     "scheduleIsFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "schedulePriority" TEXT NOT NULL DEFAULT 'Normal';

-- AlterTable
ALTER TABLE "news_model_router_defaults" DROP CONSTRAINT "news_model_router_defaults_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "news_model_router_defaults_taskType_key" ON "news_model_router_defaults"("taskType");
