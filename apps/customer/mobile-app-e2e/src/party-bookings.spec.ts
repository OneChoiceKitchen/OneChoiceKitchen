import { test, expect } from '@playwright/test';

test.describe('Party Bookings Customer Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to venues page from home and show venues', async ({ page }) => {
    // Click the Venues category icon
    await page.click('text=Venues');
    
    // Verify the URL and title
    await expect(page).toHaveURL(/.*\/venues/);
    await expect(page.locator('h1')).toHaveText('Book a Venue');
    
    // Verify venues are listed
    await expect(page.locator('text=Royal Palace Banquet')).toBeVisible();
    await expect(page.locator('text=Green Garden Outdoors')).toBeVisible();
  });

  test('should navigate to venue details and initiate booking', async ({ page }) => {
    // Go directly to the venue details
    await page.goto('/venues/1');
    
    await expect(page.locator('h1')).toHaveText('Royal Palace Banquet');
    
    // Select a package
    await page.click('text=Standard Food Package');
    
    // Proceed to book
    await page.click('text=Proceed to Book');
    
    // Verify booking page
    await expect(page).toHaveURL(/.*\/venues\/1\/book/);
    await expect(page.locator('h1')).toHaveText('Booking Request');
  });
});
