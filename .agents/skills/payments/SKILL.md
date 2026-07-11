---
name: payments
description: >
  Payment integration standards for OneChoiceKitchen using Razorpay as primary
  payment gateway. Covers order payment flow, refunds, webhooks, and idempotency.
  Load when building any payment or billing feature.
---

# Payments

## Payment Gateway: Razorpay (Primary)

OneChoiceKitchen uses Razorpay for all online payments in India.

## Supported Payment Methods
- UPI (Google Pay, PhonePe, BHIM)
- Debit/Credit Cards
- Net Banking
- Razorpay Wallet
- EMI
- Cash on Delivery (COD) — handled separately, no Razorpay

## Payment Flow

`
1. Customer clicks "Pay"
2. Backend creates Razorpay Order (amount in paise)
3. Frontend opens Razorpay checkout modal
4. Customer completes payment
5. Razorpay sends success callback to frontend
6. Frontend sends payment_id + order_id + signature to backend
7. Backend verifies signature (HMAC SHA256)
8. Backend captures payment (if not auto-captured)
9. Backend updates order status to CONFIRMED
10. Webhook received as backup confirmation
`

## Server-Side Implementation

`	ypescript
// Create Razorpay order
async createPaymentOrder(orderId: string, amount: number) {
  const razorpayOrder = await this.razorpay.orders.create({
    amount: Math.round(amount * 100), // Convert to paise
    currency: 'INR',
    receipt: orderId,
    payment_capture: true, // Auto-capture
  });
  return razorpayOrder;
}

// Verify payment signature (ALWAYS verify before confirming order)
verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(${razorpayOrderId}|)
    .digest('hex');
  return expectedSignature === signature;
}
`

## Idempotency Rules

**CRITICAL**: Payment operations must be idempotent.
- Never charge a customer twice for the same order
- Use Razorpay order ID as idempotency key
- Check if payment already captured before attempting capture
- Razorpay order IDs are unique per order attempt

## Refunds

`	ypescript
async initiateRefund(paymentId: string, amount: number, reason: string) {
  const refund = await this.razorpay.payments.refund(paymentId, {
    amount: Math.round(amount * 100), // paise
    speed: 'optimum', // 'normal' (3-5 days) or 'optimum' (instant if possible)
    notes: { reason },
  });
  return refund;
}
`

## Webhooks

Configure Razorpay webhook for these events:
- payment.captured — confirm order
- payment.failed — mark order as PAYMENT_FAILED
- efund.processed — update refund status

Webhook verification:
`	ypescript
verifyWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}
`

## Security Rules
- NEVER expose RAZORPAY_KEY_SECRET to the frontend
- ALWAYS verify payment signature server-side before confirming order
- Store only Razorpay payment IDs — never store card numbers
- Razorpay checkout runs in Razorpay's iframe — never in your own form
