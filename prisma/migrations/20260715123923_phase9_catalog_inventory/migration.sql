-- CreateTable
CREATE TABLE "cat_customers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "googleId" TEXT,
    "facebookId" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaType" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "whatsappVerified" BOOLEAN NOT NULL DEFAULT false,
    "profilePhoto" TEXT,
    "deactivatedAt" DATETIME,
    "notificationPrefs" TEXT NOT NULL DEFAULT '{"email":true,"sms":true,"whatsapp":true,"push":true}',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockoutUntil" DATETIME,
    "otpCode" TEXT,
    "otpExpiry" DATETIME,
    "roleId" TEXT,
    "restaurantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "referralCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_customers_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "cat_roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cat_customers_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerName" TEXT,
    "email" TEXT,
    "secondaryEmail" TEXT,
    "mobile" TEXT,
    "secondaryMobile" TEXT,
    "businessDetails" TEXT,
    "cuisine" TEXT,
    "address" TEXT,
    "city" TEXT,
    "lat" REAL,
    "lng" REAL,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isFranchise" BOOLEAN NOT NULL DEFAULT false,
    "parentRestaurantId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT,
    CONSTRAINT "Restaurant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT,
    "portal" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'PLATFORM',
    CONSTRAINT "cat_roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "module" TEXT,
    "resource" TEXT,
    "action" TEXT
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    PRIMARY KEY ("roleId", "permissionId"),
    CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "cat_roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "cat_permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "ownerUserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_tenants_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_tenant_branches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_tenant_branches_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_user_portal_memberships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "tenantId" TEXT,
    "scopeKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_user_portal_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cat_user_portal_memberships_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_user_role_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membershipId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_user_role_assignments_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "cat_user_portal_memberships" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cat_user_role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "cat_roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cat_user_role_assignments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_module_catalog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cat_subscription_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moduleId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tier" TEXT NOT NULL,
    "price" DECIMAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "billingInterval" TEXT NOT NULL,
    "intervalCount" INTEGER NOT NULL DEFAULT 1,
    "defaultAccessLevel" TEXT NOT NULL DEFAULT 'READ',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_subscription_plans_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "cat_module_catalog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_tenant_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "paymentReference" TEXT,
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_tenant_subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cat_tenant_subscriptions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "cat_module_catalog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cat_tenant_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "cat_subscription_plans" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_tenant_entitlements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "accessLevel" TEXT NOT NULL DEFAULT 'PREVIEW',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" DATETIME,
    "validUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_tenant_entitlements_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cat_tenant_entitlements_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "cat_module_catalog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cat_tenant_entitlements_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "cat_tenant_subscriptions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_approval_cases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "activeKey" TEXT,
    "tenantId" TEXT,
    "userId" TEXT,
    "currentStage" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueAt" DATETIME NOT NULL,
    "escalationLevel" TEXT NOT NULL DEFAULT 'NONE',
    "nextEscalationAt" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 0,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_approval_cases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cat_approval_cases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_approval_decisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "approvalCaseId" TEXT NOT NULL,
    "approverUserId" TEXT,
    "action" TEXT NOT NULL,
    "fromStage" TEXT NOT NULL,
    "toStage" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cat_approval_decisions_approvalCaseId_fkey" FOREIGN KEY ("approvalCaseId") REFERENCES "cat_approval_cases" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cat_approval_decisions_approverUserId_fkey" FOREIGN KEY ("approverUserId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApprovalRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "requestedData" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "comments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ApprovalRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ApprovalRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PartnerRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "businessDetails" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RiderRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL DEFAULT 'Bike',
    "vehicleVin" TEXT,
    "licensePlate" TEXT,
    "licenseNumber" TEXT,
    "licenseExpiry" DATETIME,
    "insuranceUrl" TEXT,
    "aadharUrl" TEXT,
    "photoUrl" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfsc" TEXT,
    "bankAccountName" TEXT,
    "whatsappVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TiffinMenu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mealType" TEXT NOT NULL,
    "dietType" TEXT NOT NULL,
    "dayOfWeek" TEXT,
    "image" TEXT,
    "youtubeUrl" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "date" DATETIME,
    "calories" INTEGER,
    "branchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TiffinMenu_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TiffinMenu_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "RestaurantBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationDays" INTEGER NOT NULL,
    "pricePerMeal" REAL NOT NULL,
    "basePrice" REAL NOT NULL,
    "dietType" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "CustomerSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "deliveryLat" REAL NOT NULL,
    "deliveryLng" REAL NOT NULL,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "packagingFee" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomerSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CustomerSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeliverySchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "mealType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "riderId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customizations" TEXT,
    CONSTRAINT "DeliverySchedule_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "CustomerSubscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BillingInvoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "tax" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "receiptUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BillingInvoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "CustomerSubscription" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TenantSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "themeColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "operatingHours" TEXT NOT NULL DEFAULT '09:00 - 22:00',
    "deliveryRadius" REAL NOT NULL DEFAULT 5.0,
    "activeModules" TEXT NOT NULL DEFAULT 'dashboard,crm,dispatch,menu,orders,payments,inventory,workforce,printing',
    "isEmployeeModuleEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gatewayName" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isSandbox" BOOLEAN NOT NULL DEFAULT true,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "merchantId" TEXT,
    "publicKey" TEXT,
    "webhookSecret" TEXT,
    "activeMethods" TEXT NOT NULL DEFAULT 'upi,cards,netbanking',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StorageConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "accessKey" TEXT,
    "secretKey" TEXT,
    "bucketName" TEXT,
    "region" TEXT,
    "endpointUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuthConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT,
    "clientSecret" TEXT,
    "callbackUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AiConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "modelName" TEXT DEFAULT 'gemini-1.5-flash-latest',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TaxRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "discount" REAL NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERCENT',
    "expiryDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "cat_inventory_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "quantity" INTEGER,
    "threshold" INTEGER DEFAULT 10,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'UNIT',
    "currentStock" REAL NOT NULL DEFAULT 0,
    "reorderLevel" REAL NOT NULL DEFAULT 0,
    "warehouse" TEXT NOT NULL DEFAULT 'Main Kitchen',
    "supplierId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_inventory_items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "cat_hrms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "restaurantId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "designation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "baseSalary" REAL NOT NULL DEFAULT 0.0,
    "joiningDate" DATETIME,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_hrms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cat_hrms_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'General',
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakMins" INTEGER NOT NULL DEFAULT 60,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Shift_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "cat_hrms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "dailyLimit" INTEGER NOT NULL DEFAULT 1000,
    "config" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SmsConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "dailyLimit" INTEGER NOT NULL DEFAULT 500,
    "config" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "excerpt" TEXT,
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "scheduledPublishDate" DATETIME,
    "publishDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "featuredImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blogId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comment_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pointsRequired" INTEGER NOT NULL,
    "rewardType" TEXT NOT NULL DEFAULT 'DISCOUNT',
    "code" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RewardRedemption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardRedemption_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RewardRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PointHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PointHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "referredEmail" TEXT NOT NULL,
    "referredUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rewardPoints" INTEGER NOT NULL DEFAULT 500,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Referral_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "customerName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "portalSource" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "slaDeadline" DATETIME,
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "ratingComment" TEXT,
    "attachments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeliverySetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantAddress" TEXT NOT NULL DEFAULT 'One Choice Kitchen, Patna',
    "restaurantLat" REAL NOT NULL DEFAULT 25.5941,
    "restaurantLng" REAL NOT NULL DEFAULT 85.1376,
    "enableDistanceCharges" BOOLEAN NOT NULL DEFAULT true,
    "freeDeliveryDistance" REAL NOT NULL DEFAULT 3.0,
    "perKmCharge" REAL NOT NULL DEFAULT 8.0,
    "minimumDeliveryCharge" REAL NOT NULL DEFAULT 0.0,
    "maximumDeliveryCharge" REAL,
    "enableDistanceMargin" BOOLEAN NOT NULL DEFAULT false,
    "distanceMarginValue" REAL NOT NULL DEFAULT 0.0,
    "applyMarginBeforeCharge" BOOLEAN NOT NULL DEFAULT true,
    "googleMapsApiKey" TEXT,
    "allowPayOnDelivery" BOOLEAN NOT NULL DEFAULT true,
    "minimumOrderValue" REAL NOT NULL DEFAULT 0.0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cat_menu_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "restaurantId" TEXT,
    "branchId" TEXT,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "basePrice" REAL,
    "image" TEXT,
    "imageUrl" TEXT,
    "diet" TEXT NOT NULL DEFAULT 'VEG',
    "category" TEXT NOT NULL DEFAULT 'Main',
    "itemType" TEXT NOT NULL DEFAULT 'FOOD_ORDERING',
    "dietaryPreference" TEXT NOT NULL DEFAULT 'VEG',
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "prepTime" INTEGER NOT NULL DEFAULT 20,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "rating" REAL NOT NULL DEFAULT 4.5,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImageUrl" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "youtubeUrl" TEXT,
    CONSTRAINT "cat_menu_items_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cat_menu_items_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "RestaurantBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cat_menu_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "cat_menu_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PortalSlider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portal" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL,
    "fontColor" TEXT NOT NULL,
    "btnColor" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductAttribute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "menuItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SINGLE',
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductAttribute_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "cat_menu_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductAttributeOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attributeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "additionalPrice" REAL NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductAttributeOption_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "ProductAttribute" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeoMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "keywords" TEXT,
    "canonicalUrl" TEXT,
    "robots" TEXT NOT NULL DEFAULT 'index, follow',
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImageUrl" TEXT,
    "ogUrl" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImageUrl" TEXT,
    "schemaMarkup" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StaticPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "section" TEXT NOT NULL DEFAULT 'Company',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "portals" TEXT NOT NULL DEFAULT 'web',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'One Choice Kitchen',
    "tagline" TEXT NOT NULL DEFAULT 'Online Home-Style Food, Tiffin & Meal Services',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#2563EB',
    "secondaryColor" TEXT NOT NULL DEFAULT '#DC2626',
    "backgroundColor" TEXT NOT NULL DEFAULT '#f3f4f8',
    "textColor" TEXT NOT NULL DEFAULT '#0f172a',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "linkedinUrl" TEXT,
    "transparentFaviconUrl" TEXT
);

-- CreateTable
CREATE TABLE "TiffinFlyer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "restaurantId" TEXT,
    "branchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TiffinFlyer_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TiffinFlyer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "RestaurantBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TiffinGlobalSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deliveryIncludedKm" INTEGER NOT NULL DEFAULT 3,
    "extraKmCharge" REAL NOT NULL DEFAULT 8,
    "shopPickupDiscountPct" REAL NOT NULL DEFAULT 5,
    "notesText" TEXT,
    "qrCodeUrl" TEXT,
    "breakfastTime" TEXT NOT NULL DEFAULT '7 - 10 AM',
    "breakfastYoutubeUrl" TEXT,
    "lunchTime" TEXT NOT NULL DEFAULT '12 - 3 PM',
    "lunchYoutubeUrl" TEXT,
    "dinnerTime" TEXT NOT NULL DEFAULT '7 - 10 PM',
    "dinnerYoutubeUrl" TEXT,
    "trialDeliveryFee" REAL NOT NULL DEFAULT 40,
    "trialPackagingFee" REAL NOT NULL DEFAULT 15,
    "minPauseDays" INTEGER NOT NULL DEFAULT 5,
    "upiId" TEXT,
    "paymentInstructions" TEXT,
    "advancePaymentRequired" BOOLEAN NOT NULL DEFAULT true,
    "businessName" TEXT NOT NULL DEFAULT 'ONE CHOICE KITCHEN',
    "businessAddress" TEXT NOT NULL DEFAULT 'MADHUBAN COLONY, NEAR ABHIYANTA NAGAR, PATNA - 27',
    "contactNumbers" TEXT NOT NULL DEFAULT '6299230165 / 7004838102',
    "restaurantId" TEXT,
    "branchId" TEXT,
    CONSTRAINT "TiffinGlobalSetting_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TiffinGlobalSetting_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "RestaurantBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TiffinHoliday" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringRule" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "restaurantId" TEXT,
    "branchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TiffinHoliday_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TiffinHoliday_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "RestaurantBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TiffinOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discountPct" REAL NOT NULL DEFAULT 0,
    "minBookings" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "appliesToTiffin" BOOLEAN NOT NULL DEFAULT true,
    "appliesToMenu" BOOLEAN NOT NULL DEFAULT false,
    "appliesToHome" BOOLEAN NOT NULL DEFAULT false,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "restaurantId" TEXT,
    "branchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TiffinOffer_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TiffinOffer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "RestaurantBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TiffinPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dietType" TEXT NOT NULL,
    "mealsPerDay" INTEGER NOT NULL,
    "totalMeals" INTEGER NOT NULL,
    "monthlyPrice" REAL NOT NULL,
    "pricePerMeal" REAL NOT NULL,
    "isBestValue" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "restaurantId" TEXT,
    "branchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TiffinPlan_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TiffinPlan_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "RestaurantBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TiffinTerm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentHi" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "restaurantId" TEXT,
    "branchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TiffinTerm_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TiffinTerm_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "RestaurantBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "riderId" TEXT,
    "branchId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "orderType" TEXT NOT NULL DEFAULT 'DELIVERY',
    "tableReservationId" TEXT,
    "tableId" TEXT,
    "totalAmount" REAL NOT NULL,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL DEFAULT 'ONLINE',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "deliveryAddress" TEXT NOT NULL,
    "deliveryLat" REAL,
    "deliveryLng" REAL,
    "specialInstructions" TEXT,
    "codAmount" REAL,
    "codCollected" BOOLEAN NOT NULL DEFAULT false,
    "itemsVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_tableReservationId_fkey" FOREIGN KEY ("tableReservationId") REFERENCES "TableReservation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "RestaurantTable" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "customizations" TEXT,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "cat_menu_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceInfo" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FailedLoginAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FailedLoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NotificationTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventName" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" DATETIME,
    "sentAt" DATETIME,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "checkInTime" DATETIME,
    "checkOutTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "photoUrl" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "address" TEXT,
    "deviceInfo" TEXT,
    "workingMins" INTEGER NOT NULL DEFAULT 0,
    "overtimeMins" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "cat_hrms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "approvedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "cat_hrms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "totalAllocated" REAL NOT NULL,
    "used" REAL NOT NULL DEFAULT 0,
    "carriedForward" REAL NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "cat_hrms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "basicSalary" REAL NOT NULL,
    "allowances" REAL NOT NULL DEFAULT 0,
    "deductions" REAL NOT NULL DEFAULT 0,
    "netSalary" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionRef" TEXT,
    "paymentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "cat_hrms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "expiryDate" DATETIME,
    "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "cat_hrms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeofenceConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "radiusMeters" REAL NOT NULL DEFAULT 100.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WhatsappConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "dailyLimit" INTEGER NOT NULL DEFAULT 500,
    "phoneNumberId" TEXT,
    "accessToken" TEXT,
    "accountSid" TEXT,
    "authToken" TEXT,
    "fromNumber" TEXT,
    "apiKey" TEXT,
    "senderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RestaurantBranch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "secondaryPhone" TEXT,
    "email" TEXT,
    "secondaryEmail" TEXT,
    "lat" REAL,
    "lng" REAL,
    "mondayHours" TEXT DEFAULT '09:00 - 22:00',
    "tuesdayHours" TEXT DEFAULT '09:00 - 22:00',
    "wednesdayHours" TEXT DEFAULT '09:00 - 22:00',
    "thursdayHours" TEXT DEFAULT '09:00 - 22:00',
    "fridayHours" TEXT DEFAULT '09:00 - 22:00',
    "saturdayHours" TEXT DEFAULT '09:00 - 22:00',
    "sundayHours" TEXT DEFAULT '09:00 - 22:00',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isQrMenuEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isReservationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isDeliveryEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isTakeawayEnabled" BOOLEAN NOT NULL DEFAULT true,
    "qrCodeUrl" TEXT,
    "brandLogoUrl" TEXT,
    "faviconUrl" TEXT,
    "fssaiNumber" TEXT,
    "fssaiDocUrl" TEXT,
    "gstNumber" TEXT,
    "gstDocUrl" TEXT,
    "panNumber" TEXT,
    "panDocUrl" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImageUrl" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "collectionTags" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RestaurantBranch_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FranchiseRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentRestaurantId" TEXT NOT NULL,
    "branchRestaurantId" TEXT NOT NULL,
    "royaltyPercent" REAL NOT NULL DEFAULT 0,
    "contractDetails" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FranchiseRelation_parentRestaurantId_fkey" FOREIGN KEY ("parentRestaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FranchiseRelation_branchRestaurantId_fkey" FOREIGN KEY ("branchRestaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "restaurantId" TEXT,
    "menuItemId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'RESTAURANT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TableReservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT,
    "date" DATETIME NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "partySize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "confirmationCode" TEXT NOT NULL,
    "specialRequests" TEXT,
    "tableNumber" TEXT,
    "tableId" TEXT,
    "depositAmount" REAL,
    "depositStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TableReservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TableReservation_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TableReservation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "RestaurantBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TableReservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "RestaurantTable" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RestaurantTable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT,
    "tableNumber" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "qrCodeUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RestaurantTable_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RestaurantTable_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "RestaurantBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "branchId" TEXT,
    "partySize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "notifiedAt" DATETIME,
    "notes" TEXT,
    "estimatedWaitTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Waitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Waitlist_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Waitlist_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "RestaurantBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CorporateMealPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "planType" TEXT NOT NULL DEFAULT 'MONTHLY',
    "employeeCount" INTEGER NOT NULL DEFAULT 1,
    "monthlyBudget" REAL NOT NULL DEFAULT 0,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmployeeMealSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "corporatePlanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeMealSubscription_corporatePlanId_fkey" FOREIGN KEY ("corporatePlanId") REFERENCES "CorporateMealPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EmployeeMealSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RestaurantCompliance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "documentNumber" TEXT,
    "fileUrl" TEXT NOT NULL,
    "issuedDate" DATETIME,
    "expiryDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "reviewedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RestaurantCompliance_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayoutRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientId" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "grossAmount" REAL NOT NULL,
    "deductions" REAL NOT NULL DEFAULT 0,
    "netAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "transactionRef" TEXT,
    "processedAt" DATETIME,
    "processedById" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processedAt" DATETIME,
    "processedById" TEXT,
    "transactionRef" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Refund_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SurgePricing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "multiplier" REAL NOT NULL DEFAULT 1.5,
    "zone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "daysOfWeek" TEXT NOT NULL DEFAULT '1,2,3,4,5,6,7',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SLAConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "priority" TEXT NOT NULL,
    "responseTimeHours" REAL NOT NULL DEFAULT 1,
    "resolutionTimeHours" REAL NOT NULL DEFAULT 24,
    "escalationHours" REAL NOT NULL DEFAULT 8,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MapsConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "mapId" TEXT,
    "routingApiUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TaskProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TaskModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT,
    "moduleId" TEXT,
    "taskType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assigneeId" TEXT,
    "reporterId" TEXT,
    "startDate" DATETIME,
    "dueDate" DATETIME,
    "estimatedHours" REAL,
    "actualHours" REAL,
    "labels" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "TaskProject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "TaskModule" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskAttachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskAttachment_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskHistory_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskSubtask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaskSubtask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Hall" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "minCapacity" INTEGER NOT NULL DEFAULT 0,
    "maxCapacity" INTEGER NOT NULL DEFAULT 100,
    "basePrice" REAL NOT NULL DEFAULT 0,
    "amenities" TEXT,
    "galleryUrls" TEXT,
    "locationString" TEXT,
    "lat" REAL,
    "lng" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hall_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Hall_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EventCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FoodPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "pricePerPlate" REAL NOT NULL DEFAULT 0,
    "minGuests" INTEGER NOT NULL DEFAULT 10,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FoodPackage_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FoodPackageItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "foodPackageId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FoodPackageItem_foodPackageId_fkey" FOREIGN KEY ("foodPackageId") REFERENCES "FoodPackage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FoodPackageItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "cat_menu_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AddonPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "price" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AddonPackage_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HallBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "hallId" TEXT NOT NULL,
    "foodPackageId" TEXT,
    "eventDate" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "advanceAmount" REAL NOT NULL DEFAULT 0,
    "balanceAmount" REAL NOT NULL DEFAULT 0,
    "specialRequests" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HallBooking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HallBooking_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HallBooking_foodPackageId_fkey" FOREIGN KEY ("foodPackageId") REFERENCES "FoodPackage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HallBookingAddon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "addonPackageId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HallBookingAddon_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "HallBooking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HallBookingAddon_addonPackageId_fkey" FOREIGN KEY ("addonPackageId") REFERENCES "AddonPackage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "conversationType" TEXT,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "type" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "avatarUrl" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_conversations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "cat_tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_chat_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "participantRole" TEXT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" DATETIME,
    "lastReadMessageId" TEXT,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "cat_chat_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "cat_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cat_chat_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cat_chat_participants_lastReadMessageId_fkey" FOREIGN KEY ("lastReadMessageId") REFERENCES "cat_chat_messages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cat_chat_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "fileMime" TEXT,
    "replyToId" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "reactions" TEXT NOT NULL DEFAULT '{}',
    "deliveredAt" DATETIME,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cat_chat_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "cat_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cat_chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cat_chat_messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "cat_chat_messages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatStarredMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatStarredMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatStarredMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "cat_chat_messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiChatSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "channel" TEXT NOT NULL DEFAULT 'WEB',
    "language" TEXT NOT NULL DEFAULT 'en',
    "metadata" TEXT,
    "ticketId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AiChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cat_customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiChatMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "intent" TEXT,
    "confidence" REAL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AiChatSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HumanSupportRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aiSessionId" TEXT NOT NULL,
    "customerId" TEXT,
    "assignedToId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "customerNote" TEXT,
    "adminNote" TEXT,
    "conversationId" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HumanSupportRequest_aiSessionId_fkey" FOREIGN KEY ("aiSessionId") REFERENCES "AiChatSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiProviderConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "apiKey" TEXT,
    "apiEndpoint" TEXT,
    "model" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChatbotKnowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChatCannedResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "shortCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PartnerFeaturePermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "grantedById" TEXT,
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PartnerDeleteRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" DATETIME,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "cat_menu_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "cat_menu_inventory_mappings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "menuItemId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantityRequired" REAL NOT NULL,
    CONSTRAINT "cat_menu_inventory_mappings_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "cat_menu_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cat_menu_inventory_mappings_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "cat_inventory_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "cat_customers_email_key" ON "cat_customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cat_customers_mobile_key" ON "cat_customers"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "cat_customers_googleId_key" ON "cat_customers"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "cat_customers_facebookId_key" ON "cat_customers"("facebookId");

-- CreateIndex
CREATE UNIQUE INDEX "cat_customers_referralCode_key" ON "cat_customers"("referralCode");

-- CreateIndex
CREATE INDEX "Restaurant_tenantId_idx" ON "Restaurant"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "cat_roles_name_key" ON "cat_roles"("name");

-- CreateIndex
CREATE INDEX "cat_roles_tenantId_idx" ON "cat_roles"("tenantId");

-- CreateIndex
CREATE INDEX "cat_roles_portal_scope_idx" ON "cat_roles"("portal", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "cat_roles_tenantId_portal_name_key" ON "cat_roles"("tenantId", "portal", "name");

-- CreateIndex
CREATE UNIQUE INDEX "cat_permissions_name_key" ON "cat_permissions"("name");

-- CreateIndex
CREATE INDEX "cat_permissions_module_resource_action_idx" ON "cat_permissions"("module", "resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "cat_tenants_code_key" ON "cat_tenants"("code");

-- CreateIndex
CREATE INDEX "cat_tenants_ownerUserId_idx" ON "cat_tenants"("ownerUserId");

-- CreateIndex
CREATE INDEX "cat_tenants_status_idx" ON "cat_tenants"("status");

-- CreateIndex
CREATE INDEX "cat_tenant_branches_tenantId_idx" ON "cat_tenant_branches"("tenantId");

-- CreateIndex
CREATE INDEX "cat_tenant_branches_tenantId_isActive_idx" ON "cat_tenant_branches"("tenantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "cat_tenant_branches_tenantId_code_key" ON "cat_tenant_branches"("tenantId", "code");

-- CreateIndex
CREATE INDEX "cat_user_portal_memberships_userId_portal_status_idx" ON "cat_user_portal_memberships"("userId", "portal", "status");

-- CreateIndex
CREATE INDEX "cat_user_portal_memberships_tenantId_idx" ON "cat_user_portal_memberships"("tenantId");

-- CreateIndex
CREATE INDEX "cat_user_portal_memberships_tenantId_portal_status_idx" ON "cat_user_portal_memberships"("tenantId", "portal", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cat_user_portal_memberships_userId_portal_scopeKey_key" ON "cat_user_portal_memberships"("userId", "portal", "scopeKey");

-- CreateIndex
CREATE INDEX "cat_user_role_assignments_roleId_idx" ON "cat_user_role_assignments"("roleId");

-- CreateIndex
CREATE INDEX "cat_user_role_assignments_tenantId_idx" ON "cat_user_role_assignments"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "cat_user_role_assignments_membershipId_roleId_key" ON "cat_user_role_assignments"("membershipId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "cat_module_catalog_code_key" ON "cat_module_catalog"("code");

-- CreateIndex
CREATE INDEX "cat_module_catalog_isActive_displayOrder_idx" ON "cat_module_catalog"("isActive", "displayOrder");

-- CreateIndex
CREATE INDEX "cat_subscription_plans_moduleId_isActive_idx" ON "cat_subscription_plans"("moduleId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "cat_subscription_plans_moduleId_code_key" ON "cat_subscription_plans"("moduleId", "code");

-- CreateIndex
CREATE INDEX "cat_tenant_subscriptions_tenantId_idx" ON "cat_tenant_subscriptions"("tenantId");

-- CreateIndex
CREATE INDEX "cat_tenant_subscriptions_moduleId_idx" ON "cat_tenant_subscriptions"("moduleId");

-- CreateIndex
CREATE INDEX "cat_tenant_subscriptions_planId_idx" ON "cat_tenant_subscriptions"("planId");

-- CreateIndex
CREATE INDEX "cat_tenant_subscriptions_tenantId_moduleId_status_startsAt_endsAt_idx" ON "cat_tenant_subscriptions"("tenantId", "moduleId", "status", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "cat_tenant_entitlements_tenantId_idx" ON "cat_tenant_entitlements"("tenantId");

-- CreateIndex
CREATE INDEX "cat_tenant_entitlements_moduleId_idx" ON "cat_tenant_entitlements"("moduleId");

-- CreateIndex
CREATE INDEX "cat_tenant_entitlements_subscriptionId_idx" ON "cat_tenant_entitlements"("subscriptionId");

-- CreateIndex
CREATE INDEX "cat_tenant_entitlements_tenantId_moduleId_accessLevel_isActive_idx" ON "cat_tenant_entitlements"("tenantId", "moduleId", "accessLevel", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "cat_tenant_entitlements_tenantId_moduleId_key" ON "cat_tenant_entitlements"("tenantId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "cat_approval_cases_activeKey_key" ON "cat_approval_cases"("activeKey");

-- CreateIndex
CREATE INDEX "cat_approval_cases_type_referenceId_idx" ON "cat_approval_cases"("type", "referenceId");

-- CreateIndex
CREATE INDEX "cat_approval_cases_status_nextEscalationAt_idx" ON "cat_approval_cases"("status", "nextEscalationAt");

-- CreateIndex
CREATE INDEX "cat_approval_cases_tenantId_status_createdAt_idx" ON "cat_approval_cases"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "cat_approval_cases_userId_status_createdAt_idx" ON "cat_approval_cases"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "cat_approval_decisions_approvalCaseId_createdAt_idx" ON "cat_approval_decisions"("approvalCaseId", "createdAt");

-- CreateIndex
CREATE INDEX "cat_approval_decisions_approverUserId_createdAt_idx" ON "cat_approval_decisions"("approverUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerRegistration_email_key" ON "PartnerRegistration"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RiderRegistration_mobile_key" ON "RiderRegistration"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentConfig_gatewayName_key" ON "PaymentConfig"("gatewayName");

-- CreateIndex
CREATE UNIQUE INDEX "StorageConfig_providerName_key" ON "StorageConfig"("providerName");

-- CreateIndex
CREATE UNIQUE INDEX "AuthConfig_providerName_key" ON "AuthConfig"("providerName");

-- CreateIndex
CREATE UNIQUE INDEX "AiConfig_providerName_key" ON "AiConfig"("providerName");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cat_inventory_items_sku_key" ON "cat_inventory_items"("sku");

-- CreateIndex
CREATE INDEX "cat_inventory_items_tenantId_idx" ON "cat_inventory_items"("tenantId");

-- CreateIndex
CREATE INDEX "cat_inventory_items_branchId_idx" ON "cat_inventory_items"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "cat_hrms_userId_key" ON "cat_hrms"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cat_hrms_email_key" ON "cat_hrms"("email");

-- CreateIndex
CREATE INDEX "cat_hrms_tenantId_idx" ON "cat_hrms"("tenantId");

-- CreateIndex
CREATE INDEX "cat_hrms_tenantId_status_idx" ON "cat_hrms"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EmailConfig_providerName_key" ON "EmailConfig"("providerName");

-- CreateIndex
CREATE UNIQUE INDEX "SmsConfig_providerName_key" ON "SmsConfig"("providerName");

-- CreateIndex
CREATE UNIQUE INDEX "Blog_slug_key" ON "Blog"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referredUserId_key" ON "Referral"("referredUserId");

-- CreateIndex
CREATE INDEX "cat_menu_items_tenantId_idx" ON "cat_menu_items"("tenantId");

-- CreateIndex
CREATE INDEX "cat_menu_items_branchId_idx" ON "cat_menu_items"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "SeoMetadata_pageName_key" ON "SeoMetadata"("pageName");

-- CreateIndex
CREATE UNIQUE INDEX "StaticPage_slug_key" ON "StaticPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TiffinFlyer_type_key" ON "TiffinFlyer"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshToken_key" ON "Session"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationTemplate_eventName_key" ON "NotificationTemplate"("eventName");

-- CreateIndex
CREATE UNIQUE INDEX "GeofenceConfig_restaurantId_key" ON "GeofenceConfig"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsappConfig_providerName_key" ON "WhatsappConfig"("providerName");

-- CreateIndex
CREATE UNIQUE INDEX "TableReservation_confirmationCode_key" ON "TableReservation"("confirmationCode");

-- CreateIndex
CREATE UNIQUE INDEX "SLAConfig_priority_key" ON "SLAConfig"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "MapsConfig_providerName_key" ON "MapsConfig"("providerName");

-- CreateIndex
CREATE UNIQUE INDEX "Task_taskId_key" ON "Task"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "EventCategory_name_key" ON "EventCategory"("name");

-- CreateIndex
CREATE INDEX "cat_conversations_tenantId_idx" ON "cat_conversations"("tenantId");

-- CreateIndex
CREATE INDEX "cat_conversations_tenantId_conversationType_status_idx" ON "cat_conversations"("tenantId", "conversationType", "status");

-- CreateIndex
CREATE INDEX "cat_conversations_status_updatedAt_idx" ON "cat_conversations"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "cat_chat_participants_userId_idx" ON "cat_chat_participants"("userId");

-- CreateIndex
CREATE INDEX "cat_chat_participants_lastReadMessageId_idx" ON "cat_chat_participants"("lastReadMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "cat_chat_participants_conversationId_userId_key" ON "cat_chat_participants"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "cat_chat_messages_conversationId_createdAt_idx" ON "cat_chat_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "cat_chat_messages_senderId_createdAt_idx" ON "cat_chat_messages"("senderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatStarredMessage_userId_messageId_key" ON "ChatStarredMessage"("userId", "messageId");

-- CreateIndex
CREATE UNIQUE INDEX "AiChatSession_sessionToken_key" ON "AiChatSession"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "HumanSupportRequest_aiSessionId_key" ON "HumanSupportRequest"("aiSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AiProviderConfig_provider_key" ON "AiProviderConfig"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "ChatCannedResponse_shortCode_key" ON "ChatCannedResponse"("shortCode");

-- CreateIndex
CREATE INDEX "PartnerFeaturePermission_partnerId_idx" ON "PartnerFeaturePermission"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerFeaturePermission_partnerId_module_feature_key" ON "PartnerFeaturePermission"("partnerId", "module", "feature");

-- CreateIndex
CREATE INDEX "PartnerDeleteRequest_partnerId_idx" ON "PartnerDeleteRequest"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerDeleteRequest_status_idx" ON "PartnerDeleteRequest"("status");

-- CreateIndex
CREATE INDEX "cat_menu_categories_tenantId_idx" ON "cat_menu_categories"("tenantId");

-- CreateIndex
CREATE INDEX "cat_menu_categories_branchId_idx" ON "cat_menu_categories"("branchId");

-- CreateIndex
CREATE INDEX "cat_menu_inventory_mappings_menuItemId_idx" ON "cat_menu_inventory_mappings"("menuItemId");

-- CreateIndex
CREATE INDEX "cat_menu_inventory_mappings_inventoryItemId_idx" ON "cat_menu_inventory_mappings"("inventoryItemId");
