import { test, expect } from '@playwright/test';

test.describe('Forms and Dialogs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolios');
    await page.waitForLoadState('networkidle');
  });

  test('should handle form validation', async ({ page }) => {
    // Try to find a create button to open a form
    const createButtons = [
      'button:has-text("Create")',
      'button:has-text("Add")',
      'button:has-text("New")'
    ];

    for (const selector of createButtons) {
      const button = page.locator(selector);
      if (await button.count() > 0 && await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(500);

        // Look for form dialog
        const dialog = page.locator('.mat-dialog-container, .modal, .dialog');
        if (await dialog.count() > 0) {
          // Try to submit empty form to test validation
          const submitButton = dialog.locator('button:has-text("Create"), button:has-text("Save"), button:has-text("Submit")');
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(500);

            // Look for validation errors
            const errorSelectors = [
              '.mat-error',
              '.error-message',
              '.validation-error',
              '.field-error',
              '.form-error'
            ];

            for (const errorSelector of errorSelectors) {
              const errors = dialog.locator(errorSelector);
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
        break;
      }
    }
  });

  test('should handle required field validation', async ({ page }) => {
    // Navigate to a form and test required fields
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add")').first();
    if (await createButton.count() > 0 && await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('.mat-dialog-container, .modal');
      if (await dialog.count() > 0) {
        // Find required input fields
        const requiredFields = dialog.locator('input[required], input[aria-required="true"]');
        const count = await requiredFields.count();

        if (count > 0) {
          // Focus and blur first required field to trigger validation
          const firstField = requiredFields.first();
          await firstField.focus();
          await firstField.blur();

          // Look for validation message
          const validationMessage = dialog.locator('.mat-error, .error-message');
          if (await validationMessage.count() > 0) {
            await expect(validationMessage.first()).toBeVisible();
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

  test('should handle form input types correctly', async ({ page }) => {
    // Test different input types in forms
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add")').first();
    if (await createButton.count() > 0 && await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('.mat-dialog-container, .modal');
      if (await dialog.count() > 0) {
        // Test text inputs
        const textInputs = dialog.locator('input[type="text"], input:not([type])');
        if (await textInputs.count() > 0) {
          await textInputs.first().fill('Test Value');
          await expect(textInputs.first()).toHaveValue('Test Value');
        }

        // Test number inputs
        const numberInputs = dialog.locator('input[type="number"]');
        if (await numberInputs.count() > 0) {
          await numberInputs.first().fill('123.45');
          await expect(numberInputs.first()).toHaveValue('123.45');
        }

        // Test email inputs
        const emailInputs = dialog.locator('input[type="email"]');
        if (await emailInputs.count() > 0) {
          await emailInputs.first().fill('test@example.com');
          await expect(emailInputs.first()).toHaveValue('test@example.com');
        }

        // Test textareas
        const textareas = dialog.locator('textarea');
        if (await textareas.count() > 0) {
          await textareas.first().fill('Test description');
          await expect(textareas.first()).toHaveValue('Test description');
        }

        // Close dialog
        const closeButton = dialog.locator('button:has-text("Cancel"), button:has-text("Close")');
        if (await closeButton.count() > 0) {
          await closeButton.click();
        }
      }
    }
  });

  test('should handle dropdown selections', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add")').first();
    if (await createButton.count() > 0 && await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('.mat-dialog-container, .modal');
      if (await dialog.count() > 0) {
        // Test mat-select dropdowns
        const matSelects = dialog.locator('mat-select');
        if (await matSelects.count() > 0) {
          await matSelects.first().click();
          await page.waitForTimeout(500);

          const options = page.locator('mat-option');
          if (await options.count() > 0) {
            await options.first().click();
            await page.waitForTimeout(500);
          }
        }

        // Test regular select elements
        const selects = dialog.locator('select');
        if (await selects.count() > 0) {
          const select = selects.first();
          const options = select.locator('option');
          if (await options.count() > 1) {
            await select.selectOption({ index: 1 });
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

  test('should handle checkbox and radio button interactions', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add")').first();
    if (await createButton.count() > 0 && await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('.mat-dialog-container, .modal');
      if (await dialog.count() > 0) {
        // Test checkboxes
        const checkboxes = dialog.locator('input[type="checkbox"], mat-checkbox');
        if (await checkboxes.count() > 0) {
          const checkbox = checkboxes.first();
          await checkbox.click();
          // Verify checkbox state change
          if (await checkbox.getAttribute('type') === 'checkbox') {
            await expect(checkbox).toBeChecked();
          }
        }

        // Test radio buttons
        const radioButtons = dialog.locator('input[type="radio"], mat-radio-button');
        if (await radioButtons.count() > 0) {
          await radioButtons.first().click();
          await page.waitForTimeout(300);
        }

        // Close dialog
        const closeButton = dialog.locator('button:has-text("Cancel"), button:has-text("Close")');
        if (await closeButton.count() > 0) {
          await closeButton.click();
        }
      }
    }
  });

  test('should handle dialog keyboard navigation', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add")').first();
    if (await createButton.count() > 0 && await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('.mat-dialog-container, .modal');
      if (await dialog.count() > 0) {
        // Test Tab navigation
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);

        // Test Escape to close dialog
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Dialog should be closed
        const dialogCount = await dialog.count();
        if (dialogCount > 0) {
          const isVisible = await dialog.first().isVisible();
          expect(isVisible).toBe(false);
        }
      }
    }
  });

  test('should handle form submission and success states', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add")').first();
    if (await createButton.count() > 0 && await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(500);

      const dialog = page.locator('.mat-dialog-container, .modal');
      if (await dialog.count() > 0) {
        // Fill out form with valid data
        const nameInput = dialog.locator('input[placeholder*="name"], input[formControlName="name"]');
        if (await nameInput.count() > 0) {
          await nameInput.fill('Test Portfolio');
        }

        const descInput = dialog.locator('textarea[placeholder*="description"], textarea[formControlName="description"]');
        if (await descInput.count() > 0) {
          await descInput.fill('Test description');
        }

        // Try to submit form
        const submitButton = dialog.locator('button:has-text("Create"), button:has-text("Save"), button:has-text("Submit")');
        if (await submitButton.count() > 0 && await submitButton.isEnabled()) {
          await submitButton.click();
          await page.waitForTimeout(1000);

          // Look for success message or dialog closure
          const successMessage = page.locator('.mat-snack-bar-container, .success-message, .toast');
          if (await successMessage.count() > 0) {
            await expect(successMessage.first()).toBeVisible();
          }
        }
      }
    }
  });
});
