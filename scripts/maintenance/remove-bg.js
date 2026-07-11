const Jimp = require('jimp');
const fs = require('fs');

async function removeWhiteBg() {
  const image = await Jimp.read('apps/web/public/branding/logo-icon.png');
  
  const tolerance = 25; // Increase tolerance for slight off-white
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    if (r > 255 - tolerance && g > 255 - tolerance && b > 255 - tolerance) {
      this.bitmap.data[idx + 3] = 0; 
    }
  });

  // Array of target paths
  const targets = [
    'apps/web/public/favicon.png',
    'apps/web/public/favicon.ico',
    'apps/web/public/branding/favicon.ico',
    'apps/admin-portal/public/favicon.png',
    'apps/admin-portal/public/favicon.ico',
    'apps/partner-portal/public/favicon.png',
    'apps/partner-portal/public/favicon.ico',
    'apps/rider-portal/public/favicon.png',
    'apps/rider-portal/public/favicon.ico',
    'apps/api/public/favicon.png',
    'apps/api/public/favicon.ico'
  ];

  for (const target of targets) {
    try {
      // Create folder if not exists
      const dir = target.substring(0, target.lastIndexOf('/'));
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
      }
      await image.writeAsync(target);
      console.log('Saved to ' + target);
    } catch (e) {
      console.log('Skipping ' + target);
    }
  }
}

removeWhiteBg().catch(console.error);
