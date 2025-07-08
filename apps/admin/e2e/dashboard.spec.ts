import { test, expect } from './fixtures/admin-fixtures';

test.describe('Admin Dashboard', () => {
  test('should display dashboard overview', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    
    // Should see dashboard header
    await expect(authenticatedPage.locator('[data-testid="dashboard-header"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="dashboard-header"]')).toContainText('Dashboard');
    
    // Should see key metrics cards
    await expect(authenticatedPage.locator('[data-testid="total-users-card"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="total-apps-card"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="total-revenue-card"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="active-users-card"]')).toBeVisible();
  });

  test('should display metrics with correct format', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    
    // Check if metrics are displayed as numbers
    const totalUsers = authenticatedPage.locator('[data-testid="total-users-value"]');
    const totalApps = authenticatedPage.locator('[data-testid="total-apps-value"]');
    const totalRevenue = authenticatedPage.locator('[data-testid="total-revenue-value"]');
    
    await expect(totalUsers).toBeVisible();
    await expect(totalApps).toBeVisible();
    await expect(totalRevenue).toBeVisible();
    
    // Revenue should be formatted as currency
    await expect(totalRevenue).toContainText('₹');
  });

  test('should navigate between sections', async ({ authenticatedPage, adminHelpers }) => {
    await authenticatedPage.goto('/dashboard');
    
    // Navigate to users
    await adminHelpers.navigateToUsers();
    await expect(authenticatedPage).toHaveURL('/users');
    
    // Navigate to apps
    await adminHelpers.navigateToApps();
    await expect(authenticatedPage).toHaveURL('/apps');
    
    // Navigate to revenue
    await adminHelpers.navigateToRevenue();
    await expect(authenticatedPage).toHaveURL('/revenue');
    
    // Navigate back to dashboard
    await authenticatedPage.click('[data-testid="dashboard-nav"]');
    await expect(authenticatedPage).toHaveURL('/dashboard');
  });

  test('should display recent activity', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    
    // Should see recent activity section
    await expect(authenticatedPage.locator('[data-testid="recent-activity"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="recent-activity-header"]')).toContainText('Recent Activity');
  });

  test('should display charts and graphs', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    
    // Should see user growth chart
    await expect(authenticatedPage.locator('[data-testid="user-growth-chart"]')).toBeVisible();
    
    // Should see revenue chart
    await expect(authenticatedPage.locator('[data-testid="revenue-chart"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ authenticatedPage }) => {
    // Set mobile viewport
    await authenticatedPage.setViewportSize({ width: 375, height: 667 });
    await authenticatedPage.goto('/dashboard');
    
    // Should see mobile navigation
    await expect(authenticatedPage.locator('[data-testid="mobile-nav"]')).toBeVisible();
    
    // Metrics should stack vertically on mobile
    const metricsContainer = authenticatedPage.locator('[data-testid="metrics-container"]');
    await expect(metricsContainer).toHaveCSS('flex-direction', 'column');
  });
});