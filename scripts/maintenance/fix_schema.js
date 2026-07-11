const fs = require('fs');
let data = fs.readFileSync('prisma/schema.prisma', 'utf8');
data = data.replace(/model Order \{[\s\S]*?\}/g, '');
data = data.replace(/model OrderItem \{[\s\S]*?\}/g, '');
data += `
model Order {
  id String @id @default(uuid())
  userId String
  restaurantId String
  riderId String?
  status String @default("PENDING")
  totalAmount Float
  deliveryFee Float @default(0)
  tax Float @default(0)
  paymentMethod String @default("ONLINE")
  paymentStatus String @default("PENDING")
  deliveryAddress String
  deliveryLat Float?
  deliveryLng Float?
  specialInstructions String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user User @relation(fields: [userId], references: [id])
  restaurant Restaurant @relation(fields: [restaurantId], references: [id])
  items OrderItem[]
}

model OrderItem {
  id String @id @default(uuid())
  orderId String
  menuItemId String
  quantity Int
  price Float
  customizations String?
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem MenuItem @relation(fields: [menuItemId], references: [id])
}
`;
fs.writeFileSync('prisma/schema.prisma', data);
