import { vi } from 'vitest';
import { 
  KnowledgeContentType, 
  SearchResultType, 
  ContentAnalyticsType, 
  AuthorAnalyticsType 
} from '../types';

// Mock Supabase client
export const createMockSupabaseClient = () => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  overlaps: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  textSearch: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn(),
  rpc: vi.fn(),
});

// Mock content data
export const mockKnowledgeContent: KnowledgeContentType = {
  id: 'test-content-1',
  title: 'Test Knowledge Content',
  slug: 'test-knowledge-content',
  description: 'This is a test knowledge content item',
  content: 'This is the main content of the test knowledge item. It contains valuable information.',
  excerpt: 'This is a test knowledge content item',
  type: 'article',
  status: 'published',
  visibility: 'public',
  level: 'beginner',
  category: 'knowledge_commons',
  language: 'en',
  
  // Authorship
  primaryAuthor: 'user-1',
  contributors: [{
    authorId: 'user-1',
    role: 'primary_author',
    contribution: 'Original author',
    contributedAt: new Date('2024-01-01'),
  }],
  
  // Metadata
  tags: ['test', 'knowledge', 'learning'],
  keywords: ['test', 'knowledge', 'content'],
  topics: ['testing', 'knowledge-management'],
  
  // Media
  featuredImage: 'https://example.com/image.jpg',
  media: [],
  
  // Learning
  estimatedReadTime: 5,
  
  // Analytics
  viewCount: 100,
  likeCount: 10,
  bookmarkCount: 5,
  shareCount: 3,
  commentCount: 2,
  downloadCount: 1,
  averageRating: 4.5,
  ratingCount: 8,
  
  // Versioning
  version: '1.0',
  versions: [{
    version: '1.0',
    changelog: 'Initial creation',
    publishedAt: new Date('2024-01-01'),
    publishedBy: 'user-1',
  }],
  
  // Timestamps
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  publishedAt: new Date('2024-01-01'),
  
  // Quality
  isVerified: true,
  qualityScore: 85,
  
  // Features
  isInteractive: false,
  hasAssessment: false,
  allowComments: true,
  allowRatings: true,
  allowDownloads: true,
};

export const mockSearchResult: SearchResultType = {
  items: [{
    id: 'test-content-1',
    title: 'Test Knowledge Content',
    slug: 'test-knowledge-content',
    description: 'This is a test knowledge content item',
    excerpt: 'This is a test knowledge content item',
    type: 'article',
    level: 'beginner',
    category: 'knowledge_commons',
    language: 'en',
    
    primaryAuthor: {
      id: 'user-1',
      name: 'Test Author',
      avatar: 'https://example.com/avatar.jpg',
      verified: true,
    },
    
    tags: ['test', 'knowledge', 'learning'],
    topics: ['testing', 'knowledge-management'],
    
    featuredImage: 'https://example.com/image.jpg',
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
    
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    publishedAt: new Date('2024-01-01'),
    
    isVerified: true,
    qualityScore: 85,
    
    score: 0.8,
  }],
  totalCount: 1,
  totalPages: 1,
  currentPage: 1,
  limit: 20,
  query: 'test',
  searchTime: 50,
};

export const mockContentAnalytics: ContentAnalyticsType = {
  contentId: 'test-content-1',
  totalViews: 100,
  uniqueViews: 80,
  averageViewDuration: 180,
  bounceRate: 25,
  totalLikes: 10,
  totalBookmarks: 5,
  totalShares: 3,
  totalComments: 2,
  totalDownloads: 1,
  averageRating: 4.5,
  totalRatings: 8,
  totalCompletions: 45,
  averageCompletionTime: 8,
  completionRate: 85,
  averageProgress: 75,
  searchImpressions: 200,
  searchClicks: 25,
  searchClickThroughRate: 12.5,
  period: 'month',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  lastUpdated: new Date('2024-01-01'),
  calculatedAt: new Date('2024-01-01'),
};

export const mockAuthorAnalytics: AuthorAnalyticsType = {
  authorId: 'user-1',
  totalContent: 10,
  publishedContent: 8,
  draftContent: 2,
  totalViews: 1000,
  totalLikes: 100,
  totalBookmarks: 50,
  totalShares: 30,
  totalComments: 20,
  totalDownloads: 10,
  averageRating: 4.2,
  totalRatings: 80,
  totalFollowers: 150,
  followerGrowth: 15,
  averageViewsPerContent: 100,
  averageEngagementRate: 8.5,
  averageQualityScore: 82,
  verificationStatus: true,
  period: 'month',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  lastUpdated: new Date('2024-01-01'),
  calculatedAt: new Date('2024-01-01'),
};

// Mock database responses
export const mockSupabaseResponse = {
  data: null,
  error: null,
  count: null,
};

export const mockSupabaseSuccess = (data: any, count?: number) => ({
  data,
  error: null,
  count,
});

export const mockSupabaseError = (message: string) => ({
  data: null,
  error: { message, code: 'TEST_ERROR' },
  count: null,
});

// Mock user profiles
export const mockUserProfile = {
  id: 'user-1',
  name: 'Test Author',
  avatar: 'https://example.com/avatar.jpg',
  verified: true,
};

// Mock nanoid
export const mockNanoid = () => 'test-id-' + Math.random().toString(36).substr(2, 9);

// Mock Fuse.js search results
export const mockFuseResults = [{
  item: {
    id: 'test-content-1',
    title: 'Test Knowledge Content',
    description: 'This is a test knowledge content item',
    content: 'This is the main content of the test knowledge item.',
    type: 'article',
    category: 'knowledge_commons',
    level: 'beginner',
    language: 'en',
    tags: ['test', 'knowledge'],
    keywords: ['test', 'knowledge'],
    topics: ['testing'],
    authorName: 'Test Author',
    authorId: 'user-1',
    publishedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    viewCount: 100,
    likeCount: 10,
    averageRating: 4.5,
    isVerified: true,
    hasAssessment: false,
    hasVideo: false,
    hasAudio: false,
    hasDocuments: false,
    estimatedReadTime: 5,
    skillsGained: ['testing'],
    qualityScore: 85,
  },
  score: 0.8,
  matches: [
    {
      key: 'title',
      value: 'Test Knowledge Content',
      indices: [[0, 4]]
    }
  ]
}];