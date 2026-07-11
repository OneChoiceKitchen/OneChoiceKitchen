import { test, expect } from '@playwright/test';

test.describe('Admin Portal E2E', () => {
  test('should allow SUPER_ADMIN to login and see configurations', async ({ page }) => {
    // Mock API responses
    await page.route('/api/auth/login', async route => {
      const json = { access_token: 'fake-jwt-token' };
      await route.fulfill({ json });
    });

    await page.route('/api/auth/me', async route => {
      const json = { 
        id: '1', 
        email: 'admin@test.com', 
        role: 'SUPER_ADMIN', 
        permissions: ['ALL'] 
      };
      await route.fulfill({ json });
    });

    await page.goto('/');

    // Ensure we are on login screen
    await expect(page.locator('h1')).toContainText('Admin Control Center');

    // Fill in credentials
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    // Should navigate to dashboard and show configurations
    await expect(page.locator('text=Configurations')).toBeVisible();
    await expect(page.locator('text=Payment Config')).toBeVisible();
    await expect(page.locator('text=Email Config')).toBeVisible();
    await expect(page.locator('text=System Overview')).toBeVisible();
  });

  test('should deny non-admin users', async ({ page }) => {
    await page.route('/api/auth/login', async route => {
      const json = { access_token: 'fake-jwt-token' };
      await route.fulfill({ json });
    });

    await page.route('/api/auth/me', async route => {
      const json = { 
        id: '1', 
        email: 'customer@test.com', 
        role: 'CUSTOMER', 
        permissions: [] 
      };
      await route.fulfill({ json });
    });

    await page.goto('/');

    // Fill in credentials
    await page.fill('input[type="email"]', 'customer@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');

    // Error should be visible
    await expect(page.locator('text=Unauthorized: Admin access required')).toBeVisible();
  });
});
