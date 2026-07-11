const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { join } = require('path');

const dbPath = join(__dirname, '../dev.db');
const url = `file:${dbPath}`;
const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function run() {
  const restaurant = await prisma.restaurant.findFirst({
    where: { name: { contains: 'One Choice Kitchen' } }
  });
  
  if (!restaurant) {
    console.log("Restaurant not found.");
    return;
  }
  
  console.log("Found restaurant:", restaurant.id, restaurant.name);
  
  const branch = await prisma.restaurantBranch.findFirst({
    where: { restaurantId: restaurant.id }
  });
  
  const branchId = branch ? branch.id : null;
  console.log("Found branch:", branchId);
  
  const result = await prisma.menuItem.updateMany({
    data: {
      restaurantId: restaurant.id,
      branchId: branchId
    }
  });
  
  console.log("Updated menu items:", result.count);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
