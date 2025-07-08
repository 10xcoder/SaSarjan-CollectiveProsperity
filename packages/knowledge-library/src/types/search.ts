import { z } from 'zod';
import { ContentType, ContentLevel, ContentCategory, ContentLanguage, ContentStatus } from './content';

/**
 * Search Filter Schema
 */
export const SearchFilters = z.object({
  // Content Type Filters
  types: z.array(ContentType).optional(),
  categories: z.array(ContentCategory).optional(),
  levels: z.array(ContentLevel).optional(),
  languages: z.array(ContentLanguage).optional(),
  status: z.array(ContentStatus).optional(),
  
  // Author Filters
  authors: z.array(z.string()).optional(),
  verifiedAuthors: z.boolean().optional(),
  
  // Tag and Topic Filters
  tags: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  
  // Location Filters
  location: z.string().optional(),
  locationRadius: z.number().optional(), // in kilometers
  
  // Quality Filters
  minRating: z.number().min(0).max(5).optional(),
  isVerified: z.boolean().optional(),
  minQualityScore: z.number().min(0).max(100).optional(),
  
  // Time Filters
  publishedAfter: z.date().optional(),
  publishedBefore: z.date().optional(),
  updatedAfter: z.date().optional(),
  updatedBefore: z.date().optional(),
  
  // Engagement Filters
  minViews: z.number().optional(),
  minLikes: z.number().optional(),
  minBookmarks: z.number().optional(),
  minComments: z.number().optional(),
  
  // Learning Filters
  maxReadTime: z.number().optional(), // in minutes
  minReadTime: z.number().optional(),
  hasAssessment: z.boolean().optional(),
  hasCertification: z.boolean().optional(),
  
  // Accessibility Filters
  accessibilityFeatures: z.array(z.enum([
    'alt_text',
    'captions',
    'transcripts',
    'audio_description',
    'sign_language',
    'easy_language',
    'high_contrast',
    'large_text',
  ])).optional(),
  
  // Media Filters
  hasVideo: z.boolean().optional(),
  hasAudio: z.boolean().optional(),
  hasImages: z.boolean().optional(),
  hasDocuments: z.boolean().optional(),
  hasDownloads: z.boolean().optional(),
  
  // Platform Filters
  appId: z.string().optional(),
  organizationId: z.string().optional(),
  
  // Advanced Filters
  isInteractive: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  allowRatings: z.boolean().optional(),
});

export type SearchFiltersType = z.infer<typeof SearchFilters>;

/**
 * Search Sort Options
 */
export const SearchSort = z.enum([
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
]);

export type SearchSortType = z.infer<typeof SearchSort>;

/**
 * Search Query Schema
 */
export const SearchQuery = z.object({
  // Basic Search
  query: z.string().optional(),
  
  // Filters
  filters: SearchFilters.optional(),
  
  // Sorting and Pagination
  sort: SearchSort.default('relevance'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  
  // Search Configuration
  fuzzy: z.boolean().default(true),
  exactMatch: z.boolean().default(false),
  includeArchived: z.boolean().default(false),
  
  // User Context
  userId: z.string().optional(),
  userLocation: z.string().optional(),
  userPreferences: z.record(z.any()).optional(),
  
  // Advanced Search
  searchFields: z.array(z.enum([
    'title',
    'description',
    'content',
    'tags',
    'keywords',
    'topics',
    'author',
    'all',
  ])).default(['all']),
  
  // Aggregations
  includeAggregations: z.boolean().default(false),
});

export type SearchQueryType = z.infer<typeof SearchQuery>;

/**
 * Search Result Item
 */
export const SearchResultItem = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  excerpt: z.string().optional(),
  type: ContentType,
  level: ContentLevel,
  category: ContentCategory,
  language: ContentLanguage,
  
  // Author Info
  primaryAuthor: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().url().optional(),
    verified: z.boolean(),
  }),
  
  // Metadata
  tags: z.array(z.string()),
  topics: z.array(z.string()),
  location: z.string().optional(),
  
  // Media
  featuredImage: z.string().url().optional(),
  hasVideo: z.boolean(),
  hasAudio: z.boolean(),
  hasDocuments: z.boolean(),
  
  // Metrics
  viewCount: z.number(),
  likeCount: z.number(),
  bookmarkCount: z.number(),
  commentCount: z.number(),
  averageRating: z.number(),
  ratingCount: z.number(),
  
  // Learning
  estimatedReadTime: z.number().optional(),
  hasAssessment: z.boolean(),
  skillsGained: z.array(z.string()).optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
  
  // Quality
  isVerified: z.boolean(),
  qualityScore: z.number().optional(),
  
  // Search Metadata
  score: z.number().optional(), // relevance score
  highlights: z.record(z.array(z.string())).optional(),
  
  // User Context
  isBookmarked: z.boolean().optional(),
  isLiked: z.boolean().optional(),
  progress: z.number().optional(),
  isCompleted: z.boolean().optional(),
});

export type SearchResultItemType = z.infer<typeof SearchResultItem>;

/**
 * Search Aggregation
 */
export const SearchAggregation = z.object({
  field: z.string(),
  buckets: z.array(z.object({
    key: z.string(),
    count: z.number(),
    label: z.string().optional(),
  })),
});

export type SearchAggregationType = z.infer<typeof SearchAggregation>;

/**
 * Search Result
 */
export const SearchResult = z.object({
  items: z.array(SearchResultItem),
  totalCount: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  limit: z.number(),
  
  // Search Metadata
  query: z.string().optional(),
  searchTime: z.number(), // in milliseconds
  
  // Aggregations
  aggregations: z.array(SearchAggregation).optional(),
  
  // Suggestions
  suggestions: z.array(z.string()).optional(),
  didYouMean: z.string().optional(),
  
  // Related Searches
  relatedSearches: z.array(z.string()).optional(),
  
  // Faceted Search
  facets: z.record(z.object({
    values: z.array(z.object({
      value: z.string(),
      count: z.number(),
      selected: z.boolean(),
    })),
    type: z.enum(['checkbox', 'radio', 'range', 'date']),
  })).optional(),
});

export type SearchResultType = z.infer<typeof SearchResult>;

/**
 * Search Suggestion
 */
export const SearchSuggestion = z.object({
  text: z.string(),
  type: z.enum(['query', 'tag', 'topic', 'author', 'title']),
  score: z.number(),
  category: z.string().optional(),
});

export type SearchSuggestionType = z.infer<typeof SearchSuggestion>;

/**
 * Search Analytics
 */
export const SearchAnalytics = z.object({
  query: z.string(),
  userId: z.string().optional(),
  resultsCount: z.number(),
  clickedResults: z.array(z.string()).optional(),
  searchTime: z.number(),
  filters: SearchFilters.optional(),
  sort: SearchSort,
  timestamp: z.date(),
  sessionId: z.string().optional(),
});

export type SearchAnalyticsType = z.infer<typeof SearchAnalytics>;

/**
 * Popular Search
 */
export const PopularSearch = z.object({
  query: z.string(),
  count: z.number(),
  category: z.string().optional(),
  timeframe: z.enum(['hour', 'day', 'week', 'month', 'year']),
  trending: z.boolean().default(false),
});

export type PopularSearchType = z.infer<typeof PopularSearch>;

/**
 * Search Index Document
 */
export const SearchDocument = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  type: ContentType,
  category: ContentCategory,
  level: ContentLevel,
  language: ContentLanguage,
  tags: z.array(z.string()),
  keywords: z.array(z.string()),
  topics: z.array(z.string()),
  authorName: z.string(),
  authorId: z.string(),
  location: z.string().optional(),
  publishedAt: z.date(),
  updatedAt: z.date(),
  viewCount: z.number(),
  likeCount: z.number(),
  averageRating: z.number(),
  qualityScore: z.number().optional(),
  isVerified: z.boolean(),
  estimatedReadTime: z.number().optional(),
  hasAssessment: z.boolean(),
  hasVideo: z.boolean(),
  hasAudio: z.boolean(),
  hasDocuments: z.boolean(),
  skillsGained: z.array(z.string()).optional(),
  culturalContext: z.string().optional(),
  appId: z.string().optional(),
  organizationId: z.string().optional(),
});

export type SearchDocumentType = z.infer<typeof SearchDocument>;