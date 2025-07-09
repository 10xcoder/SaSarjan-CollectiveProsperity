// Performance optimization utilities

export interface PerformanceMetrics {
  pageId: string;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timestamp: number;
}

export class PerformanceTracker {
  private metrics: PerformanceMetrics | null = null;
  private pageId: string;

  constructor(pageId: string) {
    this.pageId = pageId;
  }

  // Initialize performance tracking
  init() {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    this.trackCoreWebVitals();
    
    // Track page load time
    this.trackPageLoadTime();

    // Track resource timing
    this.trackResourceTiming();
  }

  private trackCoreWebVitals() {
    // First Contentful Paint (FCP)
    this.trackFCP();
    
    // Largest Contentful Paint (LCP)
    this.trackLCP();
    
    // Cumulative Layout Shift (CLS)
    this.trackCLS();
    
    // First Input Delay (FID)
    this.trackFID();
  }

  private trackFCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        this.updateMetric('firstContentfulPaint', fcpEntry.startTime);
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ['paint'] });
  }

  private trackLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        this.updateMetric('largestContentfulPaint', lastEntry.startTime);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private trackCLS() {
    let clsValue = 0;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      
      this.updateMetric('cumulativeLayoutShift', clsValue);
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  private trackFID() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fidEntry = entries[0];
      
      if (fidEntry) {
        this.updateMetric('firstInputDelay', (fidEntry as any).processingStart - fidEntry.startTime);
        observer.disconnect();
      }
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  private trackPageLoadTime() {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.updateMetric('loadTime', loadTime);
    });
  }

  private trackResourceTiming() {
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter(resource => resource.duration > 1000);
      
      if (slowResources.length > 0) {
        console.warn('Slow loading resources detected:', slowResources);
      }
    });
  }

  private updateMetric(key: keyof Omit<PerformanceMetrics, 'pageId' | 'timestamp'>, value: number) {
    if (!this.metrics) {
      this.metrics = {
        pageId: this.pageId,
        loadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        timestamp: Date.now(),
      };
    }

    this.metrics[key] = value;
  }

  // Send metrics to analytics
  sendMetrics() {
    if (!this.metrics) return;

    // Wait a bit to ensure all metrics are collected
    setTimeout(() => {
      this.reportToAnalytics(this.metrics!);
    }, 3000);
  }

  private async reportToAnalytics(metrics: PerformanceMetrics) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }
}

// Image optimization utilities
export class ImageOptimizer {
  static generateSrcSet(imageSrc: string, sizes: number[] = [320, 640, 768, 1024, 1280, 1920]): string {
    return sizes
      .map(size => `${imageSrc}?w=${size}&q=75 ${size}w`)
      .join(', ');
  }

  static generateSizes(breakpoints: { [key: string]: string } = {
    '(max-width: 640px)': '100vw',
    '(max-width: 768px)': '100vw',
    '(max-width: 1024px)': '50vw',
    '(max-width: 1280px)': '33vw',
  }): string {
    const entries = Object.entries(breakpoints);
    const conditions = entries.slice(0, -1).map(([query, size]) => `${query} ${size}`);
    const fallback = entries[entries.length - 1][1];
    
    return [...conditions, fallback].join(', ');
  }

  static preloadCriticalImages(images: string[]) {
    if (typeof window === 'undefined') return;

    images.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }
}

// CSS optimization utilities
export class CSSOptimizer {
  static inlineCriticalCSS(css: string) {
    if (typeof window === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  static loadNonCriticalCSS(href: string) {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }
}

// Font optimization utilities
export class FontOptimizer {
  static preloadFonts(fonts: Array<{ href: string; crossOrigin?: boolean }>) {
    if (typeof window === 'undefined') return;

    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = font.href;
      if (font.crossOrigin) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  static optimizeGoogleFonts(families: string[]): string {
    const baseUrl = 'https://fonts.googleapis.com/css2';
    const familyParams = families.map(family => `family=${encodeURIComponent(family)}`);
    const params = [
      ...familyParams,
      'display=swap',
      'subset=latin'
    ];
    
    return `${baseUrl}?${params.join('&')}`;
  }
}

// Cache optimization utilities
export class CacheOptimizer {
  private static readonly CACHE_NAME = '10xgrowth-v1';

  static async cacheResources(urls: string[]) {
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        const cache = await caches.open(this.CACHE_NAME);
        await cache.addAll(urls);
      } catch (error) {
        console.error('Failed to cache resources:', error);
      }
    }
  }

  static async getCachedResponse(url: string): Promise<Response | undefined> {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.CACHE_NAME);
        return await cache.match(url);
      } catch (error) {
        console.error('Failed to get cached response:', error);
      }
    }
  }

  static async updateCache(url: string, response: Response) {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.CACHE_NAME);
        await cache.put(url, response.clone());
      } catch (error) {
        console.error('Failed to update cache:', error);
      }
    }
  }
}

// Lazy loading utilities
export class LazyLoader {
  private static observer: IntersectionObserver | null = null;

  static init() {
    if (typeof window === 'undefined' || this.observer) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            this.loadElement(target);
            this.observer!.unobserve(target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1,
      }
    );
  }

  static observe(element: HTMLElement) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  private static loadElement(element: HTMLElement) {
    if (element.tagName === 'IMG') {
      const img = element as HTMLImageElement;
      const src = img.dataset.src;
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
      }
    }

    if (element.dataset.bgImage) {
      element.style.backgroundImage = `url(${element.dataset.bgImage})`;
      element.removeAttribute('data-bg-image');
    }
  }
}

// Performance monitoring
export function initPerformanceMonitoring(pageId: string) {
  if (typeof window === 'undefined') return;

  const tracker = new PerformanceTracker(pageId);
  tracker.init();

  // Send metrics when the user is about to leave
  window.addEventListener('beforeunload', () => {
    tracker.sendMetrics();
  });

  // Send metrics after 5 seconds
  setTimeout(() => {
    tracker.sendMetrics();
  }, 5000);

  // Initialize lazy loading
  LazyLoader.init();
}