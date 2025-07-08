import { z } from 'zod';
import { SocialPlatform, PlatformConfig } from './social-platforms';

// App-specific social media configuration
export const AppSocialConfig = z.object({
  appId: z.string(),
  appName: z.string(),
  enabled: z.boolean().default(true),
  platforms: z.array(PlatformConfig),
  defaultHashtags: z.array(z.string()).default([]),
  defaultMentions: z.array(z.string()).default([]),
  branding: z.object({
    logo: z.string().optional(),
    colors: z.object({
      primary: z.string(),
      secondary: z.string(),
      accent: z.string().optional(),
    }),
    watermark: z.boolean().default(false),
    signature: z.string().optional(),
  }).optional(),
  automation: z.object({
    autoSchedule: z.boolean().default(false),
    autoHashtags: z.boolean().default(false),
    autoMentions: z.boolean().default(false),
    smartScheduling: z.boolean().default(false),
  }).default({}),
  restrictions: z.object({
    maxPostsPerDay: z.number().default(10),
    maxPostsPerHour: z.number().default(5),
    allowedContentTypes: z.array(z.string()).default(['text', 'image', 'video']),
    prohibitedKeywords: z.array(z.string()).default([]),
    requireApproval: z.boolean().default(false),
  }).default({}),
  analytics: z.object({
    enabled: z.boolean().default(true),
    retentionDays: z.number().default(90),
    realTimeUpdates: z.boolean().default(true),
    webhookUrl: z.string().optional(),
  }).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AppSocialConfigType = z.infer<typeof AppSocialConfig>;

// Global social media configuration
export const GlobalSocialConfig = z.object({
  rateLimit: z.object({
    enabled: z.boolean().default(true),
    globalLimit: z.number().default(1000), // requests per hour
    perPlatformLimit: z.number().default(100), // requests per hour per platform
    perUserLimit: z.number().default(50), // requests per hour per user
  }),
  storage: z.object({
    provider: z.enum(['local', 's3', 'cloudinary', 'gcs']),
    config: z.record(z.unknown()),
    maxFileSize: z.number().default(25 * 1024 * 1024), // 25MB
    allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/gif', 'video/mp4']),
    compressionEnabled: z.boolean().default(true),
  }),
  security: z.object({
    encryptTokens: z.boolean().default(true),
    tokenRotation: z.boolean().default(true),
    tokenRotationInterval: z.number().default(30), // days
    auditLogging: z.boolean().default(true),
    ipWhitelist: z.array(z.string()).default([]),
  }),
  features: z.object({
    scheduling: z.boolean().default(true),
    analytics: z.boolean().default(true),
    templates: z.boolean().default(true),
    bulkPosting: z.boolean().default(true),
    contentApproval: z.boolean().default(false),
    aiAssistance: z.boolean().default(false),
  }),
  notifications: z.object({
    email: z.boolean().default(true),
    webhook: z.boolean().default(false),
    sms: z.boolean().default(false),
    events: z.array(z.enum([
      'post_published',
      'post_failed',
      'auth_expired',
      'rate_limit_exceeded',
      'high_engagement',
      'low_engagement',
    ])).default(['post_failed', 'auth_expired']),
  }),
  maintenance: z.object({
    enabled: z.boolean().default(false),
    message: z.string().optional(),
    allowedUsers: z.array(z.string()).default([]),
  }),
});

export type GlobalSocialConfigType = z.infer<typeof GlobalSocialConfig>;

// User social media preferences
export const UserSocialPreferences = z.object({
  userId: z.string(),
  preferences: z.object({
    defaultPlatforms: z.array(SocialPlatform).default([]),
    defaultScheduleTime: z.string().optional(), // HH:MM format
    defaultHashtags: z.array(z.string()).default([]),
    autoSave: z.boolean().default(true),
    notifications: z.object({
      postPublished: z.boolean().default(true),
      postFailed: z.boolean().default(true),
      authExpired: z.boolean().default(true),
      highEngagement: z.boolean().default(false),
      weeklyReport: z.boolean().default(false),
    }).default({}),
    timezone: z.string().default('UTC'),
    language: z.string().default('en'),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserSocialPreferencesType = z.infer<typeof UserSocialPreferences>;

// Content moderation settings
export const ContentModerationConfig = z.object({
  enabled: z.boolean().default(false),
  autoModeration: z.boolean().default(false),
  humanReview: z.boolean().default(true),
  filters: z.object({
    profanity: z.boolean().default(true),
    spam: z.boolean().default(true),
    hate: z.boolean().default(true),
    adult: z.boolean().default(true),
    violence: z.boolean().default(true),
    custom: z.array(z.string()).default([]),
  }),
  actions: z.object({
    block: z.boolean().default(true),
    flag: z.boolean().default(true),
    review: z.boolean().default(true),
    notify: z.boolean().default(true),
  }),
  whitelist: z.object({
    users: z.array(z.string()).default([]),
    domains: z.array(z.string()).default([]),
    keywords: z.array(z.string()).default([]),
  }),
  sensitivity: z.enum(['low', 'medium', 'high']).default('medium'),
});

export type ContentModerationConfigType = z.infer<typeof ContentModerationConfig>;

// API configuration for platforms
export const PlatformApiConfig = z.object({
  platform: SocialPlatform,
  version: z.string().default('v1'),
  baseUrl: z.string(),
  endpoints: z.record(z.string()),
  rateLimit: z.object({
    requests: z.number(),
    window: z.number(), // seconds
    burst: z.number().optional(),
  }),
  retryConfig: z.object({
    maxRetries: z.number().default(3),
    backoffStrategy: z.enum(['linear', 'exponential']).default('exponential'),
    baseDelay: z.number().default(1000), // milliseconds
    maxDelay: z.number().default(30000), // milliseconds
  }),
  timeout: z.number().default(30000), // milliseconds
  headers: z.record(z.string()).default({}),
});

export type PlatformApiConfigType = z.infer<typeof PlatformApiConfig>;

// Webhook configuration
export const WebhookConfig = z.object({
  enabled: z.boolean().default(false),
  url: z.string().optional(),
  events: z.array(z.enum([
    'post.published',
    'post.failed',
    'post.scheduled',
    'post.deleted',
    'auth.connected',
    'auth.disconnected',
    'auth.expired',
    'analytics.updated',
    'rate_limit.exceeded',
  ])).default([]),
  secret: z.string().optional(),
  headers: z.record(z.string()).default({}),
  timeout: z.number().default(10000), // milliseconds
  retries: z.number().default(3),
});

export type WebhookConfigType = z.infer<typeof WebhookConfig>;

// Complete social media configuration
export const SocialMediaConfig = z.object({
  global: GlobalSocialConfig,
  apps: z.array(AppSocialConfig),
  moderation: ContentModerationConfig,
  apiConfigs: z.array(PlatformApiConfig),
  webhooks: z.array(WebhookConfig),
  version: z.string().default('1.0.0'),
  lastUpdated: z.date(),
});

export type SocialMediaConfigType = z.infer<typeof SocialMediaConfig>;