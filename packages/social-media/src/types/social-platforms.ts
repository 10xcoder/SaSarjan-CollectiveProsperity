import { z } from 'zod';

// Supported social media platforms
export const SocialPlatform = z.enum([
  'linkedin',
  'twitter',
  'facebook',
  'instagram',
  'youtube',
  'whatsapp'
]);

export type SocialPlatformType = z.infer<typeof SocialPlatform>;

// Platform-specific configuration
export const LinkedInConfig = z.object({
  platform: z.literal('linkedin'),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
  scope: z.array(z.string()).default(['r_liteprofile', 'r_emailaddress', 'w_member_social']),
});

export const TwitterConfig = z.object({
  platform: z.literal('twitter'),
  apiKey: z.string(),
  apiSecretKey: z.string(),
  accessToken: z.string().optional(),
  accessTokenSecret: z.string().optional(),
  bearerToken: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
});

export const FacebookConfig = z.object({
  platform: z.literal('facebook'),
  appId: z.string(),
  appSecret: z.string(),
  accessToken: z.string().optional(),
  pageId: z.string().optional(),
});

export const InstagramConfig = z.object({
  platform: z.literal('instagram'),
  accessToken: z.string(),
  userId: z.string(),
  businessAccountId: z.string().optional(),
});

export const YouTubeConfig = z.object({
  platform: z.literal('youtube'),
  clientId: z.string(),
  clientSecret: z.string(),
  refreshToken: z.string().optional(),
  accessToken: z.string().optional(),
});

export const WhatsAppConfig = z.object({
  platform: z.literal('whatsapp'),
  phoneNumberId: z.string(),
  accessToken: z.string(),
  businessAccountId: z.string().optional(),
});

// Union type for all platform configurations
export const PlatformConfig = z.union([
  LinkedInConfig,
  TwitterConfig,
  FacebookConfig,
  InstagramConfig,
  YouTubeConfig,
  WhatsAppConfig,
]);

export type PlatformConfigType = z.infer<typeof PlatformConfig>;

// Platform capabilities
export interface PlatformCapabilities {
  canPost: boolean;
  canSchedule: boolean;
  canUploadMedia: boolean;
  canGetAnalytics: boolean;
  supportedMediaTypes: string[];
  maxTextLength: number;
  maxMediaSize: number; // in bytes
  rateLimits: {
    postsPerHour: number;
    postsPerDay: number;
  };
}

// Platform-specific capabilities
export const PLATFORM_CAPABILITIES: Record<SocialPlatformType, PlatformCapabilities> = {
  linkedin: {
    canPost: true,
    canSchedule: true,
    canUploadMedia: true,
    canGetAnalytics: true,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    maxTextLength: 3000,
    maxMediaSize: 100 * 1024 * 1024, // 100MB
    rateLimits: {
      postsPerHour: 100,
      postsPerDay: 500,
    },
  },
  twitter: {
    canPost: true,
    canSchedule: true,
    canUploadMedia: true,
    canGetAnalytics: true,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    maxTextLength: 280,
    maxMediaSize: 5 * 1024 * 1024, // 5MB
    rateLimits: {
      postsPerHour: 50,
      postsPerDay: 300,
    },
  },
  facebook: {
    canPost: true,
    canSchedule: true,
    canUploadMedia: true,
    canGetAnalytics: true,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    maxTextLength: 63206,
    maxMediaSize: 25 * 1024 * 1024, // 25MB
    rateLimits: {
      postsPerHour: 200,
      postsPerDay: 1000,
    },
  },
  instagram: {
    canPost: true,
    canSchedule: true,
    canUploadMedia: true,
    canGetAnalytics: true,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
    maxTextLength: 2200,
    maxMediaSize: 100 * 1024 * 1024, // 100MB
    rateLimits: {
      postsPerHour: 25,
      postsPerDay: 100,
    },
  },
  youtube: {
    canPost: true,
    canSchedule: true,
    canUploadMedia: true,
    canGetAnalytics: true,
    supportedMediaTypes: ['video/mp4', 'video/avi', 'video/quicktime'],
    maxTextLength: 5000,
    maxMediaSize: 256 * 1024 * 1024, // 256MB
    rateLimits: {
      postsPerHour: 6,
      postsPerDay: 100,
    },
  },
  whatsapp: {
    canPost: true,
    canSchedule: false,
    canUploadMedia: true,
    canGetAnalytics: false,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg'],
    maxTextLength: 4096,
    maxMediaSize: 16 * 1024 * 1024, // 16MB
    rateLimits: {
      postsPerHour: 1000,
      postsPerDay: 10000,
    },
  },
};

// Platform status
export const PlatformStatus = z.enum([
  'connected',
  'disconnected',
  'error',
  'pending',
  'expired',
]);

export type PlatformStatusType = z.infer<typeof PlatformStatus>;

// Platform connection info
export const PlatformConnection = z.object({
  platform: SocialPlatform,
  status: PlatformStatus,
  connectedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  lastError: z.string().optional(),
  accountInfo: z.object({
    id: z.string(),
    username: z.string(),
    displayName: z.string(),
    profileImageUrl: z.string().optional(),
    followerCount: z.number().optional(),
    verified: z.boolean().optional(),
  }).optional(),
});

export type PlatformConnectionType = z.infer<typeof PlatformConnection>;