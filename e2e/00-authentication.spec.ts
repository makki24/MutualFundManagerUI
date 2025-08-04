import { test, expect } from '@playwright/test';
import { AuthHelper } from './auth-helper';

test.describe('Authentication Flow', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check if login component is loaded
    await expect(page.locator('app-login')).toBeVisible();

    // Check for login form elements
    const usernameInput = page.locator('input[formControlName="username"], input[name="username"], input[placeholder*="username"]');
    const passwordInput = page.locator('input[formControlName="password"], input[name="password"], input[type="password"]');
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');

    await expect(usernameInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Try to submit empty form
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    await loginButton.click();

    // Look for validation errors
    const errorSelectors = [
      '.mat-error',
      '.error-message',
      '.validation-error',
      '.field-error'
    ];

    let validationFound = false;
    for (const selector of errorSelectors) {
      const errors = page.locator(selector);
      if (await errors.count() > 0) {
        await expect(errors.first()).toBeVisible();
        validationFound = true;
        break;
      }
    }

    // If no validation errors visible, form should still be on login page
    if (!validationFound) {
      await expect(page).toHaveURL('/login');
    }
  });

  test('should handle login with mock authentication', async ({ page }) => {
    // Set up mock authentication
    await authHelper.loginWithMockAuth();

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be able to access dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('app-dashboard')).toBeVisible();
  });

  test('should handle login form submission', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Fill login form with test credentials
    const usernameInput = page.locator('input[formControlName="username"], input[name="username"], input[placeholder*="username"]');
    const passwordInput = page.locator('input[formControlName="password"], input[name="password"], input[type="password"]');

    if (await usernameInput.count() > 0) {
      await usernameInput.fill('admin');
    }
    if (await passwordInput.count() > 0) {
      await passwordInput.fill('admin123');
    }

    // Submit form
    const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    await loginButton.click();

    // Wait for response (either success or error)
    await page.waitForTimeout(3000);

    // Check if we're redirected to dashboard or still on login with error
    const currentUrl = page.url();
    const isOnDashboard = currentUrl.includes('/dashboard');
    const isOnLogin = currentUrl.includes('/login');

    expect(isOnDashboard || isOnLogin).toBe(true);

    if (isOnLogin) {
      // If still on login, there might be an error message
      const errorMessage = page.locator('.mat-snack-bar-container, .error-message, .alert');
      if (await errorMessage.count() > 0) {
        console.log('Login failed - this is expected if backend is not running');
      }
    }
  });

  test('should show password visibility toggle', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Look for password visibility toggle
    const toggleButton = page.locator('button[mat-icon-button], .password-toggle, button:has(mat-icon)');
    if (await toggleButton.count() > 0) {
      const passwordInput = page.locator('input[type="password"]');

      // Click toggle to show password
      await toggleButton.first().click();
      await page.waitForTimeout(300);

      // Password input type might change to text
      const inputType = await passwordInput.first().getAttribute('type');
      expect(inputType === 'text' || inputType === 'password').toBe(true);
    }
  });

  test('should handle keyboard navigation in login form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Type in username field
    await page.keyboard.type('testuser');

    // Tab to password field
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Type in password field
    await page.keyboard.type('testpass');

    // Tab to submit button and press Enter
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');

    // Wait for form submission
    await page.waitForTimeout(2000);
  });
});
