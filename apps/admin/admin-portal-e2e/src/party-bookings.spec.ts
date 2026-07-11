import { test, expect } from '@playwright/test';

test.describe('Party Bookings Admin', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login and local storage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('admin_token', 'mock_token');
      localStorage.setItem('admin_role', 'SUPER_ADMIN');
    });
    // Navigate to dashboard directly to trigger React re-render or reload page
    await page.reload();
  });

  test('should render Event Categories admin page', async ({ page }) => {
    // Click the Event Categories tab
    await page.click('text=Event Categories');
    // Verify the page title appears
    await expect(page.locator('h1')).toHaveText('Event Categories');
    await expect(page.locator('text=Event Categories CRUD will be implemented here')).toBeVisible();
  });

  test('should render Global Venues admin page', async ({ page }) => {
    await page.click('text=Global Venues');
    await expect(page.locator('h1')).toHaveText('Global Venues');
    await expect(page.locator('text=Global Venues / Halls CRUD will be implemented here')).toBeVisible();
  });

  test('should render Hall Bookings admin page', async ({ page }) => {
    await page.click('text=Hall Bookings');
    await expect(page.locator('h1')).toHaveText('Hall Bookings');
    await expect(page.locator('text=Hall Bookings management and tracking will be implemented here')).toBeVisible();
  });
});
