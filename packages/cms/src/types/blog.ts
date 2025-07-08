import { z } from 'zod';
import { SEOMetadata, PageStatus, PageVisibility, ContentBlock } from './page';

/**
 * Blog Post Status
 */
export const BlogStatus = z.enum([
  'draft',
  'review',
  'scheduled',
  'published',
  'archived',
  'featured',
]);

export type BlogStatusType = z.infer<typeof BlogStatus>;

/**
 * Blog Category
 */
export const BlogCategory = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
  postCount: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BlogCategoryType = z.infer<typeof BlogCategory>;

/**
 * Blog Tag
 */
export const BlogTag = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  postCount: z.number().default(0),
  isVisible: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BlogTagType = z.infer<typeof BlogTag>;

/**
 * Blog Series
 */
export const BlogSeries = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  coverImage: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'completed']),
  isVisible: z.boolean().default(true),
  estimatedPosts: z.number().optional(),
  currentPosts: z.number().default(0),
  order: z.number().default(0),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BlogSeriesType = z.infer<typeof BlogSeries>;

/**
 * Blog Author
 */
export const BlogAuthor = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  bio: z.string().optional(),
  avatar: z.string().url().optional(),
  slug: z.string(),
  title: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url().optional(),
  social: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    youtube: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
  isGuest: z.boolean().default(false),
  isVerified: z.boolean().default(false),
  postCount: z.number().default(0),
  followerCount: z.number().default(0),
  expertise: z.array(z.string()).optional(),
  location: z.string().optional(),
  joinedAt: z.date(),
  lastActiveAt: z.date().optional(),
});

export type BlogAuthorType = z.infer<typeof BlogAuthor>;

/**
 * Blog Comment
 */
export const BlogComment = z.object({
  id: z.string(),
  postId: z.string(),
  parentId: z.string().optional(), // for nested comments
  authorId: z.string().optional(), // null for anonymous
  authorName: z.string(),
  authorEmail: z.string().email(),
  authorWebsite: z.string().url().optional(),
  content: z.string(),
  isApproved: z.boolean().default(false),
  isSpam: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  likes: z.number().default(0),
  replies: z.number().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  approvedAt: z.date().optional(),
  approvedBy: z.string().optional(),
});

export type BlogCommentType = z.infer<typeof BlogComment>;

/**
 * Blog Post Reading Time
 */
export const ReadingTime = z.object({
  text: z.string(), // e.g., "5 min read"
  minutes: z.number(),
  time: z.number(), // in milliseconds
  words: z.number(),
});

export type ReadingTimeType = z.infer<typeof ReadingTime>;

/**
 * Blog Post Analytics
 */
export const BlogPostAnalytics = z.object({
  postId: z.string(),
  views: z.number().default(0),
  uniqueViews: z.number().default(0),
  likes: z.number().default(0),
  shares: z.number().default(0),
  comments: z.number().default(0),
  bookmarks: z.number().default(0),
  averageReadTime: z.number().default(0), // seconds
  bounceRate: z.number().default(0), // percentage
  completionRate: z.number().default(0), // percentage
  shareBreakdown: z.object({
    twitter: z.number().default(0),
    facebook: z.number().default(0),
    linkedin: z.number().default(0),
    email: z.number().default(0),
    copy: z.number().default(0),
  }).optional(),
  topReferrers: z.array(z.object({
    domain: z.string(),
    count: z.number(),
  })).optional(),
  topCountries: z.array(z.object({
    country: z.string(),
    count: z.number(),
  })).optional(),
  readingProgress: z.array(z.object({
    percentage: z.number(),
    count: z.number(),
  })).optional(),
  lastUpdated: z.date(),
});

export type BlogPostAnalyticsType = z.infer<typeof BlogPostAnalytics>;

/**
 * Blog Post Version
 */
export const BlogPostVersion = z.object({
  version: z.string(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
  changelog: z.string().optional(),
  publishedAt: z.date(),
  publishedBy: z.string(),
  previousVersion: z.string().optional(),
});

export type BlogPostVersionType = z.infer<typeof BlogPostVersion>;

/**
 * Blog Post Content Format
 */
export const ContentFormat = z.enum([
  'markdown',
  'html',
  'blocks',
  'mixed',
]);

export type ContentFormatType = z.infer<typeof ContentFormat>;

/**
 * Main Blog Post Schema
 */
export const BlogPost = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().optional(),
  content: z.string(),
  contentFormat: ContentFormat.default('markdown'),
  blocks: z.array(ContentBlock).optional(), // For block-based content
  
  // Status and Visibility
  status: BlogStatus,
  visibility: PageVisibility,
  
  // Media
  featuredImage: z.string().url().optional(),
  featuredImageAlt: z.string().optional(),
  featuredImageCaption: z.string().optional(),
  
  // Authorship
  authorId: z.string(),
  coAuthors: z.array(z.string()).optional(),
  guestAuthor: BlogAuthor.optional(),
  
  // Organization
  categoryId: z.string().optional(),
  tags: z.array(z.string()),
  seriesId: z.string().optional(),
  seriesOrder: z.number().optional(),
  
  // App/Platform Context
  appId: z.string().optional(),
  organizationId: z.string().optional(),
  
  // Publishing
  publishedAt: z.date().optional(),
  scheduledAt: z.date().optional(),
  expiresAt: z.date().optional(),
  lastReviewedAt: z.date().optional(),
  
  // Content Metadata
  readingTime: ReadingTime.optional(),
  wordCount: z.number().default(0),
  language: z.string().default('en'),
  
  // SEO
  seo: SEOMetadata.optional(),
  
  // Social Media
  socialImage: z.string().url().optional(),
  socialTitle: z.string().optional(),
  socialDescription: z.string().optional(),
  
  // Versioning
  version: z.string().default('1.0'),
  versions: z.array(BlogPostVersion),
  
  // Engagement Settings
  allowComments: z.boolean().default(true),
  allowSharing: z.boolean().default(true),
  allowLikes: z.boolean().default(true),
  allowBookmarks: z.boolean().default(true),
  
  // Content Settings
  isPremium: z.boolean().default(false),
  isSticky: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isSponsored: z.boolean().default(false),
  sponsorInfo: z.object({
    name: z.string(),
    logo: z.string().url().optional(),
    website: z.string().url().optional(),
    disclaimer: z.string().optional(),
  }).optional(),
  
  // Related Content
  relatedPosts: z.array(z.string()).optional(),
  crossPromotedApps: z.array(z.string()).optional(),
  
  // Newsletter
  includeInNewsletter: z.boolean().default(false),
  newsletterSentAt: z.date().optional(),
  
  // Analytics
  analytics: BlogPostAnalytics.optional(),
  
  // Moderation
  moderationStatus: z.enum(['pending', 'approved', 'rejected', 'flagged']).default('pending'),
  moderationNotes: z.string().optional(),
  moderatedBy: z.string().optional(),
  moderatedAt: z.date().optional(),
  
  // Localization
  translations: z.array(z.object({
    language: z.string(),
    title: z.string(),
    slug: z.string(),
    excerpt: z.string().optional(),
    content: z.string(),
    seo: SEOMetadata.optional(),
    translatedBy: z.string(),
    translatedAt: z.date(),
    isApproved: z.boolean().default(false),
  })).optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  
  // Custom Fields
  customFields: z.record(z.any()).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type BlogPostType = z.infer<typeof BlogPost>;

/**
 * Blog Configuration
 */
export const BlogConfig = z.object({
  id: z.string(),
  appId: z.string(),
  
  // General Settings
  title: z.string(),
  description: z.string(),
  tagline: z.string().optional(),
  logo: z.string().url().optional(),
  favicon: z.string().url().optional(),
  
  // URLs and Navigation
  baseUrl: z.string().url(),
  customDomain: z.string().optional(),
  pathPrefix: z.string().default('/blog'),
  
  // Display Settings
  postsPerPage: z.number().default(10),
  excerptLength: z.number().default(160),
  showAuthorBio: z.boolean().default(true),
  showReadingTime: z.boolean().default(true),
  showRelatedPosts: z.boolean().default(true),
  showComments: z.boolean().default(true),
  showSocialSharing: z.boolean().default(true),
  
  // Features
  enableSearch: z.boolean().default(true),
  enableCategories: z.boolean().default(true),
  enableTags: z.boolean().default(true),
  enableSeries: z.boolean().default(true),
  enableNewsletter: z.boolean().default(false),
  enableRSS: z.boolean().default(true),
  
  // Comments
  commentSystem: z.enum(['internal', 'disqus', 'commento', 'discourse', 'disabled']).default('internal'),
  commentSettings: z.object({
    requireApproval: z.boolean().default(true),
    allowAnonymous: z.boolean().default(false),
    enableNotifications: z.boolean().default(true),
    spamFilter: z.boolean().default(true),
    maxDepth: z.number().default(3),
  }),
  
  // SEO
  defaultSEO: SEOMetadata,
  enableSitemap: z.boolean().default(true),
  enableRobots: z.boolean().default(true),
  
  // Analytics
  analytics: z.object({
    provider: z.enum(['internal', 'google', 'plausible', 'fathom']).optional(),
    trackingId: z.string().optional(),
    enableDetailedTracking: z.boolean().default(false),
  }),
  
  // Social Media
  socialAccounts: z.object({
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
    instagram: z.string().optional(),
  }).optional(),
  
  // Content Moderation
  moderation: z.object({
    autoApprove: z.boolean().default(false),
    requireReview: z.boolean().default(true),
    enableSpamFilter: z.boolean().default(true),
    moderators: z.array(z.string()),
  }),
  
  // Newsletter Integration
  newsletter: z.object({
    provider: z.enum(['mailchimp', 'convertkit', 'substack', 'buttondown']).optional(),
    apiKey: z.string().optional(),
    listId: z.string().optional(),
    enableSignup: z.boolean().default(false),
    signupPosition: z.enum(['header', 'footer', 'sidebar', 'inline']).default('footer'),
  }).optional(),
  
  // Performance
  cache: z.object({
    enabled: z.boolean().default(true),
    ttl: z.number().default(3600),
    staticGeneration: z.boolean().default(true),
  }),
  
  // Customization
  theme: z.object({
    primaryColor: z.string().default('#007bff'),
    secondaryColor: z.string().default('#6c757d'),
    fontFamily: z.string().default('Inter'),
    customCSS: z.string().optional(),
  }),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type BlogConfigType = z.infer<typeof BlogConfig>;