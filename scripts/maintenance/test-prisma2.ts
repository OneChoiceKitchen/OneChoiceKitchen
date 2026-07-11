import { PrismaClient } from '@prisma/client';
import { join } from 'path';

const dbPath = join(process.cwd(), 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

async function main() {
  try {
    const rewards = await prisma.reward.findMany();
    console.log('Rewards:', rewards);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
