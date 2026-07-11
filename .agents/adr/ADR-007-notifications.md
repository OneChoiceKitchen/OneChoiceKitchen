# ADR-007: Notification System Architecture

**Status**: Accepted
**Date**: 2026-07-01

---

## Decision

Use a multi-channel notification system with Firebase FCM (push), MSG91/Twilio (SMS), SendGrid/SMTP (email), and in-app WebSocket notifications, all dispatched via BullMQ queues.

---

## Context

OneChoiceKitchen generates notifications at every step of the order lifecycle: order confirmation, restaurant acceptance, rider assignment, delivery updates, and refunds. These must be reliable, fast, and not block API responses.

---

## Problem

Notification requirements:
- Customers need real-time order status updates (push + in-app)
- Partners need new order alerts immediately (push + sound)
- Riders need assignment notifications (push + SMS fallback)
- Admin needs SLA breach alerts (email + in-app)
- Notifications must be delivered even if the user's app is closed

---

## Options Considered

### Option 1: Synchronous notification in API handler
- ❌ Slow API responses (notification delivery adds latency)
- ❌ If notification fails, order creation fails
- ❌ No retry on failure

### Option 2: Single channel (email only)
- ❌ Customers don't check email for food orders
- ❌ Real-time updates impossible via email

### Option 3: Multi-channel async via BullMQ (selected)
- ✅ API returns immediately, notifications sent asynchronously
- ✅ BullMQ handles retry on failure
- ✅ Each channel independent (push can fail, SMS still sends)
- ✅ Notification preferences per user (opt-in/out)

---

## Final Decision

**Multi-channel notification system** with:
- Push: Firebase Cloud Messaging (FCM) — web + mobile
- SMS: MSG91 (India primary), Twilio (fallback/international)
- Email: SendGrid (transactional), Maildev (local dev)
- In-App: WebSocket via Socket.IO
- Queue: BullMQ with 3 retry attempts, exponential backoff

Notification flow:
`
Order Event → NotificationService → BullMQ Queue → Worker → Channel Provider
`

---

## Consequences

### Positive
- API responses are never delayed by notification delivery
- Failed notifications are automatically retried
- Users can opt out of specific channels

### Negative / Trade-offs
- Multiple third-party integrations to maintain
- Local development requires Maildev setup
- FCM tokens must be refreshed on each login

### Rules That Follow From This Decision
- All notifications dispatched via BullMQ queue — never inline
- Notification failures must be logged but must NOT fail the parent operation
- Every notification type has a corresponding queue worker
- Templates stored in code — not in a third-party system
