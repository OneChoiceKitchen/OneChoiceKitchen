# Table Reservations Functionality Document

This document outlines the architecture, flow, and components of the Table Reservations system in One Choice Kitchen.

## Overview

The Table Reservations system allows customers to book tables for dine-in at various restaurant branches. It features real-time availability checking, dynamic branch selection, and instant notifications via Email and WhatsApp for both customers and restaurant administrators.

## Core Features

### 1. Dynamic Restaurant & Branch Selection
- **Web App**: Customers navigate to the `/reservations` page. The first step involves selecting a restaurant and its specific branch. This data is fetched dynamically from the backend (`GET /api/branches/restaurants/all`).
- **Mobile App**: Similar dynamic selection is available in the `DineInTab` component.
- The UI ensures a smooth, guided flow with step indicators for selecting the location, date, time, and party size.

### 2. Availability Checking
- The backend verifies table availability for the selected date, time, and party size.
- It considers the branch's operating hours and existing reservations to prevent double-booking or overcapacity.

### 3. Automated Notifications
Upon successful booking, the system triggers real-time notifications:
- **Customer Notifications**:
  - Email confirmation containing reservation details.
  - WhatsApp message confirming the booking with a unique confirmation code.
- **Admin Notifications**:
  - Email notification sent to branch administrators (`RESTAURANT_ADMIN` role) and Super Admins.
  - WhatsApp message containing full reservation details (Date, Time, Party Size, Customer Name, Confirmation Code) to ensure prompt follow-up and preparation.
- Notification dispatching is handled asynchronously via the `NotificationsService` and `WhatsappService`.

### 4. Verification and Testing
The reservations flow is covered by comprehensive unit tests to ensure reliability:
- Controller tests (`reservations.controller.spec.ts`) verify API endpoints.
- Service tests (`reservations.service.spec.ts`) cover boundary conditions for availability logic.

## Technical Components

- **Frontend**:
  - `apps/web/app/reservations/page.tsx`: Main web reservation flow.
  - `apps/customer-mobile/src/app/components/DineInTab.tsx`: Mobile reservation flow.
- **Backend**:
  - `api/src/reservations/reservations.controller.ts`: API endpoints for reservations.
  - `api/src/reservations/reservations.service.ts`: Core business logic, availability checking, and triggering notifications.
  - `api/src/notifications/notifications.service.ts`: Generic email dispatching logic.
  - `api/src/whatsapp/whatsapp.service.ts`: WhatsApp messaging integration.

## Testing Guidelines

To verify the reservations functionality:
1. Run automated backend tests: `npm run test api -- --testPathPattern=reservations`
2. Perform manual end-to-end testing by making a reservation from the web or mobile client and verifying that emails and WhatsApp messages are dispatched correctly (check logs for sandbox/development environments).
