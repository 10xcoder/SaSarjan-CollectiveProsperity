import { PlatformManager } from './platform-manager';
import { AuthManager } from './auth-manager';
import {
  SocialPlatformType,
  AnalyticsMetricsType,
  PostAnalyticsType,
  AccountAnalyticsType,
  AnalyticsQueryType,
  AnalyticsReportType,
  AnalyticsPeriodType,
} from '../types';
import { createSupabaseClient } from '@sasarjan/database';

export class AnalyticsManager {
  private platformManager: PlatformManager;
  private authManager: AuthManager;
  private supabase = createSupabaseClient();

  constructor(platformManager: PlatformManager, authManager: AuthManager) {
    this.platformManager = platformManager;
    this.authManager = authManager;
  }

  /**
   * Get analytics for a specific post
   */
  async getPostAnalytics(userId: string, postId: string): Promise<PostAnalyticsType | null> {
    try {
      // Get post details
      const { data: post, error: postError } = await this.supabase
        .from('social_posts')
        .select('*')
        .eq('id', postId)
        .eq('userId', userId)
        .single();

      if (postError || !post) {
        return null;
      }

      // Get analytics data for each platform the post was published to
      const platformAnalytics = await Promise.all(
        post.platforms.map(async (platform: SocialPlatformType) => {
          try {
            // Get platform post ID from results
            const platformResults = post.platformResults || {};
            const platformResult = platformResults[platform];
            
            if (!platformResult?.success || !platformResult.platformPostId) {
              return null;
            }

            // Get valid tokens
            const tokens = await this.authManager.ensureValidTokens(userId, platform);
            if (!tokens) {
              return null;
            }

            // Get platform instance and fetch analytics
            const platformInstance = this.platformManager.getPlatform(platform);
            if (!platformInstance) {
              return null;
            }

            const analytics = await platformInstance.getAnalytics({
              accessToken: tokens.accessToken,
              postId: platformResult.platformPostId,
            });

            return {
              platform,
              data: analytics,
            };
          } catch (error) {
            console.error(`Failed to get analytics for ${platform}:`, error);
            return null;
          }
        })
      );

      // Aggregate analytics from all platforms
      const aggregatedMetrics = this.aggregatePostMetrics(platformAnalytics.filter(Boolean));

      const postAnalytics: PostAnalyticsType = {
        postId,
        platform: post.platforms[0], // Primary platform
        platformPostId: post.platformResults?.[post.platforms[0]]?.platformPostId || '',
        publishedAt: post.publishedAt || post.createdAt,
        metrics: aggregatedMetrics,
        hourlyData: [], // Would be populated from stored analytics data
        dailyData: [], // Would be populated from stored analytics data
        lastUpdated: new Date(),
      };

      // Store analytics data
      await this.storePostAnalytics(postAnalytics);

      return postAnalytics;
    } catch (error) {
      throw new Error(`Failed to get post analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get account analytics for a platform
   */
  async getAccountAnalytics(
    userId: string,
    platform: SocialPlatformType,
    options: {
      period?: AnalyticsPeriodType;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<AccountAnalyticsType | null> {
    try {
      // Get valid tokens
      const tokens = await this.authManager.ensureValidTokens(userId, platform);
      if (!tokens) {
        throw new Error(`No valid tokens for ${platform}`);
      }

      // Get platform instance
      const platformInstance = this.platformManager.getPlatform(platform);
      if (!platformInstance) {
        throw new Error(`Platform ${platform} not configured`);
      }

      // Fetch analytics from platform
      const analytics = await platformInstance.getAnalytics({
        accessToken: tokens.accessToken,
        startDate: options.startDate,
        endDate: options.endDate,
      });

      // Calculate date range
      const endDate = options.endDate || new Date();
      const startDate = options.startDate || this.getStartDateForPeriod(options.period || 'last_30_days', endDate);

      const accountAnalytics: AccountAnalyticsType = {
        platform,
        period: options.period || 'last_30_days',
        startDate,
        endDate,
        overview: {
          totalPosts: Number((analytics as any).posts) || 0,
          totalFollowers: Number((analytics as any).followers) || 0,
          totalFollowing: Number((analytics as any).following) || 0,
          totalEngagement: Number((analytics as any).engagement) || 0,
          totalReach: Number((analytics as any).reach) || 0,
          totalImpressions: Number((analytics as any).impressions) || 0,
          averageEngagementRate: Number((analytics as any).engagementRate) || 0,
          postsGrowth: 0, // Would calculate from historical data
          followersGrowth: 0, // Would calculate from historical data
          engagementGrowth: 0, // Would calculate from historical data
        },
        timeline: [], // Would be populated from stored analytics data
        topPosts: [], // Would be populated from post analytics
        contentTypes: {}, // Would be calculated from post data
        bestPostingTimes: [], // Would be calculated from engagement data
        hashtags: [], // Would be calculated from post data
        lastUpdated: new Date(),
      };

      // Store analytics data
      await this.storeAccountAnalytics(userId, accountAnalytics);

      return accountAnalytics;
    } catch (error) {
      throw new Error(`Failed to get account analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate analytics report
   */
  async generateReport(
    userId: string,
    options: {
      name: string;
      platforms: SocialPlatformType[];
      period: AnalyticsPeriodType;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<AnalyticsReportType> {
    try {
      const endDate = options.endDate || new Date();
      const startDate = options.startDate || this.getStartDateForPeriod(options.period, endDate);

      // Get analytics for each platform
      const platformMetrics = await Promise.all(
        options.platforms.map(async (platform) => {
          const analytics = await this.getAccountAnalytics(userId, platform, {
            period: options.period,
            startDate,
            endDate,
          });
          return analytics;
        })
      );

      // Filter out null results
      const validMetrics = platformMetrics.filter(Boolean) as AccountAnalyticsType[];

      // Generate insights
      const insights = this.generateInsights(validMetrics);

      // Calculate summary
      const summary = this.calculateSummary(validMetrics);

      const report: AnalyticsReportType = {
        id: `report_${Date.now()}`,
        userId,
        appId: 'default', // Would be determined from context
        name: options.name,
        platforms: options.platforms,
        period: options.period,
        startDate,
        endDate,
        metrics: [], // Would convert AccountAnalyticsType to AnalyticsMetricsType
        insights,
        summary,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store report
      await this.storeAnalyticsReport(report);

      return report;
    } catch (error) {
      throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get analytics reports for a user
   */
  async getUserReports(userId: string): Promise<AnalyticsReportType[]> {
    const { data, error } = await this.supabase
      .from('analytics_reports')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to get reports: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update analytics data for all posts
   */
  async updateAnalyticsData(userId: string): Promise<void> {
    try {
      // Get all published posts for the user
      const { data: posts, error } = await this.supabase
        .from('social_posts')
        .select('*')
        .eq('userId', userId)
        .eq('status', 'published');

      if (error) {
        throw new Error(`Failed to get posts: ${error.message}`);
      }

      // Update analytics for each post
      for (const post of posts || []) {
        try {
          await this.getPostAnalytics(userId, post.id);
        } catch (error) {
          console.error(`Failed to update analytics for post ${post.id}:`, error);
        }
      }
    } catch (error) {
      throw new Error(`Failed to update analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Aggregate metrics from multiple platforms
   */
  private aggregatePostMetrics(platformAnalytics: any[]): any {
    const aggregated = {
      impressions: 0,
      reach: 0,
      engagement: 0,
      clicks: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      saves: 0,
      views: 0,
      engagementRate: 0,
      clickThroughRate: 0,
    };

    for (const analytics of platformAnalytics) {
      const data = analytics.data as any;
      aggregated.impressions += Number(data.impressions) || 0;
      aggregated.reach += Number(data.reach) || 0;
      aggregated.engagement += Number(data.engagement || data.likes) || 0;
      aggregated.clicks += Number(data.clicks) || 0;
      aggregated.likes += Number(data.likes || data.reactions) || 0;
      aggregated.shares += Number(data.shares || data.retweets) || 0;
      aggregated.comments += Number(data.comments || data.replies) || 0;
      aggregated.saves += Number(data.saves) || 0;
      aggregated.views += Number(data.views) || 0;
    }

    // Calculate rates
    if (aggregated.impressions > 0) {
      aggregated.engagementRate = (aggregated.engagement / aggregated.impressions) * 100;
      aggregated.clickThroughRate = (aggregated.clicks / aggregated.impressions) * 100;
    }

    return aggregated;
  }

  /**
   * Get start date for a period
   */
  private getStartDateForPeriod(period: AnalyticsPeriodType, endDate: Date): Date {
    const start = new Date(endDate);
    
    switch (period) {
      case 'last_hour':
        start.setHours(start.getHours() - 1);
        break;
      case 'last_24_hours':
        start.setDate(start.getDate() - 1);
        break;
      case 'last_7_days':
        start.setDate(start.getDate() - 7);
        break;
      case 'last_30_days':
        start.setDate(start.getDate() - 30);
        break;
      case 'last_90_days':
        start.setDate(start.getDate() - 90);
        break;
      case 'last_year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return start;
  }

  /**
   * Generate insights from analytics data
   */
  private generateInsights(metrics: AccountAnalyticsType[]): any[] {
    const insights = [];

    // Example insights - in a real implementation, this would be more sophisticated
    for (const metric of metrics) {
      if (metric.overview.followersGrowth > 10) {
        insights.push({
          title: `Strong follower growth on ${metric.platform}`,
          description: `Your ${metric.platform} account gained ${metric.overview.followersGrowth}% followers this period`,
          category: 'audience',
          importance: 'high',
          actionable: false,
          recommendations: ['Continue your current content strategy', 'Increase posting frequency'],
        });
      }

      if (metric.overview.averageEngagementRate > 5) {
        insights.push({
          title: `High engagement on ${metric.platform}`,
          description: `Your average engagement rate of ${metric.overview.averageEngagementRate.toFixed(1)}% is above industry average`,
          category: 'performance',
          importance: 'medium',
          actionable: true,
          recommendations: ['Analyze your best-performing content', 'Replicate successful post formats'],
        });
      }
    }

    return insights;
  }

  /**
   * Calculate summary metrics
   */
  private calculateSummary(metrics: AccountAnalyticsType[]): any {
    const summary = {
      totalPosts: 0,
      totalEngagement: 0,
      totalReach: 0,
      totalImpressions: 0,
      averageEngagementRate: 0,
      bestPerformingPlatform: undefined,
      bestPerformingContentType: undefined,
      bestPostingTime: undefined,
    };

    for (const metric of metrics) {
      summary.totalPosts += metric.overview.totalPosts;
      summary.totalEngagement += metric.overview.totalEngagement;
      summary.totalReach += metric.overview.totalReach;
      summary.totalImpressions += metric.overview.totalImpressions;
    }

    // Calculate average engagement rate
    if (metrics.length > 0) {
      summary.averageEngagementRate = metrics.reduce((sum, m) => sum + m.overview.averageEngagementRate, 0) / metrics.length;
    }

    // Find best performing platform
    if (metrics.length > 0) {
      const bestPlatform = metrics.reduce((best, current) => 
        current.overview.averageEngagementRate > best.overview.averageEngagementRate ? current : best
      );
      summary.bestPerformingPlatform = bestPlatform.platform as any;
    }

    return summary;
  }

  /**
   * Store post analytics
   */
  private async storePostAnalytics(analytics: PostAnalyticsType): Promise<void> {
    await this.supabase
      .from('post_analytics')
      .upsert({
        ...analytics,
        updatedAt: new Date(),
      }, {
        onConflict: 'postId,platform',
      });
  }

  /**
   * Store account analytics
   */
  private async storeAccountAnalytics(userId: string, analytics: AccountAnalyticsType): Promise<void> {
    await this.supabase
      .from('account_analytics')
      .upsert({
        userId,
        ...analytics,
        updatedAt: new Date(),
      }, {
        onConflict: 'userId,platform,startDate,endDate',
      });
  }

  /**
   * Store analytics report
   */
  private async storeAnalyticsReport(report: AnalyticsReportType): Promise<void> {
    await this.supabase
      .from('analytics_reports')
      .insert(report);
  }
}