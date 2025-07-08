import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Global setup before all tests
  console.log('🚀 Starting global test setup...');
  
  // Start a browser instance for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the app to be ready
    await page.goto(baseURL!);
    await page.waitForSelector('text=SaSarjan App Store', { timeout: 30000 });
    console.log('✅ App is ready for testing');
  } catch (error) {
    console.error('❌ App failed to start:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;