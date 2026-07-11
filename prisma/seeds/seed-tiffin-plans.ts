import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Tiffin Plans...');

  // 1. Tiffin Global Settings
  const settings = await prisma.tiffinGlobalSetting.findFirst();
  if (!settings) {
    await prisma.tiffinGlobalSetting.create({
      data: {
        deliveryIncludedKm: 3,
        extraKmCharge: 8,
        shopPickupDiscountPct: 5,
        notesText: "Customers are required to bring their own tiffin/lunch box. The management reserves the right to modify or decide the day and type of juice/shake under the special offer without prior notice."
      }
    });
    console.log('Created Global Settings');
  }

  // 2. Tiffin Plans
  const plansData = [
    { name: '3 TIMES DAILY', dietType: 'VEG', mealsPerDay: 3, totalMeals: 90, monthlyPrice: 5500, pricePerMeal: 61, isBestValue: false },
    { name: '2 TIMES DAILY', dietType: 'VEG', mealsPerDay: 2, totalMeals: 60, monthlyPrice: 4000, pricePerMeal: 67, isBestValue: true },
    { name: 'BREAKFAST ONLY', dietType: 'VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 1500, pricePerMeal: 50, isBestValue: false },
    { name: 'LUNCH ONLY', dietType: 'VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 2500, pricePerMeal: 83, isBestValue: false },
    { name: 'DINNER ONLY', dietType: 'VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 2500, pricePerMeal: 83, isBestValue: false },
    
    { name: '3 TIMES DAILY', dietType: 'NON_VEG', mealsPerDay: 3, totalMeals: 90, monthlyPrice: 7000, pricePerMeal: 78, isBestValue: false },
    { name: '2 TIMES DAILY', dietType: 'NON_VEG', mealsPerDay: 2, totalMeals: 60, monthlyPrice: 5000, pricePerMeal: 83, isBestValue: true },
    { name: 'BREAKFAST ONLY', dietType: 'NON_VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 1600, pricePerMeal: 53, isBestValue: false },
    { name: 'LUNCH ONLY', dietType: 'NON_VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 3000, pricePerMeal: 100, isBestValue: false },
    { name: 'DINNER ONLY', dietType: 'NON_VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 3000, pricePerMeal: 100, isBestValue: false },
  ];

  for (const plan of plansData) {
    const existing = await prisma.tiffinPlan.findFirst({
      where: { name: plan.name, dietType: plan.dietType }
    });
    if (!existing) {
      await prisma.tiffinPlan.create({ data: plan });
      console.log(`Created plan: ${plan.dietType} - ${plan.name}`);
    } else {
      await prisma.tiffinPlan.update({
        where: { id: existing.id },
        data: plan
      });
      console.log(`Updated plan: ${plan.dietType} - ${plan.name}`);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
