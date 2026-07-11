// Seed menus via API

const DEFAULT_MENU_CATALOGUE = [
  { id: 'item-1', name: 'Paneer Tikka', price: 260, category: 'North Indian', description: 'Clay oven cooked cottage cheese cubes', diet: 'VEG', image: '/MenuItems/paneer_tikka_1780137312575.png', isVisible: true, isOutOfStock: false, prepTime: 20, isPopular: true, rating: 4.8 },
  { id: 'item-2', name: 'Butter Chicken', price: 340, category: 'North Indian', description: 'Tender chicken in rich creamy tomato gravy', diet: 'NON-VEG', image: '/MenuItems/butter_chicken_1780137244502.png', isVisible: true, isOutOfStock: false, prepTime: 25, isPopular: true, rating: 4.9 },
  { id: 'item-3', name: 'Veg Hakka Noodles', price: 180, category: 'Chinese', description: 'Stir-fried noodles with garden fresh vegetables', diet: 'VEG', image: '/MenuItems/veg_noodles_1780137333130.png', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: false, rating: 4.3 },
  { id: 'item-4', name: 'Manchurian Gravy', price: 210, category: 'Chinese', description: 'Vegetable dumplings in spicy soy garlic sauce', diet: 'VEG', image: '/MenuItems/manchurian_1780137296128.png', isVisible: true, isOutOfStock: false, prepTime: 20, isPopular: true, rating: 4.5 },
  { id: 'item-5', name: 'Cold Coffee', price: 120, category: 'Beverages', description: 'Creamy espresso shake served chilled', diet: 'VEG', image: '/MenuItems/cold_coffee_1780137276932.png', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: true, rating: 4.7 },
  { id: 'item-6', name: 'Chocolate Brownie', price: 150, category: 'Desserts', description: 'Warm fudgy brownie with chocolate syrup', diet: 'VEG', image: '/MenuItems/chocolate_brownie_1780137260370.png', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: false, rating: 4.6 },
  
  // North Indian
  { id: 'item-7', name: 'Dal Makhani', price: 220, category: 'North Indian', description: 'Slow cooked black lentils with butter and cream', diet: 'VEG', image: '/MenuItems/dal_makhani_1780087988049.png', isVisible: true, isOutOfStock: false, prepTime: 30, isPopular: true, rating: 4.8 },
  { id: 'item-8', name: 'Kadai Paneer', price: 280, category: 'North Indian', description: 'Paneer cooked with bell peppers and ground spices', diet: 'VEG', image: '/MenuItems/kadai_paneer_1780088004507.png', isVisible: true, isOutOfStock: false, prepTime: 25, isPopular: false, rating: 4.4 },
  { id: 'item-9', name: 'Chicken Tikka Masala', price: 350, category: 'North Indian', description: 'Roasted chicken chunks in spicy sauce', diet: 'NON-VEG', image: '/MenuItems/chicken_tikka_masala_1780087919780.png', isVisible: true, isOutOfStock: false, prepTime: 25, isPopular: true, rating: 4.7 },
  { id: 'item-10', name: 'Garlic Naan', price: 60, category: 'North Indian', description: 'Soft flatbread topped with garlic and butter', diet: 'VEG', image: '/MenuItems/garlic_naan_1780088115434.png', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: true, rating: 4.9 },
  { id: 'item-11', name: 'Jeera Rice', price: 140, category: 'North Indian', description: 'Basmati rice flavored with cumin seeds', diet: 'VEG', image: '/MenuItems/jeera_rice_1780088130089.png', isVisible: true, isOutOfStock: false, prepTime: 20, isPopular: false, rating: 4.2 },
  { id: 'item-12', name: 'Mutton Rogan Josh', price: 420, category: 'North Indian', description: 'Aromatic lamb dish of Persian origin', diet: 'NON-VEG', image: '/MenuItems/mutton_rogan_josh_1780088020789.png', isVisible: true, isOutOfStock: false, prepTime: 40, isPopular: true, rating: 4.8 },
  { id: 'item-13', name: 'Palak Paneer', price: 250, category: 'North Indian', description: 'Paneer in a thick paste made from puréed spinach', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Palakpaneer_Rayagada_Odisha_0009.jpg/960px-Palakpaneer_Rayagada_Odisha_0009.jpg', isVisible: true, isOutOfStock: false, prepTime: 25, isPopular: false, rating: 4.5 },
  { id: 'item-14', name: 'Malai Kofta', price: 270, category: 'North Indian', description: 'Potato and paneer balls in a rich creamy gravy', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Koofteh_tabrizi.jpg/960px-Koofteh_tabrizi.jpg', isVisible: true, isOutOfStock: false, prepTime: 30, isPopular: false, rating: 4.6 },
  { id: 'item-15', name: 'Tandoori Roti', price: 30, category: 'North Indian', description: 'Whole wheat flatbread baked in a tandoor', diet: 'VEG', image: '/MenuItems/tandoori_roti_1780087936178.png', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: true, rating: 4.8 },
  { id: 'item-16', name: 'Chicken Biryani', price: 310, category: 'North Indian', description: 'Fragrant basmati rice cooked with marinated chicken', diet: 'NON-VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/960px-%22Hyderabadi_Dum_Biryani%22.jpg', isVisible: true, isOutOfStock: false, prepTime: 35, isPopular: true, rating: 4.9 },
  
  // Chinese
  { id: 'item-17', name: 'Chilli Chicken Dry', price: 290, category: 'Chinese', description: 'Crispy chicken tossed in spicy chilli sauce', diet: 'NON-VEG', image: '/MenuItems/chilli_chicken_dry_1780088145429.png', isVisible: true, isOutOfStock: false, prepTime: 20, isPopular: true, rating: 4.6 },
  { id: 'item-18', name: 'Veg Fried Rice', price: 170, category: 'Chinese', description: 'Classic wok-tossed rice with mixed vegetables', diet: 'VEG', image: '/MenuItems/veg_fried_rice_1780088161193.png', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: false, rating: 4.3 },
  { id: 'item-19', name: 'Chicken Fried Rice', price: 220, category: 'Chinese', description: 'Wok-tossed rice with tender chicken pieces', diet: 'NON-VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Koh_Mak%2C_Thailand%2C_Fried_rice_with_seafood%2C_Thai_fried_rice.jpg/960px-Koh_Mak%2C_Thailand%2C_Fried_rice_with_seafood%2C_Thai_fried_rice.jpg', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: true, rating: 4.7 },
  { id: 'item-20', name: 'Spring Rolls', price: 150, category: 'Chinese', description: 'Crispy rolls stuffed with julienned vegetables', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Spring_Rolls_%283357696061%29.jpg/960px-Spring_Rolls_%283357696061%29.jpg', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: false, rating: 4.4 },
  { id: 'item-21', name: 'Sweet Corn Soup', price: 110, category: 'Chinese', description: 'Comforting thick soup with sweet corn kernels', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Corn_soup.jpg/960px-Corn_soup.jpg', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: false, rating: 4.2 },
  { id: 'item-22', name: 'Chilli Paneer', price: 260, category: 'Chinese', description: 'Cottage cheese cubes tossed in spicy soy sauce', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/ChineseDishLogo.png', isVisible: true, isOutOfStock: false, prepTime: 20, isPopular: false, rating: 4.5 },
  { id: 'item-23', name: 'Chicken Lollipop', price: 320, category: 'Chinese', description: 'Crispy and spicy fried chicken wings', diet: 'NON-VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Chicken_lollipop_in_Goa.jpg/960px-Chicken_lollipop_in_Goa.jpg', isVisible: true, isOutOfStock: false, prepTime: 25, isPopular: true, rating: 4.8 },
  { id: 'item-24', name: 'Schezwan Noodles', price: 190, category: 'Chinese', description: 'Spicy noodles tossed in fiery schezwan sauce', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Homemade_Chow_mein_with_shrimps_and_meat_with_a_choy_and_Choung.jpg/960px-Homemade_Chow_mein_with_shrimps_and_meat_with_a_choy_and_Choung.jpg', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: false, rating: 4.3 },
  
  // Fast Food & Snacks
  { id: 'item-25', name: 'Classic Veg Burger', price: 120, category: 'Fast Food', description: 'Crispy veg patty with fresh lettuce and mayo', diet: 'VEG', image: '/MenuItems/classic_veg_burger_1780088175008.png', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: true, rating: 4.5 },
  { id: 'item-26', name: 'Chicken Cheese Burger', price: 180, category: 'Fast Food', description: 'Juicy chicken patty with melted cheese', diet: 'NON-VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cheeseburger.jpg/960px-Cheeseburger.jpg', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: true, rating: 4.7 },
  { id: 'item-27', name: 'French Fries', price: 100, category: 'Fast Food', description: 'Crispy golden potato fries salted to perfection', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/8/83/French_Fries.JPG', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: true, rating: 4.8 },
  { id: 'item-28', name: 'Margherita Pizza', price: 250, category: 'Fast Food', description: 'Classic pizza with tomato sauce and mozzarella', diet: 'VEG', image: '/MenuItems/margherita_pizza_1780088072576.png', isVisible: true, isOutOfStock: false, prepTime: 20, isPopular: true, rating: 4.6 },
  { id: 'item-29', name: 'Pepperoni Pizza', price: 350, category: 'Fast Food', description: 'Loaded with cheese and premium pepperoni slices', diet: 'NON-VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Pepperoni_Pizza_%2829204589095%29.jpg/960px-Pepperoni_Pizza_%2829204589095%29.jpg', isVisible: true, isOutOfStock: false, prepTime: 20, isPopular: true, rating: 4.8 },
  { id: 'item-30', name: 'Paneer Wrap', price: 160, category: 'Fast Food', description: 'Spiced paneer wrapped in a soft tortilla', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Kolkata_Rolls.jpg/960px-Kolkata_Rolls.jpg', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: false, rating: 4.3 },
  
  // Beverages
  { id: 'item-31', name: 'Mango Lassi', price: 90, category: 'Beverages', description: 'Sweet yogurt drink blended with mango pulp', diet: 'VEG', image: '/MenuItems/mango_lassi_1780087951319.png', isVisible: true, isOutOfStock: false, prepTime: 5, isPopular: true, rating: 4.8 },
  { id: 'item-32', name: 'Fresh Lime Soda', price: 70, category: 'Beverages', description: 'Refreshing fizzy drink with lemon and mint', diet: 'VEG', image: '/MenuItems/fresh_lime_soda_1780088192673.png', isVisible: true, isOutOfStock: false, prepTime: 5, isPopular: false, rating: 4.5 },
  { id: 'item-33', name: 'Masala Chai', price: 40, category: 'Beverages', description: 'Indian spiced tea brewed with milk', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Chai_In_Sakora.jpg', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: true, rating: 4.9 },
  { id: 'item-34', name: 'Cappuccino', price: 110, category: 'Beverages', description: 'Rich espresso topped with frothy milk', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Cappuccino_in_original.jpg/960px-Cappuccino_in_original.jpg', isVisible: true, isOutOfStock: false, prepTime: 5, isPopular: false, rating: 4.4 },
  { id: 'item-35', name: 'Virgin Mojito', price: 130, category: 'Beverages', description: 'Mint and lime muddled with sparkling water', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/15-09-26-RalfR-WLC-0072.jpg/960px-15-09-26-RalfR-WLC-0072.jpg', isVisible: true, isOutOfStock: false, prepTime: 5, isPopular: true, rating: 4.7 },
  { id: 'item-36', name: 'Oreo Shake', price: 150, category: 'Beverages', description: 'Thick milkshake blended with Oreo cookies', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Strawberry_milk_shake_%28cropped%29.jpg/960px-Strawberry_milk_shake_%28cropped%29.jpg', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: true, rating: 4.8 },
  
  // Desserts
  { id: 'item-37', name: 'Gulab Jamun', price: 80, category: 'Desserts', description: 'Deep-fried milk dumplings soaked in sugar syrup', diet: 'VEG', image: '/MenuItems/gulab_jamun_1780088050152.png', isVisible: true, isOutOfStock: false, prepTime: 5, isPopular: true, rating: 4.9 },
  { id: 'item-38', name: 'Rasmalai', price: 110, category: 'Desserts', description: 'Soft paneer discs in sweetened thickened milk', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Ras_Malai_2.JPG/960px-Ras_Malai_2.JPG', isVisible: true, isOutOfStock: false, prepTime: 5, isPopular: true, rating: 4.8 },
  { id: 'item-39', name: 'Vanilla Ice Cream', price: 90, category: 'Desserts', description: 'Two scoops of classic vanilla bean ice cream', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg/960px-Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg', isVisible: true, isOutOfStock: false, prepTime: 5, isPopular: false, rating: 4.5 },
  { id: 'item-40', name: 'Cheesecake', price: 200, category: 'Desserts', description: 'New York style baked cheesecake', diet: 'VEG', image: '/MenuItems/cheesecake_1780088208452.png', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: true, rating: 4.7 },
  
  // South Indian
  { id: 'item-41', name: 'Masala Dosa', price: 140, category: 'South Indian', description: 'Crispy crepe filled with spiced potato mash', diet: 'VEG', image: '/MenuItems/masala_dosa_1780088036920.png', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: true, rating: 4.8 },
  { id: 'item-42', name: 'Idli Sambar', price: 100, category: 'South Indian', description: 'Steamed rice cakes served with lentil stew', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Idli_Sambar.JPG', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: true, rating: 4.7 },
  { id: 'item-43', name: 'Medu Vada', price: 110, category: 'South Indian', description: 'Crispy lentil donuts served with chutney', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Medu_Vadas.JPG/960px-Medu_Vadas.JPG', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: false, rating: 4.4 },
  { id: 'item-44', name: 'Rava Onion Dosa', price: 160, category: 'South Indian', description: 'Semolina crepe topped with chopped onions', diet: 'VEG', image: '/MenuItems/rava_onion_dosa_1780137350981.png', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: true, rating: 4.6 },
  
  // Salads & Healthy
  { id: 'item-45', name: 'Greek Salad', price: 210, category: 'Healthy', description: 'Fresh veggies, feta cheese, and olive oil', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Greece_Food_Horiatiki.JPG/960px-Greece_Food_Horiatiki.JPG', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: false, rating: 4.5 },
  { id: 'item-46', name: 'Chicken Caesar Salad', price: 260, category: 'Healthy', description: 'Romaine lettuce, croutons, parmesan, grilled chicken', diet: 'NON-VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Caesar_salad_%282%29.jpg/960px-Caesar_salad_%282%29.jpg', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: true, rating: 4.7 },
  { id: 'item-47', name: 'Quinoa Bowl', price: 280, category: 'Healthy', description: 'Nutritious quinoa with roasted veggies and hummus', diet: 'VEG', image: '/MenuItems/quinoa_bowl_1780087970817.png', isVisible: true, isOutOfStock: false, prepTime: 15, isPopular: false, rating: 4.6 },
  { id: 'item-48', name: 'Fruit Bowl', price: 150, category: 'Healthy', description: 'Assorted seasonal fresh fruits', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Fruktsallad_%28Fruit_salad%29.jpg/960px-Fruktsallad_%28Fruit_salad%29.jpg', isVisible: true, isOutOfStock: false, prepTime: 10, isPopular: true, rating: 4.8 },
  
  // Extras
  { id: 'item-49', name: 'Papad', price: 30, category: 'Extras', description: 'Crispy roasted lentil wafer', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Roasted_Papad_-_Howrah_2013-11-02_4068.jpg/960px-Roasted_Papad_-_Howrah_2013-11-02_4068.jpg', isVisible: true, isOutOfStock: false, prepTime: 5, isPopular: false, rating: 4.2 },
  { id: 'item-50', name: 'Mixed Raita', price: 70, category: 'Extras', description: 'Yogurt mixed with finely chopped veggies', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Cucumber-raita.jpg/960px-Cucumber-raita.jpg', isVisible: true, isOutOfStock: false, prepTime: 5, isPopular: true, rating: 4.6 },
  { id: 'item-51', name: 'Extra Butter', price: 20, category: 'Extras', description: 'A dollop of fresh butter', diet: 'VEG', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/%C5%A0v%C3%A9dsk%C3%BD_kol%C3%A1%C4%8D_naruby_904_%28cropped%29.JPG/960px-%C5%A0v%C3%A9dsk%C3%BD_kol%C3%A1%C4%8D_naruby_904_%28cropped%29.JPG', isVisible: true, isOutOfStock: false, prepTime: 1, isPopular: false, rating: 4.4 }
];


async function main() {
  console.log('Seeding menu catalogue...');
  
  for (let i=0; i<DEFAULT_MENU_CATALOGUE.length; i++) {
    const item = DEFAULT_MENU_CATALOGUE[i];
    
    // Add default attributes depending on category
    let attributes: any[] = [];
    if (item.category === 'Fast Food' && item.name.includes('Pizza')) {
      attributes = [
        { name: 'Size', type: 'SINGLE', isRequired: true, sortOrder: 1, options: [
          { name: 'Regular', additionalPrice: 0 },
          { name: 'Medium', additionalPrice: 100 },
          { name: 'Large', additionalPrice: 200 },
        ]},
        { name: 'Crust', type: 'SINGLE', isRequired: true, sortOrder: 2, options: [
          { name: 'New Hand Tossed', additionalPrice: 0 },
          { name: 'Cheese Burst', additionalPrice: 120 },
        ]}
      ];
    } else if (item.category === 'Beverages') {
       attributes = [
        { name: 'Size', type: 'SINGLE', isRequired: true, sortOrder: 1, options: [
          { name: 'Regular', additionalPrice: 0 },
          { name: 'Large', additionalPrice: 50 },
        ]}
      ];
    } else if (item.diet === 'VEG' || item.diet === 'NON-VEG') {
      // General mains
      attributes = [
        { name: 'Portion', type: 'SINGLE', isRequired: true, sortOrder: 1, options: [
          { name: 'Half', additionalPrice: 0 },
          { name: 'Full', additionalPrice: Math.floor(item.price * 0.8) }, // ~80% extra for full
        ]},
        { name: 'Spice Level', type: 'SINGLE', isRequired: true, sortOrder: 2, options: [
          { name: 'Mild', additionalPrice: 0 },
          { name: 'Medium', additionalPrice: 0 },
          { name: 'Spicy', additionalPrice: 0 },
        ]}
      ];
    }

    const payload = {
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      diet: item.diet,
      category: item.category,
      isAvailable: !item.isOutOfStock,
      prepTime: item.prepTime,
      isPopular: item.isPopular,
      rating: item.rating,
      reviewCount: Math.floor(Math.random() * 200) + 15,
      sortOrder: i,
      attributes: attributes
    };

    try {
      const res = await fetch('http://localhost:3000/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.error(`Failed to seed ${item.name}:`, await res.text());
      } else {
        console.log(`Successfully seeded ${item.name}`);
      }
    } catch (err: any) {
      console.error(`Error connecting to API for ${item.name}:`, err.message);
    }
  }

  console.log('Successfully seeded 50+ menu items into the database!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
