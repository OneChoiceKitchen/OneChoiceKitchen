# Table Reservation Enhancements - Technical Design

## Overview
This document details the architectural upgrades to the physical dine-in experience at One Choice Kitchen. The enhancements aim to digitize the end-to-end flow for dine-in customers, connecting table reservations, real-time waitlists, pre-ordering, and QR check-in workflows.

## Key Features

1. **Automated Table Availability Engine**
   - **Goal:** Prevent double-booking of physical tables and provide real-time availability checks.
   - **Logic:** Link `TableReservation` directly to `RestaurantTable`. When a customer searches for a slot, the system queries overlapping reservations for the specified duration to compute free capacity.

2. **Reservation Deposits & Pre-authorization**
   - **Goal:** Reduce no-shows by securing tables financially.
   - **Logic:** Add `depositAmount` and `depositStatus` to `TableReservation`. Integration with the payment gateway to capture funds during the booking flow and apply them against the final `Order`.

3. **Dine-In Pre-Ordering**
   - **Goal:** Reduce wait times and improve table turnover by allowing customers to order ahead.
   - **Logic:** Introduce the `DINE_IN` order type in the `Order` model. Customers can browse the menu and checkout a `DINE_IN` order linked to their `TableReservation`. The kitchen is notified when the reservation status changes to `SEATED`.

4. **QR Code Check-In**
   - **Goal:** Streamline the arrival experience.
   - **Logic:** Customers scan the table's QR code. The system validates their `confirmationCode` and updates the reservation from `CONFIRMED` to `SEATED`. Pre-orders attached to the reservation are automatically dispatched to the kitchen display system.

5. **Waitlist ETA Prediction**
   - **Goal:** Provide transparency for walk-in customers.
   - **Logic:** Calculate average turnover times and query currently `SEATED` reservations to provide an estimated wait time `estimatedWaitTime` to customers entering the `Waitlist`.

## Database Schema Changes

```prisma
model TableReservation {
  id               String            @id @default(uuid())
  // ... existing fields
  tableId          String?           // New: Link to physical table
  depositAmount    Float?            // New: Deposit amount paid
  depositStatus    String            @default("PENDING") // PENDING, PAID, REFUNDED
  
  // Relations
  table            RestaurantTable?  @relation(fields: [tableId], references: [id])
  orders           Order[]           // New: Support pre-ordering
}

model RestaurantTable {
  // ... existing fields
  reservations     TableReservation[] // New: Reverse relation
  orders           Order[]            // New: Walk-in orders
}

model Waitlist {
  // ... existing fields
  estimatedWaitTime Int?             // New: Display ETA to user in minutes
}

model Order {
  // ... existing fields
  orderType          String            @default("DELIVERY") // DELIVERY, TAKEAWAY, DINE_IN
  tableReservationId String?           // New: Link dine-in order to a reservation
  tableId            String?           // New: Link dine-in order directly to a table (walk-ins)

  // Relations
  tableReservation   TableReservation? @relation(fields: [tableReservationId], references: [id])
  table              RestaurantTable?  @relation(fields: [tableId], references: [id])
}
```

## API Workflows

### 1. Booking a Table
`POST /api/reservations`
- Check real-time table availability based on date, time, and party size.
- If pre-order items are passed, generate an `Order` object with `orderType = DINE_IN`.
- Generate a payment intent for `depositAmount` (or order total if pre-ordering).

### 2. QR Code Check-In
`POST /api/reservations/check-in`
- **Body:** `{ "qrCodeUrl": "qr-uuid", "confirmationCode": "1234" }`
- Validates the QR code matches the branch/table.
- Updates reservation status to `SEATED`.
- Updates `Order` status to `ACCEPTED` to alert the kitchen.

### 3. Joining the Waitlist
`POST /api/waitlist`
- Calculate `estimatedWaitTime` by finding the next soonest table that will finish dining based on an average 90-minute dining duration.
- Return ETA in response.
