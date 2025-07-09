import { Page, expect } from '@playwright/test';

export class AdminTestHelpers {
  constructor(private page: Page) {}

  /**
   * Login as admin user
   */
  async loginAsAdmin(email: string = 'admin@sasarjan.com', password: string = 'password123') {
    await this.page.goto('/auth/login');
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await expect(this.page).toHaveURL('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to users page
   */
  async navigateToUsers() {
    await this.page.click('[data-testid="users-nav"]');
    await expect(this.page).toHaveURL('/users');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to apps page
   */
  async navigateToApps() {
    await this.page.click('[data-testid="apps-nav"]');
    await expect(this.page).toHaveURL('/apps');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to revenue page
   */
  async navigateToRevenue() {
    await this.page.click('[data-testid="revenue-nav"]');
    await expect(this.page).toHaveURL('/revenue');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Create a new user
   */
  async createUser(userData: {
    email: string;
    password: string;
    fullName: string;
    location?: string;
    profession?: string;
  }) {
    await this.navigateToUsers();
    await this.page.click('[data-testid="add-user-button"]');
    
    // Fill out the form
    await this.page.fill('[data-testid="user-email-input"]', userData.email);
    await this.page.fill('[data-testid="user-password-input"]', userData.password);
    await this.page.fill('[data-testid="user-fullname-input"]', userData.fullName);
    
    if (userData.location) {
      await this.page.fill('[data-testid="user-location-input"]', userData.location);
    }
    
    if (userData.profession) {
      await this.page.fill('[data-testid="user-profession-input"]', userData.profession);
    }
    
    await this.page.click('[data-testid="create-user-button"]');
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="success-toast"]')).toBeVisible();
  }

  /**
   * Search for a user
   */
  async searchUser(searchTerm: string) {
    await this.navigateToUsers();
    await this.page.fill('[data-testid="user-search-input"]', searchTerm);
    await this.page.waitForTimeout(500); // Wait for debounce
  }

  /**
   * Edit a user
   */
  async editUser(userEmail: string, newData: Partial<{
    fullName: string;
    location: string;
    profession: string;
  }>) {
    await this.searchUser(userEmail);
    await this.page.click(`[data-testid="edit-user-${userEmail}"]`);
    
    if (newData.fullName) {
      await this.page.fill('[data-testid="user-fullname-input"]', newData.fullName);
    }
    
    if (newData.location) {
      await this.page.fill('[data-testid="user-location-input"]', newData.location);
    }
    
    if (newData.profession) {
      await this.page.fill('[data-testid="user-profession-input"]', newData.profession);
    }
    
    await this.page.click('[data-testid="update-user-button"]');
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="success-toast"]')).toBeVisible();
  }

  /**
   * Logout
   */
  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await expect(this.page).toHaveURL('/auth/login');
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(100);
  }

  /**
   * Take a screenshot for debugging
   */
  async debugScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}