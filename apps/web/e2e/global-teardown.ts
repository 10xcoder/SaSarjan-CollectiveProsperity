import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global test teardown...');
  
  // Cleanup after all tests
  // Clean up test data, close connections, etc.
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;