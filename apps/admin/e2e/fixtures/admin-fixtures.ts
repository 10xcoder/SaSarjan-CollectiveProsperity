import { test as base } from '@playwright/test';
import { AdminTestHelpers } from '../utils/test-helpers';

// Extend the base test with admin-specific fixtures
export const test = base.extend<{
  adminHelpers: AdminTestHelpers;
  authenticatedPage: any;
}>({
  // Admin test helpers fixture
  adminHelpers: async ({ page }, use) => {
    const helpers = new AdminTestHelpers(page);
    await use(helpers);
  },

  // Authenticated page fixture - automatically logs in as admin
  authenticatedPage: async ({ page, adminHelpers }: any, use: any) => {
    await adminHelpers.loginAsAdmin();
    await use(page);
    await adminHelpers.logout();
  },
});

export { expect } from '@playwright/test';