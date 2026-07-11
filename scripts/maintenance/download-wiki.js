const fs = require('fs');
const https = require('https');
const path = require('path');

const dataFile = path.join(__dirname, 'apps/web/app/data.ts');
let dataContent = fs.readFileSync(dataFile, 'utf8');
const publicDir = path.join(__dirname, 'apps/web/public/wiki_images');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  console.log('Downloading wiki images locally with delay...');
  const regex = /image:\s*'([^']*(?:wikimedia)[^']*)'/g;
  let match;
  let matches = [];
  while ((match = regex.exec(dataContent)) !== null) {
    matches.push(match[1]);
  }

  console.log(`Found ${matches.length} wikimedia images.`);
  
  for (const url of matches) {
    const filename = url.split('/').pop().replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const dest = path.join(publicDir, filename);
    console.log(`Downloading ${filename}...`);
    try {
      await downloadImage(url, dest);
      const localPath = `/wiki_images/${filename}`;
      dataContent = dataContent.replace(`'${url}'`, `'${localPath}'`);
      await sleep(1000); // 1 second delay
    } catch (e) {
      console.error(`Error downloading ${filename}: ${e.message}`);
      if (e.message.includes('429') || e.message.includes('403')) {
        console.log(`Removing broken URL for ${filename} to prevent broken icon.`);
        dataContent = dataContent.replace(`'${url}'`, 'null');
      }
    }
  }

  fs.writeFileSync(dataFile, dataContent);
  console.log('Done downloading images and updating data.ts.');
}

run();
