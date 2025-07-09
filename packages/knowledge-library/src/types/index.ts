// Content Types
export * from './content';
export * from './search';
export * from './analytics';

// Import types for local use
import type {
  KnowledgeContentType,
} from './content';

import type {
  SearchQueryType,
  SearchResultType,
  SearchAnalyticsType,
} from './search';

import type {
  AnalyticsEventType,
} from './analytics';

// Re-export commonly used types
export type {
  KnowledgeContentType,
  ContentTypeType,
  ContentStatusType,
  ContentVisibilityType,
  ContentLevelType,
  ContentCategoryType,
  ContentLanguageType,
  ContentMediaType,
  ContentAuthorType,
  ContentContributorType,
  ContentVersionType,
  ContentInteractionType,
  ContentCommentType,
  ContentRatingType,
  ContentCollectionType,
  LearningPathType,
  LearningPathStepType,
  ContentProgressType,
} from './content';

export type {
  SearchQueryType,
  SearchResultType,
  SearchResultItemType,
  SearchFiltersType,
  SearchSortType,
  SearchAggregationType,
  SearchSuggestionType,
  SearchAnalyticsType,
  PopularSearchType,
  SearchDocumentType,
} from './search';

export type {
  AnalyticsEventType,
  ContentAnalyticsType,
  AuthorAnalyticsType,
  PlatformAnalyticsType,
  SearchMetricsAnalyticsType,
  AnalyticsReportType,
} from './analytics';

// Utility types
export type KnowledgeLibraryConfig = {
  // Database configuration
  database: {
    url: string;
    apiKey: string;
    schema?: string;
  };
  
  // Search configuration
  search: {
    provider: 'fuse' | 'elasticsearch' | 'meilisearch';
    indexName?: string;
    apiKey?: string;
    endpoint?: string;
    options?: Record<string, any>;
  };
  
  // File storage configuration
  storage: {
    provider: 'supabase' | 'aws' | 'gcs' | 'azure';
    bucket: string;
    region?: string;
    credentials?: Record<string, any>;
    maxFileSize?: number;
    allowedMimeTypes?: string[];
  };
  
  // Analytics configuration
  analytics: {
    enabled: boolean;
    provider?: 'internal' | 'google' | 'mixpanel' | 'segment';
    trackingId?: string;
    options?: Record<string, any>;
  };
  
  // Content processing
  processing: {
    markdown: {
      enabled: boolean;
      sanitize: boolean;
      allowedTags?: string[];
      plugins?: string[];
    };
    
    media: {
      imageOptimization: boolean;
      videoTranscoding: boolean;
      thumbnailGeneration: boolean;
      maxDimensions?: {
        width: number;
        height: number;
      };
    };
    
    ai: {
      enabled: boolean;
      provider?: 'openai' | 'anthropic' | 'local';
      apiKey?: string;
      features?: {
        autoTagging: boolean;
        contentSuggestions: boolean;
        qualityScoring: boolean;
        translation: boolean;
      };
    };
  };
  
  // Moderation
  moderation: {
    enabled: boolean;
    autoModeration: boolean;
    flaggedContentAction: 'hide' | 'review' | 'delete';
    moderators?: string[];
  };
  
  // Localization
  localization: {
    defaultLanguage: string;
    supportedLanguages: string[];
    autoDetect: boolean;
    translationService?: 'google' | 'aws' | 'azure';
  };
  
  // Performance
  performance: {
    caching: {
      enabled: boolean;
      ttl: number;
      provider?: 'memory' | 'redis' | 'memcached';
    };
    
    cdn: {
      enabled: boolean;
      provider?: 'cloudflare' | 'aws' | 'fastly';
      domain?: string;
    };
  };
  
  // Security
  security: {
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      max: number;
    };
    
    authentication: {
      required: boolean;
      providers: string[];
    };
    
    authorization: {
      enabled: boolean;
      rules?: Record<string, any>;
    };
  };
  
  // Features
  features: {
    comments: boolean;
    ratings: boolean;
    bookmarks: boolean;
    sharing: boolean;
    downloads: boolean;
    offline: boolean;
    collaboration: boolean;
    versioning: boolean;
    discussions: boolean;
    notifications: boolean;
  };
  
  // Integration
  integration: {
    webhooks: {
      enabled: boolean;
      endpoints?: string[];
      events?: string[];
    };
    
    apis: {
      enabled: boolean;
      rateLimit?: number;
      authentication?: 'none' | 'api_key' | 'oauth';
    };
  };
};

// Error types
export type KnowledgeLibraryError = {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
};

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: KnowledgeLibraryError;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  metadata?: Record<string, any>;
};

// Event types
export type KnowledgeLibraryEvent = {
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
};

// Plugin types
export type KnowledgeLibraryPlugin = {
  name: string;
  version: string;
  description?: string;
  author?: string;
  
  // Plugin lifecycle
  install?: (config: KnowledgeLibraryConfig) => Promise<void>;
  uninstall?: () => Promise<void>;
  
  // Hooks
  beforeContentCreate?: (content: KnowledgeContentType) => Promise<KnowledgeContentType>;
  afterContentCreate?: (content: KnowledgeContentType) => Promise<void>;
  beforeContentUpdate?: (content: KnowledgeContentType) => Promise<KnowledgeContentType>;
  afterContentUpdate?: (content: KnowledgeContentType) => Promise<void>;
  beforeContentDelete?: (contentId: string) => Promise<void>;
  afterContentDelete?: (contentId: string) => Promise<void>;
  
  // Search hooks
  beforeSearch?: (query: SearchQueryType) => Promise<SearchQueryType>;
  afterSearch?: (result: SearchResultType) => Promise<SearchResultType>;
  
  // Analytics hooks
  beforeAnalytics?: (event: AnalyticsEventType) => Promise<AnalyticsEventType>;
  afterAnalytics?: (event: AnalyticsEventType) => Promise<void>;
  
  // Custom methods
  [key: string]: any;
};