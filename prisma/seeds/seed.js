const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.findFirst({
    where: { name: { contains: 'ramkrishna', mode: 'insensitive' } },
    include: { restaurant: true }
  });
  
  if (!branch) {
    const allBranches = await prisma.branch.findMany({ include: { restaurant: true } });
    console.log('Branch not found! Here are the available branches:', allBranches.map(b => b.name));
    return;
  }
  
  console.log('Found branch:', branch.name, branch.id, 'Restaurant:', branch.restaurant.name, branch.restaurant.id);
  
  for (let i = 1; i <= 4; i++) {
    await prisma.table.create({
      data: {
        tableNumber: 'Table ' + i,
        capacity: 4,
        status: 'AVAILABLE',
        branchId: branch.id,
        restaurantId: branch.restaurant.id
      }
    });
    console.log('Created table T' + i);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
