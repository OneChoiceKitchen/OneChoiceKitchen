const http = require('http');

const API_BASE = 'http://localhost:3000/api';

const postData = (path, data) => {
  return new Promise((resolve, reject) => {
    const postBody = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postBody)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch(e) {
            resolve(body);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postBody);
    req.end();
  });
};

const USER_ID = 'demo-user-id';

async function seedRewards() {
  console.log('Seeding Rewards...');
  const rewards = [
    { name: '10% Off Your Next Tiffin', description: 'Get a quick discount on your next meal plan.', pointsRequired: 500, rewardType: 'COUPON', code: 'OFF10' },
    { name: 'Free Mango Lassi', description: 'Beat the heat with a free chilled mango lassi.', pointsRequired: 300, rewardType: 'PHYSICAL_ITEM', code: 'FREELASSI' },
    { name: '₹200 Off Weekly Plan', description: 'Discount for regular subscribers.', pointsRequired: 1000, rewardType: 'COUPON', code: 'WEEK200' },
    { name: 'Free Samosa Plate', description: 'A plate of crispy samosas with chutney.', pointsRequired: 400, rewardType: 'PHYSICAL_ITEM', code: 'SAMOSA400' },
    { name: '1 Free Premium Dinner', description: 'Upgrade your standard dinner to premium free of cost.', pointsRequired: 1500, rewardType: 'FREE_MEAL', code: 'PREMDINN' },
    { name: '₹50 Cashback on Order', description: 'Instant wallet cashback.', pointsRequired: 250, rewardType: 'COUPON', code: 'CASH50' },
    { name: 'Free Chole Bhature', description: 'Enjoy our signature Chole Bhature on Sunday.', pointsRequired: 1200, rewardType: 'FREE_MEAL', code: 'CHOLE1200' },
    { name: '25% Off Monthly Plan', description: 'Massive discount for monthly loyalists.', pointsRequired: 2500, rewardType: 'COUPON', code: 'MONTH25' },
    { name: 'Complimentary Dessert', description: 'Pick any dessert from the menu.', pointsRequired: 600, rewardType: 'PHYSICAL_ITEM', code: 'DESSERT600' },
    { name: 'VIP Priority Delivery', description: 'Skip the queue and get your food first.', pointsRequired: 800, rewardType: 'COUPON', code: 'VIPDELIVERY' }
  ];

  for (const reward of rewards) {
    await postData('/loyalty/admin/rewards', reward);
  }
}

async function seedReferrals() {
  console.log('Seeding Referrals...');
  const referrals = [
    { referredEmail: 'amit.sharma@example.com', status: 'COMPLETED', rewardPoints: 500, referrerId: USER_ID },
    { referredEmail: 'priya.patel@example.com', status: 'COMPLETED', rewardPoints: 500, referrerId: USER_ID },
    { referredEmail: 'rahul.verma@example.com', status: 'PENDING', rewardPoints: 500, referrerId: USER_ID },
    { referredEmail: 'sneha.singh@example.com', status: 'COMPLETED', rewardPoints: 500, referrerId: USER_ID },
    { referredEmail: 'rohit.kumar@example.com', status: 'CANCELLED', rewardPoints: 500, referrerId: USER_ID },
    { referredEmail: 'neha.gupta@example.com', status: 'PENDING', rewardPoints: 500, referrerId: USER_ID },
    { referredEmail: 'vikas.yadav@example.com', status: 'COMPLETED', rewardPoints: 500, referrerId: USER_ID },
    { referredEmail: 'anjali.rao@example.com', status: 'PENDING', rewardPoints: 500, referrerId: USER_ID },
    { referredEmail: 'karan.jain@example.com', status: 'COMPLETED', rewardPoints: 500, referrerId: USER_ID },
    { referredEmail: 'meera.iyer@example.com', status: 'COMPLETED', rewardPoints: 500, referrerId: USER_ID }
  ];

  for (const ref of referrals) {
    // Wait, the API endpoint for referrals is slightly different.
    // The POST /api/referrals creates a new referral code for a user, or a referral record.
    // Let's create an endpoint in the API for admin seeding or just post directly.
    // Ah, wait. POST /api/referrals handles { referrerId, referredEmail }.
    await postData('/referrals', ref);
  }
}

async function seedReviews() {
  console.log('Seeding Reviews...');
  const reviews = [
    { customerName: 'Harshita S.', rating: 5, comment: 'Extremely soft butter chicken tender meat in a perfectly balanced rich gravy! Fresh and hot delivery in less than 20 minutes.', userId: USER_ID },
    { customerName: 'Manish K.', rating: 4, comment: 'Manchurian gravy has a fantastic tanginess, but noodles were slightly spicy. Reheating container made serving very easy.', userId: USER_ID },
    { customerName: 'Deepak Rao', rating: 5, comment: 'Subscribed to daily homestyle meal tiffin service. Highly regular, clean non-greasy home style cooking. Highly recommended!', userId: USER_ID },
    { customerName: 'Sushmita B.', rating: 3, comment: 'Food was good but delivery was 15 minutes late today.', userId: USER_ID },
    { customerName: 'Arjun N.', rating: 5, comment: 'Best Paneer Tikka in town. Portions are massive.', userId: USER_ID },
    { customerName: 'Ravi P.', rating: 5, comment: 'The packaging is top notch and eco-friendly. Highly impressed.', userId: USER_ID },
    { customerName: 'Sneha M.', rating: 4, comment: 'Loved the weekend special Biryani. Will order again.', userId: USER_ID },
    { customerName: 'Pooja V.', rating: 5, comment: 'Consistent quality over the last 3 months. My entire office orders from here.', userId: USER_ID },
    { customerName: 'Vivek S.', rating: 4, comment: 'Affordable and tasty. The app makes ordering super easy.', userId: USER_ID },
    { customerName: 'Anil D.', rating: 5, comment: 'I have tried 5 different tiffin services, and this is by far the most authentic home-style food.', userId: USER_ID }
  ];

  for (const review of reviews) {
    await postData('/reviews', review);
  }
}

async function seedTicketsAndFaqs() {
  console.log('Seeding Tickets...');
  const tickets = [
    { title: 'Tiffin delivery time slot adjustment', category: 'Delivery', priority: 'MEDIUM', description: 'Requesting to move my standard veg tiffin lunch delivery from 1:00 PM to 12:30 PM.', userId: USER_ID },
    { title: 'Stripe subscription invoice copy', category: 'Billing', priority: 'LOW', description: 'Could not download the official tax invoice for my May monthly subscription receipt.', userId: USER_ID },
    { title: 'Allergy information missing', category: 'Technical', priority: 'HIGH', description: 'The app does not show peanut allergy info on the new desserts.', userId: USER_ID },
    { title: 'Change subscription to Non-Veg', category: 'Subscription', priority: 'MEDIUM', description: 'I want to switch my current veg plan to the non-veg plan starting Monday.', userId: USER_ID },
    { title: 'Food was too spicy today', category: 'Kitchen Quality', priority: 'LOW', description: 'The Dal tadka was very spicy today, please note to keep it mild for my profile.', userId: USER_ID },
    { title: 'Promo code not applying', category: 'Billing', priority: 'MEDIUM', description: 'The WEEK200 promo code is throwing an error.', userId: USER_ID },
    { title: 'Missing item in delivery', category: 'Delivery', priority: 'HIGH', description: 'My order did not include the extra Roti I paid for.', userId: USER_ID },
    { title: 'Pause subscription for 3 days', category: 'Subscription', priority: 'MEDIUM', description: 'Going out of town, please pause delivery from Wed to Fri.', userId: USER_ID },
    { title: 'App crashes on checkout', category: 'Technical', priority: 'HIGH', description: 'When I click pay via UPI, the app crashes.', userId: USER_ID },
    { title: 'Corporate bulk order inquiry', category: 'Subscription', priority: 'LOW', description: 'Need 50 tiffins daily for my office staff. Is there a discount?', userId: USER_ID }
  ];

  for (const ticket of tickets) {
    await postData('/support/tickets', ticket);
  }

  console.log('Seeding FAQs...');
  const faqs = [
    { question: 'What time is the daily tiffin delivered?', answer: 'Lunch is delivered between 12:00 PM - 1:30 PM, and Dinner between 7:30 PM - 9:00 PM.' },
    { question: 'Can I skip a meal?', answer: 'Yes, you can skip a meal from the app up to 4 hours before the delivery time. The amount is credited to your wallet.' },
    { question: 'Do you use refined oil?', answer: 'No, we only use cold-pressed mustard oil, groundnut oil, and pure ghee for our preparations.' },
    { question: 'How do loyalty points work?', answer: 'You earn 1 point for every ₹10 spent. Points can be redeemed for discounts and free items in the Loyalty Store.' },
    { question: 'Is the packaging microwave safe?', answer: 'Yes, all our food-grade plastic containers are microwave safe. Just remember to remove the lid before heating.' },
    { question: 'Do you offer Jain food?', answer: 'Yes, we have a dedicated Jain menu option with no onion or garlic.' },
    { question: 'What is the referral bonus?', answer: 'When your friend completes their first order using your code, both of you receive 500 bonus points.' },
    { question: 'Can I change my delivery address at work?', answer: 'Yes, you can have multiple addresses saved and choose the delivery location daily.' },
    { question: 'How is the food kept warm?', answer: 'We deliver in thermal insulated bags ensuring food reaches you piping hot.' },
    { question: 'What if I am not satisfied with the food?', answer: 'We have a 100% satisfaction guarantee. If you did not like a meal, raise a support ticket and we will refund that meal.' }
  ];

  for (const faq of faqs) {
    await postData('/support/faqs', faq);
  }
}

async function run() {
  try {
    await seedRewards();
    await seedReferrals();
    await seedReviews();
    await seedTicketsAndFaqs();
    console.log('All modules seeded successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

run();
