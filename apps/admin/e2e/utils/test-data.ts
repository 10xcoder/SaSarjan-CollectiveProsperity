/**
 * Test data for admin panel E2E tests
 */

export const TEST_USERS = {
  admin: {
    email: 'admin@sasarjan.com',
    password: 'password123',
    fullName: 'SaSarjan Admin',
    role: 'admin'
  },
  newUser: {
    email: 'newuser@test.com',
    password: 'password123',
    fullName: 'New Test User',
    location: 'Mumbai, India',
    profession: 'Software Engineer',
    ageGroup: '26-35',
    bio: 'Test user created for E2E testing'
  },
  editUser: {
    email: 'edituser@test.com',
    password: 'password123',
    fullName: 'Edit Test User',
    location: 'Delhi, India',
    profession: 'Designer',
    ageGroup: '18-25'
  }
};

export const TEST_APPS = {
  sampleApp: {
    name: 'Sample Test App',
    description: 'A sample app for testing purposes',
    category: 'productivity',
    price: 99.99,
    developer: 'Test Developer',
    version: '1.0.0'
  },
  freeApp: {
    name: 'Free Test App',
    description: 'A free app for testing',
    category: 'education',
    price: 0,
    developer: 'Test Developer',
    version: '1.0.0'
  }
};

export const TEST_REVENUE = {
  monthly: {
    target: 100000,
    actual: 85000,
    currency: 'INR'
  },
  yearly: {
    target: 1200000,
    actual: 950000,
    currency: 'INR'
  }
};

export const generateTestUser = (overrides: Partial<typeof TEST_USERS.newUser> = {}) => {
  const timestamp = Date.now();
  return {
    ...TEST_USERS.newUser,
    email: `testuser_${timestamp}@test.com`,
    fullName: `Test User ${timestamp}`,
    ...overrides
  };
};

export const generateTestApp = (overrides: Partial<typeof TEST_APPS.sampleApp> = {}) => {
  const timestamp = Date.now();
  return {
    ...TEST_APPS.sampleApp,
    name: `Test App ${timestamp}`,
    ...overrides
  };
};