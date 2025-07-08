import { z } from 'zod';

/**
 * Content Types for Knowledge Library
 */
export const ContentType = z.enum([
  'article',
  'video',
  'audio',
  'document',
  'course',
  'tutorial',
  'guide',
  'template',
  'tool',
  'research',
  'case_study',
  'discussion',
  'wisdom_story',
  'cultural_practice',
  'language_resource',
  'oral_history',
  'traditional_knowledge',
  'community_story',
  'experience_sharing',
  'q_and_a',
  'book_summary',
  'infographic',
  'presentation',
  'worksheet',
  'checklist',
  'framework',
  'methodology',
]);

export type ContentTypeType = z.infer<typeof ContentType>;

/**
 * Content Status
 */
export const ContentStatus = z.enum([
  'draft',
  'review',
  'published',
  'archived',
  'deprecated',
]);

export type ContentStatusType = z.infer<typeof ContentStatus>;

/**
 * Content Visibility
 */
export const ContentVisibility = z.enum([
  'public',
  'community',
  'private',
  'unlisted',
]);

export type ContentVisibilityType = z.infer<typeof ContentVisibility>;

/**
 * Content Difficulty Level
 */
export const ContentLevel = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
  'all_levels',
]);

export type ContentLevelType = z.infer<typeof ContentLevel>;

/**
 * Content Category (aligned with SaSarjan prosperity categories)
 */
export const ContentCategory = z.enum([
  'knowledge_commons',
  'economic_empowerment',
  'environmental_stewardship',
  'social_connection',
  'cultural_preservation',
  'health_wellbeing',
  'governance_participation',
  'spiritual_growth',
  'technology_innovation',
  'education_learning',
  'general',
]);

export type ContentCategoryType = z.infer<typeof ContentCategory>;

/**
 * Content Language
 */
export const ContentLanguage = z.enum([
  'en',
  'hi',
  'ta',
  'te',
  'ml',
  'kn',
  'bn',
  'gu',
  'mr',
  'pa',
  'or',
  'as',
  'ur',
  'sa',
  'multi',
]);

export type ContentLanguageType = z.infer<typeof ContentLanguage>;

/**
 * Content Media
 */
export const ContentMedia = z.object({
  id: z.string(),
  type: z.enum(['image', 'video', 'audio', 'document', 'file']),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  size: z.number().optional(),
  duration: z.number().optional(), // in seconds
  mimeType: z.string().optional(),
  uploadedAt: z.date(),
  metadata: z.record(z.any()).optional(),
});

export type ContentMediaType = z.infer<typeof ContentMedia>;

/**
 * Content Author
 */
export const ContentAuthor = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  bio: z.string().optional(),
  credentials: z.array(z.string()).optional(),
  socialLinks: z.record(z.string().url()).optional(),
  location: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  verified: z.boolean().default(false),
});

export type ContentAuthorType = z.infer<typeof ContentAuthor>;

/**
 * Content Contributor
 */
export const ContentContributor = z.object({
  authorId: z.string(),
  role: z.enum(['primary_author', 'co_author', 'editor', 'reviewer', 'translator', 'curator']),
  contribution: z.string().optional(),
  contributedAt: z.date(),
});

export type ContentContributorType = z.infer<typeof ContentContributor>;

/**
 * Content Version
 */
export const ContentVersion = z.object({
  version: z.string(),
  changelog: z.string().optional(),
  publishedAt: z.date(),
  publishedBy: z.string(),
  previousVersion: z.string().optional(),
});

export type ContentVersionType = z.infer<typeof ContentVersion>;

/**
 * Content Interaction
 */
export const ContentInteraction = z.object({
  userId: z.string(),
  type: z.enum(['like', 'bookmark', 'share', 'comment', 'rating', 'download', 'view']),
  data: z.record(z.any()).optional(),
  timestamp: z.date(),
});

export type ContentInteractionType = z.infer<typeof ContentInteraction>;

/**
 * Content Comment
 */
export const ContentComment = z.object({
  id: z.string(),
  userId: z.string(),
  parentId: z.string().optional(), // for nested comments
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isDeleted: z.boolean().default(false),
  likes: z.number().default(0),
  replies: z.number().default(0),
});

export type ContentCommentType = z.infer<typeof ContentComment>;

/**
 * Content Rating
 */
export const ContentRating = z.object({
  userId: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
  aspects: z.record(z.number().min(1).max(5)).optional(), // e.g., accuracy, clarity, usefulness
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ContentRatingType = z.infer<typeof ContentRating>;

/**
 * Content Collection
 */
export const ContentCollection = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  slug: z.string(),
  coverImage: z.string().url().optional(),
  createdBy: z.string(),
  isPublic: z.boolean().default(true),
  contentIds: z.array(z.string()),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ContentCollectionType = z.infer<typeof ContentCollection>;

/**
 * Learning Path Step
 */
export const LearningPathStep = z.object({
  id: z.string(),
  contentId: z.string(),
  order: z.number(),
  isRequired: z.boolean().default(true),
  estimatedTime: z.number().optional(), // in minutes
  prerequisites: z.array(z.string()).optional(),
  completionCriteria: z.string().optional(),
});

export type LearningPathStepType = z.infer<typeof LearningPathStep>;

/**
 * Learning Path
 */
export const LearningPath = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  coverImage: z.string().url().optional(),
  createdBy: z.string(),
  level: ContentLevel,
  category: ContentCategory,
  estimatedTime: z.number().optional(), // total time in minutes
  steps: z.array(LearningPathStep),
  tags: z.array(z.string()),
  isPublic: z.boolean().default(true),
  prerequisites: z.array(z.string()).optional(),
  outcomes: z.array(z.string()).optional(),
  certification: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LearningPathType = z.infer<typeof LearningPath>;

/**
 * Content Progress
 */
export const ContentProgress = z.object({
  userId: z.string(),
  contentId: z.string(),
  progress: z.number().min(0).max(100),
  timeSpent: z.number().default(0), // in minutes
  lastAccessed: z.date(),
  isCompleted: z.boolean().default(false),
  completedAt: z.date().optional(),
  notes: z.string().optional(),
  bookmarks: z.array(z.string()).optional(), // bookmarked sections
});

export type ContentProgressType = z.infer<typeof ContentProgress>;

/**
 * Main Content Schema
 */
export const KnowledgeContent = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  content: z.string(), // Main content (markdown, HTML, etc.)
  excerpt: z.string().optional(),
  type: ContentType,
  status: ContentStatus,
  visibility: ContentVisibility,
  level: ContentLevel,
  category: ContentCategory,
  language: ContentLanguage,
  
  // Authorship and Attribution
  primaryAuthor: z.string(), // userId
  contributors: z.array(ContentContributor),
  attribution: z.string().optional(), // for traditional knowledge attribution
  
  // Metadata
  tags: z.array(z.string()),
  keywords: z.array(z.string()),
  topics: z.array(z.string()),
  location: z.string().optional(), // for location-specific content
  culturalContext: z.string().optional(),
  
  // Media and Resources
  featuredImage: z.string().url().optional(),
  media: z.array(ContentMedia),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    type: z.enum(['link', 'download', 'reference']),
  })).optional(),
  
  // Learning and Engagement
  estimatedReadTime: z.number().optional(), // in minutes
  prerequisites: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
  skillsGained: z.array(z.string()).optional(),
  
  // Analytics and Metrics
  viewCount: z.number().default(0),
  likeCount: z.number().default(0),
  bookmarkCount: z.number().default(0),
  shareCount: z.number().default(0),
  commentCount: z.number().default(0),
  downloadCount: z.number().default(0),
  averageRating: z.number().min(0).max(5).default(0),
  ratingCount: z.number().default(0),
  
  // Versioning and History
  version: z.string().default('1.0'),
  versions: z.array(ContentVersion),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
  lastReviewed: z.date().optional(),
  
  // Moderation and Quality
  isVerified: z.boolean().default(false),
  qualityScore: z.number().min(0).max(100).optional(),
  moderationFlags: z.array(z.string()).optional(),
  
  // Accessibility
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
  
  // Localization
  translations: z.array(z.object({
    language: ContentLanguage,
    title: z.string(),
    description: z.string(),
    content: z.string(),
    translatedBy: z.string(),
    translatedAt: z.date(),
  })).optional(),
  
  // Relationships
  relatedContent: z.array(z.string()).optional(),
  parentContent: z.string().optional(), // for content series
  childContent: z.array(z.string()).optional(),
  
  // Platform-specific
  appId: z.string().optional(), // which app this content belongs to
  organizationId: z.string().optional(),
  
  // Advanced Features
  isInteractive: z.boolean().default(false),
  hasAssessment: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  allowRatings: z.boolean().default(true),
  allowDownloads: z.boolean().default(true),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type KnowledgeContentType = z.infer<typeof KnowledgeContent>;