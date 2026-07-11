import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const adapter = new PrismaBetterSqlite3({ url: path.join(process.cwd(), 'dev.db') });
const prisma = new PrismaClient({ adapter });

const imageDir = path.join(__dirname, '../apps/web/public/images/tiffin');

// Helper to find the actual filename with timestamp
function getImagePath(prefix: string): string | null {
  try {
    const files = fs.readdirSync(imageDir);
    const match = files.find((f: string) => f.startsWith(prefix) && f.endsWith('.png'));
    return match ? `/images/tiffin/${match}` : null;
  } catch (e) {
    console.error('Error reading image dir:', e);
    return null;
  }
}

const MENU_DATA = [
  // MONDAY - VEG
  { dayOfWeek: 'Mon', mealType: 'Breakfast', dietType: 'VEG', name: '2 Alloo Paratha + Seasonal Chutney + Salad', imagePrefix: 'tiffin_paratha' },
  { dayOfWeek: 'Mon', mealType: 'Lunch', dietType: 'VEG', name: 'Rice + Dal + 2 Roti + Seasonal Sabzi + Salad', imagePrefix: 'tiffin_veg_thali' },
  { dayOfWeek: 'Mon', mealType: 'Dinner', dietType: 'VEG', name: 'Veg Pulao + Tadka Daal + Raita', imagePrefix: 'tiffin_pulao_raita' },
  // MONDAY - NON-VEG (Same as Veg)
  { dayOfWeek: 'Mon', mealType: 'Breakfast', dietType: 'NON_VEG', name: '2 Alloo Paratha + Seasonal Chutney + Salad', imagePrefix: 'tiffin_paratha' },
  { dayOfWeek: 'Mon', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Rice + Dal + 2 Roti + Seasonal Sabzi + Salad', imagePrefix: 'tiffin_veg_thali' },
  { dayOfWeek: 'Mon', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Veg Pulao + Tadka Daal + Raita', imagePrefix: 'tiffin_pulao_raita' },

  // TUESDAY - VEG
  { dayOfWeek: 'Tue', mealType: 'Breakfast', dietType: 'VEG', name: '5 Poori + Seasonal Sabji + Salad', imagePrefix: 'tiffin_poori_sabji' },
  { dayOfWeek: 'Tue', mealType: 'Lunch', dietType: 'VEG', name: 'Rajma + Chawal + 2 Roti + Salad', imagePrefix: 'tiffin_rajma_chawal' },
  { dayOfWeek: 'Tue', mealType: 'Dinner', dietType: 'VEG', name: '4 Roti + Mix Veg + Salad', imagePrefix: 'tiffin_veg_thali' },
  // TUESDAY - NON-VEG (Same as Veg)
  { dayOfWeek: 'Tue', mealType: 'Breakfast', dietType: 'NON_VEG', name: '5 Poori + Seasonal Sabji + Salad', imagePrefix: 'tiffin_poori_sabji' },
  { dayOfWeek: 'Tue', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Rajma + Chawal + 2 Roti + Salad', imagePrefix: 'tiffin_rajma_chawal' },
  { dayOfWeek: 'Tue', mealType: 'Dinner', dietType: 'NON_VEG', name: '4 Roti + Mix Veg + Salad', imagePrefix: 'tiffin_veg_thali' },

  // WEDNESDAY - VEG
  { dayOfWeek: 'Wed', mealType: 'Breakfast', dietType: 'VEG', name: '2 Paneer Paratha + Seasonal Chutney + Salad', imagePrefix: 'tiffin_paratha' },
  { dayOfWeek: 'Wed', mealType: 'Lunch', dietType: 'VEG', name: 'Kadi + Rice + 2 Roti + Salad', imagePrefix: 'tiffin_kadi_chawal' },
  { dayOfWeek: 'Wed', mealType: 'Dinner', dietType: 'VEG', name: 'Rice + Tadka Dal + 2 Roti + Seasonal Sabzi + Salad', imagePrefix: 'tiffin_veg_thali' },
  // WEDNESDAY - NON-VEG
  { dayOfWeek: 'Wed', mealType: 'Breakfast', dietType: 'NON_VEG', name: '2 Egg Omelet / Poha', imagePrefix: 'tiffin_poha' },
  { dayOfWeek: 'Wed', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Egg Curry + Rice + 2 Roti + Salad', imagePrefix: 'tiffin_egg_curry' },
  { dayOfWeek: 'Wed', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Mix Veg Fried Rice + Omelette Curry + Salad', imagePrefix: 'tiffin_chinese' },

  // THURSDAY - VEG
  { dayOfWeek: 'Thu', mealType: 'Breakfast', dietType: 'VEG', name: '5 Idli + Sambar + Chatni', imagePrefix: 'tiffin_idli_sambar' },
  { dayOfWeek: 'Thu', mealType: 'Lunch', dietType: 'VEG', name: 'Tarka Dal + Rice + 2 Roti + Salad', imagePrefix: 'tiffin_veg_thali' },
  { dayOfWeek: 'Thu', mealType: 'Dinner', dietType: 'VEG', name: 'Paneer Rice + 2 Paratha', imagePrefix: 'tiffin_paratha' },
  // THURSDAY - NON-VEG (Same as Veg)
  { dayOfWeek: 'Thu', mealType: 'Breakfast', dietType: 'NON_VEG', name: '5 Idli + Sambar + Chatni', imagePrefix: 'tiffin_idli_sambar' },
  { dayOfWeek: 'Thu', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Tarka Dal + Rice + 2 Roti + Salad', imagePrefix: 'tiffin_veg_thali' },
  { dayOfWeek: 'Thu', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Paneer Rice + 2 Paratha', imagePrefix: 'tiffin_paratha' },

  // FRIDAY - VEG
  { dayOfWeek: 'Fri', mealType: 'Breakfast', dietType: 'VEG', name: 'Normal Paratha + Seasonal Bhuiya', imagePrefix: 'tiffin_paratha' },
  { dayOfWeek: 'Fri', mealType: 'Lunch', dietType: 'VEG', name: 'Mix Veg + Pulao + Dal + Salad', imagePrefix: 'tiffin_pulao_raita' },
  { dayOfWeek: 'Fri', mealType: 'Dinner', dietType: 'VEG', name: 'Mix Veg + Fried Rice', imagePrefix: 'tiffin_chinese' },
  // FRIDAY - NON-VEG
  { dayOfWeek: 'Fri', mealType: 'Breakfast', dietType: 'NON_VEG', name: 'Normal Paratha + Seasonal Bhuiya', imagePrefix: 'tiffin_paratha' },
  { dayOfWeek: 'Fri', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Fish Curry + Rice', imagePrefix: 'tiffin_fish_curry' },
  { dayOfWeek: 'Fri', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Mix Veg + Fried Rice', imagePrefix: 'tiffin_chinese' },

  // SATURDAY - VEG
  { dayOfWeek: 'Sat', mealType: 'Breakfast', dietType: 'VEG', name: 'Poha / Upma', imagePrefix: 'tiffin_poha' },
  { dayOfWeek: 'Sat', mealType: 'Lunch', dietType: 'VEG', name: 'Khichdi + Chokha + Papad', imagePrefix: 'tiffin_khichdi' },
  { dayOfWeek: 'Sat', mealType: 'Dinner', dietType: 'VEG', name: 'Fried Rice + Manchurian + Salad', imagePrefix: 'tiffin_chinese' },
  // SATURDAY - NON-VEG (Same as Veg)
  { dayOfWeek: 'Sat', mealType: 'Breakfast', dietType: 'NON_VEG', name: 'Poha / Upma', imagePrefix: 'tiffin_poha' },
  { dayOfWeek: 'Sat', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Khichdi + Chokha + Papad', imagePrefix: 'tiffin_khichdi' },
  { dayOfWeek: 'Sat', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Fried Rice + Manchurian + Salad', imagePrefix: 'tiffin_chinese' },

  // SUNDAY - VEG
  { dayOfWeek: 'Sun', mealType: 'Breakfast', dietType: 'VEG', name: '2 Litti / Katchori + Seasonal Sabji + Onion', imagePrefix: 'tiffin_litti' },
  { dayOfWeek: 'Sun', mealType: 'Lunch', dietType: 'VEG', name: 'Paneer Sabzi + Rice + Dal + Salad', imagePrefix: 'tiffin_veg_thali' },
  { dayOfWeek: 'Sun', mealType: 'Dinner', dietType: 'VEG', name: 'Dal Tadka + Jeera Rice + Salad', imagePrefix: 'tiffin_veg_thali' },
  // SUNDAY - NON-VEG
  { dayOfWeek: 'Sun', mealType: 'Breakfast', dietType: 'NON_VEG', name: '2 Litti / Katchori + Seasonal Sabji + Onion', imagePrefix: 'tiffin_litti' },
  { dayOfWeek: 'Sun', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Chicken Curry + Rice + 2 Roti + Salad', imagePrefix: 'tiffin_chicken_curry' },
  { dayOfWeek: 'Sun', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Dal Tadka + Jeera Rice + Salad', imagePrefix: 'tiffin_veg_thali' },
];

async function seed() {
  console.log('Seeding TiffinMenu...');
  
  // Clear existing records
  await prisma.tiffinMenu.deleteMany({});
  console.log('Cleared existing TiffinMenu records.');

  for (const item of MENU_DATA) {
    const imageUrl = getImagePath(item.imagePrefix);
    
    await prisma.tiffinMenu.create({
      data: {
        name: item.name,
        mealType: item.mealType,
        dietType: item.dietType,
        dayOfWeek: item.dayOfWeek,
        image: imageUrl || null,
        isAvailable: true,
        price: 150 // default generic price
      }
    });
    console.log(`Added [${item.dayOfWeek} ${item.mealType} ${item.dietType}]: ${item.name}`);
  }
  
  console.log('Done!');
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
