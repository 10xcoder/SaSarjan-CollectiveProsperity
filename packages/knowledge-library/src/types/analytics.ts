import { z } from 'zod';
import { ContentType, ContentCategory, ContentLanguage } from './content';

/**
 * Analytics Event Types
 */
export const AnalyticsEventType = z.enum([
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
]);

export type AnalyticsEventTypeType = z.infer<typeof AnalyticsEventType>;

/**
 * Analytics Event
 */
export const AnalyticsEvent = z.object({
  id: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  
  // Event Details
  eventType: AnalyticsEventType,
  eventData: z.record(z.any()).optional(),
  
  // Content Context
  contentId: z.string().optional(),
  contentType: ContentType.optional(),
  contentCategory: ContentCategory.optional(),
  contentLanguage: ContentLanguage.optional(),
  authorId: z.string().optional(),
  
  // User Context
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  location: z.string().optional(),
  referrer: z.string().optional(),
  
  // App Context
  appId: z.string().optional(),
  appVersion: z.string().optional(),
  platform: z.enum(['web', 'mobile', 'api']).optional(),
  
  // Timestamp
  timestamp: z.date(),
  
  // Additional Metadata
  metadata: z.record(z.any()).optional(),
});

export type AnalyticsEventType = z.infer<typeof AnalyticsEvent>;

/**
 * Content Analytics
 */
export const ContentAnalytics = z.object({
  contentId: z.string(),
  
  // View Metrics
  totalViews: z.number().default(0),
  uniqueViews: z.number().default(0),
  averageViewDuration: z.number().default(0), // in seconds
  bounceRate: z.number().default(0), // percentage
  
  // Engagement Metrics
  totalLikes: z.number().default(0),
  totalBookmarks: z.number().default(0),
  totalShares: z.number().default(0),
  totalComments: z.number().default(0),
  totalDownloads: z.number().default(0),
  
  // Rating Metrics
  averageRating: z.number().default(0),
  totalRatings: z.number().default(0),
  ratingDistribution: z.record(z.number()).optional(), // rating -> count
  
  // Completion Metrics
  totalCompletions: z.number().default(0),
  averageCompletionTime: z.number().default(0), // in minutes
  completionRate: z.number().default(0), // percentage
  
  // Progress Metrics
  averageProgress: z.number().default(0), // percentage
  progressDistribution: z.record(z.number()).optional(), // progress_range -> count
  
  // Search Metrics
  searchImpressions: z.number().default(0),
  searchClicks: z.number().default(0),
  searchClickThroughRate: z.number().default(0), // percentage
  
  // Geographic Metrics
  topLocations: z.array(z.object({
    location: z.string(),
    count: z.number(),
  })).optional(),
  
  // Device Metrics
  deviceBreakdown: z.record(z.number()).optional(), // device_type -> count
  
  // Time-based Metrics
  hourlyViews: z.record(z.number()).optional(), // hour -> count
  dailyViews: z.record(z.number()).optional(), // date -> count
  
  // Referral Metrics
  topReferrers: z.array(z.object({
    referrer: z.string(),
    count: z.number(),
  })).optional(),
  
  // Period
  period: z.enum(['hour', 'day', 'week', 'month', 'year', 'all_time']),
  startDate: z.date(),
  endDate: z.date(),
  
  // Metadata
  lastUpdated: z.date(),
  calculatedAt: z.date(),
});

export type ContentAnalyticsType = z.infer<typeof ContentAnalytics>;

/**
 * Author Analytics
 */
export const AuthorAnalytics = z.object({
  authorId: z.string(),
  
  // Content Metrics
  totalContent: z.number().default(0),
  publishedContent: z.number().default(0),
  draftContent: z.number().default(0),
  
  // Engagement Metrics
  totalViews: z.number().default(0),
  totalLikes: z.number().default(0),
  totalBookmarks: z.number().default(0),
  totalShares: z.number().default(0),
  totalComments: z.number().default(0),
  totalDownloads: z.number().default(0),
  
  // Rating Metrics
  averageRating: z.number().default(0),
  totalRatings: z.number().default(0),
  
  // Follower Metrics
  totalFollowers: z.number().default(0),
  followerGrowth: z.number().default(0), // percentage
  
  // Performance Metrics
  averageViewsPerContent: z.number().default(0),
  averageEngagementRate: z.number().default(0), // percentage
  topPerformingContent: z.array(z.object({
    contentId: z.string(),
    title: z.string(),
    views: z.number(),
    engagement: z.number(),
  })).optional(),
  
  // Category Breakdown
  categoryBreakdown: z.record(z.number()).optional(), // category -> count
  typeBreakdown: z.record(z.number()).optional(), // type -> count
  languageBreakdown: z.record(z.number()).optional(), // language -> count
  
  // Time-based Metrics
  monthlyViews: z.record(z.number()).optional(), // month -> count
  monthlyPublications: z.record(z.number()).optional(), // month -> count
  
  // Quality Metrics
  averageQualityScore: z.number().default(0),
  verificationStatus: z.boolean().default(false),
  
  // Period
  period: z.enum(['month', 'quarter', 'year', 'all_time']),
  startDate: z.date(),
  endDate: z.date(),
  
  // Metadata
  lastUpdated: z.date(),
  calculatedAt: z.date(),
});

export type AuthorAnalyticsType = z.infer<typeof AuthorAnalytics>;

/**
 * Platform Analytics
 */
export const PlatformAnalytics = z.object({
  // Overall Metrics
  totalContent: z.number().default(0),
  totalAuthors: z.number().default(0),
  totalUsers: z.number().default(0),
  totalViews: z.number().default(0),
  totalEngagement: z.number().default(0),
  
  // Growth Metrics
  newContentToday: z.number().default(0),
  newContentThisWeek: z.number().default(0),
  newContentThisMonth: z.number().default(0),
  newUsersToday: z.number().default(0),
  newUsersThisWeek: z.number().default(0),
  newUsersThisMonth: z.number().default(0),
  
  // Engagement Metrics
  dailyActiveUsers: z.number().default(0),
  weeklyActiveUsers: z.number().default(0),
  monthlyActiveUsers: z.number().default(0),
  averageSessionDuration: z.number().default(0), // in minutes
  
  // Content Distribution
  contentByCategory: z.record(z.number()).optional(),
  contentByType: z.record(z.number()).optional(),
  contentByLanguage: z.record(z.number()).optional(),
  contentByLevel: z.record(z.number()).optional(),
  
  // Popular Content
  mostViewedContent: z.array(z.object({
    contentId: z.string(),
    title: z.string(),
    views: z.number(),
    type: ContentType,
    category: ContentCategory,
  })).optional(),
  
  // Popular Searches
  topSearchQueries: z.array(z.object({
    query: z.string(),
    count: z.number(),
    category: z.string().optional(),
  })).optional(),
  
  // Geographic Distribution
  usersByLocation: z.record(z.number()).optional(),
  contentByLocation: z.record(z.number()).optional(),
  
  // Device and Platform
  deviceBreakdown: z.record(z.number()).optional(),
  platformBreakdown: z.record(z.number()).optional(),
  
  // Quality Metrics
  averageContentRating: z.number().default(0),
  averageQualityScore: z.number().default(0),
  moderationStats: z.object({
    totalReports: z.number().default(0),
    resolvedReports: z.number().default(0),
    pendingReports: z.number().default(0),
  }).optional(),
  
  // Learning Metrics
  totalLearningPaths: z.number().default(0),
  totalCompletions: z.number().default(0),
  averageCompletionRate: z.number().default(0),
  
  // Period
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  startDate: z.date(),
  endDate: z.date(),
  
  // Metadata
  lastUpdated: z.date(),
  calculatedAt: z.date(),
});

export type PlatformAnalyticsType = z.infer<typeof PlatformAnalytics>;

/**
 * Search Metrics Analytics
 */
export const SearchMetricsAnalytics = z.object({
  // Query Metrics
  totalQueries: z.number().default(0),
  uniqueQueries: z.number().default(0),
  totalUsers: z.number().default(0),
  
  // Popular Queries
  topQueries: z.array(z.object({
    query: z.string(),
    count: z.number(),
    averageResults: z.number(),
    clickThroughRate: z.number(),
  })),
  
  // Trending Queries
  trendingQueries: z.array(z.object({
    query: z.string(),
    count: z.number(),
    growth: z.number(), // percentage
    timeframe: z.enum(['hour', 'day', 'week']),
  })),
  
  // No Results Queries
  noResultsQueries: z.array(z.object({
    query: z.string(),
    count: z.number(),
    suggestions: z.array(z.string()).optional(),
  })),
  
  // Filter Usage
  filterUsage: z.record(z.number()).optional(), // filter_type -> count
  
  // Search Performance
  averageSearchTime: z.number().default(0), // in milliseconds
  averageResultsPerQuery: z.number().default(0),
  
  // Click-through Metrics
  averageClickThroughRate: z.number().default(0),
  topClickedResults: z.array(z.object({
    contentId: z.string(),
    title: z.string(),
    clicks: z.number(),
    impressions: z.number(),
    ctr: z.number(),
  })),
  
  // Refinement Metrics
  queryRefinements: z.number().default(0),
  averageRefinementsPerSession: z.number().default(0),
  
  // Category Breakdown
  queriesByCategory: z.record(z.number()).optional(),
  
  // Geographic Distribution
  queriesByLocation: z.record(z.number()).optional(),
  
  // Time-based Metrics
  hourlyQueries: z.record(z.number()).optional(),
  dailyQueries: z.record(z.number()).optional(),
  
  // Period
  period: z.enum(['hour', 'day', 'week', 'month', 'year']),
  startDate: z.date(),
  endDate: z.date(),
  
  // Metadata
  lastUpdated: z.date(),
  calculatedAt: z.date(),
});

export type SearchMetricsAnalyticsType = z.infer<typeof SearchMetricsAnalytics>;

/**
 * Analytics Report
 */
export const AnalyticsReport = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['content', 'author', 'platform', 'search', 'custom']),
  
  // Report Configuration
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }),
  
  // Filters
  filters: z.record(z.any()).optional(),
  
  // Report Data
  data: z.record(z.any()),
  
  // Insights
  insights: z.array(z.object({
    type: z.enum(['insight', 'recommendation', 'alert', 'trend']),
    title: z.string(),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
    actionable: z.boolean(),
    recommendations: z.array(z.string()).optional(),
  })),
  
  // Metadata
  createdBy: z.string(),
  createdAt: z.date(),
  lastUpdated: z.date(),
  
  // Sharing
  isPublic: z.boolean().default(false),
  sharedWith: z.array(z.string()).optional(),
  
  // Export
  exportFormats: z.array(z.enum(['pdf', 'csv', 'json', 'xlsx'])).optional(),
  
  // Scheduling
  isScheduled: z.boolean().default(false),
  scheduleFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  nextRun: z.date().optional(),
});

export type AnalyticsReportType = z.infer<typeof AnalyticsReport>;