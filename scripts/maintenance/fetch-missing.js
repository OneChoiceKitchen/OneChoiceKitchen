const fs = require('fs');
const https = require('https');
const path = require('path');

const dataFile = path.join(__dirname, 'apps/web/app/data.ts');
let dataContent = fs.readFileSync(dataFile, 'utf8');

const missingItems = {
  'Palak Paneer': 'Palak paneer',
  'Malai Kofta': 'Kofta',
  'Chicken Fried Rice': 'Fried rice',
  'Chilli Paneer': 'Indian Chinese cuisine',
  'Chicken Lollipop': 'Chicken lollipop',
  'Schezwan Noodles': 'Chow mein',
  'Chicken Cheese Burger': 'Cheeseburger',
  'Paneer Wrap': 'Kati roll',
  'Masala Chai': 'Masala chai',
  'Oreo Shake': 'Milkshake',
  'Rava Onion Dosa': 'Rava dosa',
  'Fruit Bowl': 'Fruit salad',
  'Papad': 'Papadam',
  'Extra Butter': 'Butter'
};

async function fetchWikiImage(wikiTitle) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=600`;
    const options = {
      headers: {
        'User-Agent': 'RestaurantSaaS/1.0 (test@example.com)'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const pages = parsed.query.pages;
          const page = Object.values(pages)[0];
          resolve(page && page.thumbnail ? page.thumbnail.source : null);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  console.log('Fetching missing images...');
  for (const [itemName, wikiTitle] of Object.entries(missingItems)) {
    const url = await fetchWikiImage(wikiTitle);
    if (url) {
      console.log(`Found image for ${itemName}: ${url}`);
      const regex = new RegExp(`name:\\s*'${itemName}'.*?image:\\s*(null|'[^']*')`);
      const match = dataContent.match(regex);
      if (match) {
        const replacement = match[0].replace(/image:\s*(null|'[^']*')/, `image: '${url}'`);
        dataContent = dataContent.replace(match[0], replacement);
      }
    } else {
      console.log(`No image for ${itemName} (tried ${wikiTitle})`);
    }
  }
  
  fs.writeFileSync(dataFile, dataContent);
  console.log('Done mapping missing images.');
}

run();
