import { createSupabaseClient } from '@sasarjan/database';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import {
  KnowledgeContentType,
  ContentTypeType,
  ContentStatusType,
  ContentVisibilityType,
  ContentLevelType,
  ContentCategoryType,
  ContentLanguageType,
  ContentMediaType,
  ContentContributorType,
  ContentVersionType,
  ContentInteractionType,
  ContentCommentType,
  ContentRatingType,
  ContentProgressType,
} from '../types';
import { ContentValidator } from '../utils/content-validator';
import { ContentProcessor } from '../utils/content-processor';
import { AnalyticsTracker } from './analytics-tracker';

export interface CreateContentRequest {
  title: string;
  description: string;
  content: string;
  type: ContentTypeType;
  category: ContentCategoryType;
  level: ContentLevelType;
  language: ContentLanguageType;
  tags: string[];
  keywords?: string[];
  topics?: string[];
  location?: string;
  culturalContext?: string;
  featuredImage?: string;
  media?: Omit<ContentMediaType, 'id' | 'uploadedAt'>[];
  resources?: Array<{
    title: string;
    url: string;
    type: 'link' | 'download' | 'reference';
  }>;
  estimatedReadTime?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  skillsGained?: string[];
  isInteractive?: boolean;
  hasAssessment?: boolean;
  allowComments?: boolean;
  allowRatings?: boolean;
  allowDownloads?: boolean;
  visibility?: ContentVisibilityType;
  appId?: string;
  organizationId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateContentRequest extends Partial<CreateContentRequest> {
  id: string;
  changelog?: string;
}

export interface ContentQuery {
  userId?: string;
  type?: ContentTypeType;
  category?: ContentCategoryType;
  level?: ContentLevelType;
  language?: ContentLanguageType;
  status?: ContentStatusType;
  visibility?: ContentVisibilityType;
  tags?: string[];
  authorId?: string;
  appId?: string;
  organizationId?: string;
  location?: string;
  isVerified?: boolean;
  hasAssessment?: boolean;
  publishedAfter?: Date;
  publishedBefore?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'created' | 'updated' | 'published' | 'views' | 'rating' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export class ContentManager {
  private supabase = createSupabaseClient();
  private validator = ContentValidator.getInstance();
  private processor = ContentProcessor.getInstance();
  private analytics = AnalyticsTracker.getInstance({ enableTracking: false });

  /**
   * Create new content
   */
  async createContent(userId: string, request: CreateContentRequest): Promise<KnowledgeContentType> {
    try {
      // Validate request
      const validationResult = await this.validator.validateCreateRequest(request);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Generate ID and slug
      const id = nanoid();
      const slug = await this.generateUniqueSlug(request.title);

      // Process content
      const processedContent = this.processor.processContent({
        content: request.content,
        type: request.type
      }, {
        extractKeywords: true,
      });

      // Process media
      const processedMedia: ContentMediaType[] = [];
      if (request.media) {
        for (const media of request.media) {
          const processedMediaItem: ContentMediaType = {
            ...media,
            id: nanoid(),
            uploadedAt: new Date(),
          };
          processedMedia.push(processedMediaItem);
        }
      }

      // Create content object
      const content: KnowledgeContentType = {
        id,
        title: request.title,
        slug,
        description: request.description,
        content: processedContent.content || request.content,
        excerpt: processedContent.excerpt,
        type: request.type,
        status: 'draft',
        visibility: request.visibility || 'public',
        level: request.level,
        category: request.category,
        language: request.language,
        
        // Authorship
        primaryAuthor: userId,
        contributors: [{
          authorId: userId,
          role: 'primary_author',
          contribution: 'Original author',
          contributedAt: new Date(),
        }],
        attribution: undefined,
        
        // Metadata
        tags: request.tags,
        keywords: request.keywords || processedContent.keywords || [],
        topics: request.topics || [],
        location: request.location,
        culturalContext: request.culturalContext,
        
        // Media
        featuredImage: request.featuredImage,
        media: processedMedia,
        resources: request.resources,
        
        // Learning
        estimatedReadTime: request.estimatedReadTime || processedContent.estimatedReadTime,
        prerequisites: request.prerequisites,
        learningObjectives: request.learningObjectives,
        skillsGained: request.skillsGained,
        
        // Analytics
        viewCount: 0,
        likeCount: 0,
        bookmarkCount: 0,
        shareCount: 0,
        commentCount: 0,
        downloadCount: 0,
        averageRating: 0,
        ratingCount: 0,
        
        // Versioning
        version: '1.0',
        versions: [{
          version: '1.0',
          changelog: 'Initial creation',
          publishedAt: new Date(),
          publishedBy: userId,
        }],
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: undefined,
        lastReviewed: undefined,
        
        // Quality
        isVerified: false,
        qualityScore: processedContent.qualityScore,
        moderationFlags: undefined,
        
        // Accessibility
        accessibilityFeatures: undefined,
        
        // Localization
        translations: undefined,
        
        // Relationships
        relatedContent: undefined,
        parentContent: request.metadata?.parentContent,
        childContent: [],
        
        // Platform
        appId: request.appId,
        organizationId: request.organizationId,
        
        // Features
        isInteractive: request.isInteractive || false,
        hasAssessment: request.hasAssessment || false,
        allowComments: request.allowComments !== false,
        allowRatings: request.allowRatings !== false,
        allowDownloads: request.allowDownloads !== false,
        
        // Metadata
        metadata: request.metadata,
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('knowledge_content')
        .insert(content)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create content: ${error.message}`);
      }

      // Track analytics
      await this.analytics.trackEvent({
        userId,
        eventType: 'content_create',
        contentId: id,
        metadata: {
          title: request.title,
          type: request.type,
          category: request.category,
          contentType: request.type,
          contentCategory: request.category,
        },
      });

      return data;
    } catch (error) {
      throw new Error(`Failed to create content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update existing content
   */
  async updateContent(userId: string, request: UpdateContentRequest): Promise<KnowledgeContentType> {
    try {
      // Get existing content
      const existing = await this.getContentById(request.id);
      if (!existing) {
        throw new Error('Content not found');
      }

      // Check permissions
      if (existing.primaryAuthor !== userId && !this.hasUpdatePermission(userId, existing)) {
        throw new Error('Permission denied');
      }

      // Validate request
      const validationResult = await this.validator.validateUpdateRequest(request);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Process content if changed
      let processedContent;
      if (request.content && request.content !== existing.content) {
        processedContent = this.processor.processContent({
          content: request.content,
          type: request.type || existing.type
        }, {
          extractKeywords: true,
        });
      }

      // Generate new slug if title changed
      let newSlug = existing.slug;
      if (request.title && request.title !== existing.title) {
        newSlug = await this.generateUniqueSlug(request.title, existing.id);
      }

      // Create new version
      const newVersion = this.incrementVersion(existing.version);
      const newVersionInfo: ContentVersionType = {
        version: newVersion,
        changelog: request.changelog || 'Content updated',
        publishedAt: new Date(),
        publishedBy: userId,
        previousVersion: existing.version,
      };

      // Process media if provided
      let processedMediaUpdates: ContentMediaType[] | undefined;
      if (request.media) {
        processedMediaUpdates = request.media.map(media => ({
          ...media,
          id: nanoid(),
          uploadedAt: new Date(),
        }));
      }

      // Update content
      const { media, ...requestWithoutMedia } = request;
      const updates: Partial<KnowledgeContentType> = {
        ...requestWithoutMedia,
        id: existing.id, // Ensure ID doesn't change
        slug: newSlug,
        content: processedContent?.content || existing.content || '',
        excerpt: processedContent?.excerpt || existing.excerpt,
        keywords: request.keywords || processedContent?.keywords || existing.keywords,
        estimatedReadTime: request.estimatedReadTime || processedContent?.estimatedReadTime || existing.estimatedReadTime,
        qualityScore: processedContent?.qualityScore || existing.qualityScore,
        version: newVersion,
        versions: [...existing.versions, newVersionInfo],
        updatedAt: new Date(),
        ...(processedMediaUpdates && { media: processedMediaUpdates }),
      };

      // Add contributor if not primary author
      if (userId !== existing.primaryAuthor) {
        const existingContributor = existing.contributors.find(c => c.authorId === userId);
        if (!existingContributor) {
          updates.contributors = [...existing.contributors, {
            authorId: userId,
            role: 'co_author',
            contribution: 'Content update',
            contributedAt: new Date(),
          }];
        }
      }

      // Save to database
      const { data, error } = await this.supabase
        .from('knowledge_content')
        .update(updates)
        .eq('id', request.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update content: ${error.message}`);
      }

      // Track analytics
      await this.analytics.trackEvent({
        userId,
        eventType: 'content_edit',
        contentId: request.id,
        metadata: {
          previousVersion: existing.version,
          newVersion,
          changelog: request.changelog,
          contentType: data.type,
          contentCategory: data.category,
        },
      });

      return data;
    } catch (error) {
      throw new Error(`Failed to update content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Publish content
   */
  async publishContent(userId: string, contentId: string): Promise<KnowledgeContentType> {
    try {
      const content = await this.getContentById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      if (content.primaryAuthor !== userId && !this.hasPublishPermission(userId, content)) {
        throw new Error('Permission denied');
      }

      const updates: Partial<KnowledgeContentType> = {
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      };

      const { data, error } = await this.supabase
        .from('knowledge_content')
        .update(updates)
        .eq('id', contentId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to publish content: ${error.message}`);
      }

      await this.analytics.trackEvent({
        userId,
        eventType: 'content_publish',
        contentId,
        metadata: {
          contentType: data.type,
          contentCategory: data.category,
        },
      });

      return data;
    } catch (error) {
      throw new Error(`Failed to publish content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete content
   */
  async deleteContent(userId: string, contentId: string): Promise<void> {
    try {
      const content = await this.getContentById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      if (content.primaryAuthor !== userId && !this.hasDeletePermission(userId, content)) {
        throw new Error('Permission denied');
      }

      const { error } = await this.supabase
        .from('knowledge_content')
        .delete()
        .eq('id', contentId);

      if (error) {
        throw new Error(`Failed to delete content: ${error.message}`);
      }

      await this.analytics.trackEvent({
        userId,
        eventType: 'content_delete',
        contentId,
        metadata: {
          contentType: content.type,
          contentCategory: content.category,
        },
      });
    } catch (error) {
      throw new Error(`Failed to delete content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get content by ID
   */
  async getContentById(contentId: string, userId?: string): Promise<KnowledgeContentType | null> {
    try {
      const { data, error } = await this.supabase
        .from('knowledge_content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get content: ${error.message}`);
      }

      // Track view if user provided
      if (userId) {
        await this.trackView(userId, contentId);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to get content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get content by slug
   */
  async getContentBySlug(slug: string, userId?: string): Promise<KnowledgeContentType | null> {
    try {
      const { data, error } = await this.supabase
        .from('knowledge_content')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get content: ${error.message}`);
      }

      // Track view if user provided
      if (userId) {
        await this.trackView(userId, data.id);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to get content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query content
   */
  async queryContent(query: ContentQuery): Promise<{
    items: KnowledgeContentType[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      let dbQuery = this.supabase
        .from('knowledge_content')
        .select('*', { count: 'exact' });

      // Apply filters
      if (query.type) {
        dbQuery = dbQuery.eq('type', query.type);
      }
      if (query.category) {
        dbQuery = dbQuery.eq('category', query.category);
      }
      if (query.level) {
        dbQuery = dbQuery.eq('level', query.level);
      }
      if (query.language) {
        dbQuery = dbQuery.eq('language', query.language);
      }
      if (query.status) {
        dbQuery = dbQuery.eq('status', query.status);
      }
      if (query.visibility) {
        dbQuery = dbQuery.eq('visibility', query.visibility);
      }
      if (query.authorId) {
        dbQuery = dbQuery.eq('primaryAuthor', query.authorId);
      }
      if (query.appId) {
        dbQuery = dbQuery.eq('appId', query.appId);
      }
      if (query.organizationId) {
        dbQuery = dbQuery.eq('organizationId', query.organizationId);
      }
      if (query.location) {
        dbQuery = dbQuery.eq('location', query.location);
      }
      if (query.isVerified !== undefined) {
        dbQuery = dbQuery.eq('isVerified', query.isVerified);
      }
      if (query.hasAssessment !== undefined) {
        dbQuery = dbQuery.eq('hasAssessment', query.hasAssessment);
      }
      if (query.publishedAfter) {
        dbQuery = dbQuery.gte('publishedAt', query.publishedAfter.toISOString());
      }
      if (query.publishedBefore) {
        dbQuery = dbQuery.lte('publishedAt', query.publishedBefore.toISOString());
      }
      if (query.tags && query.tags.length > 0) {
        dbQuery = dbQuery.overlaps('tags', query.tags);
      }

      // Apply sorting
      const sortBy = query.sortBy || 'created';
      const sortOrder = query.sortOrder || 'desc';
      const sortColumns = {
        created: 'createdAt',
        updated: 'updatedAt',
        published: 'publishedAt',
        views: 'viewCount',
        rating: 'averageRating',
        title: 'title',
      };
      dbQuery = dbQuery.order(sortColumns[sortBy], { ascending: sortOrder === 'asc' });

      // Apply pagination
      const limit = query.limit || 20;
      const offset = query.offset || 0;
      dbQuery = dbQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await dbQuery;

      if (error) {
        throw new Error(`Failed to query content: ${error.message}`);
      }

      const total = count || 0;
      const pages = Math.ceil(total / limit);
      const page = Math.floor(offset / limit) + 1;

      return {
        items: data || [],
        total,
        page,
        pages,
      };
    } catch (error) {
      throw new Error(`Failed to query content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add interaction (like, bookmark, share)
   */
  async addInteraction(userId: string, contentId: string, type: ContentInteractionType['type'], data?: Record<string, any>): Promise<void> {
    try {
      const interaction: ContentInteractionType = {
        userId,
        type,
        data,
        timestamp: new Date(),
      };

      // Check if interaction already exists
      const { data: existing } = await this.supabase
        .from('content_interactions')
        .select('*')
        .eq('userId', userId)
        .eq('contentId', contentId)
        .eq('type', type)
        .single();

      if (existing) {
        // Update existing interaction
        await this.supabase
          .from('content_interactions')
          .update({
            data: interaction.data,
            timestamp: interaction.timestamp,
          })
          .eq('userId', userId)
          .eq('contentId', contentId)
          .eq('type', type);
      } else {
        // Create new interaction
        await this.supabase
          .from('content_interactions')
          .insert({
            ...interaction,
            contentId,
          });

        // Update content counters
        await this.updateContentCounter(contentId, type, 1);
      }

      // Track analytics
      await this.analytics.trackEvent({
        userId,
        eventType: `content_${type}` as any,
        contentId,
        metadata: data,
      });
    } catch (error) {
      throw new Error(`Failed to add interaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove interaction
   */
  async removeInteraction(userId: string, contentId: string, type: ContentInteractionType['type']): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('content_interactions')
        .delete()
        .eq('userId', userId)
        .eq('contentId', contentId)
        .eq('type', type);

      if (error) {
        throw new Error(`Failed to remove interaction: ${error.message}`);
      }

      // Update content counters
      await this.updateContentCounter(contentId, type, -1);
    } catch (error) {
      throw new Error(`Failed to remove interaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user interactions with content
   */
  async getUserInteractions(userId: string, contentId: string): Promise<ContentInteractionType[]> {
    try {
      const { data, error } = await this.supabase
        .from('content_interactions')
        .select('*')
        .eq('userId', userId)
        .eq('contentId', contentId);

      if (error) {
        throw new Error(`Failed to get interactions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      throw new Error(`Failed to get interactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Track content view
   */
  private async trackView(userId: string, contentId: string): Promise<void> {
    try {
      await this.addInteraction(userId, contentId, 'view');
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  }

  /**
   * Update content counter
   */
  private async updateContentCounter(contentId: string, type: ContentInteractionType['type'], delta: number): Promise<void> {
    try {
      const counterFields: Record<string, string> = {
        like: 'likeCount',
        bookmark: 'bookmarkCount',
        share: 'shareCount',
        comment: 'commentCount',
        download: 'downloadCount',
        view: 'viewCount',
        rating: 'ratingCount',
      };

      const field = counterFields[type];
      if (!field) return;

      const { error } = await this.supabase.rpc('increment_content_counter', {
        content_id: contentId,
        field_name: field,
        delta,
      });

      if (error) {
        console.error(`Failed to update ${field}:`, error);
      }
    } catch (error) {
      console.error('Failed to update counter:', error);
    }
  }

  /**
   * Generate unique slug
   */
  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      let query = this.supabase
        .from('knowledge_content')
        .select('id')
        .eq('slug', slug);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to check slug uniqueness: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Increment version number
   */
  private incrementVersion(currentVersion: string): string {
    const parts = currentVersion.split('.');
    const major = parseInt(parts[0] || '1', 10);
    const minor = parseInt(parts[1] || '0', 10);
    const patch = parseInt(parts[2] || '0', 10);

    // Increment minor version
    return `${major}.${minor + 1}.${patch}`;
  }

  /**
   * Check update permission
   */
  private hasUpdatePermission(userId: string, content: KnowledgeContentType): boolean {
    // Check if user is a contributor
    return content.contributors.some(c => c.authorId === userId);
  }

  /**
   * Check publish permission
   */
  private hasPublishPermission(userId: string, content: KnowledgeContentType): boolean {
    // For now, only primary author can publish
    return content.primaryAuthor === userId;
  }

  /**
   * Check delete permission
   */
  private hasDeletePermission(userId: string, content: KnowledgeContentType): boolean {
    // For now, only primary author can delete
    return content.primaryAuthor === userId;
  }
}