const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'apps/web/app/data.ts');
let dataContent = fs.readFileSync(dataFile, 'utf8');

const mapping = {
  'Chicken Tikka Masala': 'chicken_tikka_masala_1780087919780.png',
  'Tandoori Roti': 'tandoori_roti_1780087936178.png',
  'Mango Lassi': 'mango_lassi_1780087951319.png',
  'Quinoa Bowl': 'quinoa_bowl_1780087970817.png',
  'Dal Makhani': 'dal_makhani_1780087988049.png',
  'Kadai Paneer': 'kadai_paneer_1780088004507.png',
  'Mutton Rogan Josh': 'mutton_rogan_josh_1780088020789.png',
  'Masala Dosa': 'masala_dosa_1780088036920.png',
  'Gulab Jamun': 'gulab_jamun_1780088050152.png',
  'Margherita Pizza': 'margherita_pizza_1780088072576.png',
  'Garlic Naan': 'garlic_naan_1780088115434.png',
  'Jeera Rice': 'jeera_rice_1780088130089.png',
  'Chilli Chicken Dry': 'chilli_chicken_dry_1780088145429.png',
  'Veg Fried Rice': 'veg_fried_rice_1780088161193.png',
  'Classic Veg Burger': 'classic_veg_burger_1780088175008.png',
  'Fresh Lime Soda': 'fresh_lime_soda_1780088192673.png',
  'Cheesecake': 'cheesecake_1780088208452.png'
};

for (const [name, file] of Object.entries(mapping)) {
  const regex = new RegExp(`name:\\s*'${name}'.*?image:\\s*(null|'[^']*')`);
  const match = dataContent.match(regex);
  if (match) {
    const replacement = match[0].replace(/image:\s*(null|'[^']*')/, `image: '/generated_images/${file}'`);
    dataContent = dataContent.replace(match[0], replacement);
    console.log(`Updated ${name}`);
  }
}

fs.writeFileSync(dataFile, dataContent);
console.log('Done mapping AI generated images.');
