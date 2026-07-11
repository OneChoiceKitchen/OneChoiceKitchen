const fs = require('fs');
const https = require('https');
const path = require('path');

const dataFile = path.join(__dirname, 'apps/web/app/data.ts');
let dataContent = fs.readFileSync(dataFile, 'utf8');
const publicDir = path.join(__dirname, 'apps/web/public/wiki_images');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const missingItems = {
  'Schezwan Noodles': 'Chow mein',
  'Chicken Cheese Burger': 'Cheeseburger',
  'French Fries': 'French fries',
  'Masala Chai': 'Masala chai',
  'Cappuccino': 'Cappuccino',
  'Virgin Mojito': 'Mojito',
  'Vanilla Ice Cream': 'Ice cream',
  'Idli Sambar': 'Idli',
  'Medu Vada': 'Vada (food)',
  'Rava Onion Dosa': 'Dosa',
  'Chicken Caesar Salad': 'Caesar salad',
  'Papad': 'Papadam',
  'Mixed Raita': 'Raita'
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWikiImage(wikiTitle) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&format=json&pithumbsize=600`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
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

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    };
    https.get(url, options, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching and downloading remaining images...');
  for (const [itemName, wikiTitle] of Object.entries(missingItems)) {
    console.log(`Fetching wiki URL for ${itemName}...`);
    const url = await fetchWikiImage(wikiTitle);
    await sleep(2000); // Wait 2s to avoid 429
    if (url) {
      console.log(`Found image for ${itemName}: ${url}`);
      const filename = url.split('/').pop().replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const dest = path.join(publicDir, filename);
      try {
        await downloadImage(url, dest);
        console.log(`Downloaded ${filename} successfully.`);
        const localPath = `/wiki_images/${filename}`;
        
        const regex = new RegExp(`name:\\s*'${itemName}'.*?image:\\s*(null|'[^']*')`);
        const match = dataContent.match(regex);
        if (match) {
          const replacement = match[0].replace(/image:\s*(null|'[^']*')/, `image: '${localPath}'`);
          dataContent = dataContent.replace(match[0], replacement);
        }
      } catch(e) {
        console.error(`Failed to download ${url}: ${e.message}`);
      }
    } else {
      console.log(`No image for ${itemName} (tried ${wikiTitle})`);
    }
    await sleep(2000); // Wait 2s before next loop
  }
  
  fs.writeFileSync(dataFile, dataContent);
  console.log('Done mapping missing images.');
}

run();
