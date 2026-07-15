-- AlterTable
ALTER TABLE "Order" ADD COLUMN "discountAmount" REAL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "promoCode" TEXT;

-- CreateTable
CREATE TABLE "cat_promotions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" REAL NOT NULL,
    "minOrderValue" REAL,
    "maxDiscount" REAL,
    "validFrom" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_promotions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "cat_promotions_tenantId_idx" ON "cat_promotions"("tenantId");

-- CreateIndex
CREATE INDEX "cat_promotions_code_idx" ON "cat_promotions"("code");

-- CreateIndex
CREATE INDEX "cat_promotions_tenantId_isActive_validFrom_validUntil_idx" ON "cat_promotions"("tenantId", "isActive", "validFrom", "validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "cat_promotions_tenantId_code_key" ON "cat_promotions"("tenantId", "code");
