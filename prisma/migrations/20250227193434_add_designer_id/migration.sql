/*
  Warnings:

  - The `status` column on the `Logo` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('SUMMONED', 'REVIVED');

-- CreateEnum
CREATE TYPE "OrderTier" AS ENUM ('summon', 'revival', 'afterlife');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LogoStatus" ADD VALUE 'REVIEW';
ALTER TYPE "LogoStatus" ADD VALUE 'DRAFT';

-- AlterTable
ALTER TABLE "Logo" ADD COLUMN     "designerId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "LogoStatus" NOT NULL DEFAULT 'HIDDEN';

-- CreateTable
CREATE TABLE "LogoGallery" (
    "id" TEXT NOT NULL,
    "logoId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LogoGallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logo_submissions" (
    "id" TEXT NOT NULL,
    "designerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "twitter" TEXT,
    "description" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "mockupUrls" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "designerId" TEXT,

    CONSTRAINT "logo_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "twitter" TEXT,
    "website" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Designer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LogoGallery_logoId_idx" ON "LogoGallery"("logoId");

-- CreateIndex
CREATE UNIQUE INDEX "Designer_email_key" ON "Designer"("email");

-- AddForeignKey
ALTER TABLE "Logo" ADD CONSTRAINT "Logo_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogoGallery" ADD CONSTRAINT "LogoGallery_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Logo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logo_submissions" ADD CONSTRAINT "logo_submissions_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
