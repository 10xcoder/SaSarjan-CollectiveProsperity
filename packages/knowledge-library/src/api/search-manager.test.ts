import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchManager } from './search-manager';
import { 
  createMockSupabaseClient, 
  mockSearchResult, 
  mockSupabaseSuccess, 
  mockSupabaseError,
  mockFuseResults,
  mockUserProfile
} from '../test/mocks';

// Mock dependencies
vi.mock('@sasarjan/database', () => ({
  createSupabaseClient: vi.fn(),
}));

vi.mock('fuse.js', () => ({
  default: vi.fn(),
}));

vi.mock('./analytics-tracker', () => ({
  AnalyticsTracker: {
    getInstance: vi.fn(() => ({
      trackSearchEvent: vi.fn(),
    })),
  },
}));

describe('SearchManager', () => {
  let searchManager: SearchManager;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
  let mockFuse: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock supabase client
    mockSupabase = createMockSupabaseClient();
    vi.mocked(vi.importActual('@sasarjan/database')).createSupabaseClient = vi.fn(() => mockSupabase);
    
    // Setup mock Fuse
    mockFuse = {
      search: vi.fn(),
    };
    vi.mocked(vi.importActual('fuse.js')).default = vi.fn(() => mockFuse);
    
    // Setup mock analytics
    const mockAnalytics = {
      trackSearchEvent: vi.fn(),
    };
    vi.mocked(vi.importActual('./analytics-tracker')).AnalyticsTracker.getInstance = vi.fn(() => mockAnalytics);
    
    searchManager = new SearchManager();
  });

  describe('search', () => {
    it('should perform text search successfully', async () => {
      const query = {
        query: 'knowledge management',
        page: 1,
        limit: 20,
        sort: 'relevance' as const,
      };

      // Mock search index build
      mockSupabase.mockReturnValue(mockSupabaseSuccess([
        {
          id: 'content-1',
          title: 'Knowledge Management',
          description: 'Test content',
          content: 'Content body',
          type: 'article',
          category: 'knowledge_commons',
          level: 'beginner',
          language: 'en',
          status: 'published',
          visibility: 'public',
          primaryAuthor: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          publishedAt: '2024-01-01',
          tags: ['knowledge'],
          keywords: ['knowledge'],
          topics: ['management'],
          viewCount: 100,
          likeCount: 10,
          averageRating: 4.5,
          isVerified: true,
          hasAssessment: false,
          media: [],
          skillsGained: [],
        }
      ]));

      // Mock Fuse search
      mockFuse.search.mockReturnValue(mockFuseResults);

      const result = await searchManager.search(query);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('searchTime');
      expect(result.items).toBeInstanceOf(Array);
      expect(mockFuse.search).toHaveBeenCalledWith(query.query, expect.any(Object));
    });

    it('should perform filter-only search successfully', async () => {
      const query = {
        filters: {
          types: ['article'],
          categories: ['knowledge_commons'],
        },
        page: 1,
        limit: 20,
        sort: 'newest' as const,
      };

      mockSupabase.mockReturnValue(mockSupabaseSuccess([
        {
          id: 'content-1',
          title: 'Test Article',
          description: 'Test description',
          content: 'Test content',
          type: 'article',
          category: 'knowledge_commons',
          level: 'beginner',
          language: 'en',
          status: 'published',
          visibility: 'public',
          primaryAuthor: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          publishedAt: '2024-01-01',
          tags: [],
          keywords: [],
          topics: [],
          viewCount: 0,
          likeCount: 0,
          averageRating: 0,
          isVerified: false,
          hasAssessment: false,
          media: [],
          skillsGained: [],
        }
      ], 1));

      const result = await searchManager.search(query);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('totalCount');
      expect(result.items).toHaveLength(1);
      expect(result.totalCount).toBe(1);
    });

    it('should handle empty search results', async () => {
      const query = {
        query: 'nonexistent',
        page: 1,
        limit: 20,
        sort: 'relevance' as const,
      };

      mockSupabase.mockReturnValue(mockSupabaseSuccess([]));
      mockFuse.search.mockReturnValue([]);

      const result = await searchManager.search(query);

      expect(result.items).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should handle search errors gracefully', async () => {
      const query = {
        query: 'test',
        page: 1,
        limit: 20,
        sort: 'relevance' as const,
      };

      mockSupabase.mockReturnValue(mockSupabaseError('Database error'));

      await expect(searchManager.search(query)).rejects.toThrow('Search failed');
    });

    it('should add user context when user ID provided', async () => {
      const query = {
        query: 'test',
        page: 1,
        limit: 20,
        sort: 'relevance' as const,
      };

      mockSupabase.mockReturnValue(mockSupabaseSuccess([
        {
          id: 'content-1',
          title: 'Test',
          description: 'Test',
          content: 'Test',
          type: 'article',
          category: 'knowledge_commons',
          level: 'beginner',
          language: 'en',
          status: 'published',
          visibility: 'public',
          primaryAuthor: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          publishedAt: '2024-01-01',
          tags: [],
          keywords: [],
          topics: [],
          viewCount: 0,
          likeCount: 0,
          averageRating: 0,
          isVerified: false,
          hasAssessment: false,
          media: [],
          skillsGained: [],
        }
      ], 1));

      mockFuse.search.mockReturnValue(mockFuseResults);

      const result = await searchManager.search(query, 'user-1');

      expect(result).toHaveProperty('items');
      expect(result.items).toHaveLength(1);
    });
  });

  describe('getSuggestions', () => {
    it('should get search suggestions', async () => {
      const query = 'knowledge';
      
      // Mock popular searches
      mockSupabase.mockReturnValue(mockSupabaseSuccess([
        { query: 'knowledge management', count: 100 },
        { query: 'knowledge sharing', count: 50 },
      ]));

      const suggestions = await searchManager.getSuggestions(query);

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('text');
      expect(suggestions[0]).toHaveProperty('type');
      expect(suggestions[0]).toHaveProperty('score');
    });

    it('should handle empty suggestions', async () => {
      const query = 'nonexistent';
      
      mockSupabase.mockReturnValue(mockSupabaseSuccess([]));

      const suggestions = await searchManager.getSuggestions(query);

      expect(suggestions).toBeInstanceOf(Array);
      // Should return empty array but not throw error
    });

    it('should handle database errors gracefully', async () => {
      const query = 'test';
      
      mockSupabase.mockReturnValue(mockSupabaseError('Database error'));

      const suggestions = await searchManager.getSuggestions(query);

      expect(suggestions).toEqual([]);
    });
  });

  describe('getPopularSearches', () => {
    it('should get popular searches', async () => {
      const popularSearches = [
        { query: 'knowledge management', count: 100, timeframe: 'week', trending: false },
        { query: 'education', count: 50, timeframe: 'week', trending: false },
      ];

      mockSupabase.mockReturnValue(mockSupabaseSuccess(popularSearches));

      const result = await searchManager.getPopularSearches('week', 10);

      expect(result).toEqual(popularSearches);
      expect(mockSupabase.from).toHaveBeenCalledWith('popular_searches');
      expect(mockSupabase.eq).toHaveBeenCalledWith('timeframe', 'week');
      expect(mockSupabase.limit).toHaveBeenCalledWith(10);
    });

    it('should handle empty popular searches', async () => {
      mockSupabase.mockReturnValue(mockSupabaseSuccess([]));

      const result = await searchManager.getPopularSearches();

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.mockReturnValue(mockSupabaseError('Database error'));

      const result = await searchManager.getPopularSearches();

      expect(result).toEqual([]);
    });
  });

  describe('getTrendingSearches', () => {
    it('should get trending searches', async () => {
      const trendingSearches = [
        { query: 'AI learning', count: 500, timeframe: 'day', trending: true },
        { query: 'sustainable living', count: 300, timeframe: 'week', trending: true },
      ];

      mockSupabase.mockReturnValue(mockSupabaseSuccess(trendingSearches));

      const result = await searchManager.getTrendingSearches(10);

      expect(result).toEqual(trendingSearches);
      expect(mockSupabase.from).toHaveBeenCalledWith('popular_searches');
      expect(mockSupabase.eq).toHaveBeenCalledWith('trending', true);
      expect(mockSupabase.limit).toHaveBeenCalledWith(10);
    });

    it('should handle empty trending searches', async () => {
      mockSupabase.mockReturnValue(mockSupabaseSuccess([]));

      const result = await searchManager.getTrendingSearches();

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.mockReturnValue(mockSupabaseError('Database error'));

      const result = await searchManager.getTrendingSearches();

      expect(result).toEqual([]);
    });
  });

  describe('search query processing', () => {
    it('should apply default values to search query', async () => {
      const query = {};

      mockSupabase.mockReturnValue(mockSupabaseSuccess([]));

      const result = await searchManager.search(query);

      expect(result).toHaveProperty('currentPage');
      expect(result).toHaveProperty('limit');
      expect(result.currentPage).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should handle pagination correctly', async () => {
      const query = {
        page: 2,
        limit: 10,
      };

      mockSupabase.mockReturnValue(mockSupabaseSuccess([], 25));

      const result = await searchManager.search(query);

      expect(result.currentPage).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3); // 25 / 10 = 2.5, rounded up to 3
    });

    it('should handle various sort options', async () => {
      const sortOptions = ['newest', 'oldest', 'most_viewed', 'most_liked', 'highest_rated'];

      for (const sort of sortOptions) {
        const query = {
          sort: sort as any,
          page: 1,
          limit: 20,
        };

        mockSupabase.mockReturnValue(mockSupabaseSuccess([]));

        const result = await searchManager.search(query);

        expect(result).toHaveProperty('items');
        expect(result).toHaveProperty('totalCount');
      }
    });

    it('should handle complex filters', async () => {
      const query = {
        filters: {
          types: ['article', 'video'],
          categories: ['knowledge_commons', 'education_learning'],
          levels: ['beginner', 'intermediate'],
          languages: ['en', 'hi'],
          minRating: 4.0,
          isVerified: true,
          tags: ['knowledge', 'education'],
          publishedAfter: new Date('2024-01-01'),
          publishedBefore: new Date('2024-12-31'),
        },
        page: 1,
        limit: 20,
      };

      mockSupabase.mockReturnValue(mockSupabaseSuccess([]));

      const result = await searchManager.search(query);

      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('totalCount');
      
      // Verify filters were applied
      expect(mockSupabase.in).toHaveBeenCalledWith('type', ['article', 'video']);
      expect(mockSupabase.in).toHaveBeenCalledWith('category', ['knowledge_commons', 'education_learning']);
      expect(mockSupabase.gte).toHaveBeenCalledWith('averageRating', 4.0);
      expect(mockSupabase.eq).toHaveBeenCalledWith('isVerified', true);
      expect(mockSupabase.overlaps).toHaveBeenCalledWith('tags', ['knowledge', 'education']);
    });
  });

  describe('search index management', () => {
    it('should build search index when needed', async () => {
      const query = {
        query: 'test',
        page: 1,
        limit: 20,
        sort: 'relevance' as const,
      };

      // Mock index build
      mockSupabase.mockReturnValue(mockSupabaseSuccess([
        {
          id: 'content-1',
          title: 'Test',
          description: 'Test',
          content: 'Test',
          type: 'article',
          category: 'knowledge_commons',
          level: 'beginner',
          language: 'en',
          status: 'published',
          visibility: 'public',
          primaryAuthor: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          publishedAt: '2024-01-01',
          tags: [],
          keywords: [],
          topics: [],
          viewCount: 0,
          likeCount: 0,
          averageRating: 0,
          isVerified: false,
          hasAssessment: false,
          media: [],
          skillsGained: [],
        }
      ]));

      mockFuse.search.mockReturnValue(mockFuseResults);

      const result = await searchManager.search(query);

      expect(result).toHaveProperty('items');
      expect(vi.mocked(vi.importActual('fuse.js')).default).toHaveBeenCalled();
    });

    it('should handle search index errors', async () => {
      const query = {
        query: 'test',
        page: 1,
        limit: 20,
        sort: 'relevance' as const,
      };

      mockSupabase.mockReturnValue(mockSupabaseError('Database error'));

      await expect(searchManager.search(query)).rejects.toThrow('Search failed');
    });
  });
});