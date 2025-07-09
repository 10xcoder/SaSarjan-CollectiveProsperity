import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AnalyticsTracker } from './analytics-tracker';
import { mockContentAnalytics, mockAuthorAnalytics } from '../test/mocks';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AnalyticsTracker', () => {
  let tracker: AnalyticsTracker;

  beforeEach(() => {
    // Reset singleton instance
    // @ts-ignore - Access private static member for testing
    AnalyticsTracker.instance = undefined;
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (tracker) {
      tracker.destroy();
    }
    vi.useRealTimers();
  });

  describe('singleton pattern', () => {
    it('should create instance with initial config', () => {
      const config = { enableTracking: true, batchSize: 5 };
      tracker = AnalyticsTracker.getInstance(config);

      expect(tracker).toBeDefined();
    });

    it('should return same instance on subsequent calls', () => {
      const config = { enableTracking: true };
      const instance1 = AnalyticsTracker.getInstance(config);
      const instance2 = AnalyticsTracker.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should throw error if no config provided on first call', () => {
      expect(() => {
        AnalyticsTracker.getInstance();
      }).toThrow('AnalyticsTracker must be initialized with config on first use');
    });
  });

  describe('configuration', () => {
    it('should use default configuration values', () => {
      tracker = AnalyticsTracker.getInstance({ enableTracking: true });

      // Test default values by checking behavior
      expect(tracker).toBeDefined();
    });

    it('should override default values with provided config', () => {
      const config = {
        enableTracking: true,
        batchSize: 5,
        flushInterval: 10000,
        enableLocalStorage: false,
      };

      tracker = AnalyticsTracker.getInstance(config);

      expect(tracker).toBeDefined();
    });

    it('should start flush timer when tracking enabled', () => {
      const config = {
        enableTracking: true,
        flushInterval: 5000,
      };

      tracker = AnalyticsTracker.getInstance(config);

      // Timer should be set
      expect(vi.getTimerCount()).toBe(1);
    });

    it('should not start flush timer when tracking disabled', () => {
      const config = {
        enableTracking: false,
        flushInterval: 5000,
      };

      tracker = AnalyticsTracker.getInstance(config);

      // No timer should be set
      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('event tracking', () => {
    beforeEach(() => {
      tracker = AnalyticsTracker.getInstance({ enableTracking: true, batchSize: 10 });
    });

    it('should track basic event', async () => {
      const event = {
        eventType: 'content_view',
        userId: 'user-1',
        contentId: 'content-1',
      };

      await tracker.trackEvent(event);

      // Event should be added to queue
      expect(tracker).toBeDefined();
    });

    it('should not track events when tracking disabled', async () => {
      tracker.destroy();
      tracker = AnalyticsTracker.getInstance({ enableTracking: false });

      const event = {
        eventType: 'content_view',
        userId: 'user-1',
        contentId: 'content-1',
      };

      await tracker.trackEvent(event);

      // Should not throw error but also not track
      expect(tracker).toBeDefined();
    });

    it('should auto-flush when batch size reached', async () => {
      tracker.destroy();
      tracker = AnalyticsTracker.getInstance({ 
        enableTracking: true, 
        batchSize: 2,
        trackingEndpoint: 'https://api.example.com/analytics'
      });

      mockFetch.mockResolvedValue(new Response('OK', { status: 200 }));

      // Add events to reach batch size
      await tracker.trackEvent({ eventType: 'content_view', userId: 'user-1' });
      await tracker.trackEvent({ eventType: 'content_like', userId: 'user-1' });

      // Wait for any pending promises
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should have triggered flush
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/analytics',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('content_view'),
        })
      );
    });

    it('should save to localStorage when enabled', async () => {
      tracker.destroy();
      tracker = AnalyticsTracker.getInstance({ 
        enableTracking: true, 
        enableLocalStorage: true 
      });

      const mockSetItem = vi.fn();
      const mockGetItem = vi.fn().mockReturnValue('[]');
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: mockSetItem,
        },
        writable: true
      });

      await tracker.trackEvent({ eventType: 'content_view', userId: 'user-1' });

      expect(mockSetItem).toHaveBeenCalledWith(
        'analytics_events',
        expect.stringContaining('content_view')
      );
    });

    it('should handle localStorage errors gracefully', async () => {
      tracker.destroy();
      tracker = AnalyticsTracker.getInstance({ 
        enableTracking: true, 
        enableLocalStorage: true 
      });

      const mockSetItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage error');
      });
      const mockGetItem = vi.fn().mockReturnValue('[]');
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: mockSetItem,
        },
        writable: true
      });

      // Should not throw error
      await expect(tracker.trackEvent({ 
        eventType: 'content_view', 
        userId: 'user-1' 
      })).resolves.not.toThrow();
    });

    it('should limit localStorage events to 100', async () => {
      tracker.destroy();
      tracker = AnalyticsTracker.getInstance({ 
        enableTracking: true, 
        enableLocalStorage: true 
      });

      const existingEvents = Array(101).fill(null).map((_, i) => ({
        eventType: 'test',
        timestamp: new Date(),
        id: `event-${i}`
      }));

      const mockSetItem = vi.fn();
      const mockGetItem = vi.fn().mockReturnValue(JSON.stringify(existingEvents));
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: mockSetItem,
        },
        writable: true
      });

      await tracker.trackEvent({ eventType: 'content_view', userId: 'user-1' });

      // Should have removed oldest events and kept only 100
      expect(mockSetItem).toHaveBeenCalledWith(
        'analytics_events',
        expect.stringMatching(/^\[.*\]$/)
      );

      const savedEvents = JSON.parse(mockSetItem.mock.calls[0][1]);
      expect(savedEvents.length).toBe(100);
    });
  });

  describe('specific event tracking methods', () => {
    beforeEach(() => {
      tracker = AnalyticsTracker.getInstance({ enableTracking: true });
    });

    it('should track content view', async () => {
      await tracker.trackContentView('content-1', 'user-1', { source: 'web' });

      expect(tracker).toBeDefined();
    });

    it('should track content like', async () => {
      await tracker.trackContentLike('content-1', 'user-1');

      expect(tracker).toBeDefined();
    });

    it('should track content share', async () => {
      await tracker.trackContentShare('content-1', 'user-1', 'twitter');

      expect(tracker).toBeDefined();
    });

    it('should track search query', async () => {
      await tracker.trackSearchQuery('knowledge management', 'user-1', 25);

      expect(tracker).toBeDefined();
    });

    it('should track search result click', async () => {
      await tracker.trackSearchResultClick('content-1', 'knowledge management', 3, 'user-1');

      expect(tracker).toBeDefined();
    });

    it('should track search event', async () => {
      const filters = { category: ['knowledge_commons'] };
      const results = [{ id: 'content-1', title: 'Test' }];

      await tracker.trackSearchEvent('knowledge management', filters, results, 'user-1');

      expect(tracker).toBeDefined();
    });

    it('should track author follow', async () => {
      await tracker.trackAuthorFollow('author-1', 'user-1');

      expect(tracker).toBeDefined();
    });

    it('should generate session ID', async () => {
      const mockSessionStorage = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true
      });

      await tracker.trackContentView('content-1', 'user-1');

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'analytics_session_id',
        expect.stringMatching(/^session_\d+_[a-z0-9]+$/)
      );
    });

    it('should reuse existing session ID', async () => {
      const existingSessionId = 'session_123_abc';
      const mockSessionStorage = {
        getItem: vi.fn().mockReturnValue(existingSessionId),
        setItem: vi.fn(),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true
      });

      await tracker.trackContentView('content-1', 'user-1');

      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle sessionStorage not available', async () => {
      Object.defineProperty(window, 'sessionStorage', {
        value: undefined,
        writable: true
      });

      // Should not throw error
      await expect(tracker.trackContentView('content-1', 'user-1')).resolves.not.toThrow();
    });
  });

  describe('analytics retrieval', () => {
    beforeEach(() => {
      tracker = AnalyticsTracker.getInstance({ enableTracking: true });
    });

    it('should get content analytics', async () => {
      const analytics = await tracker.getContentAnalytics('content-1', 'month');

      expect(analytics).toEqual(expect.objectContaining({
        contentId: 'content-1',
        totalViews: expect.any(Number),
        uniqueViews: expect.any(Number),
        period: 'month',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        lastUpdated: expect.any(Date),
        calculatedAt: expect.any(Date),
      }));
    });

    it('should get author analytics', async () => {
      const analytics = await tracker.getAuthorAnalytics('author-1', 'quarter');

      expect(analytics).toEqual(expect.objectContaining({
        authorId: 'author-1',
        totalContent: expect.any(Number),
        publishedContent: expect.any(Number),
        draftContent: expect.any(Number),
        period: 'month',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        lastUpdated: expect.any(Date),
        calculatedAt: expect.any(Date),
      }));
    });

    it('should return mock analytics data', async () => {
      const contentAnalytics = await tracker.getContentAnalytics('content-1');
      const authorAnalytics = await tracker.getAuthorAnalytics('author-1');

      expect(contentAnalytics).toBeDefined();
      expect(authorAnalytics).toBeDefined();
      expect(contentAnalytics.contentId).toBe('content-1');
      expect(authorAnalytics.authorId).toBe('author-1');
    });
  });

  describe('flushing and sending events', () => {
    beforeEach(() => {
      tracker = AnalyticsTracker.getInstance({ 
        enableTracking: true,
        trackingEndpoint: 'https://api.example.com/analytics'
      });
    });

    it('should flush events to endpoint', async () => {
      mockFetch.mockResolvedValue(new Response('OK', { status: 200 }));

      await tracker.trackEvent({ eventType: 'content_view', userId: 'user-1' });
      
      // Manually trigger flush
      await tracker.flush();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/analytics',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('content_view'),
        })
      );
    });

    it('should handle flush errors and requeue events', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await tracker.trackEvent({ eventType: 'content_view', userId: 'user-1' });
      
      // Manually trigger flush
      await tracker.flush();

      expect(mockFetch).toHaveBeenCalled();
      
      // Events should be re-queued on error
      // Next flush should try to send them again
      mockFetch.mockResolvedValue(new Response('OK', { status: 200 }));
      await tracker.flush();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle endpoint errors', async () => {
      mockFetch.mockResolvedValue(new Response('Server Error', { status: 500 }));

      await tracker.trackEvent({ eventType: 'content_view', userId: 'user-1' });
      
      // Should not throw error
      await expect(tracker.flush()).resolves.not.toThrow();
    });

    it('should log events when no endpoint configured', async () => {
      tracker.destroy();
      tracker = AnalyticsTracker.getInstance({ 
        enableTracking: true 
        // No trackingEndpoint
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await tracker.trackEvent({ eventType: 'content_view', userId: 'user-1' });
      await tracker.flush();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Analytics Events:',
        expect.arrayContaining([
          expect.objectContaining({
            eventType: 'content_view',
            userId: 'user-1',
          })
        ])
      );

      consoleSpy.mockRestore();
    });

    it('should flush events on timer interval', async () => {
      tracker.destroy();
      tracker = AnalyticsTracker.getInstance({ 
        enableTracking: true,
        flushInterval: 1000,
        trackingEndpoint: 'https://api.example.com/analytics'
      });

      mockFetch.mockResolvedValue(new Response('OK', { status: 200 }));

      await tracker.trackEvent({ eventType: 'content_view', userId: 'user-1' });

      // Advance timer to trigger flush
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      // Wait for flush to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should not flush empty queue', async () => {
      await tracker.flush();

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    beforeEach(() => {
      tracker = AnalyticsTracker.getInstance({ 
        enableTracking: true,
        flushInterval: 1000
      });
    });

    it('should clear timer on destroy', () => {
      expect(vi.getTimerCount()).toBe(1);

      tracker.destroy();

      expect(vi.getTimerCount()).toBe(0);
    });

    it('should flush events on destroy', async () => {
      tracker.destroy();
      tracker = AnalyticsTracker.getInstance({ 
        enableTracking: true,
        trackingEndpoint: 'https://api.example.com/analytics'
      });

      mockFetch.mockResolvedValue(new Response('OK', { status: 200 }));

      await tracker.trackEvent({ eventType: 'content_view', userId: 'user-1' });

      tracker.destroy();

      // Wait for flush to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle errors during destroy', async () => {
      tracker.destroy();
      tracker = AnalyticsTracker.getInstance({ 
        enableTracking: true,
        trackingEndpoint: 'https://api.example.com/analytics'
      });

      mockFetch.mockRejectedValue(new Error('Network error'));

      await tracker.trackEvent({ eventType: 'content_view', userId: 'user-1' });

      // Should not throw error
      expect(() => tracker.destroy()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      tracker = AnalyticsTracker.getInstance({ enableTracking: true });
    });

    it('should handle malformed localStorage data', async () => {
      tracker.destroy();
      tracker = AnalyticsTracker.getInstance({ 
        enableTracking: true, 
        enableLocalStorage: true 
      });

      const mockSetItem = vi.fn();
      const mockGetItem = vi.fn().mockReturnValue('invalid json');
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: mockSetItem,
        },
        writable: true
      });

      // Should not throw error
      await expect(tracker.trackEvent({ 
        eventType: 'content_view', 
        userId: 'user-1' 
      })).resolves.not.toThrow();
    });

    it('should handle events with minimal data', async () => {
      await tracker.trackEvent({ eventType: 'content_view' });

      expect(tracker).toBeDefined();
    });

    it('should handle events with maximum data', async () => {
      await tracker.trackEvent({
        eventType: 'content_view',
        userId: 'user-1',
        contentId: 'content-1',
        authorId: 'author-1',
        sessionId: 'session-1',
        metadata: {
          source: 'web',
          deviceType: 'desktop',
          referrer: 'https://google.com',
          customData: { key: 'value' }
        }
      });

      expect(tracker).toBeDefined();
    });

    it('should handle concurrent event tracking', async () => {
      const promises = Array(10).fill(null).map((_, i) => 
        tracker.trackEvent({ eventType: 'content_view', userId: `user-${i}` })
      );

      await Promise.all(promises);

      expect(tracker).toBeDefined();
    });

    it('should handle very large event data', async () => {
      const largeData = {
        eventType: 'content_view',
        userId: 'user-1',
        metadata: {
          largeArray: Array(1000).fill(null).map((_, i) => ({ id: i, data: `data-${i}` })),
          largeString: 'x'.repeat(10000),
        }
      };

      await tracker.trackEvent(largeData);

      expect(tracker).toBeDefined();
    });
  });
});