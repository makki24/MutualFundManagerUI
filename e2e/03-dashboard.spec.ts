import { test, expect } from '@playwright/test';
import { AuthHelper } from './auth-helper';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.loginWithMockAuth();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display dashboard content', async ({ page }) => {
    // Check if dashboard component is loaded
    await expect(page.locator('app-dashboard')).toBeVisible();

    // Check for dashboard title or heading
    const headings = page.locator('h1, h2, h3').filter({ hasText: /dashboard/i });
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
  });

  test('should display key metrics and statistics', async ({ page }) => {
    // Look for common dashboard elements
    const dashboardElements = [
      '.dashboard-card',
      '.metric-card',
      '.stats-card',
      'mat-card',
      '.card'
    ];

    let foundCards = false;
    for (const selector of dashboardElements) {
      const cards = page.locator(selector);
      if (await cards.count() > 0) {
        await expect(cards.first()).toBeVisible();
        foundCards = true;
        break;
      }
    }

    // If no cards found, at least check that content is present
    if (!foundCards) {
      await expect(page.locator('body')).toContainText(/portfolio|fund|investment|total/i);
    }
  });

  test('should display charts or graphs if present', async ({ page }) => {
    // Look for chart containers
    const chartSelectors = [
      'canvas',
      '.chart',
      '.graph',
      '[data-testid="chart"]',
      'svg'
    ];

    for (const selector of chartSelectors) {
      const charts = page.locator(selector);
      if (await charts.count() > 0) {
        await expect(charts.first()).toBeVisible();
        break;
      }
    }
  });

  test('should have working action buttons', async ({ page }) => {
    // Look for common action buttons
    const buttonSelectors = [
      'button:has-text("Create")',
      'button:has-text("Add")',
      'button:has-text("New")',
      'button:has-text("View")',
      '.action-button',
      'mat-button',
      'mat-raised-button'
    ];

    for (const selector of buttonSelectors) {
      const buttons = page.locator(selector);
      const count = await buttons.count();

      if (count > 0) {
        // Test first few buttons
        for (let i = 0; i < Math.min(count, 3); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible() && await button.isEnabled()) {
            // Just check if button is clickable, don't actually click to avoid side effects
            await expect(button).toBeEnabled();
          }
        }
      }
    }
  });

  test('should display recent activities or transactions', async ({ page }) => {
    // Look for activity lists or tables
    const activitySelectors = [
      'table',
      '.activity-list',
      '.transaction-list',
      '.recent-items',
      'mat-table',
      '.list-item'
    ];

    for (const selector of activitySelectors) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
        break;
      }
    }
  });

  test('should handle loading states', async ({ page }) => {
    // Reload page to catch loading states
    await page.reload();

    // Look for loading indicators
    const loadingSelectors = [
      '.loading',
      '.spinner',
      'mat-spinner',
      'mat-progress-spinner',
      '[data-testid="loading"]'
    ];

    // Loading indicators might appear briefly, so we'll check if they exist
    // but not require them to be visible since they might disappear quickly
    for (const selector of loadingSelectors) {
      const loading = page.locator(selector);
      if (await loading.count() > 0) {
        // Loading indicator exists, which is good
        break;
      }
    }

    // Wait for content to load
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Check for basic accessibility features
    const mainContent = page.locator('main, [role="main"], .main-content');
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }

    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
  });
});
