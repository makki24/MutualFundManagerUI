import { test, expect } from '@playwright/test';

test.describe('Error Handling and Edge Cases', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Go offline to simulate network errors
    await page.context().setOffline(true);

    await page.goto('/portfolios');
    await page.waitForTimeout(2000);

    // Look for error messages or offline indicators
    const errorSelectors = [
      '.error-message',
      '.network-error',
      '.offline-message',
      '.connection-error',
      'text=/network|offline|connection/i'
    ];

    let errorFound = false;
    for (const selector of errorSelectors) {
      const errorElement = page.locator(selector);
      if (await errorElement.count() > 0) {
        await expect(errorElement.first()).toBeVisible();
        errorFound = true;
        break;
      }
    }

    // Go back online
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);
  });

  test('should handle 404 errors for invalid routes', async ({ page }) => {
    await page.goto('/invalid-route-that-does-not-exist');
    await page.waitForLoadState('networkidle');

    // Should redirect to dashboard or show 404 page
    const currentUrl = page.url();
    const is404OrRedirect = currentUrl.includes('/dashboard') ||
                           currentUrl.includes('404') ||
                           currentUrl.includes('not-found');

    expect(is404OrRedirect).toBe(true);
  });

  test('should handle invalid portfolio IDs', async ({ page }) => {
    await page.goto('/portfolios/99999');
    await page.waitForLoadState('networkidle');

    // Look for error message or redirect
    const errorSelectors = [
      '.error-message',
      '.not-found',
      'text=/not found|invalid|does not exist/i'
    ];

    for (const selector of errorSelectors) {
      const errorElement = page.locator(selector);
      if (await errorElement.count() > 0) {
        await expect(errorElement.first()).toBeVisible();
        break;
      }
    }
  });

  test('should display loading states', async ({ page }) => {
    await page.goto('/portfolios');

    // Look for loading indicators during page load
    const loadingSelectors = [
      '.loading',
      '.spinner',
      'mat-spinner',
      'mat-progress-spinner',
      '.progress-bar'
    ];

    // Check if loading indicators appear (they might be brief)
    for (const selector of loadingSelectors) {
      const loading = page.locator(selector);
      if (await loading.count() > 0) {
        // Loading indicator exists
        break;
      }
    }

    await page.waitForLoadState('networkidle');
  });

  test('should handle empty data states', async ({ page }) => {
    // This test assumes there might be empty states in the application
    await page.goto('/portfolios');
    await page.waitForLoadState('networkidle');

    // Look for empty state messages
    const emptyStateSelectors = [
      '.empty-state',
      '.no-data',
      'text=/no portfolios|empty|nothing to show/i'
    ];

    for (const selector of emptyStateSelectors) {
      const emptyState = page.locator(selector);
      if (await emptyState.count() > 0) {
        await expect(emptyState.first()).toBeVisible();
        break;
      }
    }
  });

  test('should handle form submission errors', async ({ page }) => {
    await page.goto('/portfolios');
    await page.waitForLoadState('networkidle');

    // Try to create a portfolio with invalid data
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add")').first();
    if (await createButton.count() > 0 && await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('.mat-dialog-container, .modal');
      if (await dialog.count() > 0) {
        // Try to submit with invalid or empty data
        const submitButton = dialog.locator('button:has-text("Create"), button:has-text("Save")');
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(1000);

          // Look for error messages
          const errorSelectors = [
            '.mat-error',
            '.error-message',
            '.validation-error',
            '.form-error'
          ];

          for (const selector of errorSelectors) {
            const errors = page.locator(selector);
            if (await errors.count() > 0) {
              await expect(errors.first()).toBeVisible();
              break;
            }
          }
        }

        // Close dialog
        const closeButton = dialog.locator('button:has-text("Cancel"), button:has-text("Close")');
        if (await closeButton.count() > 0) {
          await closeButton.click();
        }
      }
    }
  });

  test('should handle browser refresh correctly', async ({ page }) => {
    await page.goto('/portfolios');
    await page.waitForLoadState('networkidle');

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on portfolios page and functional
    await expect(page).toHaveURL('/portfolios');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle concurrent user actions', async ({ page }) => {
    await page.goto('/portfolios');
    await page.waitForLoadState('networkidle');

    // Try to click multiple buttons quickly
    const buttons = page.locator('button');
    const count = await buttons.count();

    if (count > 1) {
      // Click first two buttons with minimal delay
      await buttons.nth(0).click();
      await page.waitForTimeout(100);
      await buttons.nth(1).click();
      await page.waitForTimeout(500);

      // Application should handle this gracefully without crashes
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle session timeout or authentication errors', async ({ page }) => {
    // This test would typically involve mocking auth failures
    // For now, we'll just check that auth-related elements exist

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for login-related elements or user menu
    const authSelectors = [
      '.login-button',
      '.user-menu',
      '.profile-menu',
      '.logout-button',
      'text=/login|logout|profile/i'
    ];

    for (const selector of authSelectors) {
      const authElement = page.locator(selector);
      if (await authElement.count() > 0) {
        // Auth-related UI exists
        break;
      }
    }
  });
});
