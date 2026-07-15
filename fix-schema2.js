const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Find the second "model InventoryItem {"
const firstIdx = content.indexOf('model InventoryItem {');
const secondIdx = content.indexOf('model InventoryItem {', firstIdx + 1);

if (secondIdx > -1) {
  content = content.substring(0, secondIdx);
}

// Ensure MenuInventoryMapping is appended, but check if it's already there before secondIdx
if (!content.includes('model MenuInventoryMapping {')) {
  content += `
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
}

fs.writeFileSync('prisma/schema.prisma', content, 'utf8');
console.log('Removed duplicate InventoryItem');
