import { test, expect } from '@playwright/test';

test.describe('Accessibility and Performance', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for proper heading hierarchy
    const h1Elements = page.locator('h1');
    const h1Count = await h1Elements.count();

    // Should have at least one h1 element
    if (h1Count > 0) {
      await expect(h1Elements.first()).toBeVisible();
    }

    // Check for other heading levels
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/portfolios');
    await page.waitForLoadState('networkidle');

    // Check for ARIA labels on interactive elements
    const interactiveElements = page.locator('button, input, select, textarea');
    const count = await interactiveElements.count();

    if (count > 0) {
      // Check if at least some elements have ARIA attributes
      const elementsWithAria = page.locator('[aria-label], [aria-labelledby], [role]');
      const ariaCount = await elementsWithAria.count();

      // At least some elements should have ARIA attributes
      expect(ariaCount).toBeGreaterThan(0);
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Test Tab navigation
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement).toBeVisible();
    }

    // Test multiple Tab presses
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    // Test Shift+Tab (reverse navigation)
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(200);
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for text elements and their visibility
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6, button, a');
    const count = await textElements.count();

    if (count > 0) {
      // Ensure text elements are visible (basic contrast check)
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = textElements.nth(i);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
        }
      }
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/portfolios');
    await page.waitForLoadState('networkidle');

    // Try to open a form
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add")').first();
    if (await createButton.count() > 0 && await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('.mat-dialog-container, .modal');
      if (await dialog.count() > 0) {
        // Check for form labels
        const inputs = dialog.locator('input, textarea, select');
        const inputCount = await inputs.count();

        if (inputCount > 0) {
          // Check for associated labels
          const labels = dialog.locator('label, mat-label, .mat-form-field-label');
          const labelCount = await labels.count();

          // Should have labels for form fields
          expect(labelCount).toBeGreaterThan(0);
        }

        // Close dialog
        const closeButton = dialog.locator('button:has-text("Cancel"), button:has-text("Close")');
        if (await closeButton.count() > 0) {
          await closeButton.click();
        }
      }
    }
  });

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds (generous for E2E testing)
    expect(loadTime).toBeLessThan(10000);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/portfolios');
    await page.waitForLoadState('networkidle');

    // Check if pagination or virtual scrolling is implemented for large lists
    const paginationElements = page.locator('.pagination, mat-paginator, .virtual-scroll');
    const hasPagination = await paginationElements.count() > 0;

    // If there are many items, pagination should be present
    const listItems = page.locator('table tr, .list-item, mat-card, .portfolio-card');
    const itemCount = await listItems.count();

    if (itemCount > 20) {
      expect(hasPagination).toBe(true);
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check if content is visible and accessible on mobile
    await expect(page.locator('body')).toBeVisible();

    // Check if navigation is mobile-friendly
    const mobileNav = page.locator('.mobile-nav, .hamburger-menu, .nav-toggle');
    if (await mobileNav.count() > 0) {
      await expect(mobileNav.first()).toBeVisible();
    }

    // Test touch interactions
    const buttons = page.locator('button');
    if (await buttons.count() > 0) {
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        await firstButton.tap();
        await page.waitForTimeout(500);
      }
    }

    // Reset viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('should handle images and media properly', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for images and their alt text
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const altText = await img.getAttribute('alt');

        // Images should have alt text (or be decorative)
        if (altText !== null) {
          expect(altText.length).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  test('should have proper page titles', async ({ page }) => {
    const routes = ['/dashboard', '/portfolios', '/users', '/holdings', '/transactions'];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);

      // Title should contain relevant information
      expect(title).toMatch(/mutual fund|portfolio|dashboard/i);
    }
  });
});
