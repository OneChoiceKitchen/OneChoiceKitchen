import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';

const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Tiffin Plans...');

  // Clear and re-seed plans with exact values from PDF
  await prisma.tiffinPlan.deleteMany();
  await prisma.tiffinPlan.createMany({
    data: [
      // VEG Plans
      { name: '3 TIMES DAILY', dietType: 'VEG', mealsPerDay: 3, totalMeals: 90, monthlyPrice: 5500, pricePerMeal: 61, isBestValue: false, isActive: true },
      { name: '2 TIMES DAILY', dietType: 'VEG', mealsPerDay: 2, totalMeals: 60, monthlyPrice: 4000, pricePerMeal: 67, isBestValue: true, isActive: true },
      { name: 'BREAKFAST ONLY', dietType: 'VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 1500, pricePerMeal: 50, isBestValue: false, isActive: true },
      { name: 'LUNCH ONLY', dietType: 'VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 2500, pricePerMeal: 83, isBestValue: false, isActive: true },
      { name: 'DINNER ONLY', dietType: 'VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 2500, pricePerMeal: 83, isBestValue: false, isActive: true },
      // NON-VEG Plans
      { name: '3 TIMES DAILY', dietType: 'NON_VEG', mealsPerDay: 3, totalMeals: 90, monthlyPrice: 7000, pricePerMeal: 78, isBestValue: false, isActive: true },
      { name: '2 TIMES DAILY', dietType: 'NON_VEG', mealsPerDay: 2, totalMeals: 60, monthlyPrice: 5000, pricePerMeal: 83, isBestValue: true, isActive: true },
      { name: 'BREAKFAST ONLY', dietType: 'NON_VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 1600, pricePerMeal: 53, isBestValue: false, isActive: true },
      { name: 'LUNCH ONLY', dietType: 'NON_VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 3000, pricePerMeal: 100, isBestValue: false, isActive: true },
      { name: 'DINNER ONLY', dietType: 'NON_VEG', mealsPerDay: 1, totalMeals: 30, monthlyPrice: 3000, pricePerMeal: 100, isBestValue: false, isActive: true },
    ]
  });
  console.log('✅ Plans seeded (10 plans)');

  // Seed Global Settings with correct PDF values
  console.log('🌱 Seeding Global Settings...');
  await prisma.tiffinGlobalSetting.upsert({
    where: { id: 'default' },
    update: {
      deliveryIncludedKm: 3,
      extraKmCharge: 8,
      shopPickupDiscountPct: 5,
      breakfastTime: '7 - 10 AM',
      lunchTime: '12 - 3 PM',
      dinnerTime: '7 - 10 PM',
      trialDeliveryFee: 40,
      trialPackagingFee: 15,
      minPauseDays: 5,
      businessName: 'ONE CHOICE KITCHEN',
      businessAddress: 'MADHUBAN COLONY, NEAR ABHIYANTA NAGAR, PATNA - 27',
      contactNumbers: '6299230165 / 7004838102',
      notesText: 'Customers are required to bring their own tiffin/lunch box. The management reserves the right to modify or decide the day and type of juice/shake offer without prior notice.',
      paymentInstructions: 'Please verify the name Ms Preety Kumari before making the payment. If the name differs, contact us immediately!',
      advancePaymentRequired: true,
    },
    create: {
      id: 'default',
      deliveryIncludedKm: 3,
      extraKmCharge: 8,
      shopPickupDiscountPct: 5,
      breakfastTime: '7 - 10 AM',
      lunchTime: '12 - 3 PM',
      dinnerTime: '7 - 10 PM',
      trialDeliveryFee: 40,
      trialPackagingFee: 15,
      minPauseDays: 5,
      businessName: 'ONE CHOICE KITCHEN',
      businessAddress: 'MADHUBAN COLONY, NEAR ABHIYANTA NAGAR, PATNA - 27',
      contactNumbers: '6299230165 / 7004838102',
      notesText: 'Customers are required to bring their own tiffin/lunch box. The management reserves the right to modify or decide the day and type of juice/shake offer without prior notice.',
      paymentInstructions: 'Please verify the name Ms Preety Kumari before making the payment. If the name differs, contact us immediately!',
      advancePaymentRequired: true,
    }
  });
  console.log('✅ Global settings seeded');

  // Seed Terms from PDF
  console.log('🌱 Seeding Terms & Conditions...');
  const existingTerms = await prisma.tiffinTerm.count();
  if (existingTerms === 0) {
    await prisma.tiffinTerm.createMany({
      data: [
        {
          title: '1. Tiffin Box & Packaging Policy|टिफिन बॉक्स और पैकेजिंग नियम',
          contentEn: 'To ensure hygiene and reduce plastic waste, **customers must provide their own tiffin boxes**.\n\nPlease write your **Name, Mobile No, and Location** clearly on the box. If you forget your box, a minor **packaging fee of ₹15 per meal** will be applied.',
          contentHi: 'हम इको-फ्रेंडली सेवा को बढ़ावा देते हैं, इसलिए **कृपया अपना टिफिन साथ लाएं।**\n\nटिफिन पर अपना **नाम, मोबाइल नंबर और लोकेशन** स्पष्ट लिखें। टिफिन ना होने पर कंटेनर लागत के रूप में **प्रति भोजन ₹15 का पैकेजिंग शुल्क** लागू होगा।',
          order: 1,
          isActive: true,
        },
        {
          title: '2. Pause Your Plan (Absences)|प्लान रोकना (अनुपस्थित नियम)',
          contentEn: 'Going out of town? Let us know in advance!\n\nIf you pause your service for **more than 5 consecutive days**, we will happily carry forward your balance to the next month.\n\n*Note: Pauses of 5 days or less cannot be adjusted.*',
          contentHi: 'शहर से बाहर जा रहे हैं? हमें पहले सूचित करें!\n\nलगातार **5 दिन से अधिक** की अनुपस्थिति पर आपका पैसा खुशी-खुशी अगले महीने एडजस्ट कर दिया जाएगा।\n\n*नोट: 5 दिन या उससे कम पर एडजस्टमेंट लागू नहीं होगा।*',
          order: 2,
          isActive: true,
        },
        {
          title: '3. Trial Meals|ट्रायल (Trial) भोजन',
          contentEn: 'Want to taste before committing? Trial meals are billed at standard rates + delivery (₹40 up to 3KM) + packaging (₹15).\n\nIf you upgrade to a monthly plan, we will deduct the **food cost** of your trial from your fee! *(Delivery & packaging are non-refundable).*',
          contentHi: 'ट्रायल भोजन रेगुलर रेट + डिलीवरी (₹40) + पैकेजिंग (₹15) शुल्क पर उपलब्ध है।\n\nट्रायल के बाद मासिक प्लान लेने पर, केवल **भोजन का शुल्क** आपके मासिक प्लान से कम कर दिया जाएगा! *(अन्य शुल्क रिफंड नहीं होंगे)।*',
          order: 3,
          isActive: true,
        },
        {
          title: '4. Advance Payments|एडवांस भुगतान',
          contentEn: 'Since you are availing the discounted monthly meal plan, **you have to pay the full month\'s payment in advance**. Else, we will not be able to provide the service to you.',
          contentHi: 'चूंकि आप मासिक भोजन योजना का लाभ उठा रहे हैं, इसलिए **आपको पूरे महीने का एडवांस भुगतान करना होगा**, अन्यथा हम आपको सेवा प्रदान नहीं कर पाएंगे।',
          order: 4,
          isActive: true,
        },
      ]
    });
    console.log('✅ Terms seeded (4 terms from PDF)');
  } else {
    console.log(`ℹ️  Terms already exist (${existingTerms} found), skipping.`);
  }

  // Seed the Last Sunday Holiday rule
  console.log('🌱 Seeding Holidays...');
  const existingHolidays = await prisma.tiffinHoliday.count();
  if (existingHolidays === 0) {
    await prisma.tiffinHoliday.create({
      data: {
        title: 'Last Sunday of the Month – Holiday (No Service)',
        isRecurring: true,
        recurringRule: 'LAST_SUNDAY_OF_MONTH',
        isActive: true,
      }
    });
    console.log('✅ Holiday rule seeded (Last Sunday of Month)');
  } else {
    console.log(`ℹ️  Holidays already exist (${existingHolidays} found), skipping.`);
  }

  // Seed Offers from PDF / images
  console.log('🌱 Seeding Offers...');
  const existingOffers = await prisma.tiffinOffer.count();
  if (existingOffers === 0) {
    await prisma.tiffinOffer.createMany({
      data: [
        {
          title: '10% Discount on Monthly Booking',
          description: 'Get 10% off when you book for a full month in advance.',
          discountPct: 10,
          minBookings: 1,
          imageUrl: '/images/tiffin/offer-4.jpg',
          isActive: true,
        },
        {
          title: '15% Off on Min. 2 Bookings',
          description: 'Book for 2 people and save 15% on the total.',
          discountPct: 15,
          minBookings: 2,
          imageUrl: '/images/tiffin/offer-1.jpg',
          isActive: true,
        },
        {
          title: 'Up to 30% Corporate Bulk Discount',
          description: 'Exclusive discount for corporate bulk bookings.',
          discountPct: 30,
          minBookings: 10,
          imageUrl: '/images/tiffin/offer-2.jpg',
          isActive: true,
        },
        {
          title: 'Free Fresh Juice or Shake Every Week',
          description: 'Enjoy one free fresh juice or shake every week as part of your subscription.',
          discountPct: 0,
          minBookings: 0,
          imageUrl: '/images/tiffin/offer-3.jpg',
          isActive: true,
        },
      ]
    });
    console.log('✅ Offers seeded (4 offers)');
  } else {
    console.log(`ℹ️  Offers already exist (${existingOffers} found), skipping.`);
  }

  // Seed Weekly Menu from PDF
  console.log('🌱 Seeding Weekly Menu...');
  const existingMenus = await prisma.tiffinMenu.count();
  if (existingMenus === 0) {
    const vegMenuData = [
      // MON
      { dayOfWeek: 'Mon', mealType: 'Breakfast', dietType: 'VEG', name: '2 Alloo Paratha + Seasonal Chanti + Salad' },
      { dayOfWeek: 'Mon', mealType: 'Lunch', dietType: 'VEG', name: 'Rice + Dal + 2 Roti + Seasonal Sabzi + Salad' },
      { dayOfWeek: 'Mon', mealType: 'Dinner', dietType: 'VEG', name: 'Veg Pulao + Tadka Daal + Raita' },
      // TUE
      { dayOfWeek: 'Tue', mealType: 'Breakfast', dietType: 'VEG', name: '5 Poori + Seasonal Sabji + Salad' },
      { dayOfWeek: 'Tue', mealType: 'Lunch', dietType: 'VEG', name: 'Rajma + Chawal + 2 Roti + Salad' },
      { dayOfWeek: 'Tue', mealType: 'Dinner', dietType: 'VEG', name: '4 Roti + Mix Veg + Salad' },
      // WED
      { dayOfWeek: 'Wed', mealType: 'Breakfast', dietType: 'VEG', name: '2 Paneer Paratha + Seasonal Chanti + Salad' },
      { dayOfWeek: 'Wed', mealType: 'Lunch', dietType: 'VEG', name: 'Kadi + Rice + 2 Roti + Salad' },
      { dayOfWeek: 'Wed', mealType: 'Dinner', dietType: 'VEG', name: 'Rice + Tadka Dal + 2 Roti + Seasonal Sabzi + Salad' },
      // THU
      { dayOfWeek: 'Thu', mealType: 'Breakfast', dietType: 'VEG', name: '5 Idli + Sambar + Chatni' },
      { dayOfWeek: 'Thu', mealType: 'Lunch', dietType: 'VEG', name: 'Tarka Dal + Rice + 2 Roti + Salad' },
      { dayOfWeek: 'Thu', mealType: 'Dinner', dietType: 'VEG', name: 'Paneer Rice + 2 Paratha' },
      // FRI
      { dayOfWeek: 'Fri', mealType: 'Breakfast', dietType: 'VEG', name: 'Normal Paratha + Seasonal Bhuiya' },
      { dayOfWeek: 'Fri', mealType: 'Lunch', dietType: 'VEG', name: 'Mix Veg + Pulao + Dal + Salad' },
      { dayOfWeek: 'Fri', mealType: 'Dinner', dietType: 'VEG', name: 'Mix Veg + Fried Rice' },
      // SAT
      { dayOfWeek: 'Sat', mealType: 'Breakfast', dietType: 'VEG', name: 'Poha / Upma' },
      { dayOfWeek: 'Sat', mealType: 'Lunch', dietType: 'VEG', name: 'Khichdi + Chokha + Papad' },
      { dayOfWeek: 'Sat', mealType: 'Dinner', dietType: 'VEG', name: 'Fried Rice + Manchurian + Salad' },
      // SUN
      { dayOfWeek: 'Sun', mealType: 'Breakfast', dietType: 'VEG', name: '2 Litti / Katchori + Seasonal Sabji + Onion' },
      { dayOfWeek: 'Sun', mealType: 'Lunch', dietType: 'VEG', name: 'Paneer Sabzi + Rice + Dal + Salad' },
      { dayOfWeek: 'Sun', mealType: 'Dinner', dietType: 'VEG', name: 'Dal Tadka + Jeera Rice + Salad' },
    ];

    const nonVegMenuData = [
      // MON
      { dayOfWeek: 'Mon', mealType: 'Breakfast', dietType: 'NON_VEG', name: '2 Alloo Paratha + Seasonal Chanti + Salad' },
      { dayOfWeek: 'Mon', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Rice + Dal + 2 Roti + Seasonal Sabzi + Salad' },
      { dayOfWeek: 'Mon', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Veg Pulao + Tadka Daal + Raita' },
      // TUE
      { dayOfWeek: 'Tue', mealType: 'Breakfast', dietType: 'NON_VEG', name: '5 Poori + Seasonal Sabji + Salad' },
      { dayOfWeek: 'Tue', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Rajma + Chawal + 2 Roti + Salad' },
      { dayOfWeek: 'Tue', mealType: 'Dinner', dietType: 'NON_VEG', name: '4 Roti + Mix Veg + Salad' },
      // WED – Non-Veg has egg items
      { dayOfWeek: 'Wed', mealType: 'Breakfast', dietType: 'NON_VEG', name: '2 Egg Omelet / Poha' },
      { dayOfWeek: 'Wed', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Egg Curry + Rice + 2 Roti + Salad' },
      { dayOfWeek: 'Wed', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Mix Veg Fried Rice + Omlette Curry + Salad' },
      // THU
      { dayOfWeek: 'Thu', mealType: 'Breakfast', dietType: 'NON_VEG', name: '5 Idli + Sambar + Chatni' },
      { dayOfWeek: 'Thu', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Tarka Dal + Rice + 2 Roti + Salad' },
      { dayOfWeek: 'Thu', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Paneer Rice + 2 Paratha' },
      // FRI – Non-Veg has fish
      { dayOfWeek: 'Fri', mealType: 'Breakfast', dietType: 'NON_VEG', name: 'Normal Paratha + Seasonal Bhuiya' },
      { dayOfWeek: 'Fri', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Fish Curry + Rice' },
      { dayOfWeek: 'Fri', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Mix Veg + Fried Rice' },
      // SAT
      { dayOfWeek: 'Sat', mealType: 'Breakfast', dietType: 'NON_VEG', name: 'Poha / Upma' },
      { dayOfWeek: 'Sat', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Khichdi + Chokha + Papad' },
      { dayOfWeek: 'Sat', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Fried Rice + Manchurian + Salad' },
      // SUN – Non-Veg has chicken
      { dayOfWeek: 'Sun', mealType: 'Breakfast', dietType: 'NON_VEG', name: '2 Litti / Katchori + Seasonal Sabji + Onion' },
      { dayOfWeek: 'Sun', mealType: 'Lunch', dietType: 'NON_VEG', name: 'Chicken Curry + Rice + 2 Roti + Salad' },
      { dayOfWeek: 'Sun', mealType: 'Dinner', dietType: 'NON_VEG', name: 'Dal Tadka + Jeera Rice + Salad' },
    ];

    await prisma.tiffinMenu.createMany({ data: [...vegMenuData, ...nonVegMenuData].map(d => ({ ...d, price: 0, isAvailable: true })) });
    console.log(`✅ Weekly menu seeded (${vegMenuData.length + nonVegMenuData.length} items)`);
  } else {
    console.log(`ℹ️  Menu items already exist (${existingMenus} found), skipping.`);
  }

  console.log('\n🎉 All seeding complete!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
