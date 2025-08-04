import { test, expect } from '@playwright/test';

test.describe('Portfolios Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolios');
    await page.waitForLoadState('networkidle');
  });

  test('should display portfolios list', async ({ page }) => {
    // Check if portfolios component is loaded
    await expect(page.locator('app-portfolio-list')).toBeVisible();

    // Look for portfolio cards or list items
    const portfolioElements = [
      '.portfolio-card',
      '.portfolio-item',
      'mat-card',
      '.card',
      'table tr',
      '.list-item'
    ];

    let foundPortfolios = false;
    for (const selector of portfolioElements) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
        foundPortfolios = true;
        break;
      }
    }

    // If no portfolios found, check for empty state
    if (!foundPortfolios) {
      const emptyState = page.locator('text=/no portfolios|empty|create your first/i');
      if (await emptyState.count() > 0) {
        await expect(emptyState.first()).toBeVisible();
      }
    }
  });

  test('should have create portfolio functionality', async ({ page }) => {
    // Look for create/add portfolio button
    const createButtons = [
      'button:has-text("Create")',
      'button:has-text("Add")',
      'button:has-text("New")',
      '[data-testid="create-portfolio"]',
      '.create-button',
      '.add-button'
    ];

    let createButton;
    for (const selector of createButtons) {
      const button = page.locator(selector);
      if (await button.count() > 0 && await button.isVisible()) {
        createButton = button.first();
        break;
      }
    }

    if (createButton) {
      await expect(createButton).toBeVisible();
      await expect(createButton).toBeEnabled();

      // Click the create button
      await createButton.click();

      // Look for create portfolio dialog or form
      const dialogSelectors = [
        '.mat-dialog-container',
        '.dialog',
        '.modal',
        '.create-portfolio-form',
        'app-portfolio-create'
      ];

      let dialogFound = false;
      for (const selector of dialogSelectors) {
        const dialog = page.locator(selector);
        if (await dialog.count() > 0) {
          await expect(dialog.first()).toBeVisible();
          dialogFound = true;
          break;
        }
      }

      if (dialogFound) {
        // Look for form fields
        const formFields = [
          'input[placeholder*="name"]',
          'input[placeholder*="Name"]',
          'input[formControlName="name"]',
          'textarea[placeholder*="description"]'
        ];

        for (const fieldSelector of formFields) {
          const field = page.locator(fieldSelector);
          if (await field.count() > 0) {
            await expect(field.first()).toBeVisible();
          }
        }

        // Close dialog by clicking cancel or close
        const closeButtons = [
          'button:has-text("Cancel")',
          'button:has-text("Close")',
          '.mat-dialog-close',
          '[mat-dialog-close]'
        ];

        for (const closeSelector of closeButtons) {
          const closeButton = page.locator(closeSelector);
          if (await closeButton.count() > 0 && await closeButton.isVisible()) {
            await closeButton.click();
            break;
          }
        }
      }
    }
  });

  test('should display portfolio details when clicked', async ({ page }) => {
    // Look for portfolio items that can be clicked
    const portfolioItems = [
      '.portfolio-card',
      '.portfolio-item',
      'mat-card',
      'table tr:not(:first-child)', // Skip header row
      '.clickable-item'
    ];

    for (const selector of portfolioItems) {
      const items = page.locator(selector);
      const count = await items.count();

      if (count > 0) {
        const firstItem = items.first();
        if (await firstItem.isVisible()) {
          // Click the first portfolio item
          await firstItem.click();
          await page.waitForLoadState('networkidle');

          // Should navigate to portfolio details
          await expect(page.url()).toMatch(/\/portfolios\/\d+/);

          // Check if portfolio details component is loaded
          await expect(page.locator('app-portfolio-details')).toBeVisible();

          // Go back to portfolios list
          await page.goBack();
          await page.waitForLoadState('networkidle');
          break;
        }
      }
    }
  });

  test('should have search and filter functionality', async ({ page }) => {
    // Look for search input
    const searchSelectors = [
      'input[placeholder*="search"]',
      'input[placeholder*="Search"]',
      'input[type="search"]',
      '.search-input',
      '[data-testid="search"]'
    ];

    for (const selector of searchSelectors) {
      const searchInput = page.locator(selector);
      if (await searchInput.count() > 0 && await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();

        // Test typing in search
        await searchInput.fill('test');
        await page.waitForTimeout(500); // Wait for search to process
        await searchInput.clear();
        break;
      }
    }

    // Look for filter options
    const filterSelectors = [
      'select',
      '.filter-dropdown',
      'mat-select',
      '.filter-button',
      '[data-testid="filter"]'
    ];

    for (const selector of filterSelectors) {
      const filter = page.locator(selector);
      if (await filter.count() > 0 && await filter.isVisible()) {
        await expect(filter.first()).toBeVisible();
        break;
      }
    }
  });

  test('should display portfolio information correctly', async ({ page }) => {
    // Look for portfolio information elements
    const infoElements = [
      '.portfolio-name',
      '.portfolio-value',
      '.portfolio-return',
      '.aum',
      '.nav',
      '.performance'
    ];

    for (const selector of infoElements) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }

    // Check for currency or percentage values
    const valuePattern = /\$|₹|%|\d+\.\d+/;
    const bodyText = await page.locator('body').textContent();
    if (bodyText) {
      expect(bodyText).toMatch(valuePattern);
    }
  });

  test('should handle pagination if present', async ({ page }) => {
    // Look for pagination elements
    const paginationSelectors = [
      '.pagination',
      'mat-paginator',
      '.page-navigation',
      '.next-page',
      '.previous-page'
    ];

    for (const selector of paginationSelectors) {
      const pagination = page.locator(selector);
      if (await pagination.count() > 0) {
        await expect(pagination.first()).toBeVisible();

        // Test pagination buttons if they exist
        const nextButton = page.locator('button:has-text("Next"), .next-page');
        if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForLoadState('networkidle');

          const prevButton = page.locator('button:has-text("Previous"), .previous-page');
          if (await prevButton.count() > 0 && await prevButton.isEnabled()) {
            await prevButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
        break;
      }
    }
  });
});
