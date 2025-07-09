import { describe, it, expect } from 'vitest';
import {
  AnalyticsEventType,
  AnalyticsEvent,
  ContentAnalytics,
  AuthorAnalytics,
  PlatformAnalytics,
  SearchMetricsAnalytics,
  AnalyticsReport,
  type AnalyticsEventTypeType,
  type AnalyticsEventType as AnalyticsEventTypeInterface,
  type ContentAnalyticsType,
  type AuthorAnalyticsType,
  type PlatformAnalyticsType,
  type SearchMetricsAnalyticsType,
  type AnalyticsReportType,
} from './analytics';

describe('Analytics Type Schemas', () => {
  describe('AnalyticsEventType', () => {
    it('should validate valid event types', () => {
      const validEventTypes: AnalyticsEventTypeType[] = [
        'content_view',
        'content_like',
        'content_bookmark',
        'content_share',
        'content_comment',
        'content_download',
        'content_rating',
        'content_complete',
        'content_start',
        'content_progress',
        'search_query',
        'search_result_click',
        'collection_view',
        'learning_path_start',
        'learning_path_complete',
        'author_follow',
        'author_unfollow',
        'tag_follow',
        'topic_follow',
        'feedback_submit',
        'report_content',
        'content_edit',
        'content_create',
        'content_delete',
        'user_signup',
        'user_login',
        'user_logout',
      ];

      validEventTypes.forEach(eventType => {
        expect(() => AnalyticsEventType.parse(eventType)).not.toThrow();
      });
    });

    it('should reject invalid event types', () => {
      const invalidEventTypes = ['invalid_event', 'content_invalid', 'user_invalid'];

      invalidEventTypes.forEach(eventType => {
        expect(() => AnalyticsEventType.parse(eventType)).toThrow();
      });
    });
  });

  describe('AnalyticsEvent', () => {
    it('should validate valid analytics event', () => {
      const validEvent: AnalyticsEventTypeInterface = {
        id: 'event-1',
        userId: 'user-1',
        sessionId: 'session-1',
        eventType: 'content_view',
        eventData: {
          source: 'web',
          deviceType: 'desktop',
        },
        contentId: 'content-1',
        contentType: 'article',
        contentCategory: 'knowledge_commons',
        contentLanguage: 'en',
        authorId: 'author-1',
        userAgent: 'Mozilla/5.0...',
        ipAddress: '192.168.1.1',
        location: 'Mumbai, India',
        referrer: 'https://google.com',
        appId: 'app-1',
        appVersion: '1.0.0',
        platform: 'web',
        timestamp: new Date(),
        metadata: {
          customField: 'customValue',
        },
      };

      expect(() => AnalyticsEvent.parse(validEvent)).not.toThrow();
    });

    it('should validate with minimal event', () => {
      const minimalEvent: AnalyticsEventTypeInterface = {
        id: 'event-1',
        eventType: 'content_view',
        timestamp: new Date(),
      };

      expect(() => AnalyticsEvent.parse(minimalEvent)).not.toThrow();
    });

    it('should validate platform options', () => {
      const validPlatforms = ['web', 'mobile', 'api'];

      validPlatforms.forEach(platform => {
        const event = {
          id: 'event-1',
          eventType: 'content_view',
          platform,
          timestamp: new Date(),
        };

        expect(() => AnalyticsEvent.parse(event)).not.toThrow();
      });
    });
  });

  describe('ContentAnalytics', () => {
    it('should validate valid content analytics', () => {
      const validAnalytics: ContentAnalyticsType = {
        contentId: 'content-1',
        totalViews: 1000,
        uniqueViews: 800,
        averageViewDuration: 180,
        bounceRate: 25.5,
        totalLikes: 100,
        totalBookmarks: 50,
        totalShares: 30,
        totalComments: 20,
        totalDownloads: 10,
        averageRating: 4.5,
        totalRatings: 80,
        ratingDistribution: {
          '5': 40,
          '4': 25,
          '3': 10,
          '2': 3,
          '1': 2,
        },
        totalCompletions: 450,
        averageCompletionTime: 15,
        completionRate: 85.2,
        averageProgress: 75.8,
        progressDistribution: {
          '0-25': 50,
          '26-50': 100,
          '51-75': 150,
          '76-100': 200,
        },
        searchImpressions: 2000,
        searchClicks: 250,
        searchClickThroughRate: 12.5,
        topLocations: [
          { location: 'Mumbai', count: 300 },
          { location: 'Delhi', count: 250 },
          { location: 'Bangalore', count: 200 },
        ],
        deviceBreakdown: {
          desktop: 600,
          mobile: 350,
          tablet: 50,
        },
        hourlyViews: {
          '0': 10,
          '1': 5,
          '9': 100,
          '10': 120,
          '14': 150,
          '18': 180,
          '20': 200,
        },
        dailyViews: {
          '2024-01-01': 100,
          '2024-01-02': 120,
          '2024-01-03': 150,
        },
        topReferrers: [
          { referrer: 'google.com', count: 400 },
          { referrer: 'facebook.com', count: 200 },
          { referrer: 'twitter.com', count: 100 },
        ],
        period: 'month',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        lastUpdated: new Date(),
        calculatedAt: new Date(),
      };

      expect(() => ContentAnalytics.parse(validAnalytics)).not.toThrow();
    });

    it('should validate with minimal analytics', () => {
      const minimalAnalytics: ContentAnalyticsType = {
        contentId: 'content-1',
        period: 'day',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        lastUpdated: new Date(),
        calculatedAt: new Date(),
      };

      expect(() => ContentAnalytics.parse(minimalAnalytics)).not.toThrow();
    });

    it('should validate period options', () => {
      const validPeriods = ['hour', 'day', 'week', 'month', 'year', 'all_time'];

      validPeriods.forEach(period => {
        const analytics = {
          contentId: 'content-1',
          period,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          lastUpdated: new Date(),
          calculatedAt: new Date(),
        };

        expect(() => ContentAnalytics.parse(analytics)).not.toThrow();
      });
    });

    it('should validate with default values', () => {
      const analytics = {
        contentId: 'content-1',
        period: 'month',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        lastUpdated: new Date(),
        calculatedAt: new Date(),
      };

      const parsed = ContentAnalytics.parse(analytics);
      expect(parsed.totalViews).toBe(0);
      expect(parsed.uniqueViews).toBe(0);
      expect(parsed.averageViewDuration).toBe(0);
      expect(parsed.bounceRate).toBe(0);
    });
  });

  describe('AuthorAnalytics', () => {
    it('should validate valid author analytics', () => {
      const validAnalytics: AuthorAnalyticsType = {
        authorId: 'author-1',
        totalContent: 25,
        publishedContent: 20,
        draftContent: 5,
        totalViews: 10000,
        totalLikes: 1000,
        totalBookmarks: 500,
        totalShares: 300,
        totalComments: 200,
        totalDownloads: 100,
        averageRating: 4.2,
        totalRatings: 800,
        totalFollowers: 1500,
        followerGrowth: 15.5,
        averageViewsPerContent: 400,
        averageEngagementRate: 8.5,
        topPerformingContent: [
          { contentId: 'content-1', title: 'Best Article', views: 2000, engagement: 12.5 },
          { contentId: 'content-2', title: 'Great Tutorial', views: 1500, engagement: 10.2 },
        ],
        categoryBreakdown: {
          knowledge_commons: 10,
          education_learning: 8,
          health_wellbeing: 5,
          technology_innovation: 2,
        },
        typeBreakdown: {
          article: 15,
          video: 5,
          tutorial: 3,
          guide: 2,
        },
        languageBreakdown: {
          en: 20,
          hi: 3,
          mr: 2,
        },
        monthlyViews: {
          '2024-01': 2000,
          '2024-02': 2500,
          '2024-03': 3000,
        },
        monthlyPublications: {
          '2024-01': 3,
          '2024-02': 2,
          '2024-03': 4,
        },
        averageQualityScore: 82.5,
        verificationStatus: true,
        period: 'quarter',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        lastUpdated: new Date(),
        calculatedAt: new Date(),
      };

      expect(() => AuthorAnalytics.parse(validAnalytics)).not.toThrow();
    });

    it('should validate with minimal analytics', () => {
      const minimalAnalytics: AuthorAnalyticsType = {
        authorId: 'author-1',
        period: 'month',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        lastUpdated: new Date(),
        calculatedAt: new Date(),
      };

      expect(() => AuthorAnalytics.parse(minimalAnalytics)).not.toThrow();
    });

    it('should validate period options', () => {
      const validPeriods = ['month', 'quarter', 'year', 'all_time'];

      validPeriods.forEach(period => {
        const analytics = {
          authorId: 'author-1',
          period,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          lastUpdated: new Date(),
          calculatedAt: new Date(),
        };

        expect(() => AuthorAnalytics.parse(analytics)).not.toThrow();
      });
    });
  });

  describe('PlatformAnalytics', () => {
    it('should validate valid platform analytics', () => {
      const validAnalytics: PlatformAnalyticsType = {
        totalContent: 10000,
        totalAuthors: 500,
        totalUsers: 25000,
        totalViews: 1000000,
        totalEngagement: 250000,
        newContentToday: 50,
        newContentThisWeek: 300,
        newContentThisMonth: 1200,
        newUsersToday: 100,
        newUsersThisWeek: 700,
        newUsersThisMonth: 3000,
        dailyActiveUsers: 5000,
        weeklyActiveUsers: 15000,
        monthlyActiveUsers: 50000,
        averageSessionDuration: 25.5,
        contentByCategory: {
          knowledge_commons: 3000,
          education_learning: 2500,
          health_wellbeing: 2000,
          technology_innovation: 1500,
          cultural_preservation: 1000,
        },
        contentByType: {
          article: 5000,
          video: 2000,
          audio: 1000,
          tutorial: 1500,
          guide: 500,
        },
        contentByLanguage: {
          en: 7000,
          hi: 1500,
          mr: 800,
          ta: 500,
          te: 200,
        },
        contentByLevel: {
          beginner: 4000,
          intermediate: 3500,
          advanced: 2000,
          expert: 500,
        },
        mostViewedContent: [
          { contentId: 'content-1', title: 'Popular Article', views: 50000, type: 'article', category: 'knowledge_commons' },
          { contentId: 'content-2', title: 'Trending Video', views: 40000, type: 'video', category: 'education_learning' },
        ],
        topSearchQueries: [
          { query: 'knowledge management', count: 5000, category: 'knowledge_commons' },
          { query: 'health tips', count: 3000, category: 'health_wellbeing' },
        ],
        usersByLocation: {
          'Mumbai': 8000,
          'Delhi': 6000,
          'Bangalore': 5000,
          'Chennai': 3000,
        },
        contentByLocation: {
          'Mumbai': 2000,
          'Delhi': 1500,
          'Bangalore': 1200,
          'Chennai': 800,
        },
        deviceBreakdown: {
          mobile: 15000,
          desktop: 8000,
          tablet: 2000,
        },
        platformBreakdown: {
          web: 20000,
          mobile: 5000,
          api: 0,
        },
        averageContentRating: 4.3,
        averageQualityScore: 78.5,
        moderationStats: {
          totalReports: 150,
          resolvedReports: 120,
          pendingReports: 30,
        },
        totalLearningPaths: 200,
        totalCompletions: 5000,
        averageCompletionRate: 65.5,
        period: 'month',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        lastUpdated: new Date(),
        calculatedAt: new Date(),
      };

      expect(() => PlatformAnalytics.parse(validAnalytics)).not.toThrow();
    });

    it('should validate with minimal analytics', () => {
      const minimalAnalytics: PlatformAnalyticsType = {
        period: 'day',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        lastUpdated: new Date(),
        calculatedAt: new Date(),
      };

      expect(() => PlatformAnalytics.parse(minimalAnalytics)).not.toThrow();
    });

    it('should validate period options', () => {
      const validPeriods = ['day', 'week', 'month', 'quarter', 'year'];

      validPeriods.forEach(period => {
        const analytics = {
          period,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          lastUpdated: new Date(),
          calculatedAt: new Date(),
        };

        expect(() => PlatformAnalytics.parse(analytics)).not.toThrow();
      });
    });
  });

  describe('SearchMetricsAnalytics', () => {
    it('should validate valid search metrics analytics', () => {
      const validAnalytics: SearchMetricsAnalyticsType = {
        totalQueries: 50000,
        uniqueQueries: 15000,
        totalUsers: 8000,
        topQueries: [
          { query: 'knowledge management', count: 5000, averageResults: 150, clickThroughRate: 12.5 },
          { query: 'health tips', count: 3000, averageResults: 80, clickThroughRate: 15.2 },
        ],
        trendingQueries: [
          { query: 'AI learning', count: 500, growth: 25.5, timeframe: 'week' },
          { query: 'sustainable living', count: 300, growth: 18.2, timeframe: 'day' },
        ],
        noResultsQueries: [
          { query: 'obscure topic', count: 10, suggestions: ['related topic', 'similar topic'] },
          { query: 'misspelled query', count: 5 },
        ],
        filterUsage: {
          category: 15000,
          type: 12000,
          language: 8000,
          level: 5000,
        },
        averageSearchTime: 250.5,
        averageResultsPerQuery: 125.8,
        averageClickThroughRate: 14.2,
        topClickedResults: [
          { contentId: 'content-1', title: 'Popular Result', clicks: 2000, impressions: 15000, ctr: 13.3 },
          { contentId: 'content-2', title: 'Trending Result', clicks: 1500, impressions: 10000, ctr: 15.0 },
        ],
        queryRefinements: 8000,
        averageRefinementsPerSession: 1.8,
        queriesByCategory: {
          knowledge_commons: 20000,
          education_learning: 15000,
          health_wellbeing: 10000,
        },
        queriesByLocation: {
          'Mumbai': 15000,
          'Delhi': 12000,
          'Bangalore': 10000,
        },
        hourlyQueries: {
          '0': 500,
          '9': 3000,
          '10': 3500,
          '14': 4000,
          '18': 4500,
          '20': 5000,
        },
        dailyQueries: {
          '2024-01-01': 1500,
          '2024-01-02': 1800,
          '2024-01-03': 2000,
        },
        period: 'month',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        lastUpdated: new Date(),
        calculatedAt: new Date(),
      };

      expect(() => SearchMetricsAnalytics.parse(validAnalytics)).not.toThrow();
    });

    it('should validate with minimal analytics', () => {
      const minimalAnalytics: SearchMetricsAnalyticsType = {
        topQueries: [],
        trendingQueries: [],
        noResultsQueries: [],
        topClickedResults: [],
        period: 'day',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        lastUpdated: new Date(),
        calculatedAt: new Date(),
      };

      expect(() => SearchMetricsAnalytics.parse(minimalAnalytics)).not.toThrow();
    });

    it('should validate trending query timeframes', () => {
      const validTimeframes = ['hour', 'day', 'week'];

      validTimeframes.forEach(timeframe => {
        const analytics = {
          topQueries: [],
          trendingQueries: [
            { query: 'test', count: 100, growth: 10.5, timeframe }
          ],
          noResultsQueries: [],
          topClickedResults: [],
          period: 'day',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-01'),
          lastUpdated: new Date(),
          calculatedAt: new Date(),
        };

        expect(() => SearchMetricsAnalytics.parse(analytics)).not.toThrow();
      });
    });
  });

  describe('AnalyticsReport', () => {
    it('should validate valid analytics report', () => {
      const validReport: AnalyticsReportType = {
        id: 'report-1',
        title: 'Monthly Content Performance Report',
        description: 'A comprehensive report on content performance for January 2024',
        type: 'content',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
        filters: {
          category: ['knowledge_commons', 'education_learning'],
          language: ['en', 'hi'],
        },
        data: {
          totalViews: 100000,
          topContent: [
            { id: 'content-1', title: 'Popular Article', views: 5000 },
            { id: 'content-2', title: 'Trending Video', views: 3000 },
          ],
          categoryBreakdown: {
            knowledge_commons: 60000,
            education_learning: 40000,
          },
        },
        insights: [
          {
            type: 'insight',
            title: 'Content Performance Insight',
            description: 'Video content shows 25% higher engagement than articles',
            severity: 'medium',
            actionable: true,
            recommendations: ['Create more video content', 'Improve video quality'],
          },
          {
            type: 'recommendation',
            title: 'Optimization Recommendation',
            description: 'Consider focusing on knowledge_commons category',
            severity: 'low',
            actionable: true,
          },
        ],
        createdBy: 'admin-1',
        createdAt: new Date(),
        lastUpdated: new Date(),
        isPublic: false,
        sharedWith: ['manager-1', 'analyst-1'],
        exportFormats: ['pdf', 'csv', 'json'],
        isScheduled: true,
        scheduleFrequency: 'monthly',
        nextRun: new Date('2024-02-01'),
      };

      expect(() => AnalyticsReport.parse(validReport)).not.toThrow();
    });

    it('should validate with minimal report', () => {
      const minimalReport: AnalyticsReportType = {
        id: 'report-1',
        title: 'Simple Report',
        type: 'platform',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31'),
        },
        data: {},
        insights: [],
        createdBy: 'admin-1',
        createdAt: new Date(),
        lastUpdated: new Date(),
        isPublic: false,
        isScheduled: false,
      };

      expect(() => AnalyticsReport.parse(minimalReport)).not.toThrow();
    });

    it('should validate report types', () => {
      const validTypes = ['content', 'author', 'platform', 'search', 'custom'];

      validTypes.forEach(type => {
        const report = {
          id: 'report-1',
          title: 'Test Report',
          type,
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
          },
          data: {},
          insights: [],
          createdBy: 'admin-1',
          createdAt: new Date(),
          lastUpdated: new Date(),
          isPublic: false,
          isScheduled: false,
        };

        expect(() => AnalyticsReport.parse(report)).not.toThrow();
      });
    });

    it('should validate insight types', () => {
      const validInsightTypes = ['insight', 'recommendation', 'alert', 'trend'];

      validInsightTypes.forEach(type => {
        const report = {
          id: 'report-1',
          title: 'Test Report',
          type: 'content',
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
          },
          data: {},
          insights: [{
            type,
            title: 'Test Insight',
            description: 'Test insight description',
            severity: 'medium',
            actionable: true,
          }],
          createdBy: 'admin-1',
          createdAt: new Date(),
          lastUpdated: new Date(),
          isPublic: false,
          isScheduled: false,
        };

        expect(() => AnalyticsReport.parse(report)).not.toThrow();
      });
    });

    it('should validate severity levels', () => {
      const validSeverities = ['low', 'medium', 'high'];

      validSeverities.forEach(severity => {
        const report = {
          id: 'report-1',
          title: 'Test Report',
          type: 'content',
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
          },
          data: {},
          insights: [{
            type: 'insight',
            title: 'Test Insight',
            description: 'Test insight description',
            severity,
            actionable: true,
          }],
          createdBy: 'admin-1',
          createdAt: new Date(),
          lastUpdated: new Date(),
          isPublic: false,
          isScheduled: false,
        };

        expect(() => AnalyticsReport.parse(report)).not.toThrow();
      });
    });

    it('should validate export formats', () => {
      const validFormats = ['pdf', 'csv', 'json', 'xlsx'];

      validFormats.forEach(format => {
        const report = {
          id: 'report-1',
          title: 'Test Report',
          type: 'content',
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
          },
          data: {},
          insights: [],
          createdBy: 'admin-1',
          createdAt: new Date(),
          lastUpdated: new Date(),
          isPublic: false,
          isScheduled: false,
          exportFormats: [format],
        };

        expect(() => AnalyticsReport.parse(report)).not.toThrow();
      });
    });

    it('should validate schedule frequencies', () => {
      const validFrequencies = ['daily', 'weekly', 'monthly'];

      validFrequencies.forEach(frequency => {
        const report = {
          id: 'report-1',
          title: 'Test Report',
          type: 'content',
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-31'),
          },
          data: {},
          insights: [],
          createdBy: 'admin-1',
          createdAt: new Date(),
          lastUpdated: new Date(),
          isPublic: false,
          isScheduled: true,
          scheduleFrequency: frequency,
          nextRun: new Date('2024-02-01'),
        };

        expect(() => AnalyticsReport.parse(report)).not.toThrow();
      });
    });
  });
});