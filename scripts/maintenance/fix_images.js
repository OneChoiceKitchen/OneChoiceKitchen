const { createClient } = require('@libsql/client');

const client = createClient({ url: 'file:dev.db' });

const DEFAULT_SLIDER_ITEMS = [
  { title: 'Delicious Tiffin Service', description: 'Subscribe to our healthy and fresh daily tiffins.', buttonText: 'View Plans', link: '/tiffin', bgColor: 'linear-gradient(135deg, #ef4444, #991b1b)', fontColor: '#ffffff', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: '/images/tiffin/tiffin_veg_thali_1781196010180.png' },
  { title: 'Special Weekend Menu', description: 'Treat yourself with our special weekend menu items.', buttonText: 'Order Now', link: '/menu', bgColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', fontColor: '#ffffff', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: '/images/tiffin/tiffin_pulao_raita_1781196023755.png' },
  { title: 'Healthy Salads', description: 'Fresh and crisp salads made with organic ingredients.', buttonText: 'Explore Salads', link: '/menu', bgColor: 'linear-gradient(135deg, #10b981, #047857)', fontColor: '#ffffff', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: '/images/tiffin/tiffin_chicken_curry_1781196192018.png' },
  { title: 'Corporate Catering', description: 'Bulk orders and corporate packages available.', buttonText: 'Contact Us', link: '/support', bgColor: 'linear-gradient(135deg, #8b5cf6, #5b21b6)', fontColor: '#ffffff', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: '/images/tiffin/tiffin_chinese_1781196131053.png' },
  { title: 'Dessert Delights', description: 'Satisfy your sweet tooth with our exquisite desserts.', buttonText: 'View Desserts', link: '/menu', bgColor: 'linear-gradient(135deg, #ec4899, #be185d)', fontColor: '#ffffff', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: '/images/tiffin/tiffin_egg_curry_1781196164220.png' },
  { title: 'Family Combos', description: 'Perfect meals for the whole family at discounted prices.', buttonText: 'Order Combos', link: '/menu', bgColor: 'linear-gradient(135deg, #f59e0b, #b45309)', fontColor: '#ffffff', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: '/images/tiffin/tiffin_fish_curry_1781196177679.png' },
  { title: 'Vegan Options', description: '100% plant-based delicious meals delivered.', buttonText: 'Vegan Menu', link: '/menu', bgColor: 'linear-gradient(135deg, #14b8a6, #0f766e)', fontColor: '#ffffff', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: '/images/tiffin/tiffin_idli_sambar_1781196087346.png' },
  { title: 'Festive Specials', description: 'Celebrate with our limited-time festive dishes.', buttonText: 'Order Now', link: '/menu', bgColor: 'linear-gradient(135deg, #eab308, #a16207)', fontColor: '#ffffff', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: '/images/tiffin/tiffin_kadi_chawal_1781196074162.png' }
];

async function main() {
  const rs = await client.execute("SELECT id FROM PortalSlider WHERE portal = 'web'");
  if (rs.rows.length > 0) {
    console.log("Web portal sliders already exist. Deleting existing to replace with defaults...");
    await client.execute("DELETE FROM PortalSlider WHERE portal = 'web'");
  }

  const crypto = require('crypto');
  let orderIndex = 0;
  for (const item of DEFAULT_SLIDER_ITEMS) {
    await client.execute({
      sql: `INSERT INTO PortalSlider (id, portal, title, description, buttonText, link, bgColor, fontColor, btnColor, imageUrl, isActive, orderIndex, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        crypto.randomUUID(),
        'web',
        item.title,
        item.description,
        item.buttonText,
        item.link,
        item.bgColor,
        item.fontColor,
        item.btnColor,
        item.imageUrl,
        1,
        orderIndex++
      ]
    });
  }
  console.log("Successfully inserted default sliders with proper food images into Admin Panel.");
}

main().catch(console.error);
