import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { join } from 'path';

const dbPath = join(process.cwd(), 'dev.db');
const url = `file:${dbPath}`;
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  const tables = await prisma.restaurantTable.findMany({
    include: { reservations: true }
  });
  
  console.log('Current Tables:');
  tables.forEach(t => console.log(`- ID: ${t.id}, Number: "${t.tableNumber}", Reservations: ${t.reservations.length}`));
  
  let kept = new Set();
  
  for (const t of tables) {
    let newNumber = t.tableNumber.replace(/^(Table|T)\s*/i, '').trim();
    if (!newNumber) newNumber = '1';
    
    if (!kept.has(newNumber)) {
      kept.add(newNumber);
      if (t.tableNumber !== newNumber) {
        console.log(`Renaming ${t.tableNumber} to ${newNumber}`);
        await prisma.restaurantTable.update({
          where: { id: t.id },
          data: { tableNumber: newNumber }
        });
      }
    } else {
      if (t.reservations.length > 0) {
        let tempNumber = newNumber + '-dup';
        await prisma.restaurantTable.update({
          where: { id: t.id },
          data: { tableNumber: tempNumber }
        });
        console.log(`Renamed to ${tempNumber}`);
      } else {
        console.log(`Deleting duplicate table ${t.tableNumber}`);
        await prisma.restaurantTable.delete({ where: { id: t.id } });
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
