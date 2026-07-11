const blogsData = [
  {
    title: "The Ultimate Guide to Homestyle Cooking",
    slug: "ultimate-guide-homestyle-cooking",
    category: "Recipes",
    author: "Chef Raj",
    excerpt: "Discover the secrets of authentic homestyle cooking that brings the family together.",
    content: "<p>Homestyle cooking is more than just food; it's an emotion. In this guide, we dive deep into the essential spices, slow-cooking techniques, and traditional recipes that make every meal feel like a warm hug.</p><p>Key ingredients include fresh ginger, garlic, and a custom blend of garam masala.</p>",
    readTime: 5,
    seoTitle: "Homestyle Cooking Guide - One Choice Kitchen",
    seoDescription: "Learn authentic homestyle cooking secrets.",
    views: 1250,
    likes: 85,
    featuredImage: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&q=80",
    isActive: true
  },
  {
    title: "Why Tiffin Services are the Future of Urban Dining",
    slug: "tiffin-services-future-urban-dining",
    category: "Lifestyle",
    author: "Anita Sharma",
    excerpt: "With busy schedules, traditional tiffin services offer the perfect balance of health, taste, and convenience.",
    content: "<p>The modern urban professional rarely has time to cook a fresh, wholesome meal every day. Tiffin services bridge this gap by delivering home-cooked goodness directly to your desk.</p>",
    readTime: 4,
    seoTitle: "Tiffin Services - The Future of Dining",
    seoDescription: "Explore why tiffin services are growing in popularity among urban professionals.",
    views: 940,
    likes: 62,
    featuredImage: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80",
    isActive: true
  },
  {
    title: "Top 5 Superfoods to Boost Your Immunity",
    slug: "top-5-superfoods-immunity",
    category: "Nutrition",
    author: "Dr. Kavita",
    excerpt: "Incorporate these 5 powerful superfoods into your daily diet for a stronger immune system.",
    content: "<p>Immunity is your body's first line of defense. Foods like turmeric, spinach, almonds, ginger, and yogurt can significantly enhance your immune response.</p>",
    readTime: 6,
    seoTitle: "5 Immunity Boosting Superfoods",
    seoDescription: "Discover the best superfoods for a strong immune system.",
    views: 2100,
    likes: 150,
    featuredImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    isActive: true
  },
  {
    title: "Mastering the Art of Indian Spices",
    slug: "mastering-art-indian-spices",
    category: "Recipes",
    author: "Chef Raj",
    excerpt: "A beginner's guide to understanding and using essential Indian spices.",
    content: "<p>Spices are the soul of Indian cuisine. From the warmth of cumin to the heat of red chili powder, understanding how to temper (tadka) spices can elevate any dish.</p>",
    readTime: 7,
    seoTitle: "Guide to Indian Spices",
    seoDescription: "Learn how to use Indian spices in your everyday cooking.",
    views: 1800,
    likes: 120,
    featuredImage: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
    isActive: true
  },
  {
    title: "The Perfect Paneer Tikka Recipe",
    slug: "perfect-paneer-tikka-recipe",
    category: "Recipes",
    author: "Chef Raj",
    excerpt: "Make restaurant-style paneer tikka right at home with this foolproof recipe.",
    content: "<p>Paneer tikka is a classic appetizer. The secret lies in the marinade: thick yogurt, mustard oil, and a generous pinch of chaat masala. Let it marinate for at least 4 hours before grilling.</p>",
    readTime: 5,
    seoTitle: "Paneer Tikka Recipe",
    seoDescription: "Restaurant-style Paneer Tikka recipe for home cooks.",
    views: 3200,
    likes: 210,
    featuredImage: "https://images.unsplash.com/photo-1596450514735-392bf9892c90?w=800&q=80",
    isActive: true
  },
  {
    title: "Meal Prepping for Busy Professionals",
    slug: "meal-prepping-busy-professionals",
    category: "Lifestyle",
    author: "Anita Sharma",
    excerpt: "Save time and eat healthier with these simple weekend meal prep strategies.",
    content: "<p>Meal prepping doesn't have to be boring. By preparing base gravies and chopping vegetables over the weekend, you can whip up fresh meals in under 15 minutes during the week.</p>",
    readTime: 4,
    seoTitle: "Meal Prep Guide",
    seoDescription: "Time-saving meal prep strategies for busy people.",
    views: 1500,
    likes: 95,
    featuredImage: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&q=80",
    isActive: true
  },
  {
    title: "Understanding Macros in Indian Diets",
    slug: "understanding-macros-indian-diets",
    category: "Nutrition",
    author: "Dr. Kavita",
    excerpt: "How to balance proteins, carbs, and fats in a traditional Indian diet.",
    content: "<p>Indian diets are traditionally carb-heavy. However, by incorporating more lentils, paneer, and lean meats, you can achieve a balanced macronutrient profile.</p>",
    readTime: 8,
    seoTitle: "Macros in Indian Diet",
    seoDescription: "Guide to balancing macros in traditional Indian meals.",
    views: 2400,
    likes: 180,
    featuredImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80",
    isActive: true
  },
  {
    title: "The Health Benefits of Ghee",
    slug: "health-benefits-of-ghee",
    category: "Nutrition",
    author: "Dr. Kavita",
    excerpt: "Debunking the myths around clarified butter and its actual health benefits.",
    content: "<p>Ghee has been demonized for years, but modern science now supports its benefits. It's rich in fat-soluble vitamins and has a high smoke point, making it perfect for cooking.</p>",
    readTime: 5,
    seoTitle: "Health Benefits of Ghee",
    seoDescription: "Discover the nutritional benefits of using ghee.",
    views: 2800,
    likes: 205,
    featuredImage: "https://images.unsplash.com/photo-1599388151290-711a3d9061dc?w=800&q=80",
    isActive: true
  },
  {
    title: "How We Source Our Ingredients",
    slug: "how-we-source-ingredients",
    category: "Lifestyle",
    author: "Admin",
    excerpt: "A behind-the-scenes look at One Choice Kitchen's commitment to quality.",
    content: "<p>Quality food starts with quality ingredients. We partner with local farmers to ensure our vegetables are organic and our dairy is fresh. Read about our farm-to-table journey.</p>",
    readTime: 3,
    seoTitle: "Ingredient Sourcing",
    seoDescription: "Our farm-to-table sourcing process.",
    views: 850,
    likes: 45,
    featuredImage: "https://images.unsplash.com/photo-1615486171448-4fd13328cefb?w=800&q=80",
    isActive: true
  },
  {
    title: "5 Quick Breakfast Ideas",
    slug: "5-quick-breakfast-ideas",
    category: "Recipes",
    author: "Chef Raj",
    excerpt: "Start your day right with these 5-minute nutritious breakfast recipes.",
    content: "<p>From overnight oats with a twist of cardamom to quick masala poha, these recipes ensure you never skip the most important meal of the day.</p>",
    readTime: 4,
    seoTitle: "Quick Breakfast Ideas",
    seoDescription: "Fast and healthy breakfast recipes.",
    views: 1950,
    likes: 140,
    featuredImage: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
    isActive: true
  }
];

const allBlogs = [...blogsData, ...blogsData.map((b, i) => ({
  ...b,
  title: b.title + " (Part 2)",
  slug: b.slug + "-part-2-" + i,
  views: Math.floor(Math.random() * 1000),
  likes: Math.floor(Math.random() * 100)
}))];

async function seed() {
  console.log("Starting API seed...");
  
  for (const blog of allBlogs) {
    try {
      const response = await fetch("http://localhost:3000/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blog)
      });
      
      if (!response.ok) {
        console.error("Failed to seed blog:", blog.title, await response.text());
        continue;
      }
      
      const created = await response.json();
      
      if (blog.views > 1000) {
        const cRes = await fetch("http://localhost:3000/api/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blogId: created.id,
            authorName: "John Doe",
            content: "Great article! Really enjoyed reading this.",
            status: "APPROVED" // Note: Normally pending, but for seeding we might override or manually approve
          })
        });
        
        if (cRes.ok) {
          const comment = await cRes.json();
          // Update status directly using admin route
          await fetch(`http://localhost:3000/api/comments/admin/${comment.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "APPROVED" })
          });
        }
      }
    } catch (e) {
      console.error("Error seeding:", e);
    }
  }
  
  console.log("API Seed completed successfully.");
}

seed();
