import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SocialMediaManager } from '../../core/social-media-manager';
import {
  SocialMediaConfigType,
  AppSocialConfigType,
  CreatePostRequestType,
  SocialPlatformType,
} from '../../types';

describe('SocialMediaManager Integration', () => {
  let socialMediaManager: SocialMediaManager;
  let mockConfig: SocialMediaConfigType;

  beforeEach(() => {
    socialMediaManager = new SocialMediaManager();

    // Create mock configuration
    mockConfig = {
      global: {
        rateLimit: {
          enabled: true,
          globalLimit: 1000,
          perPlatformLimit: 100,
          perUserLimit: 50,
        },
        storage: {
          provider: 'supabase',
          config: {},
          maxFileSize: 25 * 1024 * 1024,
          allowedTypes: ['image/jpeg', 'image/png', 'video/mp4'],
          compressionEnabled: true,
        },
        security: {
          encryptTokens: true,
          tokenRotation: true,
          tokenRotationInterval: 30,
          auditLogging: true,
          ipWhitelist: [],
        },
        features: {
          scheduling: true,
          analytics: true,
          templates: true,
          bulkPosting: true,
          contentApproval: false,
          aiAssistance: false,
        },
        notifications: {
          email: true,
          webhook: false,
          sms: false,
          events: ['post_failed', 'auth_expired'],
        },
        maintenance: {
          enabled: false,
        },
      },
      apps: [
        {
          appId: 'talentexcel',
          appName: 'TalentExcel',
          enabled: true,
          platforms: [
            {
              platform: 'linkedin',
              clientId: 'linkedin-client-id',
              clientSecret: 'linkedin-client-secret',
              redirectUri: 'http://localhost:3000/auth/linkedin/callback',
              scope: ['r_liteprofile', 'w_member_social'],
            },
            {
              platform: 'twitter',
              apiKey: 'twitter-api-key',
              apiSecretKey: 'twitter-api-secret',
              clientId: 'twitter-client-id',
              clientSecret: 'twitter-client-secret',
            },
          ],
          defaultHashtags: ['TalentExcel', 'Career'],
          branding: {
            colors: {
              primary: '#3B82F6',
              secondary: '#10B981',
            },
          },
          automation: {
            autoSchedule: false,
            autoHashtags: true,
            autoMentions: false,
            smartScheduling: true,
          },
          restrictions: {
            maxPostsPerDay: 10,
            maxPostsPerHour: 5,
            allowedContentTypes: ['text', 'image', 'video'],
            prohibitedKeywords: [],
            requireApproval: false,
          },
          analytics: {
            enabled: true,
            retentionDays: 90,
            realTimeUpdates: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      moderation: {
        enabled: false,
        autoModeration: false,
        humanReview: true,
        filters: {
          profanity: true,
          spam: true,
          hate: true,
          adult: true,
          violence: true,
          custom: [],
        },
        actions: {
          block: true,
          flag: true,
          review: true,
          notify: true,
        },
        whitelist: {
          users: [],
          domains: [],
          keywords: [],
        },
        sensitivity: 'medium',
      },
      apiConfigs: [
        {
          platform: 'linkedin',
          version: 'v2',
          baseUrl: 'https://api.linkedin.com',
          endpoints: {
            auth: '/oauth/v2/authorization',
            token: '/oauth/v2/accessToken',
            posts: '/v2/ugcPosts',
          },
          rateLimit: {
            requests: 100,
            window: 3600,
          },
          retryConfig: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000,
            maxDelay: 30000,
          },
          timeout: 30000,
          headers: {},
        },
      ],
      webhooks: [],
      version: '1.0.0',
      lastUpdated: new Date(),
    };
  });

  describe('Initialization', () => {
    it('should initialize with configuration', async () => {
      await socialMediaManager.initialize(mockConfig);

      expect(socialMediaManager.isPlatformConfigured('linkedin')).toBe(true);
      expect(socialMediaManager.isPlatformConfigured('twitter')).toBe(true);
      expect(socialMediaManager.getConfiguredPlatforms()).toContain('linkedin');
      expect(socialMediaManager.getConfiguredPlatforms()).toContain('twitter');
    });

    it('should get platform capabilities after initialization', async () => {
      await socialMediaManager.initialize(mockConfig);

      const linkedInCapabilities = socialMediaManager.getPlatformCapabilities('linkedin');
      expect(linkedInCapabilities.canPost).toBe(true);
      expect(linkedInCapabilities.maxTextLength).toBe(3000);

      const twitterCapabilities = socialMediaManager.getPlatformCapabilities('twitter');
      expect(twitterCapabilities.canPost).toBe(true);
      expect(twitterCapabilities.maxTextLength).toBe(280);
    });
  });

  describe('Authentication Flow', () => {
    beforeEach(async () => {
      await socialMediaManager.initialize(mockConfig);
    });

    it('should generate auth URL for LinkedIn', async () => {
      const authUrl = await socialMediaManager.getAuthUrl({
        platform: 'linkedin',
        redirectUri: 'http://localhost:3000/auth/linkedin/callback',
        scopes: ['r_liteprofile', 'w_member_social'],
      });

      expect(authUrl.url).toContain('https://www.linkedin.com/oauth/v2/authorization');
      expect(authUrl.url).toContain('client_id=linkedin-client-id');
      expect(authUrl.state).toBeDefined();
    });

    it('should handle auth callback for LinkedIn', async () => {
      // Mock successful callback response
      const mockCallbackResult = {
        success: true,
        tokens: {
          accessToken: 'linkedin-access-token',
          refreshToken: 'linkedin-refresh-token',
          tokenType: 'Bearer',
          expiresIn: 3600,
        },
        platformUserId: 'linkedin-user-123',
        platformUsername: 'testuser',
        platformDisplayName: 'Test User',
      };

      // Mock the auth manager's handleCallback method
      vi.spyOn(socialMediaManager as any, 'authManager').mockReturnValue({
        handleCallback: vi.fn().mockResolvedValue(mockCallbackResult),
      });

      const result = await socialMediaManager.handleAuthCallback({
        platform: 'linkedin',
        code: 'auth-code-123',
        state: 'state-123',
        redirectUri: 'http://localhost:3000/auth/linkedin/callback',
      });

      expect(result.success).toBe(true);
      expect(result.tokens?.accessToken).toBe('linkedin-access-token');
    });

    it('should connect platform after successful auth', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'auth-record-123',
                userId: 'user-123',
                platform: 'linkedin',
                status: 'connected',
              },
              error: null,
            })),
          })),
        })),
      });

      const authResult = {
        success: true,
        tokens: {
          accessToken: 'linkedin-access-token',
          tokenType: 'Bearer',
        },
        platformUserId: 'linkedin-user-123',
        platformUsername: 'testuser',
        platformDisplayName: 'Test User',
      };

      const result = await socialMediaManager.connectPlatform(
        'user-123',
        'talentexcel',
        'linkedin',
        authResult
      );

      expect(result.platform).toBe('linkedin');
      expect(result.status).toBe('connected');
    });
  });

  describe('Content Management', () => {
    beforeEach(async () => {
      await socialMediaManager.initialize(mockConfig);

      // Mock connected platforms
      vi.spyOn(socialMediaManager as any, 'authManager').mockReturnValue({
        getConnectedPlatforms: vi.fn().mockResolvedValue([
          {
            platform: 'linkedin',
            status: 'connected',
            tokens: { accessToken: 'linkedin-token', tokenType: 'Bearer' },
          },
        ]),
      });
    });

    it('should validate content against platform constraints', async () => {
      const validContent = {
        text: 'This is a valid post for LinkedIn',
        media: [{
          size: 1024 * 1024, // 1MB
          mimeType: 'image/jpeg',
        }],
      };

      const validation = socialMediaManager.validateContent('linkedin', validContent);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject content exceeding platform limits', async () => {
      const invalidContent = {
        text: 'a'.repeat(5000), // Exceeds LinkedIn's limit
        media: [],
      };

      const validation = socialMediaManager.validateContent('linkedin', invalidContent);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Text exceeds maximum length of 3000 characters');
    });

    it('should create a post successfully', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'post-123',
                userId: 'user-123',
                content: 'Test LinkedIn post',
                platforms: ['linkedin'],
                status: 'draft',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              error: null,
            })),
          })),
        })),
      });

      const request: CreatePostRequestType = {
        content: 'Test LinkedIn post #TalentExcel #Career',
        hashtags: ['TalentExcel', 'Career'],
        platforms: ['linkedin'],
        priority: 'normal',
      };

      const result = await socialMediaManager.createPost('user-123', request);

      expect(result.id).toBe('post-123');
      expect(result.content).toBe('Test LinkedIn post');
      expect(result.platforms).toContain('linkedin');
      expect(result.status).toBe('draft');
    });

    it('should schedule a post for future publishing', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const scheduledDate = new Date(Date.now() + 3600 * 1000);

      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'post-123',
                userId: 'user-123',
                content: 'Scheduled post',
                platforms: ['linkedin'],
                status: 'scheduled',
                scheduledAt: scheduledDate,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              error: null,
            })),
          })),
        })),
      });

      const request: CreatePostRequestType = {
        content: 'Scheduled post content',
        platforms: ['linkedin'],
        scheduledAt: scheduledDate,
      };

      const result = await socialMediaManager.schedulePost('user-123', request);

      expect(result.status).toBe('scheduled');
      expect(result.scheduledAt).toEqual(scheduledDate);
    });
  });

  describe('Content Recommendations', () => {
    beforeEach(async () => {
      await socialMediaManager.initialize(mockConfig);
    });

    it('should provide posting recommendations for LinkedIn', () => {
      const recommendations = socialMediaManager.getPostingRecommendations('linkedin');

      expect(recommendations.maxHashtags).toBe(5);
      expect(recommendations.maxMentions).toBe(3);
      expect(recommendations.preferredContentLength).toBe(1500);
      expect(recommendations.tips).toContain('Use professional tone');
    });

    it('should suggest optimal posting times', () => {
      const optimalTime = socialMediaManager.suggestOptimalPostingTime(['linkedin', 'twitter']);

      expect(optimalTime).toBeInstanceOf(Date);
      expect(optimalTime.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('Media Management', () => {
    beforeEach(async () => {
      await socialMediaManager.initialize(mockConfig);
    });

    it('should upload media successfully', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      
      // Mock storage upload
      mockSupabase.storage.from.mockReturnValue({
        upload: vi.fn(() => Promise.resolve({
          data: { path: 'user-123/image.jpg' },
          error: null,
        })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://storage.supabase.com/image.jpg' },
        })),
      });

      // Mock database insert
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => Promise.resolve({
          data: {},
          error: null,
        })),
      });

      const mockFile = new File(['fake image data'], 'test.jpg', { type: 'image/jpeg' });

      const result = await socialMediaManager.uploadMedia({
        userId: 'user-123',
        file: mockFile,
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        alt: 'Test image',
      });

      expect(result.type).toBe('image');
      expect(result.filename).toBe('test.jpg');
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.url).toContain('https://storage.supabase.com');
    });

    it('should get user media library', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const mockMedia = [
        {
          id: 'media-1',
          type: 'image',
          filename: 'image1.jpg',
          url: 'https://storage.supabase.com/image1.jpg',
          createdAt: new Date(),
        },
        {
          id: 'media-2',
          type: 'video',
          filename: 'video1.mp4',
          url: 'https://storage.supabase.com/video1.mp4',
          createdAt: new Date(),
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                range: vi.fn(() => Promise.resolve({
                  data: mockMedia,
                  error: null,
                  count: 2,
                })),
              })),
            })),
          })),
        })),
      });

      const result = await socialMediaManager.getUserMedia('user-123', {
        type: 'image',
        limit: 10,
        sortBy: 'createdAt',
      });

      expect(result.media).toEqual(mockMedia);
      expect(result.total).toBe(2);
    });
  });

  describe('Analytics Integration', () => {
    beforeEach(async () => {
      await socialMediaManager.initialize(mockConfig);
    });

    it('should get post analytics', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      
      // Mock post data
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'post-123',
                platforms: ['linkedin'],
                platformResults: {
                  linkedin: {
                    success: true,
                    platformPostId: 'linkedin-post-123',
                  },
                },
                publishedAt: new Date(),
              },
              error: null,
            })),
          })),
        })),
        upsert: vi.fn(() => Promise.resolve({
          data: {},
          error: null,
        })),
      });

      // Mock platform analytics
      const mockPlatform = {
        getAnalytics: vi.fn(() => Promise.resolve({
          impressions: 1000,
          engagement: 50,
          likes: 25,
          shares: 10,
          comments: 15,
        })),
      };

      vi.spyOn(socialMediaManager as any, 'platformManager').mockReturnValue({
        getPlatform: vi.fn(() => mockPlatform),
      });

      vi.spyOn(socialMediaManager as any, 'authManager').mockReturnValue({
        ensureValidTokens: vi.fn().mockResolvedValue({
          accessToken: 'valid-token',
          tokenType: 'Bearer',
        }),
      });

      const result = await socialMediaManager.getPostAnalytics('user-123', 'post-123');

      expect(result).toBeDefined();
      expect(result?.metrics.impressions).toBe(1000);
      expect(result?.metrics.engagement).toBe(50);
      expect(mockPlatform.getAnalytics).toHaveBeenCalledWith({
        accessToken: 'valid-token',
        postId: 'linkedin-post-123',
      });
    });

    it('should get account analytics for a platform', async () => {
      const mockPlatform = {
        getAnalytics: vi.fn(() => Promise.resolve({
          followers: 1500,
          following: 500,
          posts: 100,
          engagement: 750,
          reach: 5000,
          impressions: 10000,
        })),
      };

      vi.spyOn(socialMediaManager as any, 'platformManager').mockReturnValue({
        getPlatform: vi.fn(() => mockPlatform),
      });

      vi.spyOn(socialMediaManager as any, 'authManager').mockReturnValue({
        ensureValidTokens: vi.fn().mockResolvedValue({
          accessToken: 'valid-token',
          tokenType: 'Bearer',
        }),
      });

      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        upsert: vi.fn(() => Promise.resolve({
          data: {},
          error: null,
        })),
      });

      const result = await socialMediaManager.getAccountAnalytics('user-123', 'linkedin', {
        period: 'last_30_days',
      });

      expect(result).toBeDefined();
      expect(result?.overview.totalFollowers).toBe(1500);
      expect(result?.overview.totalEngagement).toBe(750);
      expect(result?.platform).toBe('linkedin');
    });
  });

  describe('Template Management', () => {
    beforeEach(async () => {
      await socialMediaManager.initialize(mockConfig);
    });

    it('should create post template', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const mockTemplate = {
        id: 'template-123',
        name: 'Job Posting Template',
        content: 'We are hiring for {{position}} at {{company}}! {{requirements}}',
        platforms: ['linkedin'],
        variables: [
          { key: 'position', label: 'Position', type: 'text', required: true },
          { key: 'company', label: 'Company', type: 'text', required: true },
          { key: 'requirements', label: 'Requirements', type: 'text', required: false },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockTemplate,
              error: null,
            })),
          })),
        })),
      });

      const result = await socialMediaManager.createTemplate('user-123', {
        name: 'Job Posting Template',
        content: 'We are hiring for {{position}} at {{company}}! {{requirements}}',
        platforms: ['linkedin'],
        variables: [
          { key: 'position', label: 'Position', type: 'text', required: true },
          { key: 'company', label: 'Company', type: 'text', required: true },
          { key: 'requirements', label: 'Requirements', type: 'text', required: false },
        ],
      });

      expect(result.name).toBe('Job Posting Template');
      expect(result.variables).toHaveLength(3);
    });

    it('should create post from template', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'template-123',
                content: 'We are hiring for {{position}} at {{company}}!',
                hashtags: ['hiring', 'jobs'],
                platforms: ['linkedin'],
              },
              error: null,
            })),
          })),
        })),
      });

      const result = await socialMediaManager.createPostFromTemplate(
        'user-123',
        'template-123',
        {
          position: 'Senior Developer',
          company: 'TechCorp',
        }
      );

      expect(result.content).toBe('We are hiring for Senior Developer at TechCorp!');
      expect(result.hashtags).toContain('hiring');
      expect(result.templateId).toBe('template-123');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await socialMediaManager.initialize(mockConfig);
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.reject(new Error('Network error'))),
          })),
        })),
      });

      const request: CreatePostRequestType = {
        content: 'Test post',
        platforms: ['linkedin'],
      };

      await expect(socialMediaManager.createPost('user-123', request)).rejects.toThrow('Network error');
    });

    it('should validate invalid auth results', async () => {
      const invalidAuthResult = {
        success: false,
        error: 'Invalid credentials',
      };

      await expect(socialMediaManager.connectPlatform(
        'user-123',
        'talentexcel',
        'linkedin',
        invalidAuthResult
      )).rejects.toThrow('Invalid auth result');
    });
  });

  describe('Resource Cleanup', () => {
    it('should stop background processes when stopped', () => {
      const stopSpy = vi.spyOn(socialMediaManager as any, 'scheduler', 'get').mockReturnValue({
        stop: vi.fn(),
      });

      socialMediaManager.stop();

      expect(stopSpy().stop).toHaveBeenCalled();
    });
  });
});