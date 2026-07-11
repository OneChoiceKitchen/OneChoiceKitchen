import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.tiffinTerm.deleteMany({});

  const terms = [
    {
      title: '1. Tiffin Box & Packaging Policy | टिफ़िन बॉक्स और पैकेजिंग नियम',
      contentEn: 'To ensure hygiene and reduce plastic waste, customers must provide their own tiffin boxes.\nPlease write your **Name, Mobile No, and Location** clearly on the box. If you forget your box, a minor **packaging fee of ₹15 per meal** will be applied.',
      contentHi: 'हम इको-फ्रेंडली सेवा को बढ़ावा देते हैं, इसलिए **कृपया अपना टिफ़िन साथ लाएं।**\nटिफ़िन पर अपना **नाम, मोबाइल नंबर और लोकेशन** स्पष्ट लिखें। टिफ़िन न होने पर कंटेनर लागत के रूप में **प्रति भोजन ₹15 का पैकेजिंग शुल्क** लागू होगा।',
      order: 1
    },
    {
      title: '2. Pause Your Plan (Absences) | प्लान रोकना (अनुपस्थिति नियम)',
      contentEn: 'Going out of town? Let us know in advance!\nIf you pause your service for **more than 5 consecutive days**, we will happily carry forward your balance to the next month.\n*Note: Pauses of 5 days or less cannot be adjusted.*',
      contentHi: 'शहर से बाहर जा रहे हैं? हमें पहले सूचित करें!\nलगातार **5 दिन से अधिक** की अनुपस्थिति पर आपका पैसा ख़ुशी-ख़ुशी अगले महीने एडजस्ट कर दिया जाएगा।\n*नोट: 5 दिन या उससे कम पर एडजस्टमेंट लागू नहीं होगा।*',
      order: 2
    },
    {
      title: '3. Trial Meals | ट्रायल (Trial) भोजन',
      contentEn: 'Want to taste before committing? Trial meals are billed at standard rates + delivery (₹40 up to 3KM) + packaging (₹15).\nIf you upgrade to a monthly plan, we will deduct the **food cost** of your trial from your fee! *(Delivery & packaging are non-refundable).*',
      contentHi: 'ट्रायल भोजन रेगुलर रेट + डिलीवरी (₹40) + पैकेजिंग (₹15) शुल्क पर उपलब्ध है।\nट्रायल के बाद मासिक प्लान लेने पर, केवल **भोजन का शुल्क** आपके मासिक प्लान से कम कर दिया जाएगा! *(अन्य शुल्क रिफंड नहीं होंगे)।*',
      order: 3
    },
    {
      title: '4. Advance Payments | एडवांस भुगतान',
      contentEn: 'Since you are availing the discounted monthly meal plan, **you have to pay the full month\'s payment in advance.** Else, we will not be able to provide the service to you.',
      contentHi: 'चूँकि आप मासिक भोजन योजना का लाभ उठा रहे हैं, इसलिए **आपको पूरे महीने का एडवांस भुगतान करना होगा**, अन्यथा हम आपको सेवा प्रदान नहीं कर पाएंगे।',
      order: 4
    }
  ];

  for (const term of terms) {
    await prisma.tiffinTerm.create({ data: term });
  }

  console.log('Seeded TiffinTerms successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
