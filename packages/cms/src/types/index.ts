// Core CMS Types
export * from './page';
export * from './blog';
export * from './templates';

// Re-export commonly used types
export type {
  CMSPageType,
  PageTypeType,
  PageStatusType,
  PageVisibilityType,
  PageTemplateType,
  ContentBlockType,
  ContentBlockBaseType,
  SEOMetadataType,
  PageVersionType,
  PageAnalyticsType,
} from './page';

export type {
  BlogPostType,
  BlogCategoryType,
  BlogTagType,
  BlogSeriesType,
  BlogAuthorType,
  BlogCommentType,
  BlogConfigType,
  BlogStatusType,
  ReadingTimeType,
  BlogPostAnalyticsType,
  ContentFormatType,
} from './blog';

export type {
  CMSTemplateType,
  TemplateTypeType,
  TemplateCategoryType,
  TemplateIndustryType,
  TemplateVariableType,
  TemplateBlockDefinitionType,
  TemplatePreviewType,
  TemplateUsageStatsType,
  TemplateCollectionType,
  TemplateInstallationType,
  SaSarjanTemplateType,
  ProsperityTemplateCategoryType,
} from './templates';

// Utility types for CMS configuration
export type CMSConfig = {
  // Database configuration
  database: {
    url: string;
    apiKey: string;
    schema?: string;
  };
  
  // Storage configuration for media
  storage: {
    provider: 'supabase' | 'aws' | 'gcs' | 'azure' | 'cloudinary';
    bucket: string;
    region?: string;
    credentials?: Record<string, any>;
    maxFileSize?: number;
    allowedMimeTypes?: string[];
    imageOptimization?: {
      enabled: boolean;
      quality: number;
      formats: string[];
      sizes: number[];
    };
  };
  
  // Email configuration for notifications
  email: {
    provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp';
    apiKey?: string;
    from: string;
    templates?: {
      commentNotification?: string;
      postPublished?: string;
      authorInvite?: string;
    };
  };
  
  // Search configuration
  search: {
    provider: 'internal' | 'algolia' | 'elasticsearch' | 'meilisearch';
    apiKey?: string;
    indexName?: string;
    options?: Record<string, any>;
  };
  
  // Analytics configuration
  analytics: {
    enabled: boolean;
    provider?: 'internal' | 'google' | 'plausible' | 'fathom';
    trackingId?: string;
    anonymize?: boolean;
  };
  
  // Cache configuration
  cache: {
    enabled: boolean;
    provider: 'memory' | 'redis' | 'memcached';
    ttl: number;
    keyPrefix?: string;
    connection?: Record<string, any>;
  };
  
  // CDN configuration
  cdn: {
    enabled: boolean;
    provider?: 'cloudflare' | 'aws' | 'fastly';
    domain?: string;
    apiKey?: string;
  };
  
  // Security configuration
  security: {
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      max: number;
    };
    
    authentication: {
      required: boolean;
      providers: string[];
      sessionTimeout: number;
    };
    
    contentSecurity: {
      enableXSS: boolean;
      enableCSRF: boolean;
      allowedDomains: string[];
      sanitizeHTML: boolean;
    };
  };
  
  // Editor configuration
  editor: {
    defaultFormat: 'markdown' | 'html' | 'blocks';
    enableBlockEditor: boolean;
    enableMarkdown: boolean;
    enableHTML: boolean;
    allowedBlocks?: string[];
    customBlocks?: Record<string, any>;
    
    // Rich text editor options
    richText: {
      toolbar: string[];
      plugins: string[];
      customStyles?: Record<string, any>;
    };
  };
  
  // SEO configuration
  seo: {
    enabled: boolean;
    defaultMeta: {
      title: string;
      description: string;
      keywords: string[];
      author: string;
      image: string;
    };
    
    sitemaps: {
      enabled: boolean;
      path: string;
      changefreq: string;
      priority: number;
    };
    
    robots: {
      enabled: boolean;
      content: string;
    };
    
    structuredData: {
      enabled: boolean;
      defaultType: string;
    };
  };
  
  // Workflow configuration
  workflow: {
    enableReview: boolean;
    enableScheduling: boolean;
    enableVersioning: boolean;
    enableCollaboration: boolean;
    
    roles: {
      admin: string[];
      editor: string[];
      author: string[];
      contributor: string[];
      reviewer: string[];
    };
    
    notifications: {
      enabled: boolean;
      channels: string[];
    };
  };
  
  // Localization configuration
  localization: {
    enabled: boolean;
    defaultLanguage: string;
    supportedLanguages: string[];
    fallbackLanguage: string;
    autoDetect: boolean;
  };
  
  // Template configuration
  templates: {
    enabled: boolean;
    allowCustom: boolean;
    marketplace: {
      enabled: boolean;
      endpoint?: string;
      apiKey?: string;
    };
    
    validation: {
      enableSecurity: boolean;
      allowedTags: string[];
      allowedAttributes: string[];
    };
  };
  
  // Blog configuration
  blog: {
    enabled: boolean;
    defaultConfig: {
      postsPerPage: number;
      enableComments: boolean;
      enableCategories: boolean;
      enableTags: boolean;
      enableSeries: boolean;
      enableNewsletter: boolean;
    };
    
    comments: {
      system: 'internal' | 'disqus' | 'commento' | 'discourse';
      moderation: 'auto' | 'manual' | 'none';
      notifications: boolean;
    };
  };
  
  // Performance configuration
  performance: {
    staticGeneration: {
      enabled: boolean;
      strategy: 'isr' | 'ssg' | 'ssr';
      revalidate: number;
    };
    
    optimization: {
      minifyHTML: boolean;
      compressImages: boolean;
      lazyLoading: boolean;
      prefetchLinks: boolean;
    };
    
    monitoring: {
      enabled: boolean;
      endpoint?: string;
      sampleRate: number;
    };
  };
  
  // Integration configuration
  integrations: {
    webhooks: {
      enabled: boolean;
      endpoints: Array<{
        url: string;
        events: string[];
        secret?: string;
      }>;
    };
    
    apis: {
      enabled: boolean;
      rateLimit: number;
      authentication: 'none' | 'api_key' | 'oauth';
    };
    
    social: {
      autoPost: boolean;
      platforms: string[];
      credentials: Record<string, any>;
    };
  };
  
  // Custom configuration
  custom?: Record<string, any>;
};

// API Response types
export type CMSApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  metadata?: Record<string, any>;
};

// Event types
export type CMSEvent = {
  type: string;
  entity: 'page' | 'blog_post' | 'template' | 'user' | 'media';
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'archive';
  entityId: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
  metadata?: Record<string, any>;
};

// Plugin types
export type CMSPlugin = {
  name: string;
  version: string;
  description?: string;
  author?: string;
  
  // Plugin lifecycle
  install?: (config: CMSConfig) => Promise<void>;
  uninstall?: () => Promise<void>;
  activate?: () => Promise<void>;
  deactivate?: () => Promise<void>;
  
  // Hooks
  beforePageCreate?: (page: CMSPageType) => Promise<CMSPageType>;
  afterPageCreate?: (page: CMSPageType) => Promise<void>;
  beforePageUpdate?: (page: CMSPageType) => Promise<CMSPageType>;
  afterPageUpdate?: (page: CMSPageType) => Promise<void>;
  beforePageDelete?: (pageId: string) => Promise<void>;
  afterPageDelete?: (pageId: string) => Promise<void>;
  
  // Blog hooks
  beforeBlogPostCreate?: (post: BlogPostType) => Promise<BlogPostType>;
  afterBlogPostCreate?: (post: BlogPostType) => Promise<void>;
  beforeBlogPostUpdate?: (post: BlogPostType) => Promise<BlogPostType>;
  afterBlogPostUpdate?: (post: BlogPostType) => Promise<void>;
  beforeBlogPostPublish?: (post: BlogPostType) => Promise<BlogPostType>;
  afterBlogPostPublish?: (post: BlogPostType) => Promise<void>;
  
  // Template hooks
  beforeTemplateInstall?: (template: CMSTemplateType) => Promise<CMSTemplateType>;
  afterTemplateInstall?: (template: CMSTemplateType) => Promise<void>;
  
  // Custom blocks
  blocks?: Record<string, TemplateBlockDefinitionType>;
  
  // Custom admin UI
  adminUI?: {
    pages?: Array<{
      path: string;
      component: string;
      title: string;
      icon?: string;
    }>;
    
    widgets?: Array<{
      name: string;
      component: string;
      title: string;
      description?: string;
    }>;
  };
  
  // Settings schema
  settings?: Record<string, TemplateVariableType>;
  
  // Custom methods
  [key: string]: any;
};

// Error types
export type CMSError = {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
};

// Media types
export type MediaItem = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  description?: string;
  tags: string[];
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    [key: string]: any;
  };
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;
};

// Navigation types
export type NavigationItem = {
  id: string;
  label: string;
  url: string;
  type: 'page' | 'external' | 'category' | 'custom';
  target?: '_self' | '_blank';
  icon?: string;
  description?: string;
  order: number;
  parentId?: string;
  children?: NavigationItem[];
  isVisible: boolean;
  permissions?: string[];
};

export type Navigation = {
  id: string;
  name: string;
  location: 'primary' | 'secondary' | 'footer' | 'sidebar' | 'custom';
  items: NavigationItem[];
  appId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Form types
export type FormSubmission = {
  id: string;
  formId: string;
  pageId?: string;
  data: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  referer?: string;
  userId?: string;
  status: 'new' | 'read' | 'processed' | 'spam';
  submittedAt: Date;
  processedAt?: Date;
  notes?: string;
};

// Revision types
export type ContentRevision = {
  id: string;
  entityType: 'page' | 'blog_post' | 'template';
  entityId: string;
  version: string;
  title: string;
  content: any;
  changelog?: string;
  createdBy: string;
  createdAt: Date;
  isPublished: boolean;
  publishedAt?: Date;
};