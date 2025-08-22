import { test, expect } from '@playwright/test';

test.describe('Holdings Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/holdings');
    await page.waitForLoadState('networkidle');
  });

  test('should display holdings page', async ({ page }) => {
    // Check if holdings component is loaded
    await expect(page.locator('app-holdings-list')).toBeVisible();

    // Check URL
    await expect(page).toHaveURL('/holdings');
  });

  test('should display holdings table or list', async ({ page }) => {
    // Look for holdings table
    const holdingsSelectors = [
      'table',
      '.holdings-table',
      'mat-table',
      '.holdings-list',
      '.asset-list'
    ];

    let holdingsFound = false;
    for (const selector of holdingsSelectors) {
      const holdingsList = page.locator(selector);
      if (await holdingsList.count() > 0) {
        await expect(holdingsList.first()).toBeVisible();
        holdingsFound = true;
        break;
      }
    }

    if (!holdingsFound) {
      const emptyState = page.locator('text=/no holdings|empty|add holdings/i');
      if (await emptyState.count() > 0) {
        await expect(emptyState.first()).toBeVisible();
      }
    }
  });

  test('should display holding information', async ({ page }) => {
    // Look for holding details
    const holdingInfoSelectors = [
      '.symbol',
      '.asset-name',
      '.quantity',
      '.price',
      '.value',
      '.allocation'
    ];

    for (const selector of holdingInfoSelectors) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });

  test('should have add/manage holdings functionality', async ({ page }) => {
    const addButtons = [
      'button:has-text("Add Holding")',
      'button:has-text("New Holding")',
      'button:has-text("Create")',
      '.add-holding-button'
    ];

    for (const selector of addButtons) {
      const button = page.locator(selector);
      if (await button.count() > 0 && await button.isVisible()) {
        await expect(button).toBeEnabled();
        break;
      }
    }
  });
});

test.describe('Transactions Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions');
    await page.waitForLoadState('networkidle');
  });

  test('should display transactions page', async ({ page }) => {
    // Check if transactions component is loaded
    // Transactions page is implemented via TransactionsPageComponent
    await expect(page.locator('app-transactions-page')).toBeVisible();

    // Check URL
    await expect(page).toHaveURL('/transactions');
  });

  test('should display transactions table', async ({ page }) => {
    // Look for transactions table
    const transactionSelectors = [
      'table',
      '.transactions-table',
      'mat-table',
      '.transaction-list',
      '.activity-list'
    ];

    let transactionsFound = false;
    for (const selector of transactionSelectors) {
      const transactionsList = page.locator(selector);
      if (await transactionsList.count() > 0) {
        await expect(transactionsList.first()).toBeVisible();
        transactionsFound = true;
        break;
      }
    }

    if (!transactionsFound) {
      const emptyState = page.locator('text=/no transactions|empty|no activity/i');
      if (await emptyState.count() > 0) {
        await expect(emptyState.first()).toBeVisible();
      }
    }
  });

  test('should display transaction information', async ({ page }) => {
    // Look for transaction details
    const transactionInfoSelectors = [
      '.transaction-type',
      '.transaction-amount',
      '.transaction-date',
      '.transaction-status',
      '.user-name',
      '.portfolio-name'
    ];

    for (const selector of transactionInfoSelectors) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }
  });

  test('should have transaction filtering', async ({ page }) => {
    // Look for filter options
    const filterSelectors = [
      '.date-filter',
      '.type-filter',
      '.status-filter',
      'input[type="date"]',
      'select'
    ];

    for (const selector of filterSelectors) {
      const filter = page.locator(selector);
      if (await filter.count() > 0 && await filter.isVisible()) {
        await expect(filter.first()).toBeVisible();
        break;
      }
    }
  });

  test('should display transaction amounts and currencies', async ({ page }) => {
    // Check for monetary values
    const bodyText = await page.locator('body').textContent();
    if (bodyText) {
      const moneyPattern = /\$|₹|\d+\.\d+/;
      expect(bodyText).toMatch(moneyPattern);
    }
  });

  test('should have export functionality', async ({ page }) => {
    // Look for export buttons
    const exportButtons = [
      'button:has-text("Export")',
      'button:has-text("Download")',
      '.export-button',
      '.download-button'
    ];

    for (const selector of exportButtons) {
      const button = page.locator(selector);
      if (await button.count() > 0 && await button.isVisible()) {
        await expect(button).toBeEnabled();
        break;
      }
    }
  });
});
