-- Public pretty URLs: /agave-sunshine instead of /cm…
ALTER TABLE "Logo" ADD COLUMN "slug" TEXT;

-- Backfill from title
UPDATE "Logo"
SET "slug" = TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(REGEXP_REPLACE("title", '[^a-zA-Z0-9]+', '-', 'g'), '-{2,}', '-', 'g')));

UPDATE "Logo"
SET "slug" = 'logo-' || LEFT("id", 8)
WHERE "slug" IS NULL OR "slug" = '';

-- Avoid colliding with app routes
UPDATE "Logo"
SET "slug" = 'logo-' || "slug"
WHERE "slug" IN (
  'about', 'admin', 'api', 'download', 'login', 'teaser', 'success', 'cancel',
  'favicon.ico', 'robots.txt', 'sitemap.xml'
);

-- Disambiguate duplicate slugs
WITH ranked AS (
  SELECT
    "id",
    "slug",
    ROW_NUMBER() OVER (PARTITION BY "slug" ORDER BY "createdAt" ASC, "id" ASC) AS rn
  FROM "Logo"
)
UPDATE "Logo" AS l
SET "slug" = l."slug" || '-' || LEFT(l."id", 6)
FROM ranked AS r
WHERE l."id" = r."id" AND r.rn > 1;

ALTER TABLE "Logo" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Logo_slug_key" ON "Logo"("slug");
