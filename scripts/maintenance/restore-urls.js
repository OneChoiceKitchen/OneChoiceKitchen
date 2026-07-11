const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'apps/web/app/data.ts');
let dataContent = fs.readFileSync(dataFile, 'utf8');

const map = {
  'Tandoori Roti': '/generated_images/tandoori_roti_1780087936178.png',
  'Chicken Biryani': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%22Hyderabadi_Dum_Biryani%22.jpg/960px-%22Hyderabadi_Dum_Biryani%22.jpg',
  'Spring Rolls': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Spring_Rolls_%283357696061%29.jpg/960px-Spring_Rolls_%283357696061%29.jpg',
  'Sweet Corn Soup': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Corn_soup.jpg/960px-Corn_soup.jpg',
  'Classic Veg Burger': '/generated_images/classic_veg_burger_1780088175008.png',
  'French Fries': 'https://upload.wikimedia.org/wikipedia/commons/8/83/French_Fries.JPG',
  'Pepperoni Pizza': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Pepperoni_Pizza_%2829204589095%29.jpg/960px-Pepperoni_Pizza_%2829204589095%29.jpg',
  'Mango Lassi': '/generated_images/mango_lassi_1780087951319.png',
  'Masala Chai': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Chai_In_Sakora.jpg',
  'Cappuccino': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Cappuccino_in_original.jpg/960px-Cappuccino_in_original.jpg',
  'Virgin Mojito': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/15-09-26-RalfR-WLC-0072.jpg/960px-15-09-26-RalfR-WLC-0072.jpg',
  'Oreo Shake': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Strawberry_milk_shake_%28cropped%29.jpg/960px-Strawberry_milk_shake_%28cropped%29.jpg',
  'Gulab Jamun': '/generated_images/gulab_jamun_1780088050152.png',
  'Rasmalai': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Ras_Malai_2.JPG/960px-Ras_Malai_2.JPG',
  'Vanilla Ice Cream': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg/960px-Ice_cream_with_whipped_cream%2C_chocolate_syrup%2C_and_a_wafer_%28cropped%29.jpg',
  'Cheesecake': '/generated_images/cheesecake_1780088208452.png',
  'Idli Sambar': 'https://upload.wikimedia.org/wikipedia/commons/1/11/Idli_Sambar.JPG',
  'Medu Vada': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Medu_Vadas.JPG/960px-Medu_Vadas.JPG',
  'Greek Salad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Greece_Food_Horiatiki.JPG/960px-Greece_Food_Horiatiki.JPG',
  'Chicken Caesar Salad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Caesar_salad_%282%29.jpg/960px-Caesar_salad_%282%29.jpg',
  'Quinoa Bowl': '/generated_images/quinoa_bowl_1780087970817.png',
  'Fruit Bowl': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Fruktsallad_%28Fruit_salad%29.jpg/960px-Fruktsallad_%28Fruit_salad%29.jpg',
  'Papad': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Roasted_Papad_-_Howrah_2013-11-02_4068.jpg/960px-Roasted_Papad_-_Howrah_2013-11-02_4068.jpg',
  'Mixed Raita': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Cucumber-raita.jpg/960px-Cucumber-raita.jpg',
  'Extra Butter': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/%C5%A0v%C3%A9dsk%C3%BD_kol%C3%A1%C4%8D_naruby_904_%28cropped%29.JPG/960px-%C5%A0v%C3%A9dsk%C3%BD_kol%C3%A1%C4%8D_naruby_904_%28cropped%29.JPG',
  'Palak Paneer': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Palakpaneer_Rayagada_Odisha_0009.jpg/960px-Palakpaneer_Rayagada_Odisha_0009.jpg',
  'Malai Kofta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Koofteh_tabrizi.jpg/960px-Koofteh_tabrizi.jpg',
  'Chicken Fried Rice': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Koh_Mak%2C_Thailand%2C_Fried_rice_with_seafood%2C_Thai_fried_rice.jpg/960px-Koh_Mak%2C_Thailand%2C_Fried_rice_with_seafood%2C_Thai_fried_rice.jpg',
  'Chilli Paneer': 'https://upload.wikimedia.org/wikipedia/commons/8/8d/ChineseDishLogo.png',
  'Chicken Lollipop': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Chicken_lollipop_in_Goa.jpg/960px-Chicken_lollipop_in_Goa.jpg',
  'Schezwan Noodles': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Homemade_Chow_mein_with_shrimps_and_meat_with_a_choy_and_Choung.jpg/960px-Homemade_Chow_mein_with_shrimps_and_meat_with_a_choy_and_Choung.jpg',
  'Chicken Cheese Burger': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cheeseburger.jpg/960px-Cheeseburger.jpg',
  'Paneer Wrap': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Kolkata_Rolls.jpg/960px-Kolkata_Rolls.jpg'
};

for (const [name, url] of Object.entries(map)) {
  const regex = new RegExp(`name:\\s*'${name}'.*?image:\\s*(null|'[^']*')`);
  const match = dataContent.match(regex);
  if (match) {
    const replacement = match[0].replace(/image:\s*(null|'[^']*')/, `image: '${url}'`);
    dataContent = dataContent.replace(match[0], replacement);
    console.log(`Restored ${name}`);
  }
}

fs.writeFileSync(dataFile, dataContent);
console.log('Done restoring wiki URLs.');
