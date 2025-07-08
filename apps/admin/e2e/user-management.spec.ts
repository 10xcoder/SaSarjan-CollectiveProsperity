import { test, expect } from './fixtures/admin-fixtures';
import { generateTestUser } from './utils/test-data';

test.describe('User Management', () => {
  test('should display users list', async ({ authenticatedPage, adminHelpers }) => {
    await adminHelpers.navigateToUsers();
    
    // Should see users table
    await expect(authenticatedPage.locator('[data-testid="users-table"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="users-header"]')).toContainText('Users');
  });

  test('should create a new user', async ({ authenticatedPage, adminHelpers }) => {
    const newUser = generateTestUser();
    
    await adminHelpers.createUser(newUser);
    
    // Should see success message
    await expect(authenticatedPage.locator('[data-testid="success-toast"]')).toBeVisible();
    
    // Should see the new user in the list
    await adminHelpers.searchUser(newUser.email);
    await expect(authenticatedPage.locator(`[data-testid="user-row-${newUser.email}"]`)).toBeVisible();
  });

  test('should edit an existing user', async ({ authenticatedPage, adminHelpers }) => {
    const testUser = generateTestUser();
    
    // First create a user
    await adminHelpers.createUser(testUser);
    
    // Then edit it
    const updatedData = {
      fullName: 'Updated Test User',
      location: 'Bangalore, India',
      profession: 'Product Manager'
    };
    
    await adminHelpers.editUser(testUser.email, updatedData);
    
    // Verify the changes
    await adminHelpers.searchUser(testUser.email);
    await expect(authenticatedPage.locator(`[data-testid="user-name-${testUser.email}"]`)).toContainText(updatedData.fullName);
  });

  test('should search users', async ({ authenticatedPage, adminHelpers }) => {
    const testUser = generateTestUser();
    
    // Create a test user
    await adminHelpers.createUser(testUser);
    
    // Search for the user
    await adminHelpers.searchUser(testUser.email);
    
    // Should see only the searched user
    await expect(authenticatedPage.locator(`[data-testid="user-row-${testUser.email}"]`)).toBeVisible();
  });

  test('should filter users by status', async ({ authenticatedPage, adminHelpers }) => {
    await adminHelpers.navigateToUsers();
    
    // Test active users filter
    await authenticatedPage.selectOption('[data-testid="status-filter"]', 'active');
    await authenticatedPage.waitForTimeout(500);
    
    // Should see active users only
    const activeUsers = authenticatedPage.locator('[data-testid^="user-row-"]');
    await expect(activeUsers).toHaveCount(expect.any(Number));
  });

  test('should show user details modal', async ({ authenticatedPage, adminHelpers }) => {
    const testUser = generateTestUser();
    
    // Create a test user
    await adminHelpers.createUser(testUser);
    
    // Click on user details
    await authenticatedPage.click(`[data-testid="user-details-${testUser.email}"]`);
    
    // Should show user details modal
    await expect(authenticatedPage.locator('[data-testid="user-details-modal"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="user-details-email"]')).toContainText(testUser.email);
  });

  test('should handle user creation errors', async ({ authenticatedPage, adminHelpers }) => {
    await adminHelpers.navigateToUsers();
    await authenticatedPage.click('[data-testid="add-user-button"]');
    
    // Try to create user with missing required fields
    await authenticatedPage.fill('[data-testid="user-email-input"]', 'invalid-email');
    await authenticatedPage.click('[data-testid="create-user-button"]');
    
    // Should show validation errors
    await expect(authenticatedPage.locator('[data-testid="error-message"]')).toBeVisible();
  });
});