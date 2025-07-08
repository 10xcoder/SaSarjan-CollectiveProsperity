import { z } from 'zod';
import { SocialPlatform } from './social-platforms';

// Analytics time periods
export const AnalyticsPeriod = z.enum([
  'last_hour',
  'last_24_hours',
  'last_7_days',
  'last_30_days',
  'last_90_days',
  'last_year',
  'custom',
]);

export type AnalyticsPeriodType = z.infer<typeof AnalyticsPeriod>;

// Metric types
export const MetricType = z.enum([
  'impressions',
  'reach',
  'engagement',
  'clicks',
  'likes',
  'shares',
  'comments',
  'saves',
  'views',
  'followers',
  'following',
  'posts',
  'engagement_rate',
  'click_through_rate',
  'conversion_rate',
]);

export type MetricTypeType = z.infer<typeof MetricType>;

// Analytics data point
export const AnalyticsDataPoint = z.object({
  timestamp: z.date(),
  value: z.number(),
  platform: SocialPlatform,
  metric: MetricType,
  metadata: z.record(z.unknown()).optional(),
});

export type AnalyticsDataPointType = z.infer<typeof AnalyticsDataPoint>;

// Aggregated analytics metrics
export const AnalyticsMetrics = z.object({
  platform: SocialPlatform,
  period: AnalyticsPeriod,
  startDate: z.date(),
  endDate: z.date(),
  metrics: z.object({
    impressions: z.number().default(0),
    reach: z.number().default(0),
    engagement: z.number().default(0),
    clicks: z.number().default(0),
    likes: z.number().default(0),
    shares: z.number().default(0),
    comments: z.number().default(0),
    saves: z.number().default(0),
    views: z.number().default(0),
    followers: z.number().default(0),
    following: z.number().default(0),
    posts: z.number().default(0),
    engagementRate: z.number().default(0),
    clickThroughRate: z.number().default(0),
    conversionRate: z.number().default(0),
  }),
  growth: z.object({
    impressions: z.number().default(0),
    reach: z.number().default(0),
    engagement: z.number().default(0),
    followers: z.number().default(0),
    engagementRate: z.number().default(0),
  }),
  topContent: z.array(z.object({
    postId: z.string(),
    platformPostId: z.string(),
    content: z.string(),
    engagement: z.number(),
    reach: z.number(),
    impressions: z.number(),
    publishedAt: z.date(),
  })).default([]),
});

export type AnalyticsMetricsType = z.infer<typeof AnalyticsMetrics>;

// Post performance analytics
export const PostAnalytics = z.object({
  postId: z.string(),
  platform: SocialPlatform,
  platformPostId: z.string(),
  publishedAt: z.date(),
  metrics: z.object({
    impressions: z.number().default(0),
    reach: z.number().default(0),
    engagement: z.number().default(0),
    clicks: z.number().default(0),
    likes: z.number().default(0),
    shares: z.number().default(0),
    comments: z.number().default(0),
    saves: z.number().default(0),
    views: z.number().default(0),
    engagementRate: z.number().default(0),
    clickThroughRate: z.number().default(0),
  }),
  hourlyData: z.array(AnalyticsDataPoint).default([]),
  dailyData: z.array(AnalyticsDataPoint).default([]),
  demographics: z.object({
    ageGroups: z.record(z.number()).default({}),
    genders: z.record(z.number()).default({}),
    locations: z.record(z.number()).default({}),
    interests: z.record(z.number()).default({}),
  }).optional(),
  lastUpdated: z.date(),
});

export type PostAnalyticsType = z.infer<typeof PostAnalytics>;

// Account analytics
export const AccountAnalytics = z.object({
  platform: SocialPlatform,
  period: AnalyticsPeriod,
  startDate: z.date(),
  endDate: z.date(),
  overview: z.object({
    totalPosts: z.number().default(0),
    totalFollowers: z.number().default(0),
    totalFollowing: z.number().default(0),
    totalEngagement: z.number().default(0),
    totalReach: z.number().default(0),
    totalImpressions: z.number().default(0),
    averageEngagementRate: z.number().default(0),
    postsGrowth: z.number().default(0),
    followersGrowth: z.number().default(0),
    engagementGrowth: z.number().default(0),
  }),
  timeline: z.array(AnalyticsDataPoint).default([]),
  topPosts: z.array(z.object({
    postId: z.string(),
    platformPostId: z.string(),
    content: z.string(),
    engagement: z.number(),
    reach: z.number(),
    publishedAt: z.date(),
  })).default([]),
  contentTypes: z.record(z.object({
    count: z.number(),
    totalEngagement: z.number(),
    averageEngagement: z.number(),
  })).default({}),
  bestPostingTimes: z.array(z.object({
    hour: z.number(),
    dayOfWeek: z.number(),
    averageEngagement: z.number(),
  })).default([]),
  hashtags: z.array(z.object({
    tag: z.string(),
    count: z.number(),
    totalEngagement: z.number(),
    averageEngagement: z.number(),
  })).default([]),
  lastUpdated: z.date(),
});

export type AccountAnalyticsType = z.infer<typeof AccountAnalytics>;

// Analytics report
export const AnalyticsReport = z.object({
  id: z.string(),
  userId: z.string(),
  appId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  platforms: z.array(SocialPlatform),
  period: AnalyticsPeriod,
  startDate: z.date(),
  endDate: z.date(),
  metrics: z.array(AnalyticsMetrics),
  insights: z.array(z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['performance', 'audience', 'content', 'timing']),
    importance: z.enum(['low', 'medium', 'high']),
    actionable: z.boolean(),
    recommendations: z.array(z.string()).default([]),
  })).default([]),
  summary: z.object({
    totalPosts: z.number(),
    totalEngagement: z.number(),
    totalReach: z.number(),
    totalImpressions: z.number(),
    averageEngagementRate: z.number(),
    bestPerformingPlatform: SocialPlatform.optional(),
    bestPerformingContentType: z.string().optional(),
    bestPostingTime: z.string().optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AnalyticsReportType = z.infer<typeof AnalyticsReport>;

// Analytics query
export const AnalyticsQuery = z.object({
  platforms: z.array(SocialPlatform).optional(),
  period: AnalyticsPeriod,
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  metrics: z.array(MetricType).optional(),
  groupBy: z.enum(['platform', 'day', 'week', 'month', 'hour']).optional(),
  filters: z.record(z.unknown()).optional(),
});

export type AnalyticsQueryType = z.infer<typeof AnalyticsQuery>;

// Analytics insights
export const AnalyticsInsight = z.object({
  id: z.string(),
  type: z.enum(['trend', 'anomaly', 'opportunity', 'warning']),
  title: z.string(),
  description: z.string(),
  impact: z.enum(['low', 'medium', 'high']),
  platforms: z.array(SocialPlatform),
  metrics: z.array(MetricType),
  data: z.record(z.unknown()),
  recommendations: z.array(z.string()).default([]),
  createdAt: z.date(),
});

export type AnalyticsInsightType = z.infer<typeof AnalyticsInsight>;

// Benchmark data
export const BenchmarkData = z.object({
  platform: SocialPlatform,
  industry: z.string(),
  metrics: z.object({
    averageEngagementRate: z.number(),
    averageReachRate: z.number(),
    averageClickThroughRate: z.number(),
    averageFollowerGrowthRate: z.number(),
    averagePostFrequency: z.number(),
  }),
  contentTypes: z.record(z.object({
    averageEngagementRate: z.number(),
    averageReachRate: z.number(),
  })),
  lastUpdated: z.date(),
});

export type BenchmarkDataType = z.infer<typeof BenchmarkData>;