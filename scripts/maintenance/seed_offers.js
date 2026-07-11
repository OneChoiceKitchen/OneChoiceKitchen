import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { join } from 'path';

async function main() {
  const dbPath = join(process.cwd(), 'dev.db');
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter });

  await prisma.tiffinOffer.createMany({
    data: [
      {
        title: 'Flat 10% Off on Monthly Tiffin',
        description: 'Get 10% discount when you book a monthly tiffin plan. Use this offer for healthy meals every day.',
        discountPct: 10,
        minBookings: 1,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        appliesToTiffin: true,
        appliesToMenu: false,
        appliesToHome: true,
        isHero: true,
        isActive: true,
      },
      {
        title: 'Flat 5% Off on Menu Orders',
        description: 'Order from our A La Carte menu and get a 5% discount on all orders!',
        discountPct: 5,
        minBookings: 1,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        appliesToTiffin: false,
        appliesToMenu: true,
        appliesToHome: true,
        isHero: false,
        isActive: true,
      },
      {
        title: 'Bulk Corporate Booking Discount',
        description: 'Get 15% off when you book for 10 or more people. Great for office lunches!',
        discountPct: 15,
        minBookings: 10,
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        appliesToTiffin: true,
        appliesToMenu: true,
        appliesToHome: false,
        isHero: false,
        isActive: true,
      }
    ]
  });

  console.log('Successfully seeded offers');
}

main().catch(console.error);
