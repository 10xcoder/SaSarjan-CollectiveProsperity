import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentManager } from './api/content-manager';
import { SearchManager } from './api/search-manager';
import { AnalyticsTracker } from './api/analytics-tracker';
import { ContentValidator } from './utils/content-validator';
import { ContentProcessor } from './utils/content-processor';
import { 
  KnowledgeContentType, 
  SearchQueryType, 
  ContentTypeType, 
  ContentCategoryType, 
  ContentLevelType, 
  ContentLanguageType 
} from './types';

// Mock all dependencies
vi.mock('@sasarjan/database', () => ({
  createSupabaseClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'test-id-123'),
}));

vi.mock('slugify', () => ({
  default: vi.fn((str: string) => str.toLowerCase().replace(/\s+/g, '-')),
}));

vi.mock('fuse.js', () => ({
  default: vi.fn(() => ({
    search: vi.fn(() => []),
  })),
}));

describe('Knowledge Library Integration Tests', () => {
  describe('Type System Integration', () => {
    it('should validate complete content workflow types', () => {
      const contentTypes: ContentTypeType[] = [
        'article', 'video', 'audio', 'document', 'course', 'tutorial', 'guide'
      ];
      
      const categories: ContentCategoryType[] = [
        'knowledge_commons', 'economic_empowerment', 'environmental_stewardship',
        'social_connection', 'cultural_preservation', 'health_wellbeing',
        'governance_participation', 'spiritual_growth', 'technology_innovation',
        'education_learning', 'general'
      ];
      
      const levels: ContentLevelType[] = [
        'beginner', 'intermediate', 'advanced', 'expert', 'all_levels'
      ];
      
      const languages: ContentLanguageType[] = [
        'en', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'gu', 'mr', 'pa', 'or', 'as', 'ur', 'sa', 'multi'
      ];

      expect(contentTypes).toHaveLength(7);
      expect(categories).toHaveLength(11);
      expect(levels).toHaveLength(5);
      expect(languages).toHaveLength(15);
    });

    it('should validate search query types', () => {
      const searchQuery: SearchQueryType = {
        query: 'knowledge management',
        filters: {
          types: ['article', 'video'],
          categories: ['knowledge_commons', 'education_learning'],
          levels: ['beginner', 'intermediate'],
          languages: ['en', 'hi'],
          minRating: 4.0,
        },
        sort: 'relevance',
        page: 1,
        limit: 20,
        fuzzy: true,
        exactMatch: false,
        includeArchived: false,
        searchFields: ['title', 'description', 'content'],
        includeAggregations: true,
      };

      expect(searchQuery.query).toBe('knowledge management');
      expect(searchQuery.filters?.types).toContain('article');
      expect(searchQuery.filters?.categories).toContain('knowledge_commons');
      expect(searchQuery.sort).toBe('relevance');
      expect(searchQuery.page).toBe(1);
      expect(searchQuery.limit).toBe(20);
    });
  });

  describe('Content Management Workflow', () => {
    let contentManager: ContentManager;
    let validator: ContentValidator;
    let processor: ContentProcessor;

    beforeEach(() => {
      contentManager = new ContentManager();
      validator = ContentValidator.getInstance();
      processor = ContentProcessor.getInstance();
    });

    it('should process content creation workflow', async () => {
      // Test content validation
      const content = {
        title: 'Comprehensive Knowledge Management Guide',
        content: 'This is a comprehensive guide about knowledge management systems and practices.',
        type: 'guide' as ContentTypeType,
        category: 'knowledge_commons' as ContentCategoryType,
        language: 'en' as ContentLanguageType,
      };

      const validationResult = await validator.validateContent(content);
      expect(validationResult.isValid).toBe(true);

      // Test content processing
      const processedContent = processor.processContent(content);
      expect(processedContent.keywords).toBeInstanceOf(Array);
      expect(processedContent.estimatedReadTime).toBeGreaterThan(0);
      expect(processedContent.qualityScore).toBeGreaterThan(0);

      // Test slug generation
      const slug = processor.generateSlug(content.title);
      expect(slug).toBe('comprehensive-knowledge-management-guide');

      // Test excerpt generation
      const excerpt = processor.generateExcerpt(content.content);
      expect(excerpt).toBe('This is a comprehensive guide about knowledge management systems and practices.');
    });

    it('should handle content sanitization', () => {
      const maliciousContent = `
        <p>Good content</p>
        <script>alert('malicious');</script>
        <iframe src="https://malicious.com"></iframe>
        <a href="javascript:alert('hack')">Click me</a>
      `;

      const sanitized = validator.sanitizeContent(maliciousContent);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<iframe>');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).toContain('<p>Good content</p>');
    });

    it('should validate media processing', () => {
      const mediaItem = {
        type: 'image' as const,
        url: 'https://example.com/image.jpg',
        title: 'Test Image',
      };

      const validationResult = validator.validateMediaAttachment(mediaItem);
      expect(validationResult.isValid).toBe(true);

      const processedMedia = processor.processMediaAttachment(mediaItem);
      expect(processedMedia.id).toBeDefined();
      expect(processedMedia.uploadedAt).toBeDefined();
      expect(processedMedia.thumbnailUrl).toBe('https://example.com/image_thumb.jpg');
    });
  });

  describe('Search and Analytics Integration', () => {
    let searchManager: SearchManager;
    let analyticsTracker: AnalyticsTracker;

    beforeEach(() => {
      searchManager = new SearchManager();
      analyticsTracker = AnalyticsTracker.getInstance({ enableTracking: false });
    });

    it('should handle search workflow', async () => {
      const searchQuery: SearchQueryType = {
        query: 'knowledge management',
        filters: {
          types: ['article'],
          categories: ['knowledge_commons'],
          minRating: 4.0,
        },
        sort: 'relevance',
        page: 1,
        limit: 20,
      };

      // This will use mocked dependencies
      const result = await searchManager.search(searchQuery);
      
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('searchTime');
      expect(result.items).toBeInstanceOf(Array);
      expect(result.currentPage).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should handle analytics tracking', async () => {
      await analyticsTracker.trackContentView('content-1', 'user-1', {
        source: 'search',
        query: 'knowledge management',
      });

      await analyticsTracker.trackSearchQuery('knowledge management', 'user-1', 25);

      const contentAnalytics = await analyticsTracker.getContentAnalytics('content-1');
      expect(contentAnalytics.contentId).toBe('content-1');
      expect(contentAnalytics.period).toBe('month');

      const authorAnalytics = await analyticsTracker.getAuthorAnalytics('author-1');
      expect(authorAnalytics.authorId).toBe('author-1');
      expect(authorAnalytics.period).toBe('month');
    });

    it('should handle popular searches', async () => {
      const popularSearches = await searchManager.getPopularSearches('week', 10);
      expect(popularSearches).toBeInstanceOf(Array);

      const trendingSearches = await searchManager.getTrendingSearches(10);
      expect(trendingSearches).toBeInstanceOf(Array);

      const suggestions = await searchManager.getSuggestions('knowledge', 10);
      expect(suggestions).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle validation errors gracefully', async () => {
      const validator = ContentValidator.getInstance();
      
      const invalidContent = {
        title: '',
        content: '',
        type: undefined,
        category: undefined,
      };

      const result = await validator.validateContent(invalidContent);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty search results', async () => {
      const searchManager = new SearchManager();
      
      const emptyQuery: SearchQueryType = {
        query: 'nonexistent-query-that-returns-nothing',
        page: 1,
        limit: 20,
      };

      const result = await searchManager.search(emptyQuery);
      expect(result.items).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle content processing edge cases', () => {
      const processor = ContentProcessor.getInstance();
      
      // Test empty content
      const emptyResult = processor.processContent({});
      expect(emptyResult.content).toBeUndefined();
      expect(emptyResult.keywords).toBeUndefined();
      
      // Test very short content
      const shortContent = processor.processContent({
        title: 'A',
        content: 'B',
        type: 'article',
      });
      expect(shortContent.qualityScore).toBeLessThan(50);
      
      // Test slug generation with special characters
      const specialSlug = processor.generateSlug('API Design: Best Practices & Guidelines!');
      expect(specialSlug).toBe('api-design-best-practices-guidelines');
      
      // Test excerpt generation with very short content
      const shortExcerpt = processor.generateExcerpt('Short.');
      expect(shortExcerpt).toBe('Short.');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple concurrent operations', async () => {
      const validator = ContentValidator.getInstance();
      const processor = ContentProcessor.getInstance();
      
      // Test multiple validation operations
      const validationPromises = Array(10).fill(null).map((_, i) => 
        validator.validateContent({
          title: `Test Content ${i}`,
          content: `Test content body ${i}`,
          type: 'article',
          category: 'knowledge_commons',
          language: 'en',
        })
      );
      
      const results = await Promise.all(validationPromises);
      expect(results.every(r => r.isValid)).toBe(true);
      
      // Test multiple processing operations
      const processingPromises = Array(10).fill(null).map((_, i) => 
        processor.processContent({
          title: `Test Content ${i}`,
          content: `Test content body ${i} with some additional text to make it longer`,
          type: 'article',
        })
      );
      
      const processedResults = await Promise.all(processingPromises);
      expect(processedResults.every(r => r.qualityScore && r.qualityScore > 0)).toBe(true);
    });

    it('should handle large content processing', () => {
      const processor = ContentProcessor.getInstance();
      
      // Test with large content
      const largeContent = Array(1000).fill('word').join(' ');
      const result = processor.processContent({
        title: 'Large Content Test',
        content: largeContent,
        type: 'article',
      });
      
      expect(result.estimatedReadTime).toBeGreaterThan(1);
      expect(result.keywords).toBeInstanceOf(Array);
      expect(result.keywords!.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Configuration and Setup', () => {
    it('should validate analytics configuration', () => {
      const config = {
        enableTracking: true,
        batchSize: 10,
        flushInterval: 30000,
        enableLocalStorage: true,
        trackingEndpoint: 'https://api.example.com/analytics',
      };
      
      const tracker = AnalyticsTracker.getInstance(config);
      expect(tracker).toBeDefined();
      
      // Test singleton pattern
      const sameTracker = AnalyticsTracker.getInstance();
      expect(sameTracker).toBe(tracker);
    });

    it('should validate content manager setup', () => {
      const contentManager = new ContentManager();
      expect(contentManager).toBeDefined();
      
      // Test validator integration
      const validator = ContentValidator.getInstance();
      expect(validator).toBeDefined();
      
      // Test processor integration
      const processor = ContentProcessor.getInstance();
      expect(processor).toBeDefined();
    });
  });
});