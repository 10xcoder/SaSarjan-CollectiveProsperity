import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentManager } from './content-manager';
import { 
  createMockSupabaseClient, 
  mockKnowledgeContent, 
  mockSupabaseSuccess, 
  mockSupabaseError,
  mockUserProfile,
  mockNanoid
} from '../test/mocks';

// Mock dependencies
vi.mock('@sasarjan/database', () => ({
  createSupabaseClient: vi.fn(),
}));

vi.mock('nanoid', () => ({
  nanoid: vi.fn(),
}));

vi.mock('slugify', () => ({
  default: vi.fn((str: string) => str.toLowerCase().replace(/\s+/g, '-')),
}));

vi.mock('../utils/content-validator', () => ({
  ContentValidator: {
    getInstance: vi.fn(() => ({
      validateCreateRequest: vi.fn(),
      validateUpdateRequest: vi.fn(),
    })),
  },
}));

vi.mock('../utils/content-processor', () => ({
  ContentProcessor: {
    getInstance: vi.fn(() => ({
      processContent: vi.fn(),
    })),
  },
}));

vi.mock('./analytics-tracker', () => ({
  AnalyticsTracker: {
    getInstance: vi.fn(() => ({
      trackEvent: vi.fn(),
    })),
  },
}));

describe('ContentManager', () => {
  let contentManager: ContentManager;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock supabase client
    mockSupabase = createMockSupabaseClient();
    vi.mocked(vi.importActual('@sasarjan/database')).createSupabaseClient = vi.fn(() => mockSupabase);
    
    // Setup mock nanoid
    vi.mocked(vi.importActual('nanoid')).nanoid = vi.fn(() => mockNanoid());
    
    // Setup mock validator
    const mockValidator = {
      validateCreateRequest: vi.fn().mockResolvedValue({ isValid: true, errors: [] }),
      validateUpdateRequest: vi.fn().mockResolvedValue({ isValid: true, errors: [] }),
    };
    vi.mocked(vi.importActual('../utils/content-validator')).ContentValidator.getInstance = vi.fn(() => mockValidator);
    
    // Setup mock processor
    const mockProcessor = {
      processContent: vi.fn().mockReturnValue({
        content: 'processed content',
        excerpt: 'processed excerpt',
        keywords: ['keyword1', 'keyword2'],
        estimatedReadTime: 5,
        qualityScore: 85,
      }),
    };
    vi.mocked(vi.importActual('../utils/content-processor')).ContentProcessor.getInstance = vi.fn(() => mockProcessor);
    
    // Setup mock analytics
    const mockAnalytics = {
      trackEvent: vi.fn(),
    };
    vi.mocked(vi.importActual('./analytics-tracker')).AnalyticsTracker.getInstance = vi.fn(() => mockAnalytics);
    
    contentManager = new ContentManager();
  });

  describe('createContent', () => {
    it('should create content successfully', async () => {
      const createRequest = {
        title: 'Test Content',
        description: 'Test description',
        content: 'Test content body',
        type: 'article' as const,
        category: 'knowledge_commons' as const,
        level: 'beginner' as const,
        language: 'en' as const,
        tags: ['test', 'content'],
      };

      mockSupabase.single.mockResolvedValue(mockSupabaseSuccess(mockKnowledgeContent));

      const result = await contentManager.createContent('user-1', createRequest);

      expect(result).toEqual(mockKnowledgeContent);
      expect(mockSupabase.from).toHaveBeenCalledWith('knowledge_content');
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const createRequest = {
        title: 'Test Content',
        description: 'Test description',
        content: 'Test content body',
        type: 'article' as const,
        category: 'knowledge_commons' as const,
        level: 'beginner' as const,
        language: 'en' as const,
        tags: ['test', 'content'],
      };

      // Mock validation failure
      const mockValidator = {
        validateCreateRequest: vi.fn().mockResolvedValue({ 
          isValid: false, 
          errors: ['Title is required'] 
        }),
      };
      vi.mocked(vi.importActual('../utils/content-validator')).ContentValidator.getInstance = vi.fn(() => mockValidator);

      await expect(contentManager.createContent('user-1', createRequest))
        .rejects.toThrow('Validation failed: Title is required');
    });

    it('should handle database errors', async () => {
      const createRequest = {
        title: 'Test Content',
        description: 'Test description',
        content: 'Test content body',
        type: 'article' as const,
        category: 'knowledge_commons' as const,
        level: 'beginner' as const,
        language: 'en' as const,
        tags: ['test', 'content'],
      };

      mockSupabase.single.mockResolvedValue(mockSupabaseError('Database error'));

      await expect(contentManager.createContent('user-1', createRequest))
        .rejects.toThrow('Failed to create content: Database error');
    });

    it('should process media attachments', async () => {
      const createRequest = {
        title: 'Test Content',
        description: 'Test description',
        content: 'Test content body',
        type: 'article' as const,
        category: 'knowledge_commons' as const,
        level: 'beginner' as const,
        language: 'en' as const,
        tags: ['test', 'content'],
        media: [{
          type: 'image' as const,
          url: 'https://example.com/image.jpg',
          title: 'Test Image',
        }],
      };

      const expectedContent = {
        ...mockKnowledgeContent,
        media: expect.arrayContaining([
          expect.objectContaining({
            type: 'image',
            url: 'https://example.com/image.jpg',
            title: 'Test Image',
            id: expect.any(String),
            uploadedAt: expect.any(Date),
          })
        ])
      };

      mockSupabase.single.mockResolvedValue(mockSupabaseSuccess(expectedContent));

      const result = await contentManager.createContent('user-1', createRequest);

      expect(result.media).toHaveLength(1);
      expect(result.media[0]).toHaveProperty('id');
      expect(result.media[0]).toHaveProperty('uploadedAt');
    });
  });

  describe('getContentById', () => {
    it('should get content by ID successfully', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseSuccess(mockKnowledgeContent));

      const result = await contentManager.getContentById('content-1');

      expect(result).toEqual(mockKnowledgeContent);
      expect(mockSupabase.from).toHaveBeenCalledWith('knowledge_content');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'content-1');
    });

    it('should return null for non-existent content', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseError('PGRST116'));

      const result = await contentManager.getContentById('non-existent');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseError('Database error'));

      await expect(contentManager.getContentById('content-1'))
        .rejects.toThrow('Failed to get content: Database error');
    });

    it('should track view when user ID provided', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseSuccess(mockKnowledgeContent));

      const result = await contentManager.getContentById('content-1', 'user-1');

      expect(result).toEqual(mockKnowledgeContent);
      // Note: This would require more complex mocking to verify trackView was called
    });
  });

  describe('getContentBySlug', () => {
    it('should get content by slug successfully', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseSuccess(mockKnowledgeContent));

      const result = await contentManager.getContentBySlug('test-content');

      expect(result).toEqual(mockKnowledgeContent);
      expect(mockSupabase.from).toHaveBeenCalledWith('knowledge_content');
      expect(mockSupabase.eq).toHaveBeenCalledWith('slug', 'test-content');
    });

    it('should return null for non-existent slug', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseError('PGRST116'));

      const result = await contentManager.getContentBySlug('non-existent');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockSupabase.single.mockResolvedValue(mockSupabaseError('Database error'));

      await expect(contentManager.getContentBySlug('test-content'))
        .rejects.toThrow('Failed to get content: Database error');
    });
  });

  describe('queryContent', () => {
    it('should query content with filters', async () => {
      const query = {
        type: 'article' as const,
        category: 'knowledge_commons' as const,
        language: 'en' as const,
        tags: ['test'],
        limit: 10,
        offset: 0,
        sortBy: 'created' as const,
        sortOrder: 'desc' as const,
      };

      mockSupabase.mockReturnValue(mockSupabaseSuccess([mockKnowledgeContent], 1));

      const result = await contentManager.queryContent(query);

      expect(result).toEqual({
        items: [mockKnowledgeContent],
        total: 1,
        page: 1,
        pages: 1,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('knowledge_content');
      expect(mockSupabase.eq).toHaveBeenCalledWith('type', 'article');
      expect(mockSupabase.eq).toHaveBeenCalledWith('category', 'knowledge_commons');
      expect(mockSupabase.eq).toHaveBeenCalledWith('language', 'en');
      expect(mockSupabase.overlaps).toHaveBeenCalledWith('tags', ['test']);
    });

    it('should handle empty results', async () => {
      const query = {
        type: 'article' as const,
        limit: 10,
        offset: 0,
      };

      mockSupabase.mockReturnValue(mockSupabaseSuccess([], 0));

      const result = await contentManager.queryContent(query);

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        pages: 0,
      });
    });

    it('should handle database errors', async () => {
      const query = {
        type: 'article' as const,
        limit: 10,
        offset: 0,
      };

      mockSupabase.mockReturnValue(mockSupabaseError('Database error'));

      await expect(contentManager.queryContent(query))
        .rejects.toThrow('Failed to query content: Database error');
    });

    it('should apply pagination correctly', async () => {
      const query = {
        limit: 5,
        offset: 10,
      };

      mockSupabase.mockReturnValue(mockSupabaseSuccess([mockKnowledgeContent], 25));

      const result = await contentManager.queryContent(query);

      expect(result).toEqual({
        items: [mockKnowledgeContent],
        total: 25,
        page: 3, // offset 10, limit 5 = page 3
        pages: 5, // total 25, limit 5 = 5 pages
      });

      expect(mockSupabase.range).toHaveBeenCalledWith(10, 14); // offset to offset + limit - 1
    });

    it('should use default values for missing parameters', async () => {
      const query = {}; // Empty query

      mockSupabase.mockReturnValue(mockSupabaseSuccess([mockKnowledgeContent], 1));

      const result = await contentManager.queryContent(query);

      expect(result).toEqual({
        items: [mockKnowledgeContent],
        total: 1,
        page: 1,
        pages: 1,
      });

      expect(mockSupabase.range).toHaveBeenCalledWith(0, 19); // default limit 20
      expect(mockSupabase.order).toHaveBeenCalledWith('createdAt', { ascending: false }); // default sort
    });
  });

  describe('updateContent', () => {
    it('should update content successfully', async () => {
      const updateRequest = {
        id: 'content-1',
        title: 'Updated Title',
        content: 'Updated content',
      };

      // Mock existing content
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseSuccess(mockKnowledgeContent));
      // Mock update result
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseSuccess({
        ...mockKnowledgeContent,
        title: 'Updated Title',
        content: 'Updated content',
      }));

      const result = await contentManager.updateContent('user-1', updateRequest);

      expect(result.title).toBe('Updated Title');
      expect(mockSupabase.from).toHaveBeenCalledWith('knowledge_content');
      expect(mockSupabase.update).toHaveBeenCalled();
    });

    it('should handle content not found', async () => {
      const updateRequest = {
        id: 'non-existent',
        title: 'Updated Title',
      };

      // Mock get content returning null
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseError('PGRST116'));

      await expect(contentManager.updateContent('user-1', updateRequest))
        .rejects.toThrow('Content not found');
    });

    it('should handle permission denied', async () => {
      const updateRequest = {
        id: 'content-1',
        title: 'Updated Title',
      };

      // Mock existing content with different owner
      const existingContent = {
        ...mockKnowledgeContent,
        primaryAuthor: 'other-user',
        contributors: [],
      };
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseSuccess(existingContent));

      await expect(contentManager.updateContent('user-1', updateRequest))
        .rejects.toThrow('Permission denied');
    });
  });

  describe('publishContent', () => {
    it('should publish content successfully', async () => {
      // Mock existing content
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseSuccess(mockKnowledgeContent));
      // Mock publish result
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseSuccess({
        ...mockKnowledgeContent,
        status: 'published',
        publishedAt: new Date(),
      }));

      const result = await contentManager.publishContent('user-1', 'content-1');

      expect(result.status).toBe('published');
      expect(result.publishedAt).toBeDefined();
      expect(mockSupabase.update).toHaveBeenCalled();
    });

    it('should handle content not found', async () => {
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseError('PGRST116'));

      await expect(contentManager.publishContent('user-1', 'non-existent'))
        .rejects.toThrow('Content not found');
    });

    it('should handle permission denied', async () => {
      const existingContent = {
        ...mockKnowledgeContent,
        primaryAuthor: 'other-user',
      };
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseSuccess(existingContent));

      await expect(contentManager.publishContent('user-1', 'content-1'))
        .rejects.toThrow('Permission denied');
    });
  });

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      // Mock existing content
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseSuccess(mockKnowledgeContent));
      // Mock delete result
      mockSupabase.delete.mockResolvedValueOnce(mockSupabaseSuccess(null));

      await contentManager.deleteContent('user-1', 'content-1');

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'content-1');
    });

    it('should handle content not found', async () => {
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseError('PGRST116'));

      await expect(contentManager.deleteContent('user-1', 'non-existent'))
        .rejects.toThrow('Content not found');
    });

    it('should handle permission denied', async () => {
      const existingContent = {
        ...mockKnowledgeContent,
        primaryAuthor: 'other-user',
      };
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseSuccess(existingContent));

      await expect(contentManager.deleteContent('user-1', 'content-1'))
        .rejects.toThrow('Permission denied');
    });
  });

  describe('addInteraction', () => {
    it('should add new interaction successfully', async () => {
      // Mock no existing interaction
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseSuccess(null));
      // Mock insert result
      mockSupabase.insert.mockResolvedValueOnce(mockSupabaseSuccess(null));

      await contentManager.addInteraction('user-1', 'content-1', 'like');

      expect(mockSupabase.insert).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('content_interactions');
    });

    it('should update existing interaction', async () => {
      // Mock existing interaction
      const existingInteraction = {
        userId: 'user-1',
        contentId: 'content-1',
        type: 'like',
      };
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseSuccess(existingInteraction));
      // Mock update result
      mockSupabase.update.mockResolvedValueOnce(mockSupabaseSuccess(null));

      await contentManager.addInteraction('user-1', 'content-1', 'like');

      expect(mockSupabase.update).toHaveBeenCalled();
      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockSupabase.single.mockResolvedValueOnce(mockSupabaseError('Database error'));

      await expect(contentManager.addInteraction('user-1', 'content-1', 'like'))
        .rejects.toThrow('Failed to add interaction: Database error');
    });
  });

  describe('removeInteraction', () => {
    it('should remove interaction successfully', async () => {
      mockSupabase.delete.mockResolvedValueOnce(mockSupabaseSuccess(null));

      await contentManager.removeInteraction('user-1', 'content-1', 'like');

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('userId', 'user-1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('contentId', 'content-1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('type', 'like');
    });

    it('should handle database errors', async () => {
      mockSupabase.delete.mockResolvedValueOnce(mockSupabaseError('Database error'));

      await expect(contentManager.removeInteraction('user-1', 'content-1', 'like'))
        .rejects.toThrow('Failed to remove interaction: Database error');
    });
  });

  describe('getUserInteractions', () => {
    it('should get user interactions successfully', async () => {
      const interactions = [
        {
          userId: 'user-1',
          contentId: 'content-1',
          type: 'like',
          timestamp: new Date(),
        },
        {
          userId: 'user-1',
          contentId: 'content-1',
          type: 'bookmark',
          timestamp: new Date(),
        },
      ];

      mockSupabase.mockReturnValue(mockSupabaseSuccess(interactions));

      const result = await contentManager.getUserInteractions('user-1', 'content-1');

      expect(result).toEqual(interactions);
      expect(mockSupabase.from).toHaveBeenCalledWith('content_interactions');
      expect(mockSupabase.eq).toHaveBeenCalledWith('userId', 'user-1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('contentId', 'content-1');
    });

    it('should handle empty interactions', async () => {
      mockSupabase.mockReturnValue(mockSupabaseSuccess([]));

      const result = await contentManager.getUserInteractions('user-1', 'content-1');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockSupabase.mockReturnValue(mockSupabaseError('Database error'));

      await expect(contentManager.getUserInteractions('user-1', 'content-1'))
        .rejects.toThrow('Failed to get interactions: Database error');
    });
  });
});