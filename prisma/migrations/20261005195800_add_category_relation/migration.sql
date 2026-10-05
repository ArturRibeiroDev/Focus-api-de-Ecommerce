-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Create categories from existing product category values to preserve data.
INSERT INTO "categories" ("id", "name", "updated_at")
SELECT gen_random_uuid()::text, "category", CURRENT_TIMESTAMP
FROM "products"
GROUP BY "category";

-- Migrate products to the new category relation.
ALTER TABLE "products" ADD COLUMN "category_id" TEXT;

UPDATE "products" AS product
SET "category_id" = category."id"
FROM "categories" AS category
WHERE category."name" = product."category";

ALTER TABLE "products" ALTER COLUMN "category_id" SET NOT NULL;
ALTER TABLE "products" DROP COLUMN "category";

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- AddForeignKey
ALTER TABLE "products"
ADD CONSTRAINT "products_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "categories"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
