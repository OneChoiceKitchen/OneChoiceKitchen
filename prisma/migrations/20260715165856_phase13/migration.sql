-- CreateTable
CREATE TABLE "cat_invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "billingDate" DATETIME NOT NULL,
    "pdfUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_invoices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "cat_invoices_tenantId_idx" ON "cat_invoices"("tenantId");
