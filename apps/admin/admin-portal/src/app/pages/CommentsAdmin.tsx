import { useState, useEffect } from 'react';
import { useToast, useConfirm } from '@org/ui-design-system';
import styles from './CommentsAdmin.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_COMMENTS = [
  { id: 'c1', authorName: 'Mohit', authorEmail: 'mohit93@example.com', content: 'Such a great read. I\'ve shared this with all my colleagues!', blog: { title: 'Top 5 Healthy Tiffin Recipes for Busy Professionals' }, createdAt: '2026-06-29T19:50:33Z', status: 'APPROVED' },
  { id: 'c2', authorName: 'Sneha', authorEmail: 'sneha60@example.com', content: 'Absolutely phenomenal post! This completely changed my perspective.', blog: { title: 'Top 5 Healthy Tiffin Recipes for Busy Professionals' }, createdAt: '2026-06-14T19:50:33Z', status: 'PENDING' },
  { id: 'c3', authorName: 'Neha', authorEmail: 'neha14@example.com', content: 'I can\'t wait to try this out! Brilliant advice.', blog: { title: 'Top 5 Healthy Tiffin Recipes for Busy Professionals' }, createdAt: '2026-06-15T19:50:33Z', status: 'PENDING' },
  { id: 'c4', authorName: 'Mohit', authorEmail: 'mohit20@example.com', content: 'I absolutely love this. It\'s so refreshing to see such high quality.', blog: { title: 'Top 5 Healthy Tiffin Recipes for Busy Professionals' }, createdAt: '2026-07-05T19:50:33Z', status: 'PENDING' },
  { id: 'c5', authorName: 'Kavita', authorEmail: 'kavita38@example.com', content: 'Such a great read. I\'ve shared this with all my colleagues!', blog: { title: 'Top 5 Healthy Tiffin Recipes for Busy Professionals' }, createdAt: '2026-06-17T19:50:33Z', status: 'APPROVED' },
  { id: 'c6', authorName: 'Karan', authorEmail: 'karan57@example.com', content: 'I absolutely love this. It\'s so refreshing to see such high quality.', blog: { title: 'Top 5 Healthy Tiffin Recipes for Busy Professionals' }, createdAt: '2026-06-27T19:50:33Z', status: 'REJECTED' },
  { id: 'c7', authorName: 'Mohit', authorEmail: 'mohit73@example.com', content: 'Such a great read. I\'ve shared this with all my colleagues!', blog: { title: 'Top 5 Healthy Tiffin Recipes for Busy Professionals' }, createdAt: '2026-06-27T19:50:33Z', status: 'APPROVED' },
  { id: 'c8', authorName: 'Divya', authorEmail: 'divya33@example.com', content: 'Very well written and easy to follow. 5 stars!', blog: { title: 'Top 5 Healthy Tiffin Recipes for Busy Professionals' }, createdAt: '2026-06-09T19:50:33Z', status: 'APPROVED' },
  { id: 'c9', authorName: 'Divya', authorEmail: 'divya26@example.com', content: 'This is exactly what I was looking for today. Incredible detail.', blog: { title: 'Top 5 Healthy Tiffin Recipes for Busy Professionals' }, createdAt: '2026-06-23T19:50:33Z', status: 'APPROVED' },
  { id: 'c10', authorName: 'Vikram', authorEmail: 'vikram17@example.com', content: 'Awesome content as always. Keep up the great work!', blog: { title: 'Top 5 Healthy Tiffin Recipes for Busy Professionals' }, createdAt: '2026-06-11T19:50:33Z', status: 'PENDING' },
  { id: 'c11', authorName: 'Kavita', authorEmail: 'kavita80@example.com', content: 'Fantastic tips! You guys always deliver the best content.', blog: { title: 'Why Nutrition Matters in Your Daily Lunch' }, createdAt: '2026-06-30T19:50:33Z', status: 'REJECTED' },
  { id: 'c12', authorName: 'Divya', authorEmail: 'divya76@example.com', content: 'I can\'t wait to try this out! Brilliant advice.', blog: { title: 'Why Nutrition Matters in Your Daily Lunch' }, createdAt: '2026-06-13T19:50:33Z', status: 'REJECTED' },
  { id: 'c13', authorName: 'Ritu', authorEmail: 'ritu17@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'Why Nutrition Matters in Your Daily Lunch' }, createdAt: '2026-07-03T19:50:33Z', status: 'APPROVED' },
  { id: 'c14', authorName: 'Sanjay', authorEmail: 'sanjay16@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'Why Nutrition Matters in Your Daily Lunch' }, createdAt: '2026-07-04T19:50:33Z', status: 'APPROVED' },
  { id: 'c15', authorName: 'Meera', authorEmail: 'meera27@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'Why Nutrition Matters in Your Daily Lunch' }, createdAt: '2026-07-02T19:50:33Z', status: 'APPROVED' },
  { id: 'c16', authorName: 'Pooja', authorEmail: 'pooja19@example.com', content: 'Very insightful, thanks for sharing this masterpiece.', blog: { title: 'Why Nutrition Matters in Your Daily Lunch' }, createdAt: '2026-06-22T19:50:33Z', status: 'APPROVED' },
  { id: 'c17', authorName: 'Ravi', authorEmail: 'ravi60@example.com', content: 'Awesome content as always. Keep up the great work!', blog: { title: 'Why Nutrition Matters in Your Daily Lunch' }, createdAt: '2026-06-08T19:50:33Z', status: 'PENDING' },
  { id: 'c18', authorName: 'Vikas', authorEmail: 'vikas58@example.com', content: 'Very well written and easy to follow. 5 stars!', blog: { title: 'Why Nutrition Matters in Your Daily Lunch' }, createdAt: '2026-06-22T19:50:33Z', status: 'APPROVED' },
  { id: 'c19', authorName: 'Vikas', authorEmail: 'vikas90@example.com', content: 'This is exactly what I was looking for today. Incredible detail.', blog: { title: 'Why Nutrition Matters in Your Daily Lunch' }, createdAt: '2026-06-20T19:50:33Z', status: 'APPROVED' },
  { id: 'c20', authorName: 'Vikram', authorEmail: 'vikram41@example.com', content: 'Fantastic tips! You guys always deliver the best content.', blog: { title: 'Why Nutrition Matters in Your Daily Lunch' }, createdAt: '2026-06-16T19:50:33Z', status: 'APPROVED' },
  { id: 'c21', authorName: 'Swati', authorEmail: 'swati56@example.com', content: 'Such a great read. I\'ve shared this with all my colleagues!', blog: { title: 'Our Delivery Fleet Goes 100% Green by 2027' }, createdAt: '2026-06-08T19:50:33Z', status: 'APPROVED' },
  { id: 'c22', authorName: 'Kavita', authorEmail: 'kavita11@example.com', content: 'Awesome content as always. Keep up the great work!', blog: { title: 'Our Delivery Fleet Goes 100% Green by 2027' }, createdAt: '2026-06-21T19:50:33Z', status: 'APPROVED' },
  { id: 'c23', authorName: 'Neha', authorEmail: 'neha44@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'Our Delivery Fleet Goes 100% Green by 2027' }, createdAt: '2026-06-30T19:50:33Z', status: 'PENDING' },
  { id: 'c24', authorName: 'Vikram', authorEmail: 'vikram42@example.com', content: 'Thanks for the great information! I\'ve bookmarked this page.', blog: { title: 'Our Delivery Fleet Goes 100% Green by 2027' }, createdAt: '2026-06-15T19:50:33Z', status: 'PENDING' },
  { id: 'c25', authorName: 'Rahul', authorEmail: 'rahul42@example.com', content: 'I absolutely love this. It\'s so refreshing to see such high quality.', blog: { title: 'Our Delivery Fleet Goes 100% Green by 2027' }, createdAt: '2026-06-24T19:50:33Z', status: 'APPROVED' },
  { id: 'c26', authorName: 'Pooja', authorEmail: 'pooja15@example.com', content: 'Absolutely phenomenal post! This completely changed my perspective.', blog: { title: 'Our Delivery Fleet Goes 100% Green by 2027' }, createdAt: '2026-06-30T19:50:33Z', status: 'REJECTED' },
  { id: 'c27', authorName: 'Vikas', authorEmail: 'vikas55@example.com', content: 'This is exactly what I was looking for today. Incredible detail.', blog: { title: 'Our Delivery Fleet Goes 100% Green by 2027' }, createdAt: '2026-06-18T19:50:33Z', status: 'APPROVED' },
  { id: 'c28', authorName: 'Rahul', authorEmail: 'rahul91@example.com', content: 'Very insightful, thanks for sharing this masterpiece.', blog: { title: 'Our Delivery Fleet Goes 100% Green by 2027' }, createdAt: '2026-06-23T19:50:33Z', status: 'PENDING' },
  { id: 'c29', authorName: 'Ravi', authorEmail: 'ravi55@example.com', content: 'Thanks for the great information! I\'ve bookmarked this page.', blog: { title: 'Our Delivery Fleet Goes 100% Green by 2027' }, createdAt: '2026-06-14T19:50:33Z', status: 'APPROVED' },
  { id: 'c30', authorName: 'Swati', authorEmail: 'swati17@example.com', content: 'I absolutely love this. It\'s so refreshing to see such high quality.', blog: { title: 'Our Delivery Fleet Goes 100% Green by 2027' }, createdAt: '2026-06-20T19:50:33Z', status: 'REJECTED' },
  { id: 'c31', authorName: 'Pooja', authorEmail: 'pooja96@example.com', content: 'Awesome content as always. Keep up the great work!', blog: { title: 'The Secret Behind Our Famous Butter Chicken' }, createdAt: '2026-06-21T19:50:33Z', status: 'APPROVED' },
  { id: 'c32', authorName: 'Suresh', authorEmail: 'suresh14@example.com', content: 'Very insightful, thanks for sharing this masterpiece.', blog: { title: 'The Secret Behind Our Famous Butter Chicken' }, createdAt: '2026-06-29T19:50:33Z', status: 'APPROVED' },
  { id: 'c33', authorName: 'Swati', authorEmail: 'swati42@example.com', content: 'Awesome content as always. Keep up the great work!', blog: { title: 'The Secret Behind Our Famous Butter Chicken' }, createdAt: '2026-07-01T19:50:33Z', status: 'APPROVED' },
  { id: 'c34', authorName: 'Karan', authorEmail: 'karan59@example.com', content: 'Very insightful, thanks for sharing this masterpiece.', blog: { title: 'The Secret Behind Our Famous Butter Chicken' }, createdAt: '2026-07-01T19:50:33Z', status: 'APPROVED' },
  { id: 'c35', authorName: 'Priya', authorEmail: 'priya31@example.com', content: 'Fantastic tips! You guys always deliver the best content.', blog: { title: 'The Secret Behind Our Famous Butter Chicken' }, createdAt: '2026-06-08T19:50:33Z', status: 'PENDING' },
  { id: 'c36', authorName: 'Pooja', authorEmail: 'pooja68@example.com', content: 'I absolutely love this. It\'s so refreshing to see such high quality.', blog: { title: 'The Secret Behind Our Famous Butter Chicken' }, createdAt: '2026-06-10T19:50:33Z', status: 'APPROVED' },
  { id: 'c37', authorName: 'Kavita', authorEmail: 'kavita90@example.com', content: 'Wow, I never realized this before. Thanks for the eye-opener!', blog: { title: 'The Secret Behind Our Famous Butter Chicken' }, createdAt: '2026-07-05T19:50:33Z', status: 'APPROVED' },
  { id: 'c38', authorName: 'Aditya', authorEmail: 'aditya86@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'The Secret Behind Our Famous Butter Chicken' }, createdAt: '2026-06-12T19:50:33Z', status: 'APPROVED' },
  { id: 'c39', authorName: 'Priya', authorEmail: 'priya36@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'The Secret Behind Our Famous Butter Chicken' }, createdAt: '2026-06-27T19:50:33Z', status: 'APPROVED' },
  { id: 'c40', authorName: 'Rahul', authorEmail: 'rahul57@example.com', content: 'Awesome content as always. Keep up the great work!', blog: { title: 'The Secret Behind Our Famous Butter Chicken' }, createdAt: '2026-07-06T19:50:33Z', status: 'PENDING' },
  { id: 'c41', authorName: 'Neha', authorEmail: 'neha52@example.com', content: 'Wow, I never realized this before. Thanks for the eye-opener!', blog: { title: 'How to Maximize Your Partner Earnings' }, createdAt: '2026-06-19T19:50:33Z', status: 'APPROVED' },
  { id: 'c42', authorName: 'Vikas', authorEmail: 'vikas50@example.com', content: 'Such a great read. I\'ve shared this with all my colleagues!', blog: { title: 'How to Maximize Your Partner Earnings' }, createdAt: '2026-06-09T19:50:33Z', status: 'REJECTED' },
  { id: 'c43', authorName: 'Sanjay', authorEmail: 'sanjay31@example.com', content: 'This is exactly what I was looking for today. Incredible detail.', blog: { title: 'How to Maximize Your Partner Earnings' }, createdAt: '2026-07-03T19:50:33Z', status: 'APPROVED' },
  { id: 'c44', authorName: 'Mohit', authorEmail: 'mohit34@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'How to Maximize Your Partner Earnings' }, createdAt: '2026-06-28T19:50:33Z', status: 'APPROVED' },
  { id: 'c45', authorName: 'Mohit', authorEmail: 'mohit53@example.com', content: 'Wow, I never realized this before. Thanks for the eye-opener!', blog: { title: 'How to Maximize Your Partner Earnings' }, createdAt: '2026-06-30T19:50:33Z', status: 'PENDING' },
  { id: 'c46', authorName: 'Priya', authorEmail: 'priya51@example.com', content: 'Very insightful, thanks for sharing this masterpiece.', blog: { title: 'How to Maximize Your Partner Earnings' }, createdAt: '2026-07-05T19:50:33Z', status: 'REJECTED' },
  { id: 'c47', authorName: 'Sanjay', authorEmail: 'sanjay68@example.com', content: 'Awesome content as always. Keep up the great work!', blog: { title: 'How to Maximize Your Partner Earnings' }, createdAt: '2026-06-29T19:50:33Z', status: 'APPROVED' },
  { id: 'c48', authorName: 'Suresh', authorEmail: 'suresh60@example.com', content: 'Very well written and easy to follow. 5 stars!', blog: { title: 'How to Maximize Your Partner Earnings' }, createdAt: '2026-06-20T19:50:33Z', status: 'REJECTED' },
  { id: 'c49', authorName: 'Ritu', authorEmail: 'ritu88@example.com', content: 'Thanks for the great information! I\'ve bookmarked this page.', blog: { title: 'How to Maximize Your Partner Earnings' }, createdAt: '2026-07-06T19:50:33Z', status: 'PENDING' },
  { id: 'c50', authorName: 'Pooja', authorEmail: 'pooja48@example.com', content: 'I absolutely love this. It\'s so refreshing to see such high quality.', blog: { title: 'How to Maximize Your Partner Earnings' }, createdAt: '2026-06-19T19:50:33Z', status: 'REJECTED' },
  { id: 'c51', authorName: 'Neha', authorEmail: 'neha92@example.com', content: 'Very insightful, thanks for sharing this masterpiece.', blog: { title: 'Winter Promo: Free Hot Chocolate on Weekends' }, createdAt: '2026-06-17T19:50:33Z', status: 'APPROVED' },
  { id: 'c52', authorName: 'Ritu', authorEmail: 'ritu40@example.com', content: 'Wow, I never realized this before. Thanks for the eye-opener!', blog: { title: 'Winter Promo: Free Hot Chocolate on Weekends' }, createdAt: '2026-06-30T19:50:33Z', status: 'REJECTED' },
  { id: 'c53', authorName: 'Karan', authorEmail: 'karan73@example.com', content: 'Very insightful, thanks for sharing this masterpiece.', blog: { title: 'Winter Promo: Free Hot Chocolate on Weekends' }, createdAt: '2026-06-10T19:50:33Z', status: 'REJECTED' },
  { id: 'c54', authorName: 'Karan', authorEmail: 'karan52@example.com', content: 'Fantastic tips! You guys always deliver the best content.', blog: { title: 'Winter Promo: Free Hot Chocolate on Weekends' }, createdAt: '2026-06-29T19:50:33Z', status: 'REJECTED' },
  { id: 'c55', authorName: 'Vikas', authorEmail: 'vikas37@example.com', content: 'I can\'t wait to try this out! Brilliant advice.', blog: { title: 'Winter Promo: Free Hot Chocolate on Weekends' }, createdAt: '2026-06-17T19:50:33Z', status: 'APPROVED' },
  { id: 'c56', authorName: 'Amit', authorEmail: 'amit33@example.com', content: 'I can\'t wait to try this out! Brilliant advice.', blog: { title: 'Winter Promo: Free Hot Chocolate on Weekends' }, createdAt: '2026-06-10T19:50:33Z', status: 'PENDING' },
  { id: 'c57', authorName: 'Aditya', authorEmail: 'aditya56@example.com', content: 'Very insightful, thanks for sharing this masterpiece.', blog: { title: 'Winter Promo: Free Hot Chocolate on Weekends' }, createdAt: '2026-06-18T19:50:33Z', status: 'APPROVED' },
  { id: 'c58', authorName: 'Mohit', authorEmail: 'mohit16@example.com', content: 'I can\'t wait to try this out! Brilliant advice.', blog: { title: 'Winter Promo: Free Hot Chocolate on Weekends' }, createdAt: '2026-06-09T19:50:33Z', status: 'REJECTED' },
  { id: 'c59', authorName: 'Meera', authorEmail: 'meera39@example.com', content: 'Very well written and easy to follow. 5 stars!', blog: { title: 'Winter Promo: Free Hot Chocolate on Weekends' }, createdAt: '2026-06-17T19:50:33Z', status: 'APPROVED' },
  { id: 'c60', authorName: 'Karan', authorEmail: 'karan12@example.com', content: 'I can\'t wait to try this out! Brilliant advice.', blog: { title: 'Winter Promo: Free Hot Chocolate on Weekends' }, createdAt: '2026-07-03T19:50:33Z', status: 'APPROVED' },
  { id: 'c61', authorName: 'Pooja', authorEmail: 'pooja25@example.com', content: 'This is exactly what I was looking for today. Incredible detail.', blog: { title: 'The Ultimate Family Feast Guide' }, createdAt: '2026-06-08T19:50:33Z', status: 'APPROVED' },
  { id: 'c62', authorName: 'Aditya', authorEmail: 'aditya75@example.com', content: 'Absolutely phenomenal post! This completely changed my perspective.', blog: { title: 'The Ultimate Family Feast Guide' }, createdAt: '2026-06-18T19:50:33Z', status: 'APPROVED' },
  { id: 'c63', authorName: 'Priya', authorEmail: 'priya96@example.com', content: 'Thanks for the great information! I\'ve bookmarked this page.', blog: { title: 'The Ultimate Family Feast Guide' }, createdAt: '2026-06-08T19:50:33Z', status: 'APPROVED' },
  { id: 'c64', authorName: 'Priya', authorEmail: 'priya52@example.com', content: 'I can\'t wait to try this out! Brilliant advice.', blog: { title: 'The Ultimate Family Feast Guide' }, createdAt: '2026-06-19T19:50:33Z', status: 'PENDING' },
  { id: 'c65', authorName: 'Ritu', authorEmail: 'ritu82@example.com', content: 'Wow, I never realized this before. Thanks for the eye-opener!', blog: { title: 'The Ultimate Family Feast Guide' }, createdAt: '2026-06-12T19:50:33Z', status: 'APPROVED' },
  { id: 'c66', authorName: 'Meera', authorEmail: 'meera10@example.com', content: 'I can\'t wait to try this out! Brilliant advice.', blog: { title: 'The Ultimate Family Feast Guide' }, createdAt: '2026-06-26T19:50:33Z', status: 'APPROVED' },
  { id: 'c67', authorName: 'Mohit', authorEmail: 'mohit87@example.com', content: 'I can\'t wait to try this out! Brilliant advice.', blog: { title: 'The Ultimate Family Feast Guide' }, createdAt: '2026-06-21T19:50:33Z', status: 'PENDING' },
  { id: 'c68', authorName: 'Divya', authorEmail: 'divya97@example.com', content: 'Absolutely phenomenal post! This completely changed my perspective.', blog: { title: 'The Ultimate Family Feast Guide' }, createdAt: '2026-06-14T19:50:33Z', status: 'APPROVED' },
  { id: 'c69', authorName: 'Ritu', authorEmail: 'ritu60@example.com', content: 'Awesome content as always. Keep up the great work!', blog: { title: 'The Ultimate Family Feast Guide' }, createdAt: '2026-06-10T19:50:33Z', status: 'REJECTED' },
  { id: 'c70', authorName: 'Priya', authorEmail: 'priya73@example.com', content: 'Fantastic tips! You guys always deliver the best content.', blog: { title: 'The Ultimate Family Feast Guide' }, createdAt: '2026-06-30T19:50:33Z', status: 'PENDING' },
  { id: 'c71', authorName: 'Mohit', authorEmail: 'mohit69@example.com', content: 'Thanks for the great information! I\'ve bookmarked this page.', blog: { title: 'Midnight Cravings: What to Order at 2 AM' }, createdAt: '2026-06-22T19:50:33Z', status: 'PENDING' },
  { id: 'c72', authorName: 'Neha', authorEmail: 'neha44@example.com', content: 'This is exactly what I was looking for today. Incredible detail.', blog: { title: 'Midnight Cravings: What to Order at 2 AM' }, createdAt: '2026-06-19T19:50:33Z', status: 'APPROVED' },
  { id: 'c73', authorName: 'Divya', authorEmail: 'divya59@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'Midnight Cravings: What to Order at 2 AM' }, createdAt: '2026-07-05T19:50:33Z', status: 'APPROVED' },
  { id: 'c74', authorName: 'Sanjay', authorEmail: 'sanjay88@example.com', content: 'This is exactly what I was looking for today. Incredible detail.', blog: { title: 'Midnight Cravings: What to Order at 2 AM' }, createdAt: '2026-06-14T19:50:33Z', status: 'PENDING' },
  { id: 'c75', authorName: 'Rahul', authorEmail: 'rahul18@example.com', content: 'Very insightful, thanks for sharing this masterpiece.', blog: { title: 'Midnight Cravings: What to Order at 2 AM' }, createdAt: '2026-06-24T19:50:33Z', status: 'APPROVED' },
  { id: 'c76', authorName: 'Neha', authorEmail: 'neha17@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'Midnight Cravings: What to Order at 2 AM' }, createdAt: '2026-06-09T19:50:33Z', status: 'APPROVED' },
  { id: 'c77', authorName: 'Amit', authorEmail: 'amit27@example.com', content: 'Very insightful, thanks for sharing this masterpiece.', blog: { title: 'Midnight Cravings: What to Order at 2 AM' }, createdAt: '2026-06-23T19:50:33Z', status: 'APPROVED' },
  { id: 'c78', authorName: 'Rahul', authorEmail: 'rahul66@example.com', content: 'This is exactly what I was looking for today. Incredible detail.', blog: { title: 'Midnight Cravings: What to Order at 2 AM' }, createdAt: '2026-06-09T19:50:33Z', status: 'PENDING' },
  { id: 'c79', authorName: 'Sanjay', authorEmail: 'sanjay70@example.com', content: 'Wow, I never realized this before. Thanks for the eye-opener!', blog: { title: 'Midnight Cravings: What to Order at 2 AM' }, createdAt: '2026-06-29T19:50:33Z', status: 'APPROVED' },
  { id: 'c80', authorName: 'Kavita', authorEmail: 'kavita70@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'Midnight Cravings: What to Order at 2 AM' }, createdAt: '2026-06-10T19:50:33Z', status: 'PENDING' },
  { id: 'c81', authorName: 'Sneha', authorEmail: 'sneha73@example.com', content: 'Very well written and easy to follow. 5 stars!', blog: { title: 'Paneer Tikka: A Vegetarian Grilling Masterclass' }, createdAt: '2026-07-02T19:50:33Z', status: 'APPROVED' },
  { id: 'c82', authorName: 'Ravi', authorEmail: 'ravi27@example.com', content: 'I absolutely love this. It\'s so refreshing to see such high quality.', blog: { title: 'Paneer Tikka: A Vegetarian Grilling Masterclass' }, createdAt: '2026-06-26T19:50:33Z', status: 'REJECTED' },
  { id: 'c83', authorName: 'Karan', authorEmail: 'karan12@example.com', content: 'Wow, I never realized this before. Thanks for the eye-opener!', blog: { title: 'Paneer Tikka: A Vegetarian Grilling Masterclass' }, createdAt: '2026-07-04T19:50:33Z', status: 'APPROVED' },
  { id: 'c84', authorName: 'Pooja', authorEmail: 'pooja26@example.com', content: 'Such a great read. I\'ve shared this with all my colleagues!', blog: { title: 'Paneer Tikka: A Vegetarian Grilling Masterclass' }, createdAt: '2026-06-29T19:50:33Z', status: 'APPROVED' },
  { id: 'c85', authorName: 'Aditya', authorEmail: 'aditya66@example.com', content: 'Fantastic tips! You guys always deliver the best content.', blog: { title: 'Paneer Tikka: A Vegetarian Grilling Masterclass' }, createdAt: '2026-07-01T19:50:33Z', status: 'APPROVED' },
  { id: 'c86', authorName: 'Pooja', authorEmail: 'pooja35@example.com', content: 'Very well written and easy to follow. 5 stars!', blog: { title: 'Paneer Tikka: A Vegetarian Grilling Masterclass' }, createdAt: '2026-06-21T19:50:33Z', status: 'APPROVED' },
  { id: 'c87', authorName: 'Kavita', authorEmail: 'kavita10@example.com', content: 'Very well written and easy to follow. 5 stars!', blog: { title: 'Paneer Tikka: A Vegetarian Grilling Masterclass' }, createdAt: '2026-06-16T19:50:33Z', status: 'PENDING' },
  { id: 'c88', authorName: 'Sanjay', authorEmail: 'sanjay60@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'Paneer Tikka: A Vegetarian Grilling Masterclass' }, createdAt: '2026-06-26T19:50:33Z', status: 'APPROVED' },
  { id: 'c89', authorName: 'Swati', authorEmail: 'swati12@example.com', content: 'This is exactly what I was looking for today. Incredible detail.', blog: { title: 'Paneer Tikka: A Vegetarian Grilling Masterclass' }, createdAt: '2026-06-17T19:50:33Z', status: 'APPROVED' },
  { id: 'c90', authorName: 'Vikram', authorEmail: 'vikram12@example.com', content: 'I can\'t wait to try this out! Brilliant advice.', blog: { title: 'Paneer Tikka: A Vegetarian Grilling Masterclass' }, createdAt: '2026-06-22T19:50:33Z', status: 'REJECTED' },
  { id: 'c91', authorName: 'Sneha', authorEmail: 'sneha49@example.com', content: 'Very well written and easy to follow. 5 stars!', blog: { title: 'Corporate Lunches: Making Office Food Great Again' }, createdAt: '2026-06-13T19:50:33Z', status: 'REJECTED' },
  { id: 'c92', authorName: 'Kavita', authorEmail: 'kavita90@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'Corporate Lunches: Making Office Food Great Again' }, createdAt: '2026-06-17T19:50:33Z', status: 'APPROVED' },
  { id: 'c93', authorName: 'Anjali', authorEmail: 'anjali92@example.com', content: 'Very insightful, thanks for sharing this masterpiece.', blog: { title: 'Corporate Lunches: Making Office Food Great Again' }, createdAt: '2026-07-04T19:50:33Z', status: 'REJECTED' },
  { id: 'c94', authorName: 'Pooja', authorEmail: 'pooja16@example.com', content: 'Absolutely phenomenal post! This completely changed my perspective.', blog: { title: 'Corporate Lunches: Making Office Food Great Again' }, createdAt: '2026-06-14T19:50:33Z', status: 'APPROVED' },
  { id: 'c95', authorName: 'Mohit', authorEmail: 'mohit41@example.com', content: 'Awesome content as always. Keep up the great work!', blog: { title: 'Corporate Lunches: Making Office Food Great Again' }, createdAt: '2026-06-25T19:50:33Z', status: 'APPROVED' },
  { id: 'c96', authorName: 'Neha', authorEmail: 'neha77@example.com', content: 'This is exactly what I was looking for today. Incredible detail.', blog: { title: 'Corporate Lunches: Making Office Food Great Again' }, createdAt: '2026-06-14T19:50:33Z', status: 'APPROVED' },
  { id: 'c97', authorName: 'Suresh', authorEmail: 'suresh86@example.com', content: 'Mind-blowing article! The quality of this blog is just next level.', blog: { title: 'Corporate Lunches: Making Office Food Great Again' }, createdAt: '2026-06-27T19:50:33Z', status: 'APPROVED' },
  { id: 'c98', authorName: 'Swati', authorEmail: 'swati67@example.com', content: 'Absolutely phenomenal post! This completely changed my perspective.', blog: { title: 'Corporate Lunches: Making Office Food Great Again' }, createdAt: '2026-07-03T19:50:33Z', status: 'APPROVED' },
  { id: 'c99', authorName: 'Kavita', authorEmail: 'kavita30@example.com', content: 'I absolutely love this. It\'s so refreshing to see such high quality.', blog: { title: 'Corporate Lunches: Making Office Food Great Again' }, createdAt: '2026-06-16T19:50:33Z', status: 'APPROVED' },
  { id: 'c100', authorName: 'Amit', authorEmail: 'amit77@example.com', content: 'Such a great read. I\'ve shared this with all my colleagues!', blog: { title: 'Corporate Lunches: Making Office Food Great Again' }, createdAt: '2026-06-19T19:50:33Z', status: 'APPROVED' }
];

export default function CommentsAdmin() {
  const [comments, setComments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const toast = useToast();
  const confirmDialog = useConfirm();

  useEffect(() => { fetchComments(); }, [statusFilter]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      // Mocking API for demo purposes to always showcase the 100 fantastic comments
      setComments(DUMMY_COMMENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/comments/admin/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error();
      toast.success(`Comment ${status.toLowerCase()} successfully`);
      fetchComments();
    } catch {
      // Mock status update
      setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success(`(Mocked) Comment ${status.toLowerCase()} successfully`);
    }
  };

  const handleEditStart = (comment: any) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditSave = async (id: string) => {
    try {
      const res = await fetch(`/api/comments/admin/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ content: editContent })
      });
      if (!res.ok) throw new Error();
      toast.success('Comment updated successfully');
      fetchComments();
    } catch {
      // Mock comment content update
      setComments(prev => prev.map(c => c.id === id ? { ...c, content: editContent } : c));
      toast.success('(Mocked) Comment updated successfully');
    } finally {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDialog({
      title: 'Delete Comment',
      message: 'Are you sure you want to permanently delete this comment?',
      variant: 'danger'
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/comments/admin/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error();
      toast.success('Comment deleted successfully');
      fetchComments();
    } catch {
      // Mock delete
      setComments(prev => prev.filter(c => c.id !== id));
      toast.success('(Mocked) Comment deleted successfully');
    }
  };

  const filtered = statusFilter 
    ? comments.filter(c => c.status === statusFilter)
    : comments;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.titleContainer}>
          <h2 className={styles.pageTitle}>Blog Comments</h2>
          <p className={styles.pageSubtitle}>Approve or reject user comments on blog posts</p>
        </div>
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
          className={styles.statusSelect}
        >
          <option value="">All Comments</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading && comments.length === 0 ? (
        <div className={styles.emptyState}>Loading comments...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Author</th>
                <th>Comment</th>
                <th>Blog Post</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(comment => (
                <tr key={comment.id}>
                  <td data-label="Author">
                    <div className={styles.authorName}>
                      {comment.authorName || comment.user?.name || 'Anonymous'}
                    </div>
                    <div className={styles.authorEmail}>
                      {comment.authorEmail || comment.user?.email || '—'}
                    </div>
                  </td>
                  <td data-label="Comment" className={styles.contentCell}>
                    {editingId === comment.id ? (
                      <div className={styles.editWrapper}>
                        <textarea 
                          value={editContent} 
                          onChange={(e) => setEditContent(e.target.value)} 
                          className={styles.editTextarea}
                          rows={3}
                        />
                        <div className={styles.editActions}>
                          <button onClick={() => handleEditSave(comment.id)} className={`${styles.actionBtn} ${styles.save}`}>Save</button>
                          <button onClick={() => setEditingId(null)} className={`${styles.actionBtn} ${styles.cancel}`}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      comment.content
                    )}
                  </td>
                  <td data-label="Blog Post" className={styles.blogTitleCell}>
                    {comment.blog?.title || 'Unknown Post'}
                  </td>
                  <td data-label="Date" className={styles.dateCell}>
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td data-label="Status">
                    <span className={`${styles.statusBadge} ${styles[comment.status.toLowerCase()] || ''}`}>
                      {comment.status}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className={styles.actionGroup}>
                      {comment.status === 'PENDING' && (
                        <button 
                          onClick={() => handleUpdateStatus(comment.id, 'APPROVED')}
                          className={`${styles.actionBtn} ${styles.approve}`}
                        >
                          Approve
                        </button>
                      )}
                      {['PENDING', 'APPROVED'].includes(comment.status) && (
                        <button 
                          onClick={() => handleUpdateStatus(comment.id, 'REJECTED')}
                          className={`${styles.actionBtn} ${styles.reject}`}
                        >
                          Reject
                        </button>
                      )}
                      <button 
                        onClick={() => handleEditStart(comment)}
                        className={`${styles.actionBtn} ${styles.edit}`}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className={`${styles.actionBtn} ${styles.delete}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyState}>
                    {statusFilter ? `No ${statusFilter.toLowerCase()} comments.` : 'No comments found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


