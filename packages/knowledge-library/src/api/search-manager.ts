import { createSupabaseClient } from '@sasarjan/database';
import Fuse from 'fuse.js';
import {
  SearchQueryType,
  SearchResultType,
  SearchResultItemType,
  SearchFiltersType,
  SearchSortType,
  SearchDocumentType,
  SearchSuggestionType,
  SearchAnalyticsType,
  PopularSearchType,
  KnowledgeContentType,
} from '../types';
import { AnalyticsTracker } from './analytics-tracker';

export class SearchManager {
  private supabase = createSupabaseClient();
  private analytics = new AnalyticsTracker();
  private searchIndex: Fuse<SearchDocumentType> | null = null;
  private indexLastUpdated: Date | null = null;
  private readonly INDEX_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
   * Search for content
   */
  async search(query: SearchQueryType, userId?: string): Promise<SearchResultType> {
    const startTime = Date.now();
    
    try {
      let result: SearchResultType;

      if (query.query && query.query.trim()) {
        // Text-based search
        result = await this.textSearch(query);
      } else {
        // Filter-only search
        result = await this.filterSearch(query);
      }

      // Add user-specific context
      if (userId) {
        result = await this.addUserContext(result, userId);
      }

      // Track search analytics
      const searchTime = Date.now() - startTime;
      await this.trackSearch(query, result.totalCount, searchTime, userId);

      result.searchTime = searchTime;
      return result;
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, limit: number = 10): Promise<SearchSuggestionType[]> {
    try {
      const suggestions: SearchSuggestionType[] = [];

      // Query suggestions from popular searches
      const { data: popularSearches } = await this.supabase
        .from('popular_searches')
        .select('*')
        .ilike('query', `%${query}%`)
        .order('count', { ascending: false })
        .limit(limit);

      if (popularSearches) {
        suggestions.push(...popularSearches.map(search => ({
          text: search.query,
          type: 'query' as const,
          score: search.count,
        })));
      }

      // Tag suggestions
      const { data: tags } = await this.supabase
        .from('knowledge_content')
        .select('tags')
        .textSearch('tags', query)
        .limit(20);

      if (tags) {
        const tagSuggestions = new Set<string>();
        tags.forEach(item => {
          if (item.tags) {
            item.tags.forEach((tag: string) => {
              if (tag.toLowerCase().includes(query.toLowerCase())) {
                tagSuggestions.add(tag);
              }
            });
          }
        });

        Array.from(tagSuggestions).slice(0, 5).forEach(tag => {
          suggestions.push({
            text: tag,
            type: 'tag',
            score: 1,
            category: 'tag',
          });
        });
      }

      // Topic suggestions
      const { data: topics } = await this.supabase
        .from('knowledge_content')
        .select('topics')
        .textSearch('topics', query)
        .limit(20);

      if (topics) {
        const topicSuggestions = new Set<string>();
        topics.forEach(item => {
          if (item.topics) {
            item.topics.forEach((topic: string) => {
              if (topic.toLowerCase().includes(query.toLowerCase())) {
                topicSuggestions.add(topic);
              }
            });
          }
        });

        Array.from(topicSuggestions).slice(0, 5).forEach(topic => {
          suggestions.push({
            text: topic,
            type: 'topic',
            score: 1,
            category: 'topic',
          });
        });
      }

      // Author suggestions
      const { data: authors } = await this.supabase
        .from('user_profiles')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (authors) {
        authors.forEach(author => {
          suggestions.push({
            text: author.name,
            type: 'author',
            score: 1,
            category: 'author',
          });
        });
      }

      // Sort by score and relevance
      return suggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(
    timeframe: 'hour' | 'day' | 'week' | 'month' = 'week',
    limit: number = 10
  ): Promise<PopularSearchType[]> {
    try {
      const { data, error } = await this.supabase
        .from('popular_searches')
        .select('*')
        .eq('timeframe', timeframe)
        .order('count', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get popular searches: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get popular searches:', error);
      return [];
    }
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(limit: number = 10): Promise<PopularSearchType[]> {
    try {
      const { data, error } = await this.supabase
        .from('popular_searches')
        .select('*')
        .eq('trending', true)
        .order('count', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get trending searches: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get trending searches:', error);
      return [];
    }
  }

  /**
   * Text-based search using Fuse.js
   */
  private async textSearch(query: SearchQueryType): Promise<SearchResultType> {
    // Ensure search index is up to date
    await this.ensureSearchIndex();

    if (!this.searchIndex) {
      throw new Error('Search index not available');
    }

    // Configure search options
    const searchOptions = {
      includeScore: true,
      includeMatches: true,
      threshold: query.fuzzy ? 0.6 : 0.2,
      ignoreLocation: true,
      keys: this.getSearchFields(query.searchFields),
    };

    // Perform search
    const fuseResults = this.searchIndex.search(query.query!, searchOptions);

    // Convert to content IDs and scores
    const contentIds = fuseResults.map(result => ({
      id: result.item.id,
      score: result.score || 0,
      matches: result.matches,
    }));

    if (contentIds.length === 0) {
      return {
        items: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: query.page,
        limit: query.limit,
        query: query.query,
        searchTime: 0,
      };
    }

    // Get full content data from database with filters
    let dbQuery = this.supabase
      .from('knowledge_content')
      .select('*', { count: 'exact' })
      .in('id', contentIds.map(c => c.id));

    // Apply filters
    dbQuery = this.applyFilters(dbQuery, query.filters);

    // Apply sorting (relevance is default for text search)
    if (query.sort !== 'relevance') {
      dbQuery = this.applySorting(dbQuery, query.sort);
    }

    // Get results
    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    // Sort by relevance if using relevance sort
    let sortedData = data || [];
    if (query.sort === 'relevance') {
      const scoreMap = new Map(contentIds.map(c => [c.id, c.score]));
      sortedData = sortedData.sort((a, b) => {
        const scoreA = scoreMap.get(a.id) || 1;
        const scoreB = scoreMap.get(b.id) || 1;
        return scoreA - scoreB; // Lower score = better match
      });
    }

    // Apply pagination
    const startIndex = (query.page - 1) * query.limit;
    const paginatedData = sortedData.slice(startIndex, startIndex + query.limit);

    // Convert to search result items
    const items = await this.convertToSearchResults(paginatedData, contentIds);

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / query.limit);

    return {
      items,
      totalCount,
      totalPages,
      currentPage: query.page,
      limit: query.limit,
      query: query.query,
      searchTime: 0,
    };
  }

  /**
   * Filter-only search
   */
  private async filterSearch(query: SearchQueryType): Promise<SearchResultType> {
    let dbQuery = this.supabase
      .from('knowledge_content')
      .select('*', { count: 'exact' });

    // Apply filters
    dbQuery = this.applyFilters(dbQuery, query.filters);

    // Apply sorting
    dbQuery = this.applySorting(dbQuery, query.sort);

    // Apply pagination
    const startIndex = (query.page - 1) * query.limit;
    dbQuery = dbQuery.range(startIndex, startIndex + query.limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    const items = await this.convertToSearchResults(data || []);
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / query.limit);

    return {
      items,
      totalCount,
      totalPages,
      currentPage: query.page,
      limit: query.limit,
      searchTime: 0,
    };
  }

  /**
   * Apply filters to database query
   */
  private applyFilters(dbQuery: any, filters?: SearchFiltersType): any {
    if (!filters) return dbQuery;

    if (filters.types && filters.types.length > 0) {
      dbQuery = dbQuery.in('type', filters.types);
    }

    if (filters.categories && filters.categories.length > 0) {
      dbQuery = dbQuery.in('category', filters.categories);
    }

    if (filters.levels && filters.levels.length > 0) {
      dbQuery = dbQuery.in('level', filters.levels);
    }

    if (filters.languages && filters.languages.length > 0) {
      dbQuery = dbQuery.in('language', filters.languages);
    }

    if (filters.status && filters.status.length > 0) {
      dbQuery = dbQuery.in('status', filters.status);
    }

    if (filters.authors && filters.authors.length > 0) {
      dbQuery = dbQuery.in('primaryAuthor', filters.authors);
    }

    if (filters.tags && filters.tags.length > 0) {
      dbQuery = dbQuery.overlaps('tags', filters.tags);
    }

    if (filters.topics && filters.topics.length > 0) {
      dbQuery = dbQuery.overlaps('topics', filters.topics);
    }

    if (filters.keywords && filters.keywords.length > 0) {
      dbQuery = dbQuery.overlaps('keywords', filters.keywords);
    }

    if (filters.location) {
      dbQuery = dbQuery.eq('location', filters.location);
    }

    if (filters.minRating !== undefined) {
      dbQuery = dbQuery.gte('averageRating', filters.minRating);
    }

    if (filters.isVerified !== undefined) {
      dbQuery = dbQuery.eq('isVerified', filters.isVerified);
    }

    if (filters.minQualityScore !== undefined) {
      dbQuery = dbQuery.gte('qualityScore', filters.minQualityScore);
    }

    if (filters.publishedAfter) {
      dbQuery = dbQuery.gte('publishedAt', filters.publishedAfter.toISOString());
    }

    if (filters.publishedBefore) {
      dbQuery = dbQuery.lte('publishedAt', filters.publishedBefore.toISOString());
    }

    if (filters.updatedAfter) {
      dbQuery = dbQuery.gte('updatedAt', filters.updatedAfter.toISOString());
    }

    if (filters.updatedBefore) {
      dbQuery = dbQuery.lte('updatedAt', filters.updatedBefore.toISOString());
    }

    if (filters.minViews !== undefined) {
      dbQuery = dbQuery.gte('viewCount', filters.minViews);
    }

    if (filters.minLikes !== undefined) {
      dbQuery = dbQuery.gte('likeCount', filters.minLikes);
    }

    if (filters.minBookmarks !== undefined) {
      dbQuery = dbQuery.gte('bookmarkCount', filters.minBookmarks);
    }

    if (filters.minComments !== undefined) {
      dbQuery = dbQuery.gte('commentCount', filters.minComments);
    }

    if (filters.maxReadTime !== undefined) {
      dbQuery = dbQuery.lte('estimatedReadTime', filters.maxReadTime);
    }

    if (filters.minReadTime !== undefined) {
      dbQuery = dbQuery.gte('estimatedReadTime', filters.minReadTime);
    }

    if (filters.hasAssessment !== undefined) {
      dbQuery = dbQuery.eq('hasAssessment', filters.hasAssessment);
    }

    if (filters.appId) {
      dbQuery = dbQuery.eq('appId', filters.appId);
    }

    if (filters.organizationId) {
      dbQuery = dbQuery.eq('organizationId', filters.organizationId);
    }

    if (filters.isInteractive !== undefined) {
      dbQuery = dbQuery.eq('isInteractive', filters.isInteractive);
    }

    if (filters.allowComments !== undefined) {
      dbQuery = dbQuery.eq('allowComments', filters.allowComments);
    }

    if (filters.allowRatings !== undefined) {
      dbQuery = dbQuery.eq('allowRatings', filters.allowRatings);
    }

    // Media filters would require more complex queries or additional tables
    if (filters.hasVideo !== undefined) {
      // This would need to check the media array
    }

    return dbQuery;
  }

  /**
   * Apply sorting to database query
   */
  private applySorting(dbQuery: any, sort: SearchSortType): any {
    const sortMappings = {
      newest: { column: 'createdAt', ascending: false },
      oldest: { column: 'createdAt', ascending: true },
      most_viewed: { column: 'viewCount', ascending: false },
      most_liked: { column: 'likeCount', ascending: false },
      most_bookmarked: { column: 'bookmarkCount', ascending: false },
      most_commented: { column: 'commentCount', ascending: false },
      highest_rated: { column: 'averageRating', ascending: false },
      recently_updated: { column: 'updatedAt', ascending: false },
      alphabetical: { column: 'title', ascending: true },
      read_time_asc: { column: 'estimatedReadTime', ascending: true },
      read_time_desc: { column: 'estimatedReadTime', ascending: false },
      quality_score: { column: 'qualityScore', ascending: false },
      relevance: { column: 'createdAt', ascending: false }, // Default fallback
      trending: { column: 'viewCount', ascending: false }, // Could be more sophisticated
      recommended: { column: 'averageRating', ascending: false }, // Could be more sophisticated
    };

    const sortConfig = sortMappings[sort] || sortMappings.newest;
    return dbQuery.order(sortConfig.column, { ascending: sortConfig.ascending });
  }

  /**
   * Convert content to search result items
   */
  private async convertToSearchResults(
    content: KnowledgeContentType[],
    searchResults?: Array<{ id: string; score: number; matches?: any }>
  ): Promise<SearchResultItemType[]> {
    // Get author information
    const authorIds = [...new Set(content.map(c => c.primaryAuthor))];
    const { data: authors } = await this.supabase
      .from('user_profiles')
      .select('id, name, avatar, verified')
      .in('id', authorIds);

    const authorMap = new Map(authors?.map(a => [a.id, a]) || []);
    const scoreMap = new Map(searchResults?.map(r => [r.id, r.score]) || []);
    const matchMap = new Map(searchResults?.map(r => [r.id, r.matches]) || []);

    return content.map(item => {
      const author = authorMap.get(item.primaryAuthor);
      const score = scoreMap.get(item.id);
      const matches = matchMap.get(item.id);

      // Extract highlights from matches
      const highlights: Record<string, string[]> = {};
      if (matches) {
        matches.forEach((match: any) => {
          const key = match.key;
          if (match.value && match.indices) {
            highlights[key] = [match.value]; // Simplified highlight extraction
          }
        });
      }

      return {
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        excerpt: item.excerpt,
        type: item.type,
        level: item.level,
        category: item.category,
        language: item.language,
        
        primaryAuthor: {
          id: item.primaryAuthor,
          name: author?.name || 'Unknown',
          avatar: author?.avatar,
          verified: author?.verified || false,
        },
        
        tags: item.tags,
        topics: item.topics,
        location: item.location,
        
        featuredImage: item.featuredImage,
        hasVideo: item.media.some(m => m.type === 'video'),
        hasAudio: item.media.some(m => m.type === 'audio'),
        hasDocuments: item.media.some(m => m.type === 'document'),
        
        viewCount: item.viewCount,
        likeCount: item.likeCount,
        bookmarkCount: item.bookmarkCount,
        commentCount: item.commentCount,
        averageRating: item.averageRating,
        ratingCount: item.ratingCount,
        
        estimatedReadTime: item.estimatedReadTime,
        hasAssessment: item.hasAssessment,
        skillsGained: item.skillsGained,
        
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt,
        
        isVerified: item.isVerified,
        qualityScore: item.qualityScore,
        
        score,
        highlights: Object.keys(highlights).length > 0 ? highlights : undefined,
      };
    });
  }

  /**
   * Add user-specific context to search results
   */
  private async addUserContext(result: SearchResultType, userId: string): Promise<SearchResultType> {
    try {
      const contentIds = result.items.map(item => item.id);
      
      // Get user interactions
      const { data: interactions } = await this.supabase
        .from('content_interactions')
        .select('contentId, type')
        .eq('userId', userId)
        .in('contentId', contentIds);

      const interactionMap = new Map<string, Set<string>>();
      interactions?.forEach(interaction => {
        if (!interactionMap.has(interaction.contentId)) {
          interactionMap.set(interaction.contentId, new Set());
        }
        interactionMap.get(interaction.contentId)!.add(interaction.type);
      });

      // Get user progress
      const { data: progress } = await this.supabase
        .from('content_progress')
        .select('contentId, progress, isCompleted')
        .eq('userId', userId)
        .in('contentId', contentIds);

      const progressMap = new Map(progress?.map(p => [p.contentId, p]) || []);

      // Update result items with user context
      result.items = result.items.map(item => {
        const userInteractions = interactionMap.get(item.id);
        const userProgress = progressMap.get(item.id);

        return {
          ...item,
          isBookmarked: userInteractions?.has('bookmark') || false,
          isLiked: userInteractions?.has('like') || false,
          progress: userProgress?.progress,
          isCompleted: userProgress?.isCompleted || false,
        };
      });

      return result;
    } catch (error) {
      console.error('Failed to add user context:', error);
      return result;
    }
  }

  /**
   * Track search analytics
   */
  private async trackSearch(
    query: SearchQueryType,
    resultsCount: number,
    searchTime: number,
    userId?: string
  ): Promise<void> {
    try {
      if (!query.query) return;

      const analytics: SearchAnalyticsType = {
        query: query.query,
        userId,
        resultsCount,
        searchTime,
        filters: query.filters,
        sort: query.sort,
        timestamp: new Date(),
      };

      await this.analytics.trackSearchEvent(analytics);

      // Update popular searches
      await this.updatePopularSearches(query.query);
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  }

  /**
   * Update popular searches
   */
  private async updatePopularSearches(query: string): Promise<void> {
    try {
      const timeframes = ['hour', 'day', 'week', 'month', 'year'] as const;
      
      for (const timeframe of timeframes) {
        await this.supabase.rpc('increment_popular_search', {
          search_query: query,
          search_timeframe: timeframe,
        });
      }
    } catch (error) {
      console.error('Failed to update popular searches:', error);
    }
  }

  /**
   * Ensure search index is up to date
   */
  private async ensureSearchIndex(): Promise<void> {
    const now = new Date();
    
    if (
      this.searchIndex &&
      this.indexLastUpdated &&
      now.getTime() - this.indexLastUpdated.getTime() < this.INDEX_REFRESH_INTERVAL
    ) {
      return;
    }

    await this.buildSearchIndex();
  }

  /**
   * Build search index
   */
  private async buildSearchIndex(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('knowledge_content')
        .select(`
          id, title, description, content, type, category, level, language,
          tags, keywords, topics, primaryAuthor, location, publishedAt, updatedAt,
          viewCount, likeCount, averageRating, qualityScore, isVerified,
          estimatedReadTime, hasAssessment, media, skillsGained, culturalContext,
          appId, organizationId
        `)
        .eq('status', 'published')
        .eq('visibility', 'public');

      if (error) {
        throw new Error(`Failed to fetch content for indexing: ${error.message}`);
      }

      // Convert to search documents
      const documents: SearchDocumentType[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        content: item.content,
        type: item.type,
        category: item.category,
        level: item.level,
        language: item.language,
        tags: item.tags || [],
        keywords: item.keywords || [],
        topics: item.topics || [],
        authorName: '', // Would need to join with user_profiles
        authorId: item.primaryAuthor,
        location: item.location,
        publishedAt: new Date(item.publishedAt || item.createdAt),
        updatedAt: new Date(item.updatedAt),
        viewCount: item.viewCount || 0,
        likeCount: item.likeCount || 0,
        averageRating: item.averageRating || 0,
        qualityScore: item.qualityScore,
        isVerified: item.isVerified || false,
        estimatedReadTime: item.estimatedReadTime,
        hasAssessment: item.hasAssessment || false,
        hasVideo: item.media?.some((m: any) => m.type === 'video') || false,
        hasAudio: item.media?.some((m: any) => m.type === 'audio') || false,
        hasDocuments: item.media?.some((m: any) => m.type === 'document') || false,
        skillsGained: item.skillsGained || [],
        culturalContext: item.culturalContext,
        appId: item.appId,
        organizationId: item.organizationId,
      }));

      // Create Fuse index
      const fuseOptions = {
        includeScore: true,
        includeMatches: true,
        threshold: 0.4,
        ignoreLocation: true,
        keys: [
          { name: 'title', weight: 0.3 },
          { name: 'description', weight: 0.2 },
          { name: 'content', weight: 0.15 },
          { name: 'tags', weight: 0.15 },
          { name: 'keywords', weight: 0.1 },
          { name: 'topics', weight: 0.1 },
        ],
      };

      this.searchIndex = new Fuse(documents, fuseOptions);
      this.indexLastUpdated = new Date();
    } catch (error) {
      console.error('Failed to build search index:', error);
      throw error;
    }
  }

  /**
   * Get search fields for Fuse.js
   */
  private getSearchFields(searchFields: string[] = ['all']): string[] {
    if (searchFields.includes('all')) {
      return ['title', 'description', 'content', 'tags', 'keywords', 'topics', 'authorName'];
    }
    
    return searchFields.filter(field => 
      ['title', 'description', 'content', 'tags', 'keywords', 'topics', 'author'].includes(field)
    ).map(field => field === 'author' ? 'authorName' : field);
  }
}