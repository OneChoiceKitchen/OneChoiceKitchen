const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.staticPage.findMany();
  console.log("Static Pages:", pages);
}

main().catch(console.error).finally(() => prisma.$disconnect());
