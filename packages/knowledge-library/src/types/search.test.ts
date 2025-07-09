import { describe, it, expect } from 'vitest';
import {
  SearchFilters,
  SearchSort,
  SearchQuery,
  SearchResultItem,
  SearchAggregation,
  SearchResult,
  SearchSuggestion,
  SearchAnalytics,
  PopularSearch,
  SearchDocument,
  type SearchFiltersType,
  type SearchSortType,
  type SearchQueryType,
  type SearchResultItemType,
  type SearchAggregationType,
  type SearchResultType,
  type SearchSuggestionType,
  type SearchAnalyticsType,
  type PopularSearchType,
  type SearchDocumentType,
} from './search';

describe('Search Type Schemas', () => {
  describe('SearchFilters', () => {
    it('should validate valid search filters', () => {
      const validFilters: SearchFiltersType = {
        types: ['article', 'video'],
        categories: ['knowledge_commons', 'education_learning'],
        levels: ['beginner', 'intermediate'],
        languages: ['en', 'hi'],
        status: ['published'],
        authors: ['author-1', 'author-2'],
        verifiedAuthors: true,
        tags: ['test', 'knowledge'],
        topics: ['testing', 'education'],
        keywords: ['test', 'tutorial'],
        location: 'Mumbai',
        locationRadius: 50,
        minRating: 4.0,
        isVerified: true,
        minQualityScore: 80,
        publishedAfter: new Date('2024-01-01'),
        publishedBefore: new Date('2024-12-31'),
        updatedAfter: new Date('2024-01-01'),
        updatedBefore: new Date('2024-12-31'),
        minViews: 100,
        minLikes: 10,
        minBookmarks: 5,
        minComments: 2,
        maxReadTime: 30,
        minReadTime: 5,
        hasAssessment: true,
        hasCertification: false,
        accessibilityFeatures: ['alt_text', 'captions'],
        hasVideo: true,
        hasAudio: false,
        hasImages: true,
        hasDocuments: false,
        hasDownloads: true,
        appId: 'app-1',
        organizationId: 'org-1',
        isInteractive: true,
        allowComments: true,
        allowRatings: true,
      };

      expect(() => SearchFilters.parse(validFilters)).not.toThrow();
    });

    it('should validate with minimal filters', () => {
      const minimalFilters: SearchFiltersType = {
        types: ['article'],
      };

      expect(() => SearchFilters.parse(minimalFilters)).not.toThrow();
    });

    it('should validate empty filters', () => {
      const emptyFilters: SearchFiltersType = {};

      expect(() => SearchFilters.parse(emptyFilters)).not.toThrow();
    });

    it('should validate rating range', () => {
      const invalidFilter = {
        minRating: 6, // Invalid: above 5
      };

      expect(() => SearchFilters.parse(invalidFilter)).toThrow();
    });

    it('should validate quality score range', () => {
      const invalidFilter = {
        minQualityScore: 120, // Invalid: above 100
      };

      expect(() => SearchFilters.parse(invalidFilter)).toThrow();
    });
  });

  describe('SearchSort', () => {
    it('should validate valid sort options', () => {
      const validSorts: SearchSortType[] = [
        'relevance',
        'newest',
        'oldest',
        'most_viewed',
        'most_liked',
        'most_bookmarked',
        'most_commented',
        'highest_rated',
        'recently_updated',
        'alphabetical',
        'read_time_asc',
        'read_time_desc',
        'quality_score',
        'trending',
        'recommended',
      ];

      validSorts.forEach(sort => {
        expect(() => SearchSort.parse(sort)).not.toThrow();
      });
    });

    it('should reject invalid sort options', () => {
      const invalidSorts = ['popularity', 'most_recent', 'best_match'];

      invalidSorts.forEach(sort => {
        expect(() => SearchSort.parse(sort)).toThrow();
      });
    });
  });

  describe('SearchQuery', () => {
    it('should validate valid search query', () => {
      const validQuery: SearchQueryType = {
        query: 'knowledge management',
        filters: {
          types: ['article'],
          categories: ['knowledge_commons'],
          minRating: 4.0,
        },
        sort: 'relevance',
        page: 1,
        limit: 20,
        fuzzy: true,
        exactMatch: false,
        includeArchived: false,
        userId: 'user-1',
        userLocation: 'Mumbai',
        userPreferences: {
          preferredLanguages: ['en', 'hi'],
        },
        searchFields: ['title', 'description', 'content'],
        includeAggregations: true,
      };

      expect(() => SearchQuery.parse(validQuery)).not.toThrow();
    });

    it('should validate with minimal query', () => {
      const minimalQuery: SearchQueryType = {};

      expect(() => SearchQuery.parse(minimalQuery)).not.toThrow();
    });

    it('should validate with defaults', () => {
      const query = {};
      const parsed = SearchQuery.parse(query);

      expect(parsed.sort).toBe('relevance');
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(20);
      expect(parsed.fuzzy).toBe(true);
      expect(parsed.exactMatch).toBe(false);
      expect(parsed.includeArchived).toBe(false);
      expect(parsed.searchFields).toEqual(['all']);
      expect(parsed.includeAggregations).toBe(false);
    });

    it('should validate page and limit constraints', () => {
      const invalidQuery = {
        page: 0, // Invalid: below 1
        limit: 200, // Invalid: above 100
      };

      expect(() => SearchQuery.parse(invalidQuery)).toThrow();
    });

    it('should validate search fields', () => {
      const validFields = ['title', 'description', 'content', 'tags', 'keywords', 'topics', 'author', 'all'];

      validFields.forEach(field => {
        const query = {
          searchFields: [field],
        };

        expect(() => SearchQuery.parse(query)).not.toThrow();
      });
    });
  });

  describe('SearchResultItem', () => {
    it('should validate valid search result item', () => {
      const validItem: SearchResultItemType = {
        id: 'content-1',
        title: 'Test Knowledge Content',
        slug: 'test-knowledge-content',
        description: 'A test knowledge content item',
        excerpt: 'A test knowledge content item excerpt',
        type: 'article',
        level: 'beginner',
        category: 'knowledge_commons',
        language: 'en',
        
        primaryAuthor: {
          id: 'author-1',
          name: 'Test Author',
          avatar: 'https://example.com/avatar.jpg',
          verified: true,
        },
        
        tags: ['test', 'knowledge'],
        topics: ['testing', 'education'],
        location: 'Mumbai',
        
        featuredImage: 'https://example.com/featured.jpg',
        hasVideo: false,
        hasAudio: false,
        hasDocuments: false,
        
        viewCount: 100,
        likeCount: 10,
        bookmarkCount: 5,
        commentCount: 2,
        averageRating: 4.5,
        ratingCount: 8,
        
        estimatedReadTime: 5,
        hasAssessment: false,
        skillsGained: ['testing', 'knowledge-management'],
        
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        
        isVerified: true,
        qualityScore: 85,
        
        score: 0.8,
        highlights: {
          title: ['Test Knowledge Content'],
          description: ['test knowledge content'],
        },
        
        isBookmarked: false,
        isLiked: false,
        progress: 75,
        isCompleted: false,
      };

      expect(() => SearchResultItem.parse(validItem)).not.toThrow();
    });

    it('should validate with minimal fields', () => {
      const minimalItem: SearchResultItemType = {
        id: 'content-1',
        title: 'Test Content',
        slug: 'test-content',
        description: 'A test content item',
        type: 'article',
        level: 'beginner',
        category: 'knowledge_commons',
        language: 'en',
        
        primaryAuthor: {
          id: 'author-1',
          name: 'Test Author',
          verified: false,
        },
        
        tags: [],
        topics: [],
        
        hasVideo: false,
        hasAudio: false,
        hasDocuments: false,
        
        viewCount: 0,
        likeCount: 0,
        bookmarkCount: 0,
        commentCount: 0,
        averageRating: 0,
        ratingCount: 0,
        
        hasAssessment: false,
        
        createdAt: new Date(),
        updatedAt: new Date(),
        
        isVerified: false,
      };

      expect(() => SearchResultItem.parse(minimalItem)).not.toThrow();
    });

    it('should validate rating range', () => {
      const validItem = {
        id: 'content-1',
        title: 'Test Content',
        slug: 'test-content',
        description: 'A test content item',
        type: 'article',
        level: 'beginner',
        category: 'knowledge_commons',
        language: 'en',
        primaryAuthor: {
          id: 'author-1',
          name: 'Test Author',
          verified: false,
        },
        tags: [],
        topics: [],
        hasVideo: false,
        hasAudio: false,
        hasDocuments: false,
        viewCount: 0,
        likeCount: 0,
        bookmarkCount: 0,
        commentCount: 0,
        averageRating: 4.5, // Valid rating
        ratingCount: 0,
        hasAssessment: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false,
      };

      expect(() => SearchResultItem.parse(validItem)).not.toThrow();
    });
  });

  describe('SearchAggregation', () => {
    it('should validate valid aggregation', () => {
      const validAggregation: SearchAggregationType = {
        field: 'category',
        buckets: [
          { key: 'knowledge_commons', count: 25, label: 'Knowledge Commons' },
          { key: 'education_learning', count: 15, label: 'Education & Learning' },
          { key: 'health_wellbeing', count: 10 },
        ],
      };

      expect(() => SearchAggregation.parse(validAggregation)).not.toThrow();
    });

    it('should require field and buckets', () => {
      const invalidAggregation = {
        field: 'category',
        // Missing buckets
      };

      expect(() => SearchAggregation.parse(invalidAggregation)).toThrow();
    });
  });

  describe('SearchResult', () => {
    it('should validate valid search result', () => {
      const validResult: SearchResultType = {
        items: [{
          id: 'content-1',
          title: 'Test Content',
          slug: 'test-content',
          description: 'A test content item',
          type: 'article',
          level: 'beginner',
          category: 'knowledge_commons',
          language: 'en',
          primaryAuthor: {
            id: 'author-1',
            name: 'Test Author',
            verified: false,
          },
          tags: [],
          topics: [],
          hasVideo: false,
          hasAudio: false,
          hasDocuments: false,
          viewCount: 0,
          likeCount: 0,
          bookmarkCount: 0,
          commentCount: 0,
          averageRating: 0,
          ratingCount: 0,
          hasAssessment: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          isVerified: false,
        }],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        limit: 20,
        query: 'test',
        searchTime: 50,
        aggregations: [{
          field: 'category',
          buckets: [
            { key: 'knowledge_commons', count: 1 },
          ],
        }],
        suggestions: ['testing', 'knowledge'],
        didYouMean: 'test content',
        relatedSearches: ['test knowledge', 'content management'],
        facets: {
          category: {
            values: [
              { value: 'knowledge_commons', count: 1, selected: false },
            ],
            type: 'checkbox',
          },
        },
      };

      expect(() => SearchResult.parse(validResult)).not.toThrow();
    });

    it('should validate with minimal result', () => {
      const minimalResult: SearchResultType = {
        items: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 20,
        searchTime: 10,
      };

      expect(() => SearchResult.parse(minimalResult)).not.toThrow();
    });

    it('should validate facet types', () => {
      const validFacetTypes = ['checkbox', 'radio', 'range', 'date'];

      validFacetTypes.forEach(type => {
        const result = {
          items: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          limit: 20,
          searchTime: 10,
          facets: {
            test: {
              values: [{ value: 'test', count: 1, selected: false }],
              type,
            },
          },
        };

        expect(() => SearchResult.parse(result)).not.toThrow();
      });
    });
  });

  describe('SearchSuggestion', () => {
    it('should validate valid suggestion', () => {
      const validSuggestion: SearchSuggestionType = {
        text: 'knowledge management',
        type: 'query',
        score: 0.8,
        category: 'popular',
      };

      expect(() => SearchSuggestion.parse(validSuggestion)).not.toThrow();
    });

    it('should validate suggestion types', () => {
      const validTypes = ['query', 'tag', 'topic', 'author', 'title'];

      validTypes.forEach(type => {
        const suggestion = {
          text: 'test',
          type,
          score: 0.5,
        };

        expect(() => SearchSuggestion.parse(suggestion)).not.toThrow();
      });
    });
  });

  describe('SearchAnalytics', () => {
    it('should validate valid search analytics', () => {
      const validAnalytics: SearchAnalyticsType = {
        query: 'knowledge management',
        userId: 'user-1',
        resultsCount: 25,
        clickedResults: ['content-1', 'content-2'],
        searchTime: 150,
        filters: {
          types: ['article'],
          categories: ['knowledge_commons'],
        },
        sort: 'relevance',
        timestamp: new Date(),
        sessionId: 'session-1',
      };

      expect(() => SearchAnalytics.parse(validAnalytics)).not.toThrow();
    });

    it('should validate with minimal analytics', () => {
      const minimalAnalytics: SearchAnalyticsType = {
        query: 'test',
        resultsCount: 0,
        searchTime: 50,
        sort: 'relevance',
        timestamp: new Date(),
      };

      expect(() => SearchAnalytics.parse(minimalAnalytics)).not.toThrow();
    });
  });

  describe('PopularSearch', () => {
    it('should validate valid popular search', () => {
      const validPopular: PopularSearchType = {
        query: 'knowledge management',
        count: 150,
        category: 'knowledge_commons',
        timeframe: 'week',
        trending: true,
      };

      expect(() => PopularSearch.parse(validPopular)).not.toThrow();
    });

    it('should validate timeframe options', () => {
      const validTimeframes = ['hour', 'day', 'week', 'month', 'year'];

      validTimeframes.forEach(timeframe => {
        const popular = {
          query: 'test',
          count: 10,
          timeframe,
          trending: false,
        };

        expect(() => PopularSearch.parse(popular)).not.toThrow();
      });
    });
  });

  describe('SearchDocument', () => {
    it('should validate valid search document', () => {
      const validDocument: SearchDocumentType = {
        id: 'content-1',
        title: 'Test Knowledge Content',
        description: 'A test knowledge content item',
        content: 'This is the full content of the test item.',
        type: 'article',
        category: 'knowledge_commons',
        level: 'beginner',
        language: 'en',
        tags: ['test', 'knowledge'],
        keywords: ['test', 'knowledge', 'content'],
        topics: ['testing', 'education'],
        authorName: 'Test Author',
        authorId: 'author-1',
        location: 'Mumbai',
        publishedAt: new Date(),
        updatedAt: new Date(),
        viewCount: 100,
        likeCount: 10,
        averageRating: 4.5,
        qualityScore: 85,
        isVerified: true,
        estimatedReadTime: 5,
        hasAssessment: false,
        hasVideo: false,
        hasAudio: false,
        hasDocuments: false,
        skillsGained: ['testing', 'knowledge-management'],
        culturalContext: 'Indian education system',
        appId: 'app-1',
        organizationId: 'org-1',
      };

      expect(() => SearchDocument.parse(validDocument)).not.toThrow();
    });

    it('should validate with minimal document', () => {
      const minimalDocument: SearchDocumentType = {
        id: 'content-1',
        title: 'Test Content',
        description: 'A test content item',
        content: 'Test content body',
        type: 'article',
        category: 'knowledge_commons',
        level: 'beginner',
        language: 'en',
        tags: [],
        keywords: [],
        topics: [],
        authorName: 'Test Author',
        authorId: 'author-1',
        publishedAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        likeCount: 0,
        averageRating: 0,
        isVerified: false,
        hasAssessment: false,
        hasVideo: false,
        hasAudio: false,
        hasDocuments: false,
      };

      expect(() => SearchDocument.parse(minimalDocument)).not.toThrow();
    });
  });
});