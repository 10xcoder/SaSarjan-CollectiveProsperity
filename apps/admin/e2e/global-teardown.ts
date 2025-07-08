import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('Tearing down test environment...');
  
  // Clean up test data, close connections, etc.
  // You can add teardown tasks here:
  // - Clean up test users
  // - Reset test database state
  // - Clean up temporary files
  
  console.log('Test environment cleanup complete');
}

export default globalTeardown;