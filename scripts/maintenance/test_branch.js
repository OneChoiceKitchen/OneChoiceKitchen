const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.restaurantBranch.findFirst({
    include: { restaurant: true }
  });
  console.log(JSON.stringify(branch, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
