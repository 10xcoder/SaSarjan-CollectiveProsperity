import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    const firstFocusable = page.locator(':focus');
    await expect(firstFocusable).toBeVisible();
    
    // Continue tabbing to ensure focus moves properly
    await page.keyboard.press('Tab');
    const secondFocusable = page.locator(':focus');
    await expect(secondFocusable).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Check that h1 exists and is unique
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
    await expect(h1Elements.first()).toContainText('SaSarjan App Store');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This will be checked by axe-core, but we can add specific checks
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('body')
      .withTags(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('should support screen readers with proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA landmarks
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Check that interactive elements have proper labels
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const hasText = await link.textContent();
      const hasAriaLabel = await link.getAttribute('aria-label');
      
      // Each link should have either text content or aria-label
      expect(hasText || hasAriaLabel).toBeTruthy();
    }
  });

  test('should be usable with reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    
    // Verify page loads and is functional with reduced motion
    await expect(page.getByRole('heading', { name: 'SaSarjan App Store' })).toBeVisible();
  });
});