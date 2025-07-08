import { createSupabaseClient } from '@sasarjan/database';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import {
  CMSPageType,
  PageTypeType,
  PageStatusType,
  PageVisibilityType,
  PageTemplateType,
  ContentBlockType,
  SEOMetadataType,
  PageVersionType,
} from '../types';
import { ContentBlockValidator } from '../utils/content-block-validator';
import { SEOOptimizer } from '../utils/seo-optimizer';
import { PageRenderer } from '../utils/page-renderer';

export interface CreatePageRequest {
  title: string;
  description?: string;
  type: PageTypeType;
  template: PageTemplateType;
  visibility?: PageVisibilityType;
  blocks?: ContentBlockType[];
  seo?: Partial<SEOMetadataType>;
  tags?: string[];
  categories?: string[];
  appId?: string;
  organizationId?: string;
  parentPageId?: string;
  settings?: Record<string, any>;
  language?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePageRequest extends Partial<CreatePageRequest> {
  id: string;
  changelog?: string;
}

export interface PageQuery {
  type?: PageTypeType;
  status?: PageStatusType;
  visibility?: PageVisibilityType;
  template?: PageTemplateType;
  appId?: string;
  organizationId?: string;
  parentPageId?: string;
  tags?: string[];
  categories?: string[];
  language?: string;
  createdBy?: string;
  publishedAfter?: Date;
  publishedBefore?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'created' | 'updated' | 'published' | 'title' | 'views';
  sortOrder?: 'asc' | 'desc';
  includeAnalytics?: boolean;
}

export class PageManager {
  private supabase = createSupabaseClient();
  private blockValidator = new ContentBlockValidator();
  private seoOptimizer = new SEOOptimizer();
  private pageRenderer = new PageRenderer();

  /**
   * Create new page
   */
  async createPage(userId: string, request: CreatePageRequest): Promise<CMSPageType> {
    try {
      // Validate blocks
      if (request.blocks) {
        const blockValidation = this.blockValidator.validateBlocks(request.blocks);
        if (!blockValidation.isValid) {
          throw new Error(`Block validation failed: ${blockValidation.errors.join(', ')}`);
        }
      }

      // Generate ID and slug
      const id = nanoid();
      const slug = await this.generateUniqueSlug(request.title, request.appId);

      // Optimize SEO
      const optimizedSEO = this.seoOptimizer.optimizeSEO({
        title: request.title,
        description: request.description,
        ...request.seo,
      }, request.blocks || []);

      // Create initial version
      const initialVersion: PageVersionType = {
        version: '1.0',
        changelog: 'Initial creation',
        publishedAt: new Date(),
        publishedBy: userId,
        blocks: request.blocks || [],
        seo: optimizedSEO,
      };

      // Create page object
      const page: CMSPageType = {
        id,
        title: request.title,
        slug,
        description: request.description,
        type: request.type,
        template: request.template,
        status: 'draft',
        visibility: request.visibility || 'public',
        
        // Content
        blocks: request.blocks || [],
        
        // SEO
        seo: optimizedSEO,
        
        // Authorship
        createdBy: userId,
        lastEditedBy: userId,
        
        // Organization
        appId: request.appId,
        organizationId: request.organizationId,
        parentPageId: request.parentPageId,
        childPages: [],
        
        // Categorization
        tags: request.tags || [],
        categories: request.categories || [],
        
        // Publishing
        publishedAt: undefined,
        scheduledAt: undefined,
        expiresAt: undefined,
        
        // Versioning
        version: '1.0',
        versions: [initialVersion],
        
        // Settings
        settings: {
          showInNavigation: false,
          allowComments: false,
          allowSharing: true,
          trackingEnabled: true,
          ...request.settings,
        },
        
        // Localization
        language: request.language || 'en',
        translations: [],
        
        // Performance
        cacheSettings: {
          enabled: true,
          ttl: 3600,
          varyByUser: false,
          varyByDevice: false,
        },
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Custom Fields
        customFields: undefined,
        
        // Metadata
        metadata: request.metadata,
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('cms_pages')
        .insert(page)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create page: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to create page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update existing page
   */
  async updatePage(userId: string, request: UpdatePageRequest): Promise<CMSPageType> {
    try {
      // Get existing page
      const existing = await this.getPageById(request.id);
      if (!existing) {
        throw new Error('Page not found');
      }

      // Check permissions
      if (existing.createdBy !== userId && !this.hasUpdatePermission(userId, existing)) {
        throw new Error('Permission denied');
      }

      // Validate blocks if provided
      if (request.blocks) {
        const blockValidation = this.blockValidator.validateBlocks(request.blocks);
        if (!blockValidation.isValid) {
          throw new Error(`Block validation failed: ${blockValidation.errors.join(', ')}`);
        }
      }

      // Generate new slug if title changed
      let newSlug = existing.slug;
      if (request.title && request.title !== existing.title) {
        newSlug = await this.generateUniqueSlug(request.title, existing.appId, existing.id);
      }

      // Optimize SEO if content changed
      let optimizedSEO = existing.seo;
      if (request.blocks || request.seo || request.title || request.description) {
        optimizedSEO = this.seoOptimizer.optimizeSEO({
          title: request.title || existing.title,
          description: request.description || existing.description,
          ...existing.seo,
          ...request.seo,
        }, request.blocks || existing.blocks);
      }

      // Create new version
      const newVersion = this.incrementVersion(existing.version);
      const newVersionInfo: PageVersionType = {
        version: newVersion,
        changelog: request.changelog || 'Page updated',
        publishedAt: new Date(),
        publishedBy: userId,
        previousVersion: existing.version,
        blocks: request.blocks || existing.blocks,
        seo: optimizedSEO,
      };

      // Update page
      const updates: Partial<CMSPageType> = {
        ...request,
        id: existing.id, // Ensure ID doesn't change
        slug: newSlug,
        seo: optimizedSEO,
        lastEditedBy: userId,
        version: newVersion,
        versions: [...existing.versions, newVersionInfo],
        updatedAt: new Date(),
      };

      // Save to database
      const { data, error } = await this.supabase
        .from('cms_pages')
        .update(updates)
        .eq('id', request.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update page: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to update page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Publish page
   */
  async publishPage(userId: string, pageId: string): Promise<CMSPageType> {
    try {
      const page = await this.getPageById(pageId);
      if (!page) {
        throw new Error('Page not found');
      }

      if (page.createdBy !== userId && !this.hasPublishPermission(userId, page)) {
        throw new Error('Permission denied');
      }

      const updates: Partial<CMSPageType> = {
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      };

      const { data, error } = await this.supabase
        .from('cms_pages')
        .update(updates)
        .eq('id', pageId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to publish page: ${error.message}`);
      }

      // Generate static version if enabled
      await this.generateStaticVersion(data);

      return data;
    } catch (error) {
      throw new Error(`Failed to publish page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Unpublish page
   */
  async unpublishPage(userId: string, pageId: string): Promise<CMSPageType> {
    try {
      const page = await this.getPageById(pageId);
      if (!page) {
        throw new Error('Page not found');
      }

      if (page.createdBy !== userId && !this.hasPublishPermission(userId, page)) {
        throw new Error('Permission denied');
      }

      const updates: Partial<CMSPageType> = {
        status: 'unpublished',
        updatedAt: new Date(),
      };

      const { data, error } = await this.supabase
        .from('cms_pages')
        .update(updates)
        .eq('id', pageId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to unpublish page: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to unpublish page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Schedule page publication
   */
  async schedulePage(userId: string, pageId: string, scheduledAt: Date): Promise<CMSPageType> {
    try {
      const page = await this.getPageById(pageId);
      if (!page) {
        throw new Error('Page not found');
      }

      if (page.createdBy !== userId && !this.hasPublishPermission(userId, page)) {
        throw new Error('Permission denied');
      }

      const updates: Partial<CMSPageType> = {
        status: 'scheduled',
        scheduledAt,
        updatedAt: new Date(),
      };

      const { data, error } = await this.supabase
        .from('cms_pages')
        .update(updates)
        .eq('id', pageId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to schedule page: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to schedule page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete page
   */
  async deletePage(userId: string, pageId: string): Promise<void> {
    try {
      const page = await this.getPageById(pageId);
      if (!page) {
        throw new Error('Page not found');
      }

      if (page.createdBy !== userId && !this.hasDeletePermission(userId, page)) {
        throw new Error('Permission denied');
      }

      // Check for child pages
      if (page.childPages && page.childPages.length > 0) {
        throw new Error('Cannot delete page with child pages');
      }

      const { error } = await this.supabase
        .from('cms_pages')
        .delete()
        .eq('id', pageId);

      if (error) {
        throw new Error(`Failed to delete page: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to delete page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get page by ID
   */
  async getPageById(pageId: string, includeAnalytics = false): Promise<CMSPageType | null> {
    try {
      let query = this.supabase
        .from('cms_pages')
        .select('*')
        .eq('id', pageId);

      if (includeAnalytics) {
        query = query.select('*, analytics:page_analytics(*)');
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get page: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to get page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get page by slug
   */
  async getPageBySlug(slug: string, appId?: string, includeAnalytics = false): Promise<CMSPageType | null> {
    try {
      let query = this.supabase
        .from('cms_pages')
        .select(includeAnalytics ? '*, analytics:page_analytics(*)' : '*')
        .eq('slug', slug);

      if (appId) {
        query = query.eq('appId', appId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Failed to get page: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to get page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query pages
   */
  async queryPages(query: PageQuery): Promise<{
    items: CMSPageType[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      let dbQuery = this.supabase
        .from('cms_pages')
        .select('*', { count: 'exact' });

      // Apply filters
      if (query.type) {
        dbQuery = dbQuery.eq('type', query.type);
      }
      if (query.status) {
        dbQuery = dbQuery.eq('status', query.status);
      }
      if (query.visibility) {
        dbQuery = dbQuery.eq('visibility', query.visibility);
      }
      if (query.template) {
        dbQuery = dbQuery.eq('template', query.template);
      }
      if (query.appId) {
        dbQuery = dbQuery.eq('appId', query.appId);
      }
      if (query.organizationId) {
        dbQuery = dbQuery.eq('organizationId', query.organizationId);
      }
      if (query.parentPageId) {
        dbQuery = dbQuery.eq('parentPageId', query.parentPageId);
      }
      if (query.language) {
        dbQuery = dbQuery.eq('language', query.language);
      }
      if (query.createdBy) {
        dbQuery = dbQuery.eq('createdBy', query.createdBy);
      }
      if (query.tags && query.tags.length > 0) {
        dbQuery = dbQuery.overlaps('tags', query.tags);
      }
      if (query.categories && query.categories.length > 0) {
        dbQuery = dbQuery.overlaps('categories', query.categories);
      }
      if (query.publishedAfter) {
        dbQuery = dbQuery.gte('publishedAt', query.publishedAfter.toISOString());
      }
      if (query.publishedBefore) {
        dbQuery = dbQuery.lte('publishedAt', query.publishedBefore.toISOString());
      }

      // Apply sorting
      const sortBy = query.sortBy || 'created';
      const sortOrder = query.sortOrder || 'desc';
      const sortColumns = {
        created: 'createdAt',
        updated: 'updatedAt',
        published: 'publishedAt',
        title: 'title',
        views: 'analytics.views',
      };
      dbQuery = dbQuery.order(sortColumns[sortBy] || 'createdAt', { ascending: sortOrder === 'asc' });

      // Apply pagination
      const limit = query.limit || 20;
      const offset = query.offset || 0;
      dbQuery = dbQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await dbQuery;

      if (error) {
        throw new Error(`Failed to query pages: ${error.message}`);
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
      throw new Error(`Failed to query pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Duplicate page
   */
  async duplicatePage(userId: string, pageId: string, newTitle: string): Promise<CMSPageType> {
    try {
      const originalPage = await this.getPageById(pageId);
      if (!originalPage) {
        throw new Error('Page not found');
      }

      const createRequest: CreatePageRequest = {
        title: newTitle,
        description: originalPage.description,
        type: originalPage.type,
        template: originalPage.template,
        visibility: 'draft' as PageVisibilityType,
        blocks: originalPage.blocks,
        seo: {
          ...originalPage.seo,
          title: newTitle,
        },
        tags: originalPage.tags,
        categories: originalPage.categories,
        appId: originalPage.appId,
        organizationId: originalPage.organizationId,
        settings: originalPage.settings,
        language: originalPage.language,
        metadata: originalPage.metadata,
      };

      return await this.createPage(userId, createRequest);
    } catch (error) {
      throw new Error(`Failed to duplicate page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate static version of page
   */
  private async generateStaticVersion(page: CMSPageType): Promise<void> {
    try {
      // Render page to static HTML
      const staticHTML = await this.pageRenderer.renderToHTML(page);
      
      // Save static version (implementation depends on storage provider)
      // This could save to CDN, file system, or static hosting service
      await this.saveStaticHTML(page.slug, staticHTML);
    } catch (error) {
      console.error('Failed to generate static version:', error);
    }
  }

  /**
   * Save static HTML (placeholder implementation)
   */
  private async saveStaticHTML(slug: string, html: string): Promise<void> {
    // Implementation would depend on static hosting setup
    // Could save to S3, Vercel, Netlify, etc.
    console.log(`Saving static HTML for ${slug}`);
  }

  /**
   * Generate unique slug
   */
  private async generateUniqueSlug(title: string, appId?: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      let query = this.supabase
        .from('cms_pages')
        .select('id')
        .eq('slug', slug);

      if (appId) {
        query = query.eq('appId', appId);
      }

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
  private hasUpdatePermission(userId: string, page: CMSPageType): boolean {
    // Implementation would check user roles and permissions
    // For now, allow organization members to edit
    return true;
  }

  /**
   * Check publish permission
   */
  private hasPublishPermission(userId: string, page: CMSPageType): boolean {
    // Implementation would check user roles and permissions
    // For now, only allow page creator to publish
    return page.createdBy === userId;
  }

  /**
   * Check delete permission
   */
  private hasDeletePermission(userId: string, page: CMSPageType): boolean {
    // Implementation would check user roles and permissions
    // For now, only allow page creator to delete
    return page.createdBy === userId;
  }
}