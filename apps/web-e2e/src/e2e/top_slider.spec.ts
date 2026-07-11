import { test, expect } from '@playwright/test';

test.describe('Top Slider Visibility Verification', () => {
  test.use({ baseURL: 'http://localhost:4208' });

  const MOCK_SLIDE = {
    id: 'mock-1',
    portal: 'web',
    isActive: true,
    pageScope: 'all',
    title: 'Mock E2E Slide',
    description: 'This is a mock slide for E2E testing',
    imageUrl: 'https://mock.image/1.jpg',
    orderIndex: 0,
  };

  // Define the pages where the Top Slider should be visible
  const pagesWithSlider = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Tiffin', path: '/tiffin' },
    { name: 'Reservations', path: '/reservations' },
  ];

  for (const pageInfo of pagesWithSlider) {
    test(`should display Top Slider on ${pageInfo.name} page`, async ({ page }) => {
      // Set up route mock BEFORE navigating so it intercepts the first fetch
      await page.route('/api/sliders', async route => {
        await route.fulfill({ json: [MOCK_SLIDE] });
      });

      // Also mock collections so menu page doesn't fail on that API
      await page.route('/api/collections', async route => {
        await route.fulfill({ json: { previouslyOrdered: [], topOffers: [], topTen: [] } });
      });

      await page.goto(pageInfo.path);

      // Wait for network activity to settle (slider fetches on mount)
      await page.waitForLoadState('networkidle');

      // Wait for our mock slide title to appear
      await expect(page.getByText('Mock E2E Slide')).toBeVisible({ timeout: 8000 });
      await expect(page.getByText('This is a mock slide for E2E testing')).toBeVisible();
    });
  }
});
