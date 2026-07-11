import { test, expect } from '@playwright/test';

test.describe('Login Flow E2E', () => {
  test.use({ baseURL: 'http://localhost:4208' });

  test('User can open login modal and login with correct credentials', async ({ page }) => {
    // Navigate to the web app
    await page.goto('/');

    // Assuming there is a "Sign In" button on the navbar (first occurrence)
    const signInButton = page.getByRole('button', { name: /Sign In/i }).first();
    if (await signInButton.isVisible()) {
      await signInButton.click();
    }

    // Wait for the modal to be visible
    const modalHeading = page.getByText('Access your One Choice Kitchen subscription');
    await expect(modalHeading).toBeVisible();

    // Fill in credentials
    await page.getByPlaceholder('customer@test.com').fill('customer@test.com');
    await page.getByPlaceholder('••••••••').fill('test123');

    // Submit using the form's submit button (inside the modal form)
    await page.locator('form').getByRole('button', { name: /Sign In/i }).click();

    // Expect the modal to close or the user state to update (e.g. "My Account" appears)
    // Since the modal is mocked to close after 800ms
    await expect(modalHeading).toBeHidden({ timeout: 5000 });
  });

  test('User sees error with incorrect credentials', async ({ page }) => {
    await page.goto('/');

    const signInButton = page.getByRole('button', { name: /Sign In/i }).first();
    if (await signInButton.isVisible()) {
      await signInButton.click();
    }

    await page.getByPlaceholder('customer@test.com').fill('wrong@test.com');
    await page.getByPlaceholder('••••••••').fill('wrongpass');
    await page.locator('form').getByRole('button', { name: /Sign In/i }).click();

    // Expect validation error
    const errorMsg = page.getByText(/Invalid email or password/i);
    await expect(errorMsg).toBeVisible({ timeout: 3000 });
  });
});
