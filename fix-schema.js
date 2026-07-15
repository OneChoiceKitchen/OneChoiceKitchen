const fs = require('fs');

// Read the file as raw bytes
const buffer = fs.readFileSync('prisma/schema.prisma');
let validEnd = buffer.length;

// Look for the first null byte, which marks the start of the corrupted append
for (let i = 0; i < buffer.length; i++) {
  if (buffer[i] === 0x00) {
    validEnd = i;
    break;
  }
}

// Slice out the corrupted part and convert to string
let validContent = buffer.slice(0, validEnd).toString('utf8');

// The valid content should end with the PartnerDeleteRequest model
// Let's make sure we cut it cleanly
const lastIndex = validContent.lastIndexOf('}');
if (lastIndex > -1) {
  validContent = validContent.substring(0, lastIndex + 1) + '\n';
}

const appendText = `
enum ItemType {
  FOOD_ORDERING
  DINE_IN
  HALL_BOOKING
  CAKE
  DECORATION
  PHOTOGRAPHY
}

enum DietaryPreference {
  VEG
  NON_VEG
  VEGAN
  GLUTEN_FREE
}

model MenuCategory {
  id          String     @id @default(uuid())
  tenantId    String
  branchId    String?
  name        String
  description String?
  isActive    Boolean    @default(true)
  sortOrder   Int        @default(0)
  items       MenuItem[]

  @@index([tenantId])
  @@index([branchId])
  @@map("cat_menu_categories")
}

model InventoryItem {
  id            String                 @id @default(uuid())
  tenantId      String
  branchId      String?
  name          String
  sku           String                 @unique
  unitOfMeasure String
  currentStock  Float                  @default(0)
  reorderLevel  Float                  @default(0)
  mappings      MenuInventoryMapping[]

  @@index([tenantId])
  @@index([branchId])
  @@map("cat_inventory_items")
}

model MenuInventoryMapping {
  id              String        @id @default(uuid())
  menuItemId      String
  inventoryItemId String
  quantityRequired Float
  menuItem        MenuItem      @relation(fields: [menuItemId], references: [id])
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])

  @@index([menuItemId])
  @@index([inventoryItemId])
  @@map("cat_menu_inventory_mappings")
}
`;

fs.writeFileSync('prisma/schema.prisma', validContent + appendText, 'utf8');
console.log('Fixed schema.prisma successfully');
