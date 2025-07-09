import { z } from 'zod';

/**
 * Page Types for CMS
 */
export const PageType = z.enum([
  'landing',
  'about',
  'pricing',
  'features',
  'blog_post',
  'blog_index',
  'contact',
  'faq',
  'legal',
  'terms',
  'privacy',
  'support',
  'documentation',
  'changelog',
  'campaign',
  'event',
  'partnership',
  'press',
  'team',
  'careers',
  'case_study',
  'testimonials',
  'resources',
  'api_docs',
  'developer',
  'custom',
]);

export type PageTypeType = z.infer<typeof PageType>;

/**
 * Page Status
 */
export const PageStatus = z.enum([
  'draft',
  'review',
  'scheduled',
  'published',
  'archived',
  'unpublished',
]);

export type PageStatusType = z.infer<typeof PageStatus>;

/**
 * Page Visibility
 */
export const PageVisibility = z.enum([
  'public',
  'unlisted',
  'private',
  'password_protected',
  'members_only',
]);

export type PageVisibilityType = z.infer<typeof PageVisibility>;

/**
 * SEO Metadata
 */
export const SEOMetadata = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  canonical: z.string().url().optional(),
  noindex: z.boolean().default(false),
  nofollow: z.boolean().default(false),
  
  // Open Graph
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url().optional(),
  ogType: z.string().default('website'),
  ogUrl: z.string().url().optional(),
  
  // Twitter Card
  twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).default('summary_large_image'),
  twitterSite: z.string().optional(),
  twitterCreator: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().url().optional(),
  
  // Schema.org Structured Data
  structuredData: z.record(z.any()).optional(),
  
  // Additional Meta Tags
  additionalMeta: z.array(z.object({
    name: z.string(),
    content: z.string(),
    property: z.string().optional(),
  })).optional(),
});

export type SEOMetadataType = z.infer<typeof SEOMetadata>;

/**
 * Page Template
 */
export const PageTemplate = z.enum([
  'default',
  'hero_cta',
  'hero_video',
  'hero_image',
  'features_grid',
  'features_tabs',
  'pricing_table',
  'pricing_cards',
  'blog_list',
  'blog_post',
  'about_team',
  'about_story',
  'contact_form',
  'faq_accordion',
  'testimonials_carousel',
  'case_study_detailed',
  'press_kit',
  'event_landing',
  'partnership_form',
  'developer_docs',
  'api_reference',
  'changelog_timeline',
  'careers_listing',
  'legal_document',
  'coming_soon',
  'maintenance',
  'error_404',
  'custom',
]);

export type PageTemplateType = z.infer<typeof PageTemplate>;

/**
 * Content Block Base
 */
export const ContentBlockBase = z.object({
  id: z.string(),
  type: z.string(),
  order: z.number(),
  settings: z.record(z.any()).optional(),
  styles: z.record(z.any()).optional(),
  responsive: z.object({
    mobile: z.record(z.any()).optional(),
    tablet: z.record(z.any()).optional(),
    desktop: z.record(z.any()).optional(),
  }).optional(),
  conditions: z.object({
    showIf: z.record(z.any()).optional(),
    hideIf: z.record(z.any()).optional(),
    userRoles: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.date().optional(),
      end: z.date().optional(),
    }).optional(),
  }).optional(),
});

export type ContentBlockBaseType = z.infer<typeof ContentBlockBase>;

/**
 * Content Blocks - Specific Types
 */

// Hero Section Block
export const HeroBlock = ContentBlockBase.extend({
  type: z.literal('hero'),
  data: z.object({
    headline: z.string(),
    subheadline: z.string().optional(),
    description: z.string().optional(),
    backgroundImage: z.string().url().optional(),
    backgroundVideo: z.string().url().optional(),
    ctaPrimary: z.object({
      text: z.string(),
      url: z.string(),
      style: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('primary'),
    }).optional(),
    ctaSecondary: z.object({
      text: z.string(),
      url: z.string(),
      style: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('secondary'),
    }).optional(),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    overlay: z.object({
      enabled: z.boolean().default(false),
      color: z.string().default('rgba(0,0,0,0.5)'),
    }).optional(),
  }),
});

// Features Block
export const FeaturesBlock = ContentBlockBase.extend({
  type: z.literal('features'),
  data: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    layout: z.enum(['grid', 'list', 'carousel', 'tabs']).default('grid'),
    columns: z.number().min(1).max(6).default(3),
    features: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      icon: z.string().optional(),
      image: z.string().url().optional(),
      link: z.string().url().optional(),
      order: z.number(),
    })),
  }),
});

// Text Block
export const TextBlock = ContentBlockBase.extend({
  type: z.literal('text'),
  data: z.object({
    content: z.string(), // Rich HTML content
    format: z.enum(['html', 'markdown', 'plain']).default('html'),
    alignment: z.enum(['left', 'center', 'right', 'justify']).default('left'),
    maxWidth: z.string().optional(),
  }),
});

// Image Block
export const ImageBlock = ContentBlockBase.extend({
  type: z.literal('image'),
  data: z.object({
    src: z.string().url(),
    alt: z.string(),
    caption: z.string().optional(),
    alignment: z.enum(['left', 'center', 'right', 'full']).default('center'),
    link: z.string().url().optional(),
    lazy: z.boolean().default(true),
    sizes: z.object({
      mobile: z.string().optional(),
      tablet: z.string().optional(),
      desktop: z.string().optional(),
    }).optional(),
  }),
});

// Video Block
export const VideoBlock = ContentBlockBase.extend({
  type: z.literal('video'),
  data: z.object({
    src: z.string().url(),
    poster: z.string().url().optional(),
    caption: z.string().optional(),
    autoplay: z.boolean().default(false),
    loop: z.boolean().default(false),
    muted: z.boolean().default(false),
    controls: z.boolean().default(true),
    aspectRatio: z.enum(['16:9', '4:3', '1:1', '9:16']).default('16:9'),
    provider: z.enum(['youtube', 'vimeo', 'self-hosted']).optional(),
    videoId: z.string().optional(),
  }),
});

// CTA Block
export const CTABlock = ContentBlockBase.extend({
  type: z.literal('cta'),
  data: z.object({
    headline: z.string(),
    description: z.string().optional(),
    button: z.object({
      text: z.string(),
      url: z.string(),
      style: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('primary'),
      size: z.enum(['small', 'medium', 'large']).default('medium'),
    }),
    backgroundImage: z.string().url().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
  }),
});

// Testimonials Block
export const TestimonialsBlock = ContentBlockBase.extend({
  type: z.literal('testimonials'),
  data: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    layout: z.enum(['carousel', 'grid', 'list']).default('carousel'),
    testimonials: z.array(z.object({
      id: z.string(),
      quote: z.string(),
      author: z.object({
        name: z.string(),
        title: z.string().optional(),
        company: z.string().optional(),
        avatar: z.string().url().optional(),
      }),
      rating: z.number().min(1).max(5).optional(),
      order: z.number(),
    })),
  }),
});

// FAQ Block
export const FAQBlock = ContentBlockBase.extend({
  type: z.literal('faq'),
  data: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    layout: z.enum(['accordion', 'tabs', 'grid']).default('accordion'),
    searchable: z.boolean().default(false),
    categories: z.array(z.string()).optional(),
    faqs: z.array(z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
      category: z.string().optional(),
      order: z.number(),
    })),
  }),
});

// Form Block
export const FormBlock = ContentBlockBase.extend({
  type: z.literal('form'),
  data: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    formId: z.string(),
    action: z.string().url(),
    method: z.enum(['GET', 'POST']).default('POST'),
    successMessage: z.string().default('Thank you for your submission!'),
    errorMessage: z.string().default('Something went wrong. Please try again.'),
    fields: z.array(z.object({
      id: z.string(),
      type: z.enum(['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio', 'file']),
      label: z.string(),
      placeholder: z.string().optional(),
      required: z.boolean().default(false),
      validation: z.object({
        pattern: z.string().optional(),
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
      options: z.array(z.object({
        value: z.string(),
        label: z.string(),
      })).optional(),
      order: z.number(),
    })),
  }),
});

// Stats Block
export const StatsBlock = ContentBlockBase.extend({
  type: z.literal('stats'),
  data: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    layout: z.enum(['horizontal', 'grid', 'carousel']).default('grid'),
    animated: z.boolean().default(true),
    stats: z.array(z.object({
      id: z.string(),
      value: z.string(), // Could be number or formatted string like "10K+"
      label: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
      prefix: z.string().optional(),
      suffix: z.string().optional(),
      color: z.string().optional(),
      order: z.number(),
    })),
  }),
});

// Team Block
export const TeamBlock = ContentBlockBase.extend({
  type: z.literal('team'),
  data: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    layout: z.enum(['grid', 'carousel', 'list']).default('grid'),
    columns: z.number().min(1).max(6).default(3),
    members: z.array(z.object({
      id: z.string(),
      name: z.string(),
      title: z.string(),
      bio: z.string().optional(),
      avatar: z.string().url(),
      email: z.string().email().optional(),
      social: z.object({
        linkedin: z.string().url().optional(),
        twitter: z.string().url().optional(),
        github: z.string().url().optional(),
        website: z.string().url().optional(),
      }).optional(),
      order: z.number(),
    })),
  }),
});

// Apps Showcase Block (SaSarjan specific)
export const AppsShowcaseBlock = ContentBlockBase.extend({
  type: z.literal('apps_showcase'),
  data: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    layout: z.enum(['grid', 'carousel', 'featured']).default('grid'),
    showCategories: z.boolean().default(true),
    showMetrics: z.boolean().default(true),
    appIds: z.array(z.string()).optional(), // If empty, show all apps
    categories: z.array(z.string()).optional(), // Filter by categories
    maxApps: z.number().optional(),
  }),
});

// Prosperity Categories Block (SaSarjan specific)
export const ProsperityCategoriesBlock = ContentBlockBase.extend({
  type: z.literal('prosperity_categories'),
  data: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    layout: z.enum(['grid', 'carousel', 'tabs', 'accordion']).default('grid'),
    columns: z.number().min(1).max(8).default(4),
    showDescriptions: z.boolean().default(true),
    showIcons: z.boolean().default(true),
    showCounts: z.boolean().default(false),
    categories: z.array(z.string()).optional(), // If empty, show all categories
  }),
});

// Union of all content blocks
export const ContentBlock = z.discriminatedUnion('type', [
  HeroBlock,
  FeaturesBlock,
  TextBlock,
  ImageBlock,
  VideoBlock,
  CTABlock,
  TestimonialsBlock,
  FAQBlock,
  FormBlock,
  StatsBlock,
  TeamBlock,
  AppsShowcaseBlock,
  ProsperityCategoriesBlock,
]);

export type ContentBlockType = z.infer<typeof ContentBlock>;

// Individual block types
export type HeroBlockType = z.infer<typeof HeroBlock>;
export type FeaturesBlockType = z.infer<typeof FeaturesBlock>;
export type TextBlockType = z.infer<typeof TextBlock>;
export type ImageBlockType = z.infer<typeof ImageBlock>;
export type VideoBlockType = z.infer<typeof VideoBlock>;
export type CTABlockType = z.infer<typeof CTABlock>;
export type TestimonialsBlockType = z.infer<typeof TestimonialsBlock>;
export type FAQBlockType = z.infer<typeof FAQBlock>;
export type FormBlockType = z.infer<typeof FormBlock>;
export type StatsBlockType = z.infer<typeof StatsBlock>;
export type TeamBlockType = z.infer<typeof TeamBlock>;
export type AppsShowcaseBlockType = z.infer<typeof AppsShowcaseBlock>;
export type ProsperityCategoriesBlockType = z.infer<typeof ProsperityCategoriesBlock>;

/**
 * Page Version
 */
export const PageVersion = z.object({
  version: z.string(),
  changelog: z.string().optional(),
  publishedAt: z.date(),
  publishedBy: z.string(),
  previousVersion: z.string().optional(),
  blocks: z.array(ContentBlock),
  seo: SEOMetadata.optional(),
});

export type PageVersionType = z.infer<typeof PageVersion>;

/**
 * Page Analytics
 */
export const PageAnalytics = z.object({
  pageId: z.string(),
  views: z.number().default(0),
  uniqueViews: z.number().default(0),
  bounceRate: z.number().default(0), // percentage
  averageTimeOnPage: z.number().default(0), // seconds
  conversionRate: z.number().default(0), // percentage
  topReferrers: z.array(z.object({
    domain: z.string(),
    count: z.number(),
  })).optional(),
  topCountries: z.array(z.object({
    country: z.string(),
    count: z.number(),
  })).optional(),
  deviceBreakdown: z.object({
    mobile: z.number().default(0),
    tablet: z.number().default(0),
    desktop: z.number().default(0),
  }).optional(),
  lastUpdated: z.date(),
});

export type PageAnalyticsType = z.infer<typeof PageAnalytics>;

/**
 * Main Page Schema
 */
export const CMSPage = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  type: PageType,
  template: PageTemplate,
  status: PageStatus,
  visibility: PageVisibility,
  
  // Content
  blocks: z.array(ContentBlock),
  
  // SEO and Metadata
  seo: SEOMetadata.optional(),
  
  // Authorship
  createdBy: z.string(),
  lastEditedBy: z.string(),
  
  // Organization
  appId: z.string().optional(), // Which app this page belongs to
  organizationId: z.string().optional(),
  parentPageId: z.string().optional(),
  childPages: z.array(z.string()).optional(),
  
  // Categorization
  tags: z.array(z.string()),
  categories: z.array(z.string()),
  
  // Publishing
  publishedAt: z.date().optional(),
  scheduledAt: z.date().optional(),
  expiresAt: z.date().optional(),
  
  // Versioning
  version: z.string().default('1.0'),
  versions: z.array(PageVersion),
  
  // Settings
  settings: z.object({
    // Navigation
    showInNavigation: z.boolean().default(false),
    navigationOrder: z.number().optional(),
    navigationParent: z.string().optional(),
    
    // Comments and Interactions
    allowComments: z.boolean().default(false),
    allowSharing: z.boolean().default(true),
    
    // Access Control
    password: z.string().optional(),
    membershipRequired: z.boolean().default(false),
    allowedRoles: z.array(z.string()).optional(),
    
    // Advanced
    customCSS: z.string().optional(),
    customJS: z.string().optional(),
    redirectUrl: z.string().url().optional(),
    
    // Analytics
    trackingEnabled: z.boolean().default(true),
    conversionGoals: z.array(z.object({
      name: z.string(),
      type: z.enum(['page_view', 'click', 'form_submit', 'download']),
      target: z.string(),
    })).optional(),
  }).optional(),
  
  // Localization
  language: z.string().default('en'),
  translations: z.array(z.object({
    language: z.string(),
    title: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    blocks: z.array(ContentBlock),
    seo: SEOMetadata.optional(),
    translatedBy: z.string(),
    translatedAt: z.date(),
  })).optional(),
  
  // Performance
  cacheSettings: z.object({
    enabled: z.boolean().default(true),
    ttl: z.number().default(3600), // seconds
    varyByUser: z.boolean().default(false),
    varyByDevice: z.boolean().default(false),
  }).optional(),
  
  // A/B Testing
  experiments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['draft', 'running', 'completed', 'paused']),
    variants: z.array(z.object({
      id: z.string(),
      name: z.string(),
      traffic: z.number(), // percentage
      blocks: z.array(ContentBlock),
    })),
    startDate: z.date(),
    endDate: z.date().optional(),
    conversionGoal: z.string(),
  })).optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  
  // Analytics
  analytics: PageAnalytics.optional(),
  
  // Custom Fields
  customFields: z.record(z.any()).optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
});

export type CMSPageType = z.infer<typeof CMSPage>;