-- CreateEnum
CREATE TYPE "LogoStatus" AS ENUM ('AVAILABLE', 'SOLD', 'HIDDEN');

-- CreateTable
CREATE TABLE "Logo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "thumbnail" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "LogoStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "priceId" TEXT NOT NULL,

    CONSTRAINT "Logo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "summon" INTEGER NOT NULL,
    "revival" INTEGER NOT NULL,
    "afterlife" INTEGER NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Logo" ADD CONSTRAINT "Logo_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
