import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async login(username: string = 'admin', password: string = 'admin123') {
    // Navigate to login page
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');

    // Fill login form
    await this.page.fill('input[formControlName="username"], input[name="username"], input[placeholder*="username"]', username);
    await this.page.fill('input[formControlName="password"], input[name="password"], input[type="password"]', password);

    // Submit form
    await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');

    // Wait for navigation to dashboard
    try {
      await this.page.waitForURL('/dashboard', { timeout: 10000 });
    } catch (error) {
      // If login fails, we might still be on login page
      console.log('Login may have failed or taken longer than expected');
    }
  }

  async loginWithMockAuth() {
    // Set mock authentication data in localStorage
    await this.page.addInitScript(() => {
      const mockUser = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        active: true
      };

      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('current_user', JSON.stringify(mockUser));
    });
  }

  async logout() {
    // Look for logout button or user menu
    const logoutSelectors = [
      'button:has-text("Logout")',
      'button:has-text("Sign Out")',
      '.logout-button',
      '.user-menu button'
    ];

    for (const selector of logoutSelectors) {
      const button = this.page.locator(selector);
      if (await button.count() > 0 && await button.isVisible()) {
        await button.click();
        break;
      }
    }

    // Wait for redirect to login
    await this.page.waitForURL('/login', { timeout: 5000 });
  }

  async isLoggedIn(): Promise<boolean> {
    // Check if we're on a protected route (not login)
    const currentUrl = this.page.url();
    return !currentUrl.includes('/login');
  }
}
