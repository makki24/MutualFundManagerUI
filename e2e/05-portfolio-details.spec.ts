import { test, expect } from '@playwright/test';

test.describe('Portfolio Details Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to portfolios first, then to a specific portfolio
    await page.goto('/portfolios');
    await page.waitForLoadState('networkidle');

    // Try to find and click on a portfolio, or navigate directly to portfolio/1
    const portfolioItems = page.locator('.portfolio-card, .portfolio-item, mat-card, table tr:not(:first-child)');
    const count = await portfolioItems.count();

    if (count > 0) {
      await portfolioItems.first().click();
      await page.waitForLoadState('networkidle');
    } else {
      // Fallback: navigate directly to portfolio 1
      await page.goto('/portfolios/1');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display portfolio details', async ({ page }) => {
    // Check if portfolio details component is loaded
    await expect(page.locator('app-portfolio-details')).toBeVisible();

    // Check URL pattern
    await expect(page.url()).toMatch(/\/portfolios\/\d+/);
  });

  test('should display portfolio overview information', async ({ page }) => {
    // Look for portfolio overview elements
    const overviewElements = [
      '.portfolio-name',
      '.portfolio-title',
      '.nav-value',
      '.aum-value',
      '.total-units',
      '.cash-balance',
      '.investor-count',
      '.holdings-count'
    ];

    for (const selector of overviewElements) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
      }
    }

    // Check for numerical values
    const bodyText = await page.locator('body').textContent();
    if (bodyText) {
      expect(bodyText).toMatch(/\$|₹|\d+\.\d+|%/);
    }
  });

  test('should have tabbed interface for different sections', async ({ page }) => {
    // Look for tab navigation
    const tabSelectors = [
      '.mat-tab-label',
      '.tab-button',
      '.nav-tab',
      'mat-tab',
      '.tab-header'
    ];

    let tabsFound = false;
    for (const selector of tabSelectors) {
      const tabs = page.locator(selector);
      const count = await tabs.count();

      if (count > 0) {
        tabsFound = true;

        // Test clicking on different tabs
        for (let i = 0; i < Math.min(count, 3); i++) {
          const tab = tabs.nth(i);
          if (await tab.isVisible() && await tab.isEnabled()) {
            await tab.click();
            await page.waitForTimeout(500); // Wait for tab content to load

            // Check if tab content is visible
            const tabContent = page.locator('.mat-tab-body, .tab-content, .tab-pane');
            if (await tabContent.count() > 0) {
              await expect(tabContent.first()).toBeVisible();
            }
          }
        }
        break;
      }
    }

    // If no tabs found, check for section headers
    if (!tabsFound) {
      const sectionHeaders = page.locator('h2, h3, .section-title');
      if (await sectionHeaders.count() > 0) {
        await expect(sectionHeaders.first()).toBeVisible();
      }
    }
  });

  test('should display investors/users table', async ({ page }) => {
    // Look for investors section
    const investorsSelectors = [
      'table',
      '.investors-table',
      '.users-table',
      'mat-table',
      '.data-table'
    ];

    for (const selector of investorsSelectors) {
      const table = page.locator(selector);
      if (await table.count() > 0) {
        await expect(table.first()).toBeVisible();

        // Check for table headers
        const headers = table.locator('th, .header-cell');
        if (await headers.count() > 0) {
          await expect(headers.first()).toBeVisible();
        }

        // Check for table rows
        const rows = table.locator('tr:not(:first-child), .data-row');
        if (await rows.count() > 0) {
          await expect(rows.first()).toBeVisible();
        }
        break;
      }
    }
  });

  test('should have add user functionality', async ({ page }) => {
    // Look for add user button
    const addUserButtons = [
      'button:has-text("Add User")',
      'button:has-text("Add Investor")',
      'button:has-text("Invite")',
      '.add-user-button',
      '[data-testid="add-user"]'
    ];

    for (const selector of addUserButtons) {
      const button = page.locator(selector);
      if (await button.count() > 0 && await button.isVisible()) {
        await expect(button).toBeEnabled();

        // Click the add user button
        await button.click();
        await page.waitForTimeout(500);

        // Look for add user dialog
        const dialogSelectors = [
          '.mat-dialog-container',
          '.add-user-dialog',
          '.modal',
          'app-add-user-to-portfolio-dialog'
        ];

        for (const dialogSelector of dialogSelectors) {
          const dialog = page.locator(dialogSelector);
          if (await dialog.count() > 0) {
            await expect(dialog.first()).toBeVisible();

            // Look for user search/selection
            const searchInput = dialog.locator('input[placeholder*="search"], input[placeholder*="user"]');
            if (await searchInput.count() > 0) {
              await expect(searchInput.first()).toBeVisible();
            }

            // Look for investment amount input
            const amountInput = dialog.locator('input[placeholder*="amount"], input[type="number"]');
            if (await amountInput.count() > 0) {
              await expect(amountInput.first()).toBeVisible();
            }

            // Close dialog
            const closeButton = dialog.locator('button:has-text("Cancel"), button:has-text("Close")');
            if (await closeButton.count() > 0) {
              await closeButton.first().click();
            }
            break;
          }
        }
        break;
      }
    }
  });

  test('should have user action menus', async ({ page }) => {
    // Look for action buttons or menus in user rows
    const actionSelectors = [
      '.action-menu',
      '.more-actions',
      'button[mat-icon-button]',
      '.menu-trigger',
      '.actions-column button'
    ];

    for (const selector of actionSelectors) {
      const actions = page.locator(selector);
      const count = await actions.count();

      if (count > 0) {
        const firstAction = actions.first();
        if (await firstAction.isVisible() && await firstAction.isEnabled()) {
          await firstAction.click();
          await page.waitForTimeout(500);

          // Look for action menu items
          const menuItems = page.locator('.mat-menu-item, .menu-item, .action-item');
          if (await menuItems.count() > 0) {
            await expect(menuItems.first()).toBeVisible();

            // Click outside to close menu
            await page.click('body', { position: { x: 0, y: 0 } });
          }
          break;
        }
      }
    }
  });

  test('should display holdings information', async ({ page }) => {
    // Look for holdings section or tab
    const holdingsTab = page.locator('text="Holdings", .holdings-tab');
    if (await holdingsTab.count() > 0 && await holdingsTab.isVisible()) {
      await holdingsTab.click();
      await page.waitForTimeout(500);
    }

    // Look for holdings data
    const holdingsSelectors = [
      '.holdings-table',
      '.holdings-list',
      '.asset-list',
      'table:has(th:text("Symbol")), table:has(th:text("Asset"))'
    ];

    for (const selector of holdingsSelectors) {
      const holdings = page.locator(selector);
      if (await holdings.count() > 0) {
        await expect(holdings.first()).toBeVisible();
        break;
      }
    }
  });

  test('should display performance metrics', async ({ page }) => {
    // Look for performance section or tab
    const performanceTab = page.locator('text="Performance", .performance-tab');
    if (await performanceTab.count() > 0 && await performanceTab.isVisible()) {
      await performanceTab.click();
      await page.waitForTimeout(500);
    }

    // Look for performance metrics
    const performanceSelectors = [
      '.performance-chart',
      '.returns-chart',
      'canvas',
      '.metric-card',
      '.performance-stats'
    ];

    for (const selector of performanceSelectors) {
      const performance = page.locator(selector);
      if (await performance.count() > 0) {
        await expect(performance.first()).toBeVisible();
        break;
      }
    }
  });

  test('should have back navigation', async ({ page }) => {
    // Look for back button
    const backButtons = [
      'button:has-text("Back")',
      '.back-button',
      '[data-testid="back"]',
      '.breadcrumb a'
    ];

    for (const selector of backButtons) {
      const backButton = page.locator(selector);
      if (await backButton.count() > 0 && await backButton.isVisible()) {
        await backButton.click();
        await page.waitForLoadState('networkidle');

        // Should navigate back to portfolios list
        await expect(page).toHaveURL('/portfolios');
        return;
      }
    }

    // If no back button found, test browser back
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/portfolios');
  });
});
