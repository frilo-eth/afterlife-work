-- CreateTable
CREATE TABLE "CheckoutLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "logoId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "error" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutLog_pkey" PRIMARY KEY ("id")
);
