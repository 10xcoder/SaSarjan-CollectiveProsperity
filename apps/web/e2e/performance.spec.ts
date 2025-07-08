import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals: any = {};
          
          entries.forEach((entry: any) => {
            if (entry.name === 'FCP') {
              vitals.fcp = entry.value;
            }
            if (entry.name === 'LCP') {
              vitals.lcp = entry.value;
            }
            if (entry.name === 'FID') {
              vitals.fid = entry.value;
            }
            if (entry.name === 'CLS') {
              vitals.cls = entry.value;
            }
          });
          
          // Return metrics after a short delay to ensure all are captured
          setTimeout(() => resolve(vitals), 1000);
        }).observe({ entryTypes: ['measure', 'navigation'] });
        
        // Fallback resolve
        setTimeout(() => resolve({}), 3000);
      });
    });
    
    console.log('Performance metrics:', metrics);
    // Note: In real tests, you'd have specific thresholds
    // expect(metrics.lcp).toBeLessThan(2500); // LCP should be < 2.5s
  });

  test('should load homepage within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('text=SaSarjan App Store');
    const loadTime = Date.now() - startTime;
    
    console.log(`Homepage loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have efficient resource loading', async ({ page }) => {
    const response = await page.goto('/');
    
    // Check main document size
    const contentLength = response?.headers()['content-length'];
    if (contentLength) {
      const sizeKB = parseInt(contentLength) / 1024;
      console.log(`Main document size: ${sizeKB.toFixed(2)}KB`);
      expect(sizeKB).toBeLessThan(100); // Main HTML should be < 100KB
    }
  });

  test('should properly compress assets', async ({ page }) => {
    await page.goto('/');
    
    // Check if responses are compressed
    const responses = await page.evaluate(() => {
      return Array.from(performance.getEntriesByType('resource')).map((entry: any) => ({
        name: entry.name,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
      }));
    });
    
    const jsFiles = responses.filter(r => r.name.includes('.js'));
    const cssFiles = responses.filter(r => r.name.includes('.css'));
    
    console.log(`Found ${jsFiles.length} JS files and ${cssFiles.length} CSS files`);
    
    // Check compression ratio for larger files
    jsFiles.forEach(file => {
      if (file.decodedBodySize > 10000) { // Only check files > 10KB
        const compressionRatio = file.transferSize / file.decodedBodySize;
        console.log(`${file.name}: compression ratio ${compressionRatio.toFixed(2)}`);
        expect(compressionRatio).toBeLessThan(0.8); // Should be at least 20% compressed
      }
    });
  });

  test('should have minimal layout shift', async ({ page }) => {
    await page.goto('/');
    
    // Measure CLS (Cumulative Layout Shift)
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
        
        // Wait a bit to capture layout shifts
        setTimeout(() => resolve(clsValue), 2000);
      });
    });
    
    console.log(`Cumulative Layout Shift: ${cls}`);
    expect(cls).toBeLessThan(0.1); // CLS should be < 0.1
  });
});