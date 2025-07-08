import { z } from 'zod';
import { ContentBlock, PageType, PageTemplate } from './page';

/**
 * Template Category
 */
export const TemplateCategory = z.enum([
  'landing',
  'marketing',
  'business',
  'ecommerce',
  'portfolio',
  'blog',
  'documentation',
  'education',
  'nonprofit',
  'event',
  'personal',
  'agency',
  'startup',
  'saas',
  'proserpity_focused', // SaSarjan specific
  'community',
  'government',
  'healthcare',
  'finance',
  'technology',
  'creative',
  'food',
  'travel',
  'real_estate',
  'entertainment',
  'sports',
  'news',
  'custom',
]);

export type TemplateCategoryType = z.infer<typeof TemplateCategory>;

/**
 * Template Industry
 */
export const TemplateIndustry = z.enum([
  'technology',
  'healthcare',
  'finance',
  'education',
  'nonprofit',
  'retail',
  'manufacturing',
  'real_estate',
  'food_beverage',
  'travel_tourism',
  'entertainment',
  'sports_fitness',
  'beauty_wellness',
  'automotive',
  'construction',
  'legal',
  'consulting',
  'marketing',
  'agriculture',
  'environmental',
  'social_impact', // SaSarjan specific
  'collective_prosperity', // SaSarjan specific
  'community_development', // SaSarjan specific
  'general',
]);

export type TemplateIndustryType = z.infer<typeof TemplateIndustry>;

/**
 * Template Type
 */
export const TemplateType = z.enum([
  'page',
  'block',
  'section',
  'component',
  'layout',
  'email',
]);

export type TemplateTypeType = z.infer<typeof TemplateType>;

/**
 * Template Variable
 */
export const TemplateVariable = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string().optional(),
  type: z.enum(['text', 'textarea', 'number', 'boolean', 'select', 'image', 'color', 'url', 'email', 'date']),
  defaultValue: z.any().optional(),
  required: z.boolean().default(false),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    options: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),
  }).optional(),
  group: z.string().optional(), // For organizing variables in groups
  order: z.number().default(0),
});

export type TemplateVariableType = z.infer<typeof TemplateVariable>;

/**
 * Template Block Definition
 */
export const TemplateBlockDefinition = z.object({
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  category: z.string(),
  
  // Default configuration
  defaultData: z.record(z.any()),
  defaultSettings: z.record(z.any()).optional(),
  defaultStyles: z.record(z.any()).optional(),
  
  // Customization options
  variables: z.array(TemplateVariable).optional(),
  allowedChildren: z.array(z.string()).optional(),
  maxChildren: z.number().optional(),
  
  // Validation
  requiredFields: z.array(z.string()).optional(),
  
  // Preview
  previewImage: z.string().url().optional(),
  
  // Metadata
  tags: z.array(z.string()).optional(),
  
  // Documentation
  documentation: z.string().optional(),
  examples: z.array(z.record(z.any())).optional(),
});

export type TemplateBlockDefinitionType = z.infer<typeof TemplateBlockDefinition>;

/**
 * Template Preview
 */
export const TemplatePreview = z.object({
  desktop: z.string().url(),
  tablet: z.string().url().optional(),
  mobile: z.string().url().optional(),
  thumbnail: z.string().url(),
});

export type TemplatePreviewType = z.infer<typeof TemplatePreview>;

/**
 * Template Rating
 */
export const TemplateRating = z.object({
  userId: z.string(),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
  createdAt: z.date(),
});

export type TemplateRatingType = z.infer<typeof TemplateRating>;

/**
 * Template Usage Stats
 */
export const TemplateUsageStats = z.object({
  templateId: z.string(),
  totalUses: z.number().default(0),
  uniqueUsers: z.number().default(0),
  averageRating: z.number().default(0),
  totalRatings: z.number().default(0),
  
  // Time-based stats
  usesToday: z.number().default(0),
  usesThisWeek: z.number().default(0),
  usesThisMonth: z.number().default(0),
  
  // Geographic stats
  topCountries: z.array(z.object({
    country: z.string(),
    count: z.number(),
  })).optional(),
  
  // Industry stats
  topIndustries: z.array(z.object({
    industry: TemplateIndustry,
    count: z.number(),
  })).optional(),
  
  lastUpdated: z.date(),
});

export type TemplateUsageStatsType = z.infer<typeof TemplateUsageStats>;

/**
 * Main Template Schema
 */
export const CMSTemplate = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  
  // Template Information
  type: TemplateType,
  category: TemplateCategory,
  industry: TemplateIndustry,
  pageType: PageType.optional(),
  pageTemplate: PageTemplate.optional(),
  
  // Content
  blocks: z.array(ContentBlock),
  layout: z.string().optional(), // Layout component name
  
  // Customization
  variables: z.array(TemplateVariable),
  blockDefinitions: z.array(TemplateBlockDefinition).optional(),
  
  // Media
  previewImages: TemplatePreview,
  demoUrl: z.string().url().optional(),
  
  // Metadata
  tags: z.array(z.string()),
  keywords: z.array(z.string()).optional(),
  
  // Authorship
  createdBy: z.string(),
  authorName: z.string(),
  authorWebsite: z.string().url().optional(),
  
  // Licensing
  license: z.enum(['free', 'premium', 'enterprise', 'custom']).default('free'),
  price: z.number().default(0),
  currency: z.string().default('USD'),
  
  // Status
  status: z.enum(['draft', 'review', 'published', 'deprecated']).default('draft'),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  
  // Compatibility
  minVersion: z.string().optional(), // Minimum CMS version required
  maxVersion: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  
  // Requirements
  requiredPlugins: z.array(z.string()).optional(),
  requiredBlocks: z.array(z.string()).optional(),
  
  // Installation
  installationInstructions: z.string().optional(),
  configurationSteps: z.array(z.string()).optional(),
  
  // Support
  supportEmail: z.string().email().optional(),
  documentationUrl: z.string().url().optional(),
  changelogUrl: z.string().url().optional(),
  
  // Analytics
  usageStats: TemplateUsageStats.optional(),
  ratings: z.array(TemplateRating).optional(),
  
  // SEO
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  
  // Organization
  organizationId: z.string().optional(),
  teamId: z.string().optional(),
  
  // Versioning
  version: z.string().default('1.0.0'),
  changelog: z.string().optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().optional(),
  
  // Custom Fields
  customFields: z.record(z.any()).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type CMSTemplateType = z.infer<typeof CMSTemplate>;

/**
 * Template Collection
 */
export const TemplateCollection = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  
  // Collection Info
  category: TemplateCategory,
  industry: TemplateIndustry.optional(),
  
  // Content
  templateIds: z.array(z.string()),
  coverImage: z.string().url(),
  
  // Authorship
  createdBy: z.string(),
  curatedBy: z.string().optional(),
  
  // Status
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  
  // Metadata
  tags: z.array(z.string()),
  
  // Stats
  totalTemplates: z.number().default(0),
  totalDownloads: z.number().default(0),
  averageRating: z.number().default(0),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TemplateCollectionType = z.infer<typeof TemplateCollection>;

/**
 * Template Installation
 */
export const TemplateInstallation = z.object({
  id: z.string(),
  templateId: z.string(),
  userId: z.string(),
  
  // Installation Details
  installationType: z.enum(['full', 'blocks_only', 'custom']),
  installedBlocks: z.array(z.string()),
  variables: z.record(z.any()).optional(),
  
  // Status
  status: z.enum(['installing', 'completed', 'failed', 'partial']),
  errorMessage: z.string().optional(),
  
  // Configuration
  pageId: z.string().optional(), // If installed as a page
  targetPath: z.string().optional(),
  
  // Timestamps
  installedAt: z.date(),
  lastUsedAt: z.date().optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type TemplateInstallationType = z.infer<typeof TemplateInstallation>;

/**
 * SaSarjan-Specific Template Categories
 */

// Prosperity-Focused Templates
export const ProsperityTemplateCategory = z.enum([
  'personal_transformation',
  'economic_empowerment',
  'environmental_stewardship',
  'social_connection',
  'cultural_preservation',
  'health_wellbeing',
  'governance_participation',
  'spiritual_growth',
  'knowledge_commons',
]);

export type ProsperityTemplateCategoryType = z.infer<typeof ProsperityTemplateCategory>;

// SaSarjan Template with Prosperity Focus
export const SaSarjanTemplate = CMSTemplate.extend({
  // Prosperity-specific fields
  prosperityCategory: ProsperityTemplateCategory.optional(),
  impactMetrics: z.array(z.object({
    metric: z.string(),
    description: z.string(),
    targetValue: z.string(),
    unit: z.string(),
  })).optional(),
  
  // Community features
  communityFeatures: z.object({
    enableDiscussion: z.boolean().default(false),
    enableCollaboration: z.boolean().default(false),
    enableSharing: z.boolean().default(true),
    enableFeedback: z.boolean().default(true),
  }).optional(),
  
  // Localization support
  supportedLanguages: z.array(z.string()).optional(),
  culturalAdaptations: z.array(z.object({
    region: z.string(),
    adaptations: z.array(z.string()),
    culturalConsiderations: z.string(),
  })).optional(),
  
  // Ubuntu philosophy alignment
  ubuntuPrinciples: z.array(z.enum([
    'interconnectedness',
    'collective_wellbeing',
    'shared_responsibility',
    'inclusive_growth',
    'sustainable_development',
    'cultural_respect',
    'wisdom_sharing',
    'community_empowerment',
  ])).optional(),
});

export type SaSarjanTemplateType = z.infer<typeof SaSarjanTemplate>;