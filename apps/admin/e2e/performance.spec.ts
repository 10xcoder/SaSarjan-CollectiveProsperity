import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('dashboard should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/auth/login');
    
    // Login
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Login
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('/dashboard');
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: Record<string, number> = {};
          
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
          });
          
          resolve(vitals);
        });
        
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 3000);
      });
    });
    
    // Check performance metrics
    if (vitals.fcp) {
      expect(vitals.fcp).toBeLessThan(2000); // FCP should be under 2 seconds
    }
    
    if (vitals.lcp) {
      expect(vitals.lcp).toBeLessThan(2500); // LCP should be under 2.5 seconds
    }
  });

  test('should efficiently handle large data sets', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Login
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('/dashboard');
    
    // Navigate to users page
    await page.click('[data-testid="users-nav"]');
    await page.waitForURL('/users');
    
    const startTime = Date.now();
    
    // Wait for users table to load
    await page.waitForSelector('[data-testid="users-table"]');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Users page should load within 3 seconds even with large datasets
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle rapid user interactions', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Login
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('/dashboard');
    
    // Navigate to users page
    await page.click('[data-testid="users-nav"]');
    await page.waitForURL('/users');
    
    // Test rapid search interactions
    const searchInput = page.locator('[data-testid="user-search-input"]');
    
    const startTime = Date.now();
    
    // Type rapidly
    await searchInput.fill('test');
    await page.waitForTimeout(100);
    await searchInput.fill('test user');
    await page.waitForTimeout(100);
    await searchInput.fill('test user 123');
    
    // Wait for search results
    await page.waitForTimeout(500);
    
    const responseTime = Date.now() - startTime;
    
    // Should handle rapid typing within 1 second
    expect(responseTime).toBeLessThan(1000);
  });

  test('should optimize bundle size', async ({ page }) => {
    // Enable network tracking
    await page.route('**/*', (route) => {
      route.continue();
    });
    
    const responses: any[] = [];
    
    page.on('response', (response) => {
      if (response.url().includes('/_next/static/')) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'],
        });
      }
    });
    
    await page.goto('/auth/login');
    
    // Login and navigate to dashboard
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Calculate total bundle size
    const totalSize = responses.reduce((sum, response) => {
      return sum + (parseInt(response.size) || 0);
    }, 0);
    
    // Bundle size should be reasonable (less than 1MB for initial load)
    expect(totalSize).toBeLessThan(1024 * 1024);
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Login
    await page.fill('[data-testid="email-input"]', 'admin@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL('/dashboard');
    
    // Measure memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Navigate through different pages
    await page.click('[data-testid="users-nav"]');
    await page.waitForURL('/users');
    await page.waitForLoadState('networkidle');
    
    await page.click('[data-testid="apps-nav"]');
    await page.waitForURL('/apps');
    await page.waitForLoadState('networkidle');
    
    await page.click('[data-testid="revenue-nav"]');
    await page.waitForURL('/revenue');
    await page.waitForLoadState('networkidle');
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory usage should not increase dramatically
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    }
  });
});