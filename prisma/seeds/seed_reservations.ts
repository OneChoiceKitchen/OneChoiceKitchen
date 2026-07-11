import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { join } from 'path';

const dbPath = join(process.cwd(), 'dev.db');
const url = `file:${dbPath}`;
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const branch = await prisma.restaurantBranch.findFirst({
    include: { restaurant: true }
  });
  
  if (!branch) {
    console.log('Branch not found!');
    return;
  }
  
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('User not found!');
    return;
  }
  
  console.log('Seeding for branch:', branch.name, branch.id);
  
  // Create tables
  for (let i = 1; i <= 3; i++) {
    const table = await prisma.restaurantTable.create({
      data: {
        tableNumber: 'Table ' + i,
        capacity: 4,
        isAvailable: i !== 1, // Make table 1 unavailable
        branchId: branch.id,
        restaurantId: branch.restaurant.id
      }
    });
    
    // Create an active reservation for table 1
    if (i === 1) {
      await prisma.tableReservation.create({
        data: {
          restaurantId: branch.restaurant.id,
          branchId: branch.id,
          userId: user.id,
          tableId: table.id,
          date: new Date(),
          timeSlot: '19:00',
          partySize: 2,
          status: 'SEATED',
          depositAmount: 500,
          depositStatus: 'PAID',
          confirmationCode: 'AX9B21'
        }
      });
      console.log('Created active reservation for Table 1');
    }
  }

  // Create a pending reservation
  await prisma.tableReservation.create({
    data: {
      restaurantId: branch.restaurant.id,
      branchId: branch.id,
      userId: user.id,
      date: new Date(),
      timeSlot: '20:00',
      partySize: 3,
      status: 'CONFIRMED',
      depositAmount: 500,
      depositStatus: 'PAID',
      confirmationCode: 'BQ8X12'
    }
  });

  // Create a waitlist entry
  await prisma.waitlist.create({
    data: {
      restaurantId: branch.restaurant.id,
      branchId: branch.id,
      userId: user.id,
      partySize: 4,
      status: 'WAITING',
      estimatedWaitTime: 25
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
