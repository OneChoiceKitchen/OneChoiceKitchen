import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { join } from 'path';
import * as nodemailer from 'nodemailer';

const dbPath = join(process.cwd(), 'dev.db');
const url = `file:${dbPath}`;
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Notifications...');

  // 1. Create Ethereal Mock Email Account
  console.log('Generating Ethereal Test Account...');
  const testAccount = await nodemailer.createTestAccount();
  console.log('Test Account created:', testAccount.user);

  // 2. Clear old configs
  await prisma.emailConfig.deleteMany({});
  await prisma.whatsappConfig.deleteMany({});
  await prisma.notificationTemplate.deleteMany({});

  // 3. Seed Email Config (Ethereal)
  await prisma.emailConfig.create({
    data: {
      providerName: 'SMTP',
      isActive: true,
      priority: 1,
      dailyLimit: 1000,
      config: {
        host: 'smtp.ethereal.email',
        port: 587,
        useTls: false,
        username: testAccount.user,
        password: testAccount.pass,
        fromEmail: testAccount.user,
        fromName: 'OneChoiceKitchen Mock'
      }
    }
  });
  console.log('✅ Seeded Email Config (Ethereal Mock)');

  // 4. Seed WhatsApp Config (Local Console)
  await prisma.whatsappConfig.create({
    data: {
      providerName: 'Local Console',
      isActive: true,
      priority: 1,
      dailyLimit: 500
    }
  });
  console.log('✅ Seeded WhatsApp Config (Local Console)');

  // 5. Seed Notification Templates
  const templates = [
    {
      eventName: 'RESERVATION_CUSTOMER_EMAIL',
      channel: 'EMAIL',
      subject: 'Table Reservation Confirmed!',
      body: 'Hello {{customerName}},\n\nYour table at {{restaurantName}} ({{branchName}}) is confirmed!\nDate: {{date}}\nTime: {{timeSlot}}\nParty Size: {{partySize}}\nConfirmation Code: {{confirmationCode}}\n\nThank you for choosing us!',
      isActive: true
    },
    {
      eventName: 'RESERVATION_CUSTOMER_WA',
      channel: 'WHATSAPP',
      body: 'Hello {{customerName}},\n\nYour table at {{restaurantName}} ({{branchName}}) is confirmed!\nDate: {{date}}\nTime: {{timeSlot}}\nParty Size: {{partySize}}\nConfirmation Code: {{confirmationCode}}\n\nThank you for choosing us!',
      isActive: true
    },
    {
      eventName: 'RESERVATION_ADMIN_EMAIL',
      channel: 'EMAIL',
      subject: 'New Table Reservation - Action Required',
      body: 'New Table Reservation!\n\nCustomer: {{customerName}} ({{customerPhone}})\nRestaurant: {{restaurantName}} ({{branchName}})\nDate: {{date}}\nTime: {{timeSlot}}\nParty Size: {{partySize}}\nConfirmation Code: {{confirmationCode}}',
      isActive: true
    },
    {
      eventName: 'RESERVATION_ADMIN_WA',
      channel: 'WHATSAPP',
      body: 'New Table Reservation!\n\nCustomer: {{customerName}} ({{customerPhone}})\nRestaurant: {{restaurantName}} ({{branchName}})\nDate: {{date}}\nTime: {{timeSlot}}\nParty Size: {{partySize}}\nConfirmation Code: {{confirmationCode}}',
      isActive: true
    },
    {
      eventName: 'TIFFIN_CUSTOMER_EMAIL',
      channel: 'EMAIL',
      subject: 'Tiffin Subscription Confirmed!',
      body: 'Hello {{customerName}},\n\nYour Tiffin Subscription ({{planName}}) is confirmed!\nStarts: {{startDate}}\n\nThank you for choosing One Choice Kitchen!',
      isActive: true
    },
    {
      eventName: 'TIFFIN_CUSTOMER_WA',
      channel: 'WHATSAPP',
      body: 'Hello {{customerName}},\n\nYour Tiffin Subscription ({{planName}}) is confirmed!\nStarts: {{startDate}}\n\nThank you for choosing One Choice Kitchen!',
      isActive: true
    },
    {
      eventName: 'TIFFIN_ADMIN_EMAIL',
      channel: 'EMAIL',
      subject: 'New Tiffin Subscription',
      body: 'New Tiffin Subscription!\n\nCustomer: {{customerName}} ({{customerPhone}})\nPlan: {{planName}}\nStarts: {{startDate}}',
      isActive: true
    },
    {
      eventName: 'TIFFIN_ADMIN_WA',
      channel: 'WHATSAPP',
      body: 'New Tiffin Subscription!\n\nCustomer: {{customerName}} ({{customerPhone}})\nPlan: {{planName}}\nStarts: {{startDate}}',
      isActive: true
    }
  ];

  for (const t of templates) {
    await prisma.notificationTemplate.create({ data: t });
  }
  console.log('✅ Seeded 8 Notification Templates');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n\n======================================================');
    console.log('Ethereal credentials are set!');
    console.log('If you want to view the sent emails, go to https://ethereal.email');
    console.log('and login with the credentials visible in your Admin Panel -> Email Configs');
    console.log('======================================================\n');
  });
