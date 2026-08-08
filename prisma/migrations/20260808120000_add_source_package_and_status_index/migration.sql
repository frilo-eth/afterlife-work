-- Deliverable archive handed to the buyer after purchase. Stored as a
-- Cloudinary public_id so the asset can be uploaded with authenticated access
-- and served as a short-lived signed link.
ALTER TABLE "Logo" ADD COLUMN "sourcePackageId" TEXT;
ALTER TABLE "Logo" ADD COLUMN "sourcePackageName" TEXT;
ALTER TABLE "Logo" ADD COLUMN "sourcePackageAt" TIMESTAMP(3);

-- The catalog query filters on status and orders by createdAt; neither column
-- was indexed, so every listing was a sequential scan.
CREATE INDEX "Logo_status_createdAt_idx" ON "Logo"("status", "createdAt");
