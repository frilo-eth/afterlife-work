/*
  Warnings:

  - The `status` column on the `Logo` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Logo" ADD COLUMN     "designerEmail" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'HIDDEN';

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "logoId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "wordmark" TEXT,
    "customerEmail" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Logo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
