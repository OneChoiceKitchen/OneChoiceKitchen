const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  try {
    await page.goto('http://localhost:4205');
    console.log('Navigated to admin portal');
    
    // Login
    await page.fill('input[type="email"]', 'admin@onechoicekitchen.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    console.log('Logged in');
    
    // Wait for Dashboard to load
    await page.waitForTimeout(2000);
    
    // Click SEO & Branding
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div'));
      const seoItem = items.find(el => el.textContent && el.textContent.includes('SEO & Branding'));
      if (seoItem) seoItem.click();
    });
    console.log('Clicked SEO tab');
    
    // Wait a bit
    await page.waitForTimeout(2000);
    
    // Dump HTML of main
    const mainHtml = await page.evaluate(() => document.querySelector('main')?.innerHTML || 'No main element');
    console.log('MAIN HTML:', mainHtml);
    
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
})();
