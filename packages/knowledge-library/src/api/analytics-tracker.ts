import { AnalyticsEventType, ContentAnalyticsType, SearchAnalyticsType, AuthorAnalyticsType } from '../types';

export interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  contentId?: string;
  authorId?: string;
  sessionId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AnalyticsConfig {
  enableTracking: boolean;
  trackingEndpoint?: string;
  batchSize?: number;
  flushInterval?: number; // milliseconds
  enableLocalStorage?: boolean;
}

export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer?: NodeJS.Timeout;

  private constructor(config: AnalyticsConfig) {
    this.config = {
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enableLocalStorage: true,
      ...config
    };

    if (this.config.enableTracking && this.config.flushInterval) {
      this.startFlushTimer();
    }
  }

  static getInstance(config?: AnalyticsConfig): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      if (!config) {
        throw new Error('AnalyticsTracker must be initialized with config on first use');
      }
      AnalyticsTracker.instance = new AnalyticsTracker(config);
    }
    return AnalyticsTracker.instance;
  }

  async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    if (!this.config.enableTracking) {
      return;
    }

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: new Date()
    };

    this.eventQueue.push(fullEvent);

    // Auto-flush if batch size reached
    if (this.eventQueue.length >= (this.config.batchSize || 10)) {
      await this.flush();
    }

    // Store in local storage if enabled
    if (this.config.enableLocalStorage && typeof localStorage !== 'undefined') {
      this.saveToLocalStorage(fullEvent);
    }
  }

  async trackContentView(contentId: string, userId?: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventType: 'content_view',
      contentId,
      userId,
      sessionId: this.getSessionId(),
      metadata
    });
  }

  async trackContentLike(contentId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      eventType: 'content_like',
      contentId,
      userId,
      sessionId: this.getSessionId()
    });
  }

  async trackContentShare(contentId: string, userId?: string, platform?: string): Promise<void> {
    await this.trackEvent({
      eventType: 'content_share',
      contentId,
      userId,
      sessionId: this.getSessionId(),
      metadata: { platform }
    });
  }

  async trackSearchQuery(query: string, userId?: string, results?: number): Promise<void> {
    await this.trackEvent({
      eventType: 'search_query',
      userId,
      sessionId: this.getSessionId(),
      metadata: { query, resultCount: results }
    });
  }

  async trackSearchResultClick(contentId: string, query: string, position: number, userId?: string): Promise<void> {
    await this.trackEvent({
      eventType: 'search_result_click',
      contentId,
      userId,
      sessionId: this.getSessionId(),
      metadata: { query, position }
    });
  }

  async trackSearchEvent(query: string, filters: any, results: any[], userId?: string): Promise<void> {
    await this.trackEvent({
      eventType: 'search_query',
      userId,
      sessionId: this.getSessionId(),
      metadata: { 
        query, 
        filters, 
        resultCount: results.length,
        hasResults: results.length > 0
      }
    });
  }

  async trackAuthorFollow(authorId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      eventType: 'author_follow',
      authorId,
      userId,
      sessionId: this.getSessionId()
    });
  }

  async getContentAnalytics(contentId: string, timeRange?: string): Promise<ContentAnalyticsType> {
    // In a real implementation, this would query the analytics database
    const mockAnalytics: ContentAnalyticsType = {
      contentId,
      totalViews: 0,
      uniqueViews: 0,
      averageViewDuration: 0,
      bounceRate: 0,
      totalLikes: 0,
      totalBookmarks: 0,
      totalShares: 0,
      totalComments: 0,
      totalDownloads: 0,
      averageRating: 0,
      totalRatings: 0,
      totalCompletions: 0,
      averageCompletionTime: 0,
      completionRate: 0,
      averageProgress: 0,
      searchImpressions: 0,
      searchClicks: 0,
      searchClickThroughRate: 0,
      period: 'month',
      startDate: new Date(),
      endDate: new Date(),
      lastUpdated: new Date(),
      calculatedAt: new Date(),
    };

    return mockAnalytics;
  }

  async getAuthorAnalytics(authorId: string, timeRange?: string): Promise<AuthorAnalyticsType> {
    // In a real implementation, this would query the analytics database
    const mockAnalytics: AuthorAnalyticsType = {
      authorId,
      totalViews: 0,
      totalLikes: 0,
      totalBookmarks: 0,
      totalShares: 0,
      totalComments: 0,
      totalDownloads: 0,
      averageRating: 0,
      totalRatings: 0,
      totalFollowers: 0,
      followerGrowth: 0,
      averageViewsPerContent: 0,
      averageEngagementRate: 0,
      averageQualityScore: 0,
      totalContent: 0,
      publishedContent: 0,
      draftContent: 0,
      verificationStatus: false,
      period: 'month',
      startDate: new Date(),
      endDate: new Date(),
      lastUpdated: new Date(),
      calculatedAt: new Date(),
    };

    return mockAnalytics;
  }

  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (this.config.trackingEndpoint) {
        await this.sendToEndpoint(events);
      } else {
        // Log to console in development
        console.log('Analytics Events:', events);
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  private async sendToEndpoint(events: AnalyticsEvent[]): Promise<void> {
    if (!this.config.trackingEndpoint) {
      return;
    }

    const response = await fetch(this.config.trackingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ events })
    });

    if (!response.ok) {
      throw new Error(`Analytics endpoint returned ${response.status}`);
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error);
    }, this.config.flushInterval);
  }

  private getSessionId(): string {
    // Simple session ID generation
    if (typeof sessionStorage !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      return sessionId;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToLocalStorage(event: AnalyticsEvent): void {
    try {
      const stored = localStorage.getItem('analytics_events') || '[]';
      const events = JSON.parse(stored);
      events.push(event);
      
      // Keep only last 100 events in localStorage
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to save analytics event to localStorage:', error);
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush().catch(console.error);
  }
}