const fs = require('fs');
const https = require('https');
const path = require('path');

const dataFile = path.join(__dirname, 'apps/web/app/data.ts');
let dataContent = fs.readFileSync(dataFile, 'utf8');

const items = [
  'Dal Makhani', 'Kadai Paneer', 'Chicken Tikka Masala', 'Garlic Naan', 'Jeera Rice', 'Rogan Josh', 'Palak Paneer', 'Malai Kofta', 'Roti', 'Biryani',
  'Chilli Chicken', 'Fried Rice', 'Spring roll', 'Corn soup', 'Chilli Paneer', 'Chicken Lollipop', 'Schezwan Noodles',
  'Veggie burger', 'Chicken Burger', 'French fries', 'Margherita Pizza', 'Pepperoni', 'Wrap',
  'Lassi', 'Soda', 'Masala chai', 'Cappuccino', 'Mojito', 'Milkshake',
  'Gulab jamun', 'Ras malai', 'Ice cream', 'Cheesecake',
  'Dosa', 'Idli', 'Vada (food)', 'Rava Dosa',
  'Greek salad', 'Caesar salad', 'Quinoa', 'Fruit salad',
  'Papadam', 'Raita', 'Butter'
];

async function fetchWikiImage(query) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=600`;
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
  console.log('Starting image fetch...');
  for (const item of items) {
    const url = await fetchWikiImage(item);
    if (url) {
      console.log(`Found image for ${item}: ${url}`);
      const baseName = item.split(' ')[0].replace(/\W/g, ''); // safe regex base
      const regex = new RegExp(`name:\\s*'[^']*?${baseName}[^']*?'.*?image:\\s*null`);
      const match = dataContent.match(regex);
      if (match) {
        const replacement = match[0].replace('image: null', `image: '${url}'`);
        dataContent = dataContent.replace(match[0], replacement);
      }
    } else {
      console.log(`No image for ${item}`);
    }
  }
  
  fs.writeFileSync(dataFile, dataContent);
  console.log('Done mapping images.');
}

run();
