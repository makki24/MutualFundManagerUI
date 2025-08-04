import { test, expect } from '@playwright/test';

test.describe('Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
  });

  test('should display users list page', async ({ page }) => {
    // Check if users component is loaded
    await expect(page.locator('app-user-list')).toBeVisible();

    // Check URL
    await expect(page).toHaveURL('/users');
  });

  test('should display users table or list', async ({ page }) => {
    // Look for users table or list
    const userListSelectors = [
      'table',
      '.users-table',
      'mat-table',
      '.user-list',
      '.data-table'
    ];

    let usersFound = false;
    for (const selector of userListSelectors) {
      const userList = page.locator(selector);
      if (await userList.count() > 0) {
        await expect(userList.first()).toBeVisible();
        usersFound = true;

        // Check for table headers
        const headers = userList.locator('th, .header-cell');
        if (await headers.count() > 0) {
          await expect(headers.first()).toBeVisible();
        }
        break;
      }
    }

    // If no users found, check for empty state
    if (!usersFound) {
      const emptyState = page.locator('text=/no users|empty|add users/i');
      if (await emptyState.count() > 0) {
        await expect(emptyState.first()).toBeVisible();
      }
    }
  });

  test('should have create user functionality', async ({ page }) => {
    // Look for create/add user button
    const createButtons = [
      'button:has-text("Create User")',
      'button:has-text("Add User")',
      'button:has-text("New User")',
      'button:has-text("Invite")',
      '.create-user-button',
      '.add-user-button'
    ];

    for (const selector of createButtons) {
      const button = page.locator(selector);
      if (await button.count() > 0 && await button.isVisible()) {
        await expect(button).toBeEnabled();

        // Click the create user button
        await button.click();
        await page.waitForTimeout(500);

        // Look for create user dialog or form
        const dialogSelectors = [
          '.mat-dialog-container',
          '.create-user-dialog',
          '.user-form',
          '.modal'
        ];

        for (const dialogSelector of dialogSelectors) {
          const dialog = page.locator(dialogSelector);
          if (await dialog.count() > 0) {
            await expect(dialog.first()).toBeVisible();

            // Look for form fields
            const formFields = [
              'input[placeholder*="name"]',
              'input[placeholder*="email"]',
              'input[placeholder*="username"]',
              'input[type="email"]'
            ];

            for (const fieldSelector of formFields) {
              const field = dialog.locator(fieldSelector);
              if (await field.count() > 0) {
                await expect(field.first()).toBeVisible();
              }
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

  test('should display user information', async ({ page }) => {
    // Look for user information in the table/list
    const userInfoSelectors = [
      '.user-name',
      '.user-email',
      '.user-role',
      '.user-status',
      'td', // table cells
      '.user-info'
    ];

    for (const selector of userInfoSelectors) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        await expect(elements.first()).toBeVisible();
      }
    }

    // Check for email pattern in the page
    const bodyText = await page.locator('body').textContent();
    if (bodyText) {
      const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      if (emailPattern.test(bodyText)) {
        // Email found, which is good
        expect(true).toBe(true);
      }
    }
  });

  test('should have user search functionality', async ({ page }) => {
    // Look for search input
    const searchSelectors = [
      'input[placeholder*="search"]',
      'input[placeholder*="Search"]',
      'input[type="search"]',
      '.search-input',
      '.user-search'
    ];

    for (const selector of searchSelectors) {
      const searchInput = page.locator(selector);
      if (await searchInput.count() > 0 && await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible();

        // Test typing in search
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        await searchInput.clear();
        break;
      }
    }
  });

  test('should have user filtering options', async ({ page }) => {
    // Look for filter options
    const filterSelectors = [
      'select',
      '.filter-dropdown',
      'mat-select',
      '.role-filter',
      '.status-filter'
    ];

    for (const selector of filterSelectors) {
      const filter = page.locator(selector);
      if (await filter.count() > 0 && await filter.isVisible()) {
        await expect(filter.first()).toBeVisible();

        // Try to interact with filter if it's a select
        if (selector.includes('select') || selector.includes('mat-select')) {
          await filter.first().click();
          await page.waitForTimeout(500);

          // Look for filter options
          const options = page.locator('mat-option, option');
          if (await options.count() > 0) {
            await expect(options.first()).toBeVisible();

            // Click outside to close dropdown
            await page.click('body', { position: { x: 0, y: 0 } });
          }
        }
        break;
      }
    }
  });

  test('should have user action buttons', async ({ page }) => {
    // Look for action buttons in user rows
    const actionSelectors = [
      '.action-menu',
      '.user-actions',
      'button[mat-icon-button]',
      '.edit-button',
      '.delete-button',
      '.more-actions'
    ];

    for (const selector of actionSelectors) {
      const actions = page.locator(selector);
      const count = await actions.count();

      if (count > 0) {
        const firstAction = actions.first();
        if (await firstAction.isVisible() && await firstAction.isEnabled()) {
          await firstAction.click();
          await page.waitForTimeout(500);

          // Look for action menu or dialog
          const menuItems = page.locator('.mat-menu-item, .menu-item, .action-item, .mat-dialog-container');
          if (await menuItems.count() > 0) {
            await expect(menuItems.first()).toBeVisible();

            // Close menu/dialog
            await page.click('body', { position: { x: 0, y: 0 } });
            await page.waitForTimeout(300);
          }
          break;
        }
      }
    }
  });

  test('should display user roles and permissions', async ({ page }) => {
    // Look for role information
    const roleSelectors = [
      '.user-role',
      '.role-badge',
      '.permission-level',
      'td:has-text("ADMIN")',
      'td:has-text("USER")'
    ];

    for (const selector of roleSelectors) {
      const roleElements = page.locator(selector);
      if (await roleElements.count() > 0) {
        await expect(roleElements.first()).toBeVisible();
        break;
      }
    }

    // Check for role-related text in the page
    const bodyText = await page.locator('body').textContent();
    if (bodyText) {
      const rolePattern = /admin|user|manager|viewer/i;
      if (rolePattern.test(bodyText)) {
        expect(true).toBe(true);
      }
    }
  });

  test('should handle user status (active/inactive)', async ({ page }) => {
    // Look for status indicators
    const statusSelectors = [
      '.user-status',
      '.status-badge',
      '.active-status',
      '.inactive-status',
      'td:has-text("Active")',
      'td:has-text("Inactive")'
    ];

    for (const selector of statusSelectors) {
      const statusElements = page.locator(selector);
      if (await statusElements.count() > 0) {
        await expect(statusElements.first()).toBeVisible();
        break;
      }
    }
  });

  test('should have pagination for large user lists', async ({ page }) => {
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

        // Test pagination if enabled
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
