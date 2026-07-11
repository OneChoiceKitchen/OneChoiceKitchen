import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { join } from 'path';

const dbPath = join(process.cwd(), 'dev.db');
const url = `file:${dbPath}`;
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const originalTable1 = await prisma.restaurantTable.findFirst({
    where: { tableNumber: '1' }
  });
  
  const dupTable = await prisma.restaurantTable.findFirst({
    where: { tableNumber: '1-dup' },
    include: { reservations: true }
  });
  
  if (originalTable1 && dupTable) {
    console.log(`Moving reservations from ${dupTable.id} to ${originalTable1.id}`);
    
    // Update reservations
    await prisma.tableReservation.updateMany({
      where: { tableId: dupTable.id },
      data: { tableId: originalTable1.id }
    });
    
    // Delete dup table
    console.log(`Deleting ${dupTable.tableNumber}`);
    await prisma.restaurantTable.delete({
      where: { id: dupTable.id }
    });
    
    // Mark original table as unavailable
    await prisma.restaurantTable.update({
      where: { id: originalTable1.id },
      data: { isAvailable: false }
    });
    
    console.log('Cleanup successful');
  } else {
    console.log('Could not find tables to merge');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
