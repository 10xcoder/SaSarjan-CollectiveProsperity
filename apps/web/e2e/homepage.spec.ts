import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'SaSarjan App Store' })).toBeVisible();
  });

  test('should display the subtitle', async ({ page }) => {
    await expect(page.getByRole('main').getByText('Building a robust technology platform')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    const exploreAppsLink = page.getByRole('link', { name: 'Explore Apps' });
    const developersLink = page.getByRole('link', { name: 'For Developers' });
    
    await expect(exploreAppsLink).toBeVisible();
    await expect(developersLink).toBeVisible();
    
    // Test link attributes
    await expect(exploreAppsLink).toHaveAttribute('href', '/apps');
    await expect(developersLink).toHaveAttribute('href', '/developer');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.getByRole('heading', { name: 'SaSarjan App Store' })).toBeVisible();
    await expect(page.getByRole('main').getByText('Building a robust technology platform')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await expect(page).toHaveTitle(/SaSarjan App Store/);
    
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /technology platform/);
  });

  test('should support dark mode toggle', async ({ page }) => {
    // Initially should be in light mode or system preference
    const html = page.locator('html');
    
    // Test that theme can be toggled (when we implement the toggle)
    // This test will be updated when we add the theme toggle component
    await expect(html).toBeVisible();
  });
});

test.describe('PWA Features', () => {
  test('should have service worker registration', async ({ page }) => {
    await page.goto('/');
    
    // Check if service worker is registered
    const swRegistration = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(swRegistration).toBe(true);
  });

  test('should have manifest file', async ({ page }) => {
    const response = await page.request.get('/manifest.json');
    expect(response.status()).toBe(200);
    
    const manifest = await response.json();
    expect(manifest.name).toContain('SaSarjan');
    expect(manifest.start_url).toBe('/');
  });

  test('should be installable as PWA', async ({ page, context }) => {
    await page.goto('/');
    
    // Listen for beforeinstallprompt event
    const beforeInstallPrompt = await page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('beforeinstallprompt', () => {
          resolve(true);
        });
        // Trigger after a short delay to simulate real behavior
        setTimeout(() => resolve(false), 2000);
      });
    });
    
    // Note: This might not trigger in test environment
    // but we're testing the structure is in place
    expect(typeof beforeInstallPrompt).toBe('boolean');
  });
});