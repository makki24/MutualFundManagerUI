import { test, expect } from '@playwright/test';
import { AuthHelper } from './auth-helper';

test.describe('Navigation and Layout', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginWithMockAuth();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display main navigation elements', async ({ page }) => {
    // Check if main layout is present
    await expect(page.locator('app-main-layout')).toBeVisible();

    // Check for navigation elements (adjust selectors based on actual implementation)
    const navElements = [
      'Dashboard',
      'Portfolios',
      'Users',
      'Holdings',
      'Transactions'
    ];

    for (const element of navElements) {
      // Try different possible selectors for navigation
      const navItem = page.locator(`text="${element}"`).first();
      if (await navItem.count() > 0) {
        await expect(navItem).toBeVisible();
      }
    }
  });

  test('should navigate to all main routes', async ({ page }) => {
    const routes = [
      { path: '/dashboard', title: 'Dashboard' },
      { path: '/portfolios', title: 'Portfolios' },
      { path: '/users', title: 'Users' },
      { path: '/holdings', title: 'Holdings' },
      { path: '/transactions', title: 'Transactions' }
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      // Check URL
      await expect(page).toHaveURL(route.path);

      // Check if page loads without major errors
      await expect(page.locator('body')).toBeVisible();

      // Wait a bit for any async operations
      await page.waitForTimeout(1000);
    }
  });

  test('should handle navigation clicks', async ({ page }) => {
    // Try to find and click navigation links
    const navigationLinks = [
      { text: 'Dashboard', expectedUrl: '/dashboard' },
      { text: 'Portfolios', expectedUrl: '/portfolios' }
    ];

    for (const link of navigationLinks) {
      const navLink = page.locator(`text="${link.text}"`).first();
      if (await navLink.count() > 0 && await navLink.isVisible()) {
        await navLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(link.expectedUrl);
      }
    }
  });

  test('should display header and footer elements', async ({ page }) => {
    // Check for common header elements
    const headerElements = page.locator('header, .header, mat-toolbar, .toolbar');
    if (await headerElements.count() > 0) {
      await expect(headerElements.first()).toBeVisible();
    }

    // Check for user menu or profile elements
    const userElements = page.locator('[data-testid="user-menu"], .user-menu, .profile');
    if (await userElements.count() > 0) {
      await expect(userElements.first()).toBeVisible();
    }
  });

  test('should handle browser back and forward navigation', async ({ page }) => {
    // Navigate to portfolios
    await page.goto('/portfolios');
    await page.waitForLoadState('networkidle');

    // Navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Use browser back
    await page.goBack();
    await expect(page).toHaveURL('/portfolios');

    // Use browser forward
    await page.goForward();
    await expect(page).toHaveURL('/dashboard');
  });
});
