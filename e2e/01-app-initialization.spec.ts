import { test, expect } from '@playwright/test';
import { AuthHelper } from './auth-helper';

test.describe('Application Initialization', () => {
  test('should load the application and redirect to login for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    // Should redirect to login page for unauthenticated users
    await expect(page).toHaveURL('/login');

    // Should have the correct title
    await expect(page).toHaveTitle('Mutual Fund Manager');

    // Should load without console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');

    // Check for critical console errors (ignore minor warnings)
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('DevTools') &&
      !error.includes('Extension') &&
      !error.includes('Failed to load resource') // Ignore API call failures in tests
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should redirect to dashboard when authenticated', async ({ page }) => {
    const authHelper = new AuthHelper(page);

    // Set up mock authentication
    await authHelper.loginWithMockAuth();

    await page.goto('/');

    // Should redirect to dashboard for authenticated users
    await expect(page).toHaveURL('/dashboard');

    // Should load dashboard component
    await expect(page.locator('app-dashboard')).toBeVisible();
  });

  test('should have proper meta tags and SEO elements', async ({ page }) => {
    await page.goto('/');

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');

    // Check if fonts are loaded
    const robotoFont = await page.locator('link[href*="Roboto"]').count();
    expect(robotoFont).toBeGreaterThan(0);

    // Check if Material Icons are loaded
    const materialIcons = await page.locator('link[href*="Material+Icons"]').count();
    expect(materialIcons).toBeGreaterThan(0);
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginWithMockAuth();

    await page.goto('/dashboard');

    // Test desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();

    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();

    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();

    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });
});
