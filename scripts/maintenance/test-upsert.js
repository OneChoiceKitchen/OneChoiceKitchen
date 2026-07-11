const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const data = { providerName: 'GOOGLE_MAPS', apiKey: 'test_key', mapId: 'test_id', isActive: false };
    const { providerName, id, isActive, createdAt, updatedAt, ...rest } = data;
    const result = await prisma.mapsConfig.upsert({
      where: { providerName },
      update: rest,
      create: { providerName, ...rest, isActive: false }
    });
    console.log('Upsert successful:', result);
  } catch (err) {
    console.error('Error during upsert:', err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
