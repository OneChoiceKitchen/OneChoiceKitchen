const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'apps/web/app/data.ts');
let dataContent = fs.readFileSync(dataFile, 'utf8');

const replacements = {
  "'/paneer_tikka.png'": "'/generated_images/paneer_tikka.png'",
  "'/butter_chicken.png'": "'/generated_images/butter_chicken.png'",
  "'/veg_noodles.png'": "'/generated_images/veg_noodles.png'",
  "'/manchurian.png'": "'/generated_images/manchurian.png'",
  "'/cold_coffee.png'": "'/generated_images/cold_coffee.png'",
  "'/chocolate_brownie.png'": "'/generated_images/chocolate_brownie.png'"
};

for (const [oldVal, newVal] of Object.entries(replacements)) {
  dataContent = dataContent.replace(new RegExp(oldVal, 'g'), newVal);
}

// Add Rava Onion Dosa
const dosaRegex = /name:\s*'Rava Onion Dosa'.*?image:\s*(null|'[^']*')/;
const dosaMatch = dataContent.match(dosaRegex);
if (dosaMatch) {
  const replacement = dosaMatch[0].replace(/image:\s*(null|'[^']*')/, `image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Dosa_and_ghee.jpg/960px-Dosa_and_ghee.jpg'`);
  dataContent = dataContent.replace(dosaMatch[0], replacement);
}

fs.writeFileSync(dataFile, dataContent);

const layoutFile = path.join(__dirname, 'apps/web/app/layout.tsx');
let layoutContent = fs.readFileSync(layoutFile, 'utf8');
// Assuming standard Next.js layout metadata uses the default favicon implicitly. We don't need to change layout if they didn't explicitly reference it.
// Let's check if it references it.

const pageFile = path.join(__dirname, 'apps/web/app/page.tsx');
let pageContent = fs.readFileSync(pageFile, 'utf8');
pageContent = pageContent.replace('src="/favicon.ico"', 'src="/branding/favicon.ico"');

fs.writeFileSync(pageFile, pageContent);

console.log('Done mapping updates.');
