const fetch = require('node-fetch'); // Use global fetch if Node 18+

const BASE_URL = 'http://localhost:3000/api';

const rewards = [
  { name: 'Free Dessert', description: 'Get a free Gulab Jamun or Rasgulla with your next meal.', pointsCost: 500, type: 'DISCOUNT', imageUrl: 'https://images.unsplash.com/photo-1596450514735-392bf9892c90?w=800&q=80', isActive: true },
  { name: '10% Off Order', description: 'Flat 10% discount on any order above ₹500.', pointsCost: 1000, type: 'DISCOUNT', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', isActive: true },
  { name: 'Free Delivery', description: 'Waive off delivery charges for one order.', pointsCost: 300, type: 'FREE_ITEM', imageUrl: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=800&q=80', isActive: true },
  { name: 'Extra Paneer Portion', description: 'Add an extra portion of Paneer to any sabzi.', pointsCost: 400, type: 'FREE_ITEM', imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80', isActive: true },
  { name: 'Buy 1 Get 1 Thali', description: 'Buy one Executive Thali, get another absolutely free.', pointsCost: 2500, type: 'BOGO', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', isActive: true },
  { name: '₹100 Cashback', description: 'Get ₹100 added to your wallet.', pointsCost: 1000, type: 'CASHBACK', imageUrl: 'https://images.unsplash.com/photo-1580519542036-ed47f3e42d6c?w=800&q=80', isActive: true },
  { name: 'Free Garlic Bread', description: 'A side of garlic bread with any Italian fusion meal.', pointsCost: 450, type: 'FREE_ITEM', imageUrl: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=800&q=80', isActive: true },
  { name: '20% Off Weekend Order', description: 'Special 20% discount on Saturday or Sunday.', pointsCost: 1500, type: 'DISCOUNT', imageUrl: 'https://images.unsplash.com/photo-1414235077428-33898dd14582?w=800&q=80', isActive: true },
  { name: 'Free Beverage', description: 'Choice of Lassi, Buttermilk, or Soft Drink.', pointsCost: 250, type: 'FREE_ITEM', imageUrl: 'https://images.unsplash.com/photo-1527661591450-b444d9cdd732?w=800&q=80', isActive: true },
  { name: 'VIP Priority Delivery', description: 'Skip the queue and get your meal delivered faster.', pointsCost: 800, type: 'EXPERIENCE', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', isActive: true },
  { name: 'Chef Special Starter', description: 'Surprise starter prepared by our head chef.', pointsCost: 1200, type: 'FREE_ITEM', imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80', isActive: true }
];

const faqs = [
  { question: 'What is your delivery radius?', answer: 'We deliver up to 15km from our central kitchen.', category: 'Delivery', order: 1, isActive: true },
  { question: 'Do you offer vegan options?', answer: 'Yes! We have a dedicated vegan menu with over 20 items.', category: 'Food', order: 2, isActive: true },
  { question: 'How does the tiffin subscription work?', answer: 'You can subscribe for 7, 15, or 30 days. Meals are delivered daily at your preferred time.', category: 'Subscriptions', order: 3, isActive: true },
  { question: 'Can I cancel my subscription anytime?', answer: 'Yes, cancellations are allowed with a 24-hour notice. The remaining balance will be refunded.', category: 'Subscriptions', order: 4, isActive: true },
  { question: 'Is the packaging eco-friendly?', answer: 'Absolutely. We use 100% biodegradable bagasse containers for all our meals.', category: 'General', order: 5, isActive: true },
  { question: 'How are loyalty points calculated?', answer: 'You earn 1 point for every ₹10 spent on our platform.', category: 'Loyalty', order: 6, isActive: true },
  { question: 'Do you cater for large events?', answer: 'Yes, we offer bulk catering for parties of up to 500 people. Please contact support.', category: 'Catering', order: 7, isActive: true },
  { question: 'What payment methods do you accept?', answer: 'We accept UPI, Credit/Debit cards, Net Banking, and Sodexo meal passes.', category: 'Payments', order: 8, isActive: true },
  { question: 'How do I use a referral code?', answer: 'Enter the referral code during signup to instantly receive 500 bonus points.', category: 'Referrals', order: 9, isActive: true },
  { question: 'Can I pause my tiffin subscription?', answer: 'Yes, you can pause your subscription for up to 5 days a month.', category: 'Subscriptions', order: 10, isActive: true }
];

const reviews = [
  { userId: 'user-1', authorName: 'Ravi Verma', rating: 5, content: 'Absolutely love the homestyle meals. Reminds me of my mother\'s cooking!', isVerifiedPurchase: true },
  { userId: 'user-2', authorName: 'Priya Sharma', rating: 4, content: 'Great food, but delivery was a bit late on Saturday. Otherwise perfect.', isVerifiedPurchase: true },
  { userId: 'user-3', authorName: 'Amit Singh', rating: 5, content: 'The loyalty program is highly rewarding. I get a free dessert almost every week.', isVerifiedPurchase: true },
  { userId: 'user-4', authorName: 'Sneha Gupta', rating: 5, content: 'Eco-friendly packaging is a huge plus for me. The paneer tikka is highly recommended.', isVerifiedPurchase: true },
  { userId: 'user-5', authorName: 'Karan Patel', rating: 3, content: 'Decent food. Portions could be slightly bigger for the price.', isVerifiedPurchase: true },
  { userId: 'user-6', authorName: 'Meera Iyer', rating: 5, content: 'Subscribed to the monthly tiffin plan. Total lifesaver for a busy professional.', isVerifiedPurchase: true },
  { userId: 'user-7', authorName: 'Vikram Chawla', rating: 4, content: 'Customer support was very helpful when I needed to change my delivery address at the last minute.', isVerifiedPurchase: false },
  { userId: 'user-8', authorName: 'Neha Desai', rating: 5, content: 'Best North Indian food in the city, hands down. The packaging keeps it piping hot.', isVerifiedPurchase: true },
  { userId: 'user-9', authorName: 'Arjun Reddy', rating: 5, content: 'The UI of the app is super smooth. Ordering takes less than 30 seconds.', isVerifiedPurchase: true },
  { userId: 'user-10', authorName: 'Pooja Bhatia', rating: 4, content: 'Good variety in the weekly menu. I never get bored of eating here.', isVerifiedPurchase: true }
];

const tickets = [
  { userId: 'demo-user-id', subject: 'Change Delivery Address', message: 'Hi, I recently moved. How do I update my default delivery address for my ongoing tiffin subscription?', priority: 'MEDIUM', type: 'GENERAL' },
  { userId: 'demo-user-id', subject: 'Missing Item in Order #492', message: 'I ordered a Thali but the extra papad I paid for was missing. Please refund the amount.', priority: 'HIGH', type: 'ORDER_ISSUE' },
  { userId: 'user-44', subject: 'App Crashing on Checkout', message: 'Every time I try to apply a promo code, the app freezes.', priority: 'HIGH', type: 'TECHNICAL' },
  { userId: 'user-55', subject: 'Corporate Catering Inquiry', message: 'We have a corporate event for 50 people next week. Can you provide a custom menu?', priority: 'LOW', type: 'GENERAL' },
  { userId: 'demo-user-id', subject: 'Loyalty Points Not Credited', message: 'I completed an order yesterday but the 150 points are not showing in my account.', priority: 'MEDIUM', type: 'BILLING' },
  { userId: 'user-77', subject: 'Cancel Subscription', message: 'I am traveling for a month. Please cancel my active subscription and refund the remaining days.', priority: 'HIGH', type: 'BILLING' },
  { userId: 'user-88', subject: 'Feedback on Dal Makhani', message: 'The dal was a bit too spicy today. Just sharing some feedback for the chef.', priority: 'LOW', type: 'FEEDBACK' },
  { userId: 'demo-user-id', subject: 'Referral Bonus Missing', message: 'My friend used my code but I did not get the 500 bonus points.', priority: 'MEDIUM', type: 'GENERAL' },
  { userId: 'user-11', subject: 'Allergy Request', message: 'Please ensure no nuts are used in my upcoming weekend order.', priority: 'HIGH', type: 'ORDER_ISSUE' },
  { userId: 'user-22', subject: 'Payment Failed but Money Deducted', message: 'I paid via UPI, the money left my bank but the order says payment failed.', priority: 'HIGH', type: 'BILLING' }
];

const referrals = [
  { referrerId: 'demo-user-id', referredId: 'new-user-101', status: 'COMPLETED', rewardPoints: 500 },
  { referrerId: 'demo-user-id', referredId: 'new-user-102', status: 'PENDING', rewardPoints: 500 },
  { referrerId: 'demo-user-id', referredId: 'new-user-103', status: 'COMPLETED', rewardPoints: 500 },
  { referrerId: 'other-user-99', referredId: 'demo-user-id', status: 'COMPLETED', rewardPoints: 500 },
  { referrerId: 'demo-user-id', referredId: 'new-user-104', status: 'COMPLETED', rewardPoints: 500 },
  { referrerId: 'demo-user-id', referredId: 'new-user-105', status: 'PENDING', rewardPoints: 500 },
  { referrerId: 'user-456', referredId: 'new-user-106', status: 'COMPLETED', rewardPoints: 500 },
  { referrerId: 'demo-user-id', referredId: 'new-user-107', status: 'COMPLETED', rewardPoints: 500 },
  { referrerId: 'user-789', referredId: 'new-user-108', status: 'PENDING', rewardPoints: 500 },
  { referrerId: 'demo-user-id', referredId: 'new-user-109', status: 'COMPLETED', rewardPoints: 500 }
];

async function seedData() {
  console.log('Starting seed for Loyalty, Support, Reviews, and Referrals...');
  
  for (const reward of rewards) {
    try {
      await fetch(`${BASE_URL}/loyalty/admin/rewards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reward)
      });
    } catch (e) { console.error('Error seeding reward:', e); }
  }
  console.log('Rewards seeded.');

  for (const faq of faqs) {
    try {
      await fetch(`${BASE_URL}/support/admin/faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faq)
      });
    } catch (e) { console.error('Error seeding FAQ:', e); }
  }
  console.log('FAQs seeded.');

  for (const review of reviews) {
    try {
      await fetch(`${BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
    } catch (e) { console.error('Error seeding review:', e); }
  }
  console.log('Reviews seeded.');

  for (const ticket of tickets) {
    try {
      await fetch(`${BASE_URL}/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      });
    } catch (e) { console.error('Error seeding ticket:', e); }
  }
  console.log('Tickets seeded.');

  for (const ref of referrals) {
    try {
      await fetch(`${BASE_URL}/referrals/admin/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ref)
      });
    } catch (e) { console.error('Error seeding referral:', e); }
  }
  console.log('Referrals seeded.');
  
  console.log('Done seeding additional modules!');
}

seedData();
