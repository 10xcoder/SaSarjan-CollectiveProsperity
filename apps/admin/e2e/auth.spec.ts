import { test, expect } from './fixtures/admin-fixtures';
import { TEST_USERS } from './utils/test-data';

test.describe('Admin Authentication', () => {
  test('should login successfully with valid credentials', async ({ page, adminHelpers }) => {
    await page.goto('/auth/login');
    
    await adminHelpers.loginAsAdmin();
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('[data-testid="email-input"]', 'invalid@test.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ page, adminHelpers }) => {
    await adminHelpers.loginAsAdmin();
    await adminHelpers.logout();
    
    // Should be redirected to login page
    await expect(page).toHaveURL('/auth/login');
  });

  test('should redirect to login when accessing protected routes without auth', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL('/auth/login');
  });
});