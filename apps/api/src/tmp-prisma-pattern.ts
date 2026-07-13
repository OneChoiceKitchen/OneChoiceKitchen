import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function testConfigs(configs: any[]) {
  for (const config of configs) {
    await prisma.emailConfig.update({
      where: { id: config.id },
      data: {
        isActive: config.isActive,
        priority: config.priority,
        dailyLimit: config.dailyLimit,
        config: config.config,
      },
    });
  }
}
