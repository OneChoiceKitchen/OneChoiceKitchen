const fs = require('fs');
const appendText = `
// ==========================================
// PARTY & FUNCTION BOOKING MODULE
// ==========================================

model EventCategory {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  bookings    HallBooking[]
}

model Hall {
  id            String   @id @default(uuid())
  restaurantId  String?
  name          String
  description   String?
  capacity      Int
  pricePerHour  Float
  pricePerDay   Float
  images        String?  // JSON array
  videos        String?  // JSON array
  locationLat   Float?
  locationLng   Float?
  address       String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  bookings      HallBooking[]
  amenities     VenueAmenity[]
  reviews       VenueReview[]
}

model VenueAmenity {
  id        String   @id @default(uuid())
  hallId    String
  name      String
  icon      String?
  createdAt DateTime @default(now())

  hall      Hall     @relation(fields: [hallId], references: [id], onDelete: Cascade)
}

model FoodPackage {
  id            String   @id @default(uuid())
  name          String
  description   String?
  type          String   @default("VEG") // VEG, NON_VEG, MIXED
  pricePerPlate Float
  minGuests     Int      @default(10)
  maxGuests     Int?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  items         FoodPackageItem[]
  bookings      HallBooking[]
}

model FoodPackageItem {
  id            String   @id @default(uuid())
  packageId     String
  name          String
  category      String   // Starter, Main Course, Dessert, Beverage
  isOptional    Boolean  @default(false)
  extraPrice    Float    @default(0)

  package       FoodPackage @relation(fields: [packageId], references: [id], onDelete: Cascade)
}

model HallBooking {
  id              String   @id @default(uuid())
  userId          String
  hallId          String
  eventCategoryId String
  foodPackageId   String?
  
  eventDate       DateTime
  startTime       String?
  endTime         String?
  guestCount      Int
  durationHours   Int?

  status          String   @default("REQUESTED") // REQUESTED, APPROVED, PAYMENT_PENDING, CONFIRMED, CANCELLED
  
  basePrice       Float
  foodPrice       Float    @default(0)
  decorPrice      Float    @default(0)
  taxAmount       Float    @default(0)
  discountAmount  Float    @default(0)
  totalAmount     Float
  advancePaid     Float    @default(0)

  specialRequests String?
  cancellationReason String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User          @relation(fields: [userId], references: [id])
  hall            Hall          @relation(fields: [hallId], references: [id])
  eventCategory   EventCategory @relation(fields: [eventCategoryId], references: [id])
  foodPackage     FoodPackage?  @relation(fields: [foodPackageId], references: [id])
  invoice         BookingInvoice?
}

model BookingInvoice {
  id             String   @id @default(uuid())
  bookingId      String   @unique
  invoiceNumber  String   @unique
  amount         Float
  tax            Float
  total          Float
  status         String   @default("UNPAID") // UNPAID, PARTIAL, PAID
  issuedAt       DateTime @default(now())
  dueDate        DateTime?
  paidAt         DateTime?
  paymentGatewayRef String?
  
  booking        HallBooking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model VenueReview {
  id          String   @id @default(uuid())
  hallId      String
  userId      String
  rating      Int
  comment     String?
  photos      String?  // JSON array
  createdAt   DateTime @default(now())
  
  hall        Hall     @relation(fields: [hallId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id])
}
`;
fs.appendFileSync('prisma/schema.prisma', appendText);
console.log('Appended schema successfully.');
