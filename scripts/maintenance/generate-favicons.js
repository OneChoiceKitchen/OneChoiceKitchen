const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = path.join(__dirname, 'apps/web/public/branding/transpatent-logo-icon.png');

const directories = [
  'apps/web/public',
  'api/public',
  'apps/admin/admin-portal/public',
  'apps/partner/partner-portal/public',
  'apps/rider/rider-portal/public'
];

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 }
];

const filesToRemove = [
  'favicon.ico',
  'favicon.png',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png'
];

async function generate() {
  console.log('Generating favicons from pure transparent logo...');
  
  if (!fs.existsSync(sourceImage)) {
    console.error('Source image not found:', sourceImage);
    return;
  }

  for (const dir of directories) {
    const targetDir = path.join(__dirname, dir);
    if (!fs.existsSync(targetDir)) {
      console.log(`Directory ${targetDir} does not exist, creating...`);
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Remove old files
    for (const f of filesToRemove) {
      const p = path.join(targetDir, f);
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        console.log(`Deleted old favicon: ${p}`);
      }
    }

    // Generate standard PNG sizes
    for (const { name, size } of sizes) {
      await sharp(sourceImage)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(path.join(targetDir, name));
      console.log(`Saved ${name} to ${dir}`);
    }

    // Create favicon.ico (as a 32x32 PNG for simplicity, which works on all modern browsers)
    await sharp(sourceImage)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(targetDir, 'favicon.ico'));
    console.log(`Saved favicon.ico to ${dir}`);
  }
  
  console.log('Done!');
}

generate().catch(console.error);
