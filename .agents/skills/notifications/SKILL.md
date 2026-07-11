---
name: notifications
description: >
  Multi-channel notification system for OneChoiceKitchen. Push via FCM, SMS via
  MSG91/Twilio, email via SendGrid, in-app via WebSocket. All dispatched through
  BullMQ queues. Load when implementing any notification-triggering feature.
---

# Notifications

## Channels
| Channel | Provider | Use Cases |
|---------|---------|-----------|
| Push (Mobile) | Firebase FCM | Order updates, assignments |
| Push (Web) | Firebase FCM | Order confirmations |
| SMS | MSG91 (India) / Twilio | OTP, urgent alerts |
| Email | SendGrid / SMTP | Order receipts, invoices |
| In-App | WebSocket (Socket.IO) | Real-time order tracking |

## Architecture

All notifications are dispatched asynchronously via BullMQ:
`
Event → NotificationService.dispatch() → BullMQ Queue → NotificationWorker → Channel Provider
`

Never send notifications synchronously in the API request handler.

## Queue Setup

`	ypescript
// notification.processor.ts
@Processor('notifications')
export class NotificationProcessor {
  @Process('push')
  async handlePush(job: Job<PushNotificationPayload>) {
    await this.fcm.send({
      token: job.data.fcmToken,
      notification: { title: job.data.title, body: job.data.body },
      data: job.data.metadata,
    });
  }

  @Process('sms')
  async handleSms(job: Job<SmsPayload>) {
    await this.msg91.sendSms(job.data.phone, job.data.message);
  }

  @Process('email')
  async handleEmail(job: Job<EmailPayload>) {
    await this.sendgrid.send({
      to: job.data.email,
      subject: job.data.subject,
      html: job.data.htmlContent,
    });
  }
}
`

## Dispatch Pattern

`	ypescript
// Dispatch notification (fire and forget)
async notifyOrderConfirmed(order: Order) {
  await this.notificationQueue.add('push', {
    fcmToken: order.user.fcmToken,
    title: 'Order Confirmed! 🎉',
    body: Your order from  is confirmed.,
    metadata: { orderId: order.id, type: 'ORDER_CONFIRMED' },
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
}
`

## Notification Preferences

Users can opt out of specific channels. Always check preferences before sending:
`	ypescript
const prefs = await this.userPrefsRepo.getNotificationPrefs(userId);
if (prefs.pushEnabled) await this.dispatchPush(...);
if (prefs.emailEnabled) await this.dispatchEmail(...);
if (prefs.smsEnabled) await this.dispatchSms(...);
`

## Local Development

Email preview: Maildev running on http://localhost:1080
Set SMTP_HOST=localhost and SMTP_PORT=1025 in .env.local

## Critical Rules
- Notification failures MUST NOT fail the parent business operation
- All notification jobs have retry: 3 attempts with exponential backoff
- FCM tokens stored per device, updated on each login
- OTP SMS expires in 5 minutes — enforce server-side
