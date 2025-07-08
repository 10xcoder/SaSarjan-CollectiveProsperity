import { nanoid } from 'nanoid';
import {
  SocialPostType,
  CreatePostRequestType,
  UpdatePostRequestType,
  PostStatusType,
  SocialPlatformType,
  PostTemplateType,
  PostSeriesType,
  MediaAttachmentType,
} from '../types';
import { PlatformManager } from './platform-manager';
import { AuthManager } from './auth-manager';
import { MediaManager } from './media-manager';
import { Scheduler } from './scheduler';
import { createSupabaseClient } from '@sasarjan/database';

export class PostManager {
  private platformManager: PlatformManager;
  private authManager: AuthManager;
  private mediaManager: MediaManager;
  private scheduler: Scheduler;
  private supabase = createSupabaseClient();

  constructor(
    platformManager: PlatformManager,
    authManager: AuthManager,
    mediaManager: MediaManager,
    scheduler: Scheduler
  ) {
    this.platformManager = platformManager;
    this.authManager = authManager;
    this.mediaManager = mediaManager;
    this.scheduler = scheduler;
  }

  /**
   * Create a new social media post
   */
  async createPost(userId: string, request: CreatePostRequestType): Promise<SocialPostType> {
    // Validate user has access to requested platforms
    await this.validatePlatformAccess(userId, request.platforms);

    // Validate content for each platform
    await this.validatePostContent(request);

    // Create post record
    const post: SocialPostType = {
      id: nanoid(),
      userId,
      appId: request.metadata?.appId as string || 'default',
      title: request.title,
      content: request.content,
      summary: request.summary,
      hashtags: request.hashtags,
      mentions: request.mentions,
      media: request.media,
      platforms: request.platforms,
      status: request.scheduledAt ? 'scheduled' : 'draft',
      priority: request.priority,
      scheduledAt: request.scheduledAt,
      platformConfigs: request.platformConfigs,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: request.metadata,
    };

    // Store in database
    const { data, error } = await this.supabase
      .from('social_posts')
      .insert(post)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }

    // Schedule post if needed
    if (post.scheduledAt) {
      await this.scheduler.schedulePost(post);
    }

    return data;
  }

  /**
   * Update an existing post
   */
  async updatePost(userId: string, request: UpdatePostRequestType): Promise<SocialPostType> {
    // Get existing post
    const existingPost = await this.getPost(request.id);
    if (!existingPost) {
      throw new Error('Post not found');
    }

    // Check ownership
    if (existingPost.userId !== userId) {
      throw new Error('Unauthorized to update this post');
    }

    // Don't allow updates to published posts
    if (existingPost.status === 'published') {
      throw new Error('Cannot update published posts');
    }

    // Validate platforms if changed
    if (request.platforms) {
      await this.validatePlatformAccess(userId, request.platforms);
    }

    // Update post
    const updatedPost = {
      ...existingPost,
      ...request,
      updatedAt: new Date(),
    };

    // Validate content if changed
    if (request.content || request.platforms) {
      await this.validatePostContent(updatedPost);
    }

    const { data, error } = await this.supabase
      .from('social_posts')
      .update(updatedPost)
      .eq('id', request.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }

    // Reschedule if needed
    if (updatedPost.scheduledAt && updatedPost.status === 'scheduled') {
      await this.scheduler.reschedulePost(updatedPost);
    }

    return data;
  }

  /**
   * Publish a post immediately
   */
  async publishPost(userId: string, postId: string): Promise<{ success: boolean; results: Record<string, any> }> {
    const post = await this.getPost(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.userId !== userId) {
      throw new Error('Unauthorized to publish this post');
    }

    if (post.status === 'published') {
      throw new Error('Post is already published');
    }

    // Update status to posting
    await this.updatePostStatus(postId, 'posting');

    const results: Record<string, any> = {};
    let hasErrors = false;

    // Publish to each platform
    for (const platform of post.platforms) {
      try {
        const result = await this.publishToPlatform(userId, post, platform);
        results[platform] = result;
      } catch (error) {
        results[platform] = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        hasErrors = true;
      }
    }

    // Update final status
    const finalStatus = hasErrors ? 'failed' : 'published';
    await this.updatePostStatus(postId, finalStatus, {
      publishedAt: !hasErrors ? new Date() : undefined,
      platformResults: results,
    });

    return {
      success: !hasErrors,
      results,
    };
  }

  /**
   * Delete a post
   */
  async deletePost(userId: string, postId: string): Promise<void> {
    const post = await this.getPost(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.userId !== userId) {
      throw new Error('Unauthorized to delete this post');
    }

    // Cancel scheduled post if needed
    if (post.status === 'scheduled') {
      await this.scheduler.cancelScheduledPost(postId);
    }

    // Mark as deleted
    await this.supabase
      .from('social_posts')
      .update({ 
        status: 'deleted',
        updatedAt: new Date(),
      })
      .eq('id', postId);
  }

  /**
   * Get a post by ID
   */
  async getPost(postId: string): Promise<SocialPostType | null> {
    const { data, error } = await this.supabase
      .from('social_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Get posts for a user
   */
  async getUserPosts(
    userId: string,
    options: {
      status?: PostStatusType;
      platform?: SocialPlatformType;
      limit?: number;
      offset?: number;
      sortBy?: 'createdAt' | 'scheduledAt' | 'publishedAt';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ posts: SocialPostType[]; total: number }> {
    let query = this.supabase
      .from('social_posts')
      .select('*', { count: 'exact' })
      .eq('userId', userId)
      .neq('status', 'deleted');

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.platform) {
      query = query.contains('platforms', [options.platform]);
    }

    if (options.sortBy) {
      query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get user posts: ${error.message}`);
    }

    return {
      posts: data || [],
      total: count || 0,
    };
  }

  /**
   * Create a post template
   */
  async createTemplate(userId: string, template: Omit<PostTemplateType, 'id' | 'createdAt' | 'updatedAt'>): Promise<PostTemplateType> {
    const newTemplate: PostTemplateType = {
      ...template,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { data, error } = await this.supabase
      .from('post_templates')
      .insert(newTemplate)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }

    return data;
  }

  /**
   * Get templates for a user
   */
  async getUserTemplates(userId: string): Promise<PostTemplateType[]> {
    const { data, error } = await this.supabase
      .from('post_templates')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      throw new Error(`Failed to get templates: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create post from template
   */
  async createPostFromTemplate(
    userId: string,
    templateId: string,
    variables: Record<string, string>
  ): Promise<Partial<CreatePostRequestType>> {
    const { data: template, error } = await this.supabase
      .from('post_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error || !template) {
      throw new Error('Template not found');
    }

    // Replace variables in content
    let content = template.content;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return {
      content,
      hashtags: template.hashtags,
      platforms: template.platforms,
      templateId,
    };
  }

  /**
   * Validate user has access to platforms
   */
  private async validatePlatformAccess(userId: string, platforms: SocialPlatformType[]): Promise<void> {
    const connectedPlatforms = await this.authManager.getConnectedPlatforms(userId);
    const connectedPlatformTypes = connectedPlatforms.map(p => p.platform);

    for (const platform of platforms) {
      if (!connectedPlatformTypes.includes(platform)) {
        throw new Error(`Not connected to ${platform}`);
      }
    }
  }

  /**
   * Validate post content against platform constraints
   */
  private async validatePostContent(post: Partial<CreatePostRequestType>): Promise<void> {
    if (!post.content || !post.platforms) {
      return;
    }

    for (const platform of post.platforms) {
      const validation = this.platformManager.validateContent(platform, {
        text: post.content,
        media: post.media,
      });

      if (!validation.valid) {
        throw new Error(`Content validation failed for ${platform}: ${validation.errors.join(', ')}`);
      }
    }
  }

  /**
   * Publish post to a specific platform
   */
  private async publishToPlatform(
    userId: string,
    post: SocialPostType,
    platform: SocialPlatformType
  ): Promise<{ success: boolean; platformPostId?: string; url?: string; error?: string }> {
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

      // Get platform-specific config
      const platformConfig = post.platformConfigs.find(config => config.platform === platform);
      
      // Format content
      const formattedContent = this.platformManager.formatContentForPlatform(platform, {
        text: platformConfig?.customContent || post.content,
        hashtags: platformConfig?.customHashtags || post.hashtags,
        mentions: platformConfig?.customMentions || post.mentions,
      });

      // Upload media if needed
      const mediaUrls = await this.prepareMediaForPlatform(post.media, platform);

      // Post to platform
      const result = await platformInstance.post({
        accessToken: tokens.accessToken,
        content: formattedContent,
        media: mediaUrls,
      });

      return {
        success: true,
        platformPostId: result.id,
        url: result.url,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Prepare media for platform posting
   */
  private async prepareMediaForPlatform(
    media: MediaAttachmentType[],
    platform: SocialPlatformType
  ): Promise<Array<{ url: string; type: string; alt?: string }>> {
    const result = [];
    
    for (const item of media) {
      // Check if media type is supported by platform
      const capabilities = this.platformManager.getPlatformCapabilities(platform);
      if (!capabilities.supportedMediaTypes.includes(item.mimeType)) {
        continue; // Skip unsupported media
      }

      result.push({
        url: item.url,
        type: item.type,
        alt: item.alt,
      });
    }

    return result;
  }

  /**
   * Update post status
   */
  private async updatePostStatus(
    postId: string,
    status: PostStatusType,
    additionalFields?: Record<string, any>
  ): Promise<void> {
    await this.supabase
      .from('social_posts')
      .update({
        status,
        updatedAt: new Date(),
        ...additionalFields,
      })
      .eq('id', postId);
  }
}