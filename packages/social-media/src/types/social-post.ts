import { z } from 'zod';
import { SocialPlatform } from './social-platforms';

// Media types for social posts
export const MediaType = z.enum([
  'image',
  'video',
  'audio',
  'document',
  'gif',
]);

export type MediaTypeType = z.infer<typeof MediaType>;

// Media attachment schema
export const MediaAttachment = z.object({
  id: z.string(),
  type: MediaType,
  url: z.string(),
  thumbnailUrl: z.string().optional(),
  filename: z.string(),
  size: z.number(),
  mimeType: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(), // for video/audio in seconds
});

export type MediaAttachmentType = z.infer<typeof MediaAttachment>;

// Post status
export const PostStatus = z.enum([
  'draft',
  'scheduled',
  'posting',
  'published',
  'failed',
  'deleted',
]);

export type PostStatusType = z.infer<typeof PostStatus>;

// Post priority
export const PostPriority = z.enum([
  'low',
  'normal',
  'high',
  'urgent',
]);

export type PostPriorityType = z.infer<typeof PostPriority>;

// Base social post schema
export const BaseSocialPost = z.object({
  id: z.string(),
  userId: z.string(),
  appId: z.string(),
  title: z.string().optional(),
  content: z.string(),
  summary: z.string().optional(),
  hashtags: z.array(z.string()).default([]),
  mentions: z.array(z.string()).default([]),
  media: z.array(MediaAttachment).default([]),
  platforms: z.array(SocialPlatform),
  status: PostStatus,
  priority: PostPriority.default('normal'),
  scheduledAt: z.date().optional(),
  publishedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export type BaseSocialPostType = z.infer<typeof BaseSocialPost>;

// Platform-specific post configurations
export const PlatformPostConfig = z.object({
  platform: SocialPlatform,
  enabled: z.boolean().default(true),
  customContent: z.string().optional(),
  customHashtags: z.array(z.string()).default([]),
  customMentions: z.array(z.string()).default([]),
  customMedia: z.array(MediaAttachment).default([]),
  platformSpecificData: z.record(z.unknown()).optional(),
});

export type PlatformPostConfigType = z.infer<typeof PlatformPostConfig>;

// Full social post with platform-specific configurations
export const SocialPost = BaseSocialPost.extend({
  platformConfigs: z.array(PlatformPostConfig).default([]),
});

export type SocialPostType = z.infer<typeof SocialPost>;

// Post template for reusable content
export const PostTemplate = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  content: z.string(),
  hashtags: z.array(z.string()).default([]),
  platforms: z.array(SocialPlatform),
  variables: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(['text', 'url', 'date', 'number']),
    required: z.boolean().default(false),
    defaultValue: z.string().optional(),
  })).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PostTemplateType = z.infer<typeof PostTemplate>;

// Post series for campaigns
export const PostSeries = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  posts: z.array(z.string()), // Array of post IDs
  schedule: z.object({
    startDate: z.date(),
    endDate: z.date().optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']),
    interval: z.number().optional(), // For custom frequency
    daysOfWeek: z.array(z.number()).optional(), // 0-6 for Sun-Sat
    timeOfDay: z.string().optional(), // HH:MM format
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PostSeriesType = z.infer<typeof PostSeries>;

// Post engagement metrics
export const PostEngagement = z.object({
  postId: z.string(),
  platform: SocialPlatform,
  platformPostId: z.string(),
  likes: z.number().default(0),
  shares: z.number().default(0),
  comments: z.number().default(0),
  views: z.number().default(0),
  clicks: z.number().default(0),
  saves: z.number().default(0),
  reach: z.number().default(0),
  impressions: z.number().default(0),
  engagementRate: z.number().default(0),
  lastUpdated: z.date(),
});

export type PostEngagementType = z.infer<typeof PostEngagement>;

// Post creation request
export const CreatePostRequest = z.object({
  content: z.string(),
  title: z.string().optional(),
  summary: z.string().optional(),
  hashtags: z.array(z.string()).default([]),
  mentions: z.array(z.string()).default([]),
  media: z.array(MediaAttachment).default([]),
  platforms: z.array(SocialPlatform),
  scheduledAt: z.date().optional(),
  priority: PostPriority.default('normal'),
  platformConfigs: z.array(PlatformPostConfig).default([]),
  templateId: z.string().optional(),
  seriesId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreatePostRequestType = z.infer<typeof CreatePostRequest>;

// Post update request
export const UpdatePostRequest = CreatePostRequest.partial().extend({
  id: z.string(),
  status: PostStatus.optional(),
});

export type UpdatePostRequestType = z.infer<typeof UpdatePostRequest>;