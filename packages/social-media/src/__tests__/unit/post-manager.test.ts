import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostManager } from '../../api/post-manager';
import { PlatformManager } from '../../api/platform-manager';
import { AuthManager } from '../../api/auth-manager';
import { MediaManager } from '../../api/media-manager';
import { Scheduler } from '../../api/scheduler';
import { CreatePostRequestType, SocialPostType } from '../../types';

describe('PostManager', () => {
  let postManager: PostManager;
  let platformManager: PlatformManager;
  let authManager: AuthManager;
  let mediaManager: MediaManager;
  let scheduler: Scheduler;

  beforeEach(() => {
    platformManager = new PlatformManager();
    authManager = new AuthManager(platformManager);
    mediaManager = new MediaManager();
    scheduler = new Scheduler();
    postManager = new PostManager(platformManager, authManager, mediaManager, scheduler);

    // Mock dependencies
    vi.spyOn(authManager, 'getConnectedPlatforms').mockResolvedValue([
      {
        id: 'auth-1',
        userId: 'user-123',
        appId: 'app-456',
        platform: 'linkedin',
        status: 'connected',
        tokens: {
          accessToken: 'test-token',
          tokenType: 'Bearer',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    vi.spyOn(platformManager, 'validateContent').mockReturnValue({
      valid: true,
      errors: [],
    });

    vi.spyOn(scheduler, 'schedulePost').mockResolvedValue();
  });

  describe('Post Creation', () => {
    it('should create a draft post successfully', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const mockPost: SocialPostType = {
        id: 'post-123',
        userId: 'user-123',
        appId: 'app-456',
        content: 'Test post content',
        hashtags: ['test'],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        status: 'draft',
        priority: 'normal',
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockPost,
              error: null,
            })),
          })),
        })),
      });

      const request: CreatePostRequestType = {
        content: 'Test post content',
        hashtags: ['test'],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        priority: 'normal',
      };

      const result = await postManager.createPost('user-123', request);

      expect(result).toEqual(mockPost);
      expect(result.status).toBe('draft');
      expect(scheduler.schedulePost).not.toHaveBeenCalled();
    });

    it('should create a scheduled post', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const scheduledDate = new Date(Date.now() + 3600 * 1000);
      const mockPost: SocialPostType = {
        id: 'post-123',
        userId: 'user-123',
        appId: 'app-456',
        content: 'Scheduled post content',
        hashtags: [],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        status: 'scheduled',
        priority: 'normal',
        scheduledAt: scheduledDate,
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockPost,
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

      const result = await postManager.createPost('user-123', request);

      expect(result.status).toBe('scheduled');
      expect(result.scheduledAt).toEqual(scheduledDate);
      expect(scheduler.schedulePost).toHaveBeenCalledWith(result);
    });

    it('should validate platform access before creating post', async () => {
      vi.spyOn(authManager, 'getConnectedPlatforms').mockResolvedValue([]);

      const request: CreatePostRequestType = {
        content: 'Test post',
        platforms: ['linkedin'],
      };

      await expect(postManager.createPost('user-123', request)).rejects.toThrow(
        'Not connected to linkedin'
      );
    });

    it('should validate content before creating post', async () => {
      vi.spyOn(platformManager, 'validateContent').mockReturnValue({
        valid: false,
        errors: ['Content too long'],
      });

      const request: CreatePostRequestType = {
        content: 'Invalid content',
        platforms: ['linkedin'],
      };

      await expect(postManager.createPost('user-123', request)).rejects.toThrow(
        'Content validation failed for linkedin: Content too long'
      );
    });

    it('should handle database errors during creation', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' },
            })),
          })),
        })),
      });

      const request: CreatePostRequestType = {
        content: 'Test post',
        platforms: ['linkedin'],
      };

      await expect(postManager.createPost('user-123', request)).rejects.toThrow(
        'Failed to create post: Database error'
      );
    });
  });

  describe('Post Updates', () => {
    it('should update a draft post successfully', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const existingPost: SocialPostType = {
        id: 'post-123',
        userId: 'user-123',
        appId: 'app-456',
        content: 'Original content',
        hashtags: [],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        status: 'draft',
        priority: 'normal',
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPost = {
        ...existingPost,
        content: 'Updated content',
        hashtags: ['updated'],
      };

      // Mock getting existing post
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: existingPost,
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: updatedPost,
                error: null,
              })),
            })),
          })),
        })),
      });

      const result = await postManager.updatePost('user-123', {
        id: 'post-123',
        content: 'Updated content',
        hashtags: ['updated'],
      });

      expect(result.content).toBe('Updated content');
      expect(result.hashtags).toContain('updated');
    });

    it('should prevent updates to published posts', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const publishedPost: SocialPostType = {
        id: 'post-123',
        userId: 'user-123',
        appId: 'app-456',
        content: 'Published content',
        hashtags: [],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        status: 'published',
        priority: 'normal',
        publishedAt: new Date(),
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: publishedPost,
              error: null,
            })),
          })),
        })),
      });

      await expect(postManager.updatePost('user-123', {
        id: 'post-123',
        content: 'Updated content',
      })).rejects.toThrow('Cannot update published posts');
    });

    it('should prevent unauthorized updates', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const otherUserPost: SocialPostType = {
        id: 'post-123',
        userId: 'other-user',
        appId: 'app-456',
        content: 'Other user content',
        hashtags: [],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        status: 'draft',
        priority: 'normal',
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: otherUserPost,
              error: null,
            })),
          })),
        })),
      });

      await expect(postManager.updatePost('user-123', {
        id: 'post-123',
        content: 'Hacked content',
      })).rejects.toThrow('Unauthorized to update this post');
    });
  });

  describe('Post Publishing', () => {
    it('should publish post to all platforms successfully', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const draftPost: SocialPostType = {
        id: 'post-123',
        userId: 'user-123',
        appId: 'app-456',
        content: 'Test post content',
        hashtags: ['test'],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        status: 'draft',
        priority: 'normal',
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock getting the post
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: draftPost,
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: {},
            error: null,
          })),
        })),
      });

      // Mock platform publishing
      const mockPlatform = {
        post: vi.fn(() => Promise.resolve({
          id: 'platform-post-123',
          url: 'https://linkedin.com/post/123',
        })),
      };

      vi.spyOn(platformManager, 'getPlatform').mockReturnValue(mockPlatform);
      vi.spyOn(authManager, 'ensureValidTokens').mockResolvedValue({
        accessToken: 'valid-token',
        tokenType: 'Bearer',
      });
      vi.spyOn(platformManager, 'formatContentForPlatform').mockReturnValue('Formatted content #test');

      const result = await postManager.publishPost('user-123', 'post-123');

      expect(result.success).toBe(true);
      expect(result.results.linkedin.success).toBe(true);
      expect(result.results.linkedin.platformPostId).toBe('platform-post-123');
      expect(mockPlatform.post).toHaveBeenCalledWith({
        accessToken: 'valid-token',
        content: 'Formatted content #test',
        media: [],
      });
    });

    it('should handle platform publishing errors gracefully', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const draftPost: SocialPostType = {
        id: 'post-123',
        userId: 'user-123',
        appId: 'app-456',
        content: 'Test post content',
        hashtags: [],
        mentions: [],
        media: [],
        platforms: ['linkedin', 'twitter'],
        status: 'draft',
        priority: 'normal',
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: draftPost,
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: {},
            error: null,
          })),
        })),
      });

      // Mock one successful and one failed platform
      const mockLinkedInPlatform = {
        post: vi.fn(() => Promise.resolve({
          id: 'linkedin-post-123',
          url: 'https://linkedin.com/post/123',
        })),
      };

      const mockTwitterPlatform = {
        post: vi.fn(() => Promise.reject(new Error('Twitter API error'))),
      };

      vi.spyOn(platformManager, 'getPlatform')
        .mockImplementation((platform) => {
          if (platform === 'linkedin') return mockLinkedInPlatform;
          if (platform === 'twitter') return mockTwitterPlatform;
          return undefined;
        });

      vi.spyOn(authManager, 'ensureValidTokens').mockResolvedValue({
        accessToken: 'valid-token',
        tokenType: 'Bearer',
      });
      vi.spyOn(platformManager, 'formatContentForPlatform').mockReturnValue('Test post content');

      const result = await postManager.publishPost('user-123', 'post-123');

      expect(result.success).toBe(false); // Overall failure due to one platform failing
      expect(result.results.linkedin.success).toBe(true);
      expect(result.results.twitter.success).toBe(false);
      expect(result.results.twitter.error).toContain('Twitter API error');
    });

    it('should prevent publishing already published posts', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const publishedPost: SocialPostType = {
        id: 'post-123',
        userId: 'user-123',
        appId: 'app-456',
        content: 'Already published',
        hashtags: [],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        status: 'published',
        priority: 'normal',
        publishedAt: new Date(),
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: publishedPost,
              error: null,
            })),
          })),
        })),
      });

      await expect(postManager.publishPost('user-123', 'post-123')).rejects.toThrow(
        'Post is already published'
      );
    });
  });

  describe('Post Retrieval', () => {
    it('should get user posts with filters', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const mockPosts: SocialPostType[] = [
        {
          id: 'post-1',
          userId: 'user-123',
          appId: 'app-456',
          content: 'Post 1',
          hashtags: [],
          mentions: [],
          media: [],
          platforms: ['linkedin'],
          status: 'published',
          priority: 'normal',
          platformConfigs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'post-2',
          userId: 'user-123',
          appId: 'app-456',
          content: 'Post 2',
          hashtags: [],
          mentions: [],
          media: [],
          platforms: ['twitter'],
          status: 'draft',
          priority: 'high',
          platformConfigs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({
                  range: vi.fn(() => Promise.resolve({
                    data: mockPosts,
                    error: null,
                    count: 2,
                  })),
                })),
              })),
            })),
          })),
        })),
      });

      const result = await postManager.getUserPosts('user-123', {
        limit: 10,
        offset: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.posts).toEqual(mockPosts);
      expect(result.total).toBe(2);
    });

    it('should get a specific post by ID', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const mockPost: SocialPostType = {
        id: 'post-123',
        userId: 'user-123',
        appId: 'app-456',
        content: 'Specific post',
        hashtags: [],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        status: 'published',
        priority: 'normal',
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockPost,
              error: null,
            })),
          })),
        })),
      });

      const result = await postManager.getPost('post-123');
      expect(result).toEqual(mockPost);
    });

    it('should return null for non-existent post', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Not found' },
            })),
          })),
        })),
      });

      const result = await postManager.getPost('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('Post Deletion', () => {
    it('should delete a draft post', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const draftPost: SocialPostType = {
        id: 'post-123',
        userId: 'user-123',
        appId: 'app-456',
        content: 'Draft post',
        hashtags: [],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        status: 'draft',
        priority: 'normal',
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: draftPost,
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: {},
            error: null,
          })),
        })),
      });

      await postManager.deletePost('user-123', 'post-123');

      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        status: 'deleted',
        updatedAt: expect.any(Date),
      });
    });

    it('should cancel scheduled post before deletion', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const scheduledPost: SocialPostType = {
        id: 'post-123',
        userId: 'user-123',
        appId: 'app-456',
        content: 'Scheduled post',
        hashtags: [],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        status: 'scheduled',
        priority: 'normal',
        scheduledAt: new Date(Date.now() + 3600 * 1000),
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: scheduledPost,
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: {},
            error: null,
          })),
        })),
      });

      vi.spyOn(scheduler, 'cancelScheduledPost').mockResolvedValue();

      await postManager.deletePost('user-123', 'post-123');

      expect(scheduler.cancelScheduledPost).toHaveBeenCalledWith('post-123');
    });

    it('should prevent unauthorized deletion', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      const otherUserPost: SocialPostType = {
        id: 'post-123',
        userId: 'other-user',
        appId: 'app-456',
        content: 'Other user post',
        hashtags: [],
        mentions: [],
        media: [],
        platforms: ['linkedin'],
        status: 'draft',
        priority: 'normal',
        platformConfigs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: otherUserPost,
              error: null,
            })),
          })),
        })),
      });

      await expect(postManager.deletePost('user-123', 'post-123')).rejects.toThrow(
        'Unauthorized to delete this post'
      );
    });
  });
});