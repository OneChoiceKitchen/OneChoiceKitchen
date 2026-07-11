const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf-8');

const newModels = `
model Restaurant {
  id             String                @id @default(uuid())
  name           String
  ownerName      String?
  email          String?
  mobile         String?
  businessDetails String?
  isActive       Boolean               @default(true)
  createdAt      DateTime              @default(now())
  updatedAt      DateTime              @updatedAt
  users          User[]
}

model Role {
  id          String           @id @default(uuid())
  name        String           @unique
  description String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  users       User[]
  permissions RolePermission[]
}

model Permission {
  id          String           @id @default(uuid())
  name        String           @unique
  description String?
  createdAt   DateTime         @default(now())
  roles       RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  action      String   
  entity      String   
  entityId    String?
  details     String?  
  ipAddress   String?
  createdAt   DateTime @default(now())
  
  user        User?    @relation(fields: [userId], references: [id])
}

model ApprovalRequest {
  id           String   @id @default(uuid())
  entityType   String   
  entityId     String?  
  requestedData String  
  status       String   @default("PENDING") 
  requestedById String
  approvedById  String?
  comments     String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  requestedBy  User     @relation("RequestedApprovals", fields: [requestedById], references: [id])
  approvedBy   User?    @relation("ApprovedApprovals", fields: [approvedById], references: [id])
}

model PartnerRegistration {
  id             String   @id @default(uuid())
  restaurantName String
  ownerName      String
  email          String   @unique
  mobile         String
  businessDetails String?
  status         String   @default("PENDING") 
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
`;

content = content.replace(/model User \{[\s\S]*?\}/, `model User {
  id                String                 @id @default(uuid())
  email             String                 @unique
  password          String?
  name              String
  roleId            String?
  role              Role?                  @relation(fields: [roleId], references: [id])
  restaurantId      String?
  restaurant        Restaurant?            @relation(fields: [restaurantId], references: [id])
  emailVerified     Boolean                @default(false)
  isActive          Boolean                @default(true)
  loyaltyPoints     Int                    @default(0)
  referralCode      String                 @unique @default(uuid())
  createdAt         DateTime               @default(now())
  updatedAt         DateTime               @updatedAt
  addresses         Address[]
  subscriptions     CustomerSubscription[]
  pointHistory      PointHistory[]
  referredBy        Referral?              @relation("ReferredBy")
  referralsMade     Referral[]             @relation("ReferralsMade")
  reviews           Review[]
  rewardRedemptions RewardRedemption[]
  supportTickets    SupportTicket[]
  auditLogs         AuditLog[]
  requestedApprovals ApprovalRequest[]     @relation("RequestedApprovals")
  approvedApprovals  ApprovalRequest[]     @relation("ApprovedApprovals")
}
` + newModels);

// Now apply restaurantId to specific models
const tablesToUpdate = ["TiffinMenu", "MenuItem", "CustomerSubscription", "Employee"];

for (const table of tablesToUpdate) {
  const regex = new RegExp(`(model ${table} \\{[\\s\\S]*?id\\s+String\\s+@id @default\\(uuid\\(\\)\\))`);
  content = content.replace(regex, `$1\n  restaurantId String?`);
}

fs.writeFileSync('prisma/schema.prisma', content);
console.log('Schema updated successfully!');
