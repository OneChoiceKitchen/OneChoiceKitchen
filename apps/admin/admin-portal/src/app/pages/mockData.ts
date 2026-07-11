/**
 * Shared mock data for Restaurant Operations modules.
 * Used as API fallback when backend is unavailable.
 */

export const MOCK_RESTAURANTS = [
  { id: 'rest-01', name: 'One Choice Kitchen - Bengaluru' },
  { id: 'rest-02', name: 'One Choice Kitchen - Mysuru' },
];

export const MOCK_BRANCHES = [
  {
    id: 'br-01', restaurantId: 'rest-01',
    name: 'MG Road - Bengaluru', address: '42, Brigade Road, MG Road', city: 'Bengaluru',
    phone: '+91 80 4567 8901', secondaryPhone: '+91 98765 43210', email: 'mgroad@onechoicekitchen.in',
    secondaryEmail: null, lat: 12.9716, lng: 77.5946,
    mondayHours: '08:00-22:00', tuesdayHours: '08:00-22:00', wednesdayHours: '08:00-22:00',
    thursdayHours: '08:00-22:00', fridayHours: '08:00-23:00', saturdayHours: '08:00-23:00', sundayHours: '09:00-21:00',
    isActive: true, isQrMenuEnabled: true, isReservationEnabled: true, isDeliveryEnabled: true, isTakeawayEnabled: true,
    qrCodeUrl: 'https://onechoicekitchen.in/menu/mgroad', brandLogoUrl: null, faviconUrl: null,
    fssaiNumber: 'FBO-KA-12345678', fssaiDocUrl: null, gstNumber: '29AAAAA0000A1Z5', gstDocUrl: null,
    panNumber: 'AAAAA0000A', panDocUrl: null, collectionTags: 'dine-in,delivery,takeaway',
    seoTitle: 'One Choice Kitchen MG Road | Best Tiffin & A-la-carte Bengaluru',
    seoDescription: 'Authentic South Indian tiffin and a-la-carte meals at MG Road, Bengaluru.',
    restaurant: { id: 'rest-01', name: 'One Choice Kitchen - Bengaluru' },
  },
  {
    id: 'br-02', restaurantId: 'rest-01',
    name: 'Koramangala - Bengaluru', address: '80 Feet Road, 4th Block, Koramangala', city: 'Bengaluru',
    phone: '+91 80 2345 6789', secondaryPhone: null, email: 'koramangala@onechoicekitchen.in',
    secondaryEmail: null, lat: 12.9352, lng: 77.6245,
    mondayHours: '08:00-21:00', tuesdayHours: '08:00-21:00', wednesdayHours: '08:00-21:00',
    thursdayHours: '08:00-21:00', fridayHours: '08:00-22:00', saturdayHours: '08:00-22:00', sundayHours: '09:00-20:00',
    isActive: true, isQrMenuEnabled: true, isReservationEnabled: false, isDeliveryEnabled: true, isTakeawayEnabled: true,
    qrCodeUrl: 'https://onechoicekitchen.in/menu/koramangala', brandLogoUrl: null, faviconUrl: null,
    fssaiNumber: 'FBO-KA-87654321', fssaiDocUrl: null, gstNumber: '29BBBBB1111B1Z6', gstDocUrl: null,
    panNumber: 'BBBBB1111B', panDocUrl: null, collectionTags: 'delivery,takeaway',
    seoTitle: 'One Choice Kitchen Koramangala | Tiffin Delivery Bengaluru',
    seoDescription: 'Fresh home-style tiffin and meals delivered from Koramangala, Bengaluru.',
    restaurant: { id: 'rest-01', name: 'One Choice Kitchen - Bengaluru' },
  },
  {
    id: 'br-03', restaurantId: 'rest-01',
    name: 'Indiranagar - Bengaluru', address: '100 Feet Road, HAL 2nd Stage, Indiranagar', city: 'Bengaluru',
    phone: '+91 80 3456 7890', secondaryPhone: null, email: 'indiranagar@onechoicekitchen.in',
    secondaryEmail: null, lat: 12.9719, lng: 77.6412,
    mondayHours: '08:00-22:00', tuesdayHours: '08:00-22:00', wednesdayHours: '08:00-22:00',
    thursdayHours: '08:00-22:00', fridayHours: '08:00-23:00', saturdayHours: '09:00-23:00', sundayHours: '09:00-21:00',
    isActive: false, isQrMenuEnabled: false, isReservationEnabled: true, isDeliveryEnabled: false, isTakeawayEnabled: true,
    qrCodeUrl: null, brandLogoUrl: null, faviconUrl: null,
    fssaiNumber: 'FBO-KA-11223344', fssaiDocUrl: null, gstNumber: '29CCCCC2222C1Z7', gstDocUrl: null,
    panNumber: 'CCCCC2222C', panDocUrl: null, collectionTags: 'dine-in,takeaway',
    seoTitle: 'One Choice Kitchen Indiranagar | Premium Dining Bengaluru',
    seoDescription: 'Premium dine-in experience at Indiranagar, Bengaluru.',
    restaurant: { id: 'rest-01', name: 'One Choice Kitchen - Bengaluru' },
  },
];

export const MOCK_MENU_ITEMS = [
  { id: 'mi-01', name: 'Masala Dosa', description: 'Crispy rice crepe with spiced potato filling, sambar and chutneys.', price: 120, category: 'Breakfast', image: '', diet: 'VEG', prepTime: 12, isPopular: true, sortOrder: 1, isActive: true, restaurantId: 'rest-01', branchId: 'br-01', attributes: ['gluten-free','bestseller'], ingredients: [{ sku:'GRN-003',name:'Dosa Batter',qty:0.15,unit:'kg'},{ sku:'OIL-001',name:'Sunflower Oil',qty:0.02,unit:'ltr'},{ sku:'VEG-001',name:'Tomatoes',qty:0.05,unit:'kg'},{ sku:'SPC-001',name:'Cumin Seeds',qty:0.005,unit:'kg'}] },
  { id: 'mi-02', name: 'Idli Plate (4 pcs)', description: 'Steamed rice cakes with sambar and coconut chutney.', price: 80, category: 'Breakfast', image: '', diet: 'VEG', prepTime: 8, isPopular: true, sortOrder: 2, isActive: true, restaurantId: 'rest-01', branchId: 'br-01', attributes: ['light','bestseller'], ingredients: [{ sku:'GRN-003',name:'Dosa Batter',qty:0.2,unit:'kg'},{ sku:'VEG-001',name:'Tomatoes',qty:0.04,unit:'kg'},{ sku:'OIL-001',name:'Sunflower Oil',qty:0.01,unit:'ltr'}] },
  { id: 'mi-03', name: 'Paneer Butter Masala', description: 'Cottage cheese in rich tomato-butter gravy.', price: 220, category: 'Main Course', image: '', diet: 'VEG', prepTime: 20, isPopular: true, sortOrder: 3, isActive: true, restaurantId: 'rest-01', branchId: 'br-01', attributes: ['rich','popular'], ingredients: [{ sku:'DAI-002',name:'Paneer',qty:0.15,unit:'kg'},{ sku:'VEG-001',name:'Tomatoes',qty:0.1,unit:'kg'},{ sku:'DAI-001',name:'Full Cream Milk',qty:0.05,unit:'ltr'},{ sku:'SPC-002',name:'Turmeric',qty:0.005,unit:'kg'},{ sku:'OIL-002',name:'Coconut Oil',qty:0.015,unit:'ltr'}] },
  { id: 'mi-04', name: 'Dal Tadka', description: 'Yellow lentils tempered with cumin, garlic and butter.', price: 160, category: 'Main Course', image: '', diet: 'VEG', prepTime: 25, isPopular: false, sortOrder: 4, isActive: true, restaurantId: 'rest-01', branchId: 'br-02', attributes: ['protein-rich'], ingredients: [{ sku:'PRO-001',name:'Moong Dal',qty:0.1,unit:'kg'},{ sku:'VEG-002',name:'Onions',qty:0.05,unit:'kg'},{ sku:'SPC-001',name:'Cumin Seeds',qty:0.005,unit:'kg'},{ sku:'SPC-002',name:'Turmeric',qty:0.003,unit:'kg'},{ sku:'OIL-001',name:'Sunflower Oil',qty:0.02,unit:'ltr'}] },
  { id: 'mi-05', name: 'Veg Biryani', description: 'Fragrant basmati rice cooked with seasonal vegetables.', price: 180, category: 'Rice', image: '', diet: 'VEG', prepTime: 35, isPopular: true, sortOrder: 5, isActive: true, restaurantId: 'rest-01', branchId: 'br-01', attributes: ['chef-special'], ingredients: [{ sku:'GRN-001',name:'Basmati Rice',qty:0.15,unit:'kg'},{ sku:'VEG-002',name:'Onions',qty:0.08,unit:'kg'},{ sku:'VEG-001',name:'Tomatoes',qty:0.06,unit:'kg'},{ sku:'SPC-001',name:'Cumin Seeds',qty:0.003,unit:'kg'},{ sku:'OIL-002',name:'Coconut Oil',qty:0.02,unit:'ltr'}] },
  { id: 'mi-06', name: 'Chapati (2 pcs)', description: 'Soft whole wheat flatbreads.', price: 40, category: 'Breads', image: '', diet: 'VEG', prepTime: 8, isPopular: false, sortOrder: 6, isActive: true, restaurantId: 'rest-01', branchId: 'br-02', attributes: ['light'], ingredients: [{ sku:'GRN-002',name:'Whole Wheat Flour',qty:0.1,unit:'kg'},{ sku:'OIL-001',name:'Sunflower Oil',qty:0.005,unit:'ltr'}] },
  { id: 'mi-07', name: 'Masala Chai', description: 'Spiced milk tea with ginger and cardamom.', price: 30, category: 'Beverages', image: '', diet: 'VEG', prepTime: 5, isPopular: true, sortOrder: 7, isActive: true, restaurantId: 'rest-01', branchId: 'br-01', attributes: ['hot','signature'], ingredients: [{ sku:'DAI-001',name:'Full Cream Milk',qty:0.15,unit:'ltr'},{ sku:'SPC-001',name:'Cumin Seeds',qty:0.001,unit:'kg'}] },
  { id: 'mi-08', name: 'Curd Rice', description: 'Cooling yogurt rice tempered with mustard seeds.', price: 90, category: 'Rice', image: '', diet: 'VEG', prepTime: 10, isPopular: false, sortOrder: 8, isActive: true, restaurantId: 'rest-01', branchId: 'br-03', attributes: ['cooling'], ingredients: [{ sku:'GRN-001',name:'Basmati Rice',qty:0.1,unit:'kg'},{ sku:'DAI-001',name:'Full Cream Milk',qty:0.1,unit:'ltr'},{ sku:'SPC-001',name:'Cumin Seeds',qty:0.002,unit:'kg'}] },
];

export const MOCK_TIFFIN_ITEMS = [
  { id: 'ti-01', name: 'South Indian Breakfast Box', mealSlot: 'BREAKFAST', day: 'Mon', description: 'Idli, Vada, Sambar, 2 Chutneys', price: 99, isVeg: true, isActive: true, restaurantId: 'rest-01', branchId: 'br-01', planName: 'Vegetarian Plan', ingredients: [{ sku:'GRN-003',name:'Dosa Batter',qty:0.25,unit:'kg'},{ sku:'VEG-001',name:'Tomatoes',qty:0.05,unit:'kg'},{ sku:'OIL-001',name:'Sunflower Oil',qty:0.01,unit:'ltr'}] },
  { id: 'ti-02', name: 'Veg Lunch Thali', mealSlot: 'LUNCH', day: 'Mon', description: '2 Chapati, Rice, Dal, Sabzi, Salad, Pickle', price: 149, isVeg: true, isActive: true, restaurantId: 'rest-01', branchId: 'br-01', planName: 'Vegetarian Plan', ingredients: [{ sku:'GRN-001',name:'Basmati Rice',qty:0.15,unit:'kg'},{ sku:'GRN-002',name:'Whole Wheat Flour',qty:0.12,unit:'kg'},{ sku:'PRO-001',name:'Moong Dal',qty:0.08,unit:'kg'},{ sku:'VEG-002',name:'Onions',qty:0.06,unit:'kg'},{ sku:'SPC-002',name:'Turmeric',qty:0.003,unit:'kg'},{ sku:'OIL-001',name:'Sunflower Oil',qty:0.02,unit:'ltr'}] },
  { id: 'ti-03', name: 'Paneer Special Dinner', mealSlot: 'DINNER', day: 'Mon', description: 'Paneer Masala, 3 Roti, Raita, Dessert', price: 179, isVeg: true, isActive: true, restaurantId: 'rest-01', branchId: 'br-01', planName: 'Vegetarian Plan', ingredients: [{ sku:'DAI-002',name:'Paneer',qty:0.2,unit:'kg'},{ sku:'GRN-002',name:'Whole Wheat Flour',qty:0.18,unit:'kg'},{ sku:'VEG-001',name:'Tomatoes',qty:0.1,unit:'kg'},{ sku:'DAI-001',name:'Full Cream Milk',qty:0.1,unit:'ltr'},{ sku:'SPC-001',name:'Cumin Seeds',qty:0.005,unit:'kg'},{ sku:'OIL-002',name:'Coconut Oil',qty:0.015,unit:'ltr'}] },
  { id: 'ti-04', name: 'Dosa Breakfast Box', mealSlot: 'BREAKFAST', day: 'Tue', description: 'Masala Dosa, Sambar, Chutney, Filter Coffee', price: 109, isVeg: true, isActive: true, restaurantId: 'rest-01', branchId: 'br-02', planName: 'Vegetarian Plan', ingredients: [{ sku:'GRN-003',name:'Dosa Batter',qty:0.2,unit:'kg'},{ sku:'OIL-001',name:'Sunflower Oil',qty:0.02,unit:'ltr'},{ sku:'VEG-001',name:'Tomatoes',qty:0.06,unit:'kg'},{ sku:'DAI-001',name:'Full Cream Milk',qty:0.1,unit:'ltr'}] },
  { id: 'ti-05', name: 'Tuesday Biryani Lunch', mealSlot: 'LUNCH', day: 'Tue', description: 'Veg Biryani, Raita, Papad, Dessert', price: 169, isVeg: true, isActive: true, restaurantId: 'rest-01', branchId: 'br-01', planName: 'Premium Plan', ingredients: [{ sku:'GRN-001',name:'Basmati Rice',qty:0.2,unit:'kg'},{ sku:'VEG-002',name:'Onions',qty:0.08,unit:'kg'},{ sku:'VEG-001',name:'Tomatoes',qty:0.07,unit:'kg'},{ sku:'SPC-001',name:'Cumin Seeds',qty:0.004,unit:'kg'},{ sku:'DAI-001',name:'Full Cream Milk',qty:0.08,unit:'ltr'}] },
];

export const LOW_STOCK_SKUS = ['OIL-002', 'SPC-001', 'GRN-002'];
export const OOS_SKUS = ['DAI-001'];

export type StockLevel = 'ok' | 'low' | 'critical' | 'out';
export function getIngredientStatus(sku: string): StockLevel {
  if (OOS_SKUS.includes(sku)) return 'out';
  if (LOW_STOCK_SKUS.includes(sku)) return 'critical';
  return 'ok';
}
export const STOCK_BADGE: Record<StockLevel, { label: string; color: string; bg: string }> = {
  ok:       { label: 'In Stock',     color: '#166534', bg: '#dcfce7' },
  low:      { label: 'Low Stock',    color: '#92400e', bg: '#fef3c7' },
  critical: { label: 'Critical',     color: '#b91c1c', bg: '#fee2e2' },
  out:      { label: 'Out of Stock', color: '#ffffff', bg: '#dc2626' },
};
