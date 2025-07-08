import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test('dashboard page should be accessible', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Login first
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('/dashboard');
    
    // Inject axe-core
    await injectAxe(page);
    
    // Check accessibility
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('users page should be accessible', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Login first
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('/dashboard');
    await page.click('[data-testid="users-nav"]');
    await page.waitForURL('/users');
    
    // Inject axe-core
    await injectAxe(page);
    
    // Check accessibility
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('user creation modal should be accessible', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Login first
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('/dashboard');
    await page.click('[data-testid="users-nav"]');
    await page.waitForURL('/users');
    
    // Open user creation modal
    await page.click('[data-testid="add-user-button"]');
    await page.waitForSelector('[data-testid="user-modal"]');
    
    // Inject axe-core
    await injectAxe(page);
    
    // Check accessibility
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('login page should be accessible', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Inject axe-core
    await injectAxe(page);
    
    // Check accessibility
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="login-button"]')).toBeFocused();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Inject axe-core
    await injectAxe(page);
    
    // Check specifically for color contrast issues
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check that form elements have proper labels
    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');
    const loginButton = page.locator('[data-testid="login-button"]');
    
    await expect(emailInput).toHaveAttribute('aria-label');
    await expect(passwordInput).toHaveAttribute('aria-label');
    await expect(loginButton).toHaveAttribute('aria-label');
  });
});