-- CreateTable
CREATE TABLE "cat_webhooks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "eventTrigger" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "secretKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_webhooks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_webhook_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "webhookId" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "responseStatus" INTEGER,
    "isSuccessful" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cat_webhook_logs_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "cat_webhooks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "cat_webhooks_tenantId_idx" ON "cat_webhooks"("tenantId");

-- CreateIndex
CREATE INDEX "cat_webhooks_eventTrigger_idx" ON "cat_webhooks"("eventTrigger");

-- CreateIndex
CREATE INDEX "cat_webhook_logs_webhookId_idx" ON "cat_webhook_logs"("webhookId");

-- CreateIndex
CREATE INDEX "cat_webhook_logs_isSuccessful_idx" ON "cat_webhook_logs"("isSuccessful");
