import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Create a browser instance
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Setting up test environment...');
  
  // Wait for the admin app to be ready
  try {
    await page.goto(baseURL || 'http://localhost:3004');
    await page.waitForLoadState('networkidle');
    console.log('Admin app is ready for testing');
  } catch (error) {
    console.error('Failed to setup test environment:', error);
    throw error;
  }

  // You can add more setup tasks here:
  // - Create test users
  // - Set up test data
  // - Configure test database state
  
  await browser.close();
}

export default globalSetup;