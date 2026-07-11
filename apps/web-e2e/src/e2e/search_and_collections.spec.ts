import { test, expect } from '@playwright/test';

test.describe('Search, Filters, and Collections Verification', () => {
  test.use({ baseURL: 'http://localhost:4208' });

  test.beforeEach(async ({ page }) => {
    // Mock collections API so ExploreSections renders regardless of DB state
    await page.route('/api/collections', async route => {
      await route.fulfill({
        json: {
          previouslyOrdered: [],
          topOffers: [],
          topTen: [],
        },
      });
    });
  });

  test('should display explore collections by default', async ({ page }) => {
    await page.goto('/menu');

    // Wait for the page to hydrate
    await page.waitForLoadState('networkidle');

    // ExploreSections renders when collections is non-null (even empty object)
    await expect(page.getByText("Explore What's Hot")).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Top Offers')).toBeVisible();
    await expect(page.getByText('Top 10 Nearby')).toBeVisible();
    await expect(page.getByText('Food on Train')).toBeVisible();
    await expect(page.getByText('Plan a Party')).toBeVisible();
  });

  test('should perform search and display results', async ({ page }) => {
    // Mock search API
    await page.route('/api/search*', async route => {
      await route.fulfill({
        json: {
          dishes: [{ id: '1', name: 'Paneer Tikka', price: 180, image: null }],
          restaurants: [],
          branches: [],
        },
      });
    });

    await page.goto('/menu');
    await page.waitForLoadState('networkidle');

    // Type in search bar
    const searchInput = page.locator('input[placeholder="Search for dishes, restaurants, or branches..."]');
    await searchInput.fill('Paneer');

    // Wait for debounce (300ms) + network + render
    await page.waitForTimeout(800);

    // Results should appear (webkit is slower — allow more time)
    await expect(page.getByText('Search Results')).toBeVisible({ timeout: 12000 });

    // Check if Paneer Tikka dish is in results
    await expect(page.getByText('Paneer Tikka')).toBeVisible();

    // Check if Explore collections are hidden while searching
    await expect(page.getByText("Explore What's Hot")).toBeHidden();
  });

  test('should apply filters and update results', async ({ page }) => {
    // Mock search API for filter scenario
    await page.route('/api/search*', async route => {
      await route.fulfill({
        json: {
          dishes: [{ id: '2', name: 'Veg Thali', price: 120, image: null }],
          restaurants: [],
          branches: [],
        },
      });
    });

    await page.goto('/menu');
    await page.waitForLoadState('networkidle');

    // Click on "Under ₹200" filter chip
    await page.locator('button:has-text("Under ₹200")').click();

    // Wait for search trigger (debounce 300ms + network)
    await page.waitForTimeout(800);

    // Results section should appear due to filter
    await expect(page.getByText('Search Results')).toBeVisible({ timeout: 5000 });
  });

  test('should allow scheduling an order', async ({ page }) => {
    await page.goto('/menu');
    await page.waitForLoadState('networkidle');

    // Click Schedule Order button (opens the picker)
    const scheduleBtn = page.locator('button:has-text("Schedule Order")');
    await expect(scheduleBtn).toBeVisible({ timeout: 5000 });
    await scheduleBtn.click();

    // Wait for the dropdown to appear
    await expect(page.getByText('Schedule for later')).toBeVisible({ timeout: 3000 });

    // Set date and time (fill directly without waiting for close)
    await page.locator('input[type="date"]').fill('2026-10-10');
    await page.locator('input[type="time"]').fill('18:00');

    // Click confirm
    await page.locator('button:has-text("Confirm Schedule")').click();

    // Check if confirmation message appears
    await expect(page.getByText('Your order is scheduled for 2026-10-10 at 18:00.')).toBeVisible({ timeout: 5000 });
  });
});
