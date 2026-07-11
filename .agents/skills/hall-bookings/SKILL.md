---
name: hall-bookings
description: >
  Party hall and venue booking system for OneChoiceKitchen restaurant partners.
  Covers venue management, event packages, booking workflow, customer quotes,
  deposit handling, and admin approval. Trigger when: implementing hall bookings,
  event packages, venue management, party bookings, or catering quotes.
---

# Hall Bookings Skill

## Module Overview

The Hall Bookings module allows restaurant partners to manage:
- **Venues** — banquet halls, rooftops, garden areas
- **Packages** — food + service bundles for events
- **Bookings** — customer event reservations

## Partner Portal Components

| Component | Tab | File |
|-----------|-----|------|
| Venue Management | `venues` | `pages/VenuesPartner.tsx` |
| Package Management | `packages` | `pages/PackagesPartner.tsx` |
| Booking Management | `hall_bookings` | `pages/BookingsPartner.tsx` |

## Business Rules

1. **Booking Flow**: Customer inquiry → Partner quote → Customer confirms → Deposit paid → Event day → Final payment
2. **Deposit**: 25% of total package cost upfront
3. **Cancellation**: 100% deposit refund if cancelled 72h+ before event; 50% if 24-72h; No refund within 24h
4. **Guest count**: Min 20, Max per venue capacity
5. **Advance booking**: Min 3 days ahead
6. **Package customization**: Add/remove items, dietary requirements (veg/non-veg/Jain)

## Prisma Models

```prisma
model Venue {
  id          String @id @default(cuid())
  name        String
  description String
  capacity    Int
  basePrice   Decimal
  amenities   String[] // ['AC', 'Projector', 'WiFi', 'Parking']
  images      String[]
  branchId    String
  isActive    Boolean @default(true)
  bookings    HallBooking[]
}

model EventPackage {
  id          String @id @default(cuid())
  name        String    // "Silver Wedding Package"
  description String
  pricePerPax Decimal
  minPax      Int
  maxPax      Int
  items       String[]  // menu items included
  branchId    String
  bookings    HallBooking[]
}

model HallBooking {
  id           String        @id @default(cuid())
  venueId      String
  packageId    String?
  customerId   String
  eventDate    DateTime
  guestCount   Int
  eventType    String        // Wedding, Birthday, Corporate, etc.
  status       BookingStatus // INQUIRY | QUOTED | CONFIRMED | DEPOSITED | COMPLETED | CANCELLED
  totalAmount  Decimal
  depositPaid  Decimal       @default(0)
  notes        String?
  createdAt    DateTime      @default(now())
}
```

## API Endpoints

```
GET    /api/halls/venues              # List venues (filterable by city, capacity)
GET    /api/halls/packages            # List event packages
POST   /api/halls/bookings            # Create booking inquiry
GET    /api/halls/bookings/:id        # Get booking details
PATCH  /api/halls/bookings/:id/quote  # Partner submits quote
PATCH  /api/halls/bookings/:id/confirm # Customer confirms
POST   /api/halls/bookings/:id/deposit # Record deposit payment
```

## Admin Routes

- Manage all venues: `case 'venues': return <VenuesAdmin />;`
- Manage packages: `case 'event_packages': return <EventPackagesAdmin />;`
- All bookings: `case 'hall_bookings_admin': return <HallBookingsAdmin />;`
