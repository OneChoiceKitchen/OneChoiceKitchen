const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const config = await prisma.aiConfig.findFirst({ where: { providerName: 'GEMINI' } });
  if (!config) {
    console.log('No config');
    return;
  }
  const key = config.apiKey;
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
