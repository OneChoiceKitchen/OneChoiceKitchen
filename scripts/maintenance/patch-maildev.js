const fs = require('fs');
const path = require('path');

const mailDevHtmlPath = path.join(__dirname, 'node_modules', 'maildev', 'app', 'index.html');

if (fs.existsSync(mailDevHtmlPath)) {
  let content = fs.readFileSync(mailDevHtmlPath, 'utf8');
  
  // Replace title
  content = content.replace(/<title>.*?<\/title>/g, '<title>Mail Dev | One Choice Kitchen</title>');
  
  fs.writeFileSync(mailDevHtmlPath, content);
  console.log('Successfully patched MailDev HTML with One Choice Kitchen branding.');
} else {
  console.log('MailDev index.html not found, skipping patch.');
}
