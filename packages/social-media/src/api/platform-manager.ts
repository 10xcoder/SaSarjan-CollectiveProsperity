import {
  SocialPlatformType,
  PlatformConfigType,
  PlatformCapabilities,
  PLATFORM_CAPABILITIES,
  AuthConfigType,
  OAuthTokenType,
  PlatformAccountInfoType,
} from '../types';
import { LinkedInPlatform } from '../platforms/linkedin';
import { TwitterPlatform } from '../platforms/twitter';
import { FacebookPlatform } from '../platforms/facebook';
import { InstagramPlatform } from '../platforms/instagram';

export interface IPlatform {
  getAuthConfig(): AuthConfigType;
  getCapabilities(): PlatformCapabilities;
  exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
    codeVerifier?: string;
  }): Promise<OAuthTokenType>;
  refreshTokens(refreshToken: string): Promise<OAuthTokenType>;
  revokeTokens(accessToken: string): Promise<void>;
  getUserInfo(accessToken: string): Promise<PlatformAccountInfoType>;
  validateTokens(accessToken: string): Promise<boolean>;
  post(params: {
    accessToken: string;
    content: string;
    media?: Array<{ url: string; type: string; alt?: string }>;
    scheduledFor?: Date;
  }): Promise<{ id: string; url?: string }>;
  getAnalytics(params: {
    accessToken: string;
    postId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Record<string, unknown>>;
}

export class PlatformManager {
  private platforms: Map<SocialPlatformType, IPlatform> = new Map();
  private configs: Map<SocialPlatformType, PlatformConfigType> = new Map();

  constructor() {
    this.initializePlatforms();
  }

  /**
   * Initialize platform instances
   */
  private initializePlatforms(): void {
    // Initialize platforms when configs are available
    // This will be called when configs are loaded
  }

  /**
   * Configure a platform
   */
  configurePlatform(config: PlatformConfigType): void {
    this.configs.set(config.platform, config);
    
    // Initialize platform instance based on type
    switch (config.platform) {
      case 'linkedin':
        this.platforms.set('linkedin', new LinkedInPlatform(config));
        break;
      case 'twitter':
        this.platforms.set('twitter', new TwitterPlatform(config));
        break;
      case 'facebook':
        this.platforms.set('facebook', new FacebookPlatform(config));
        break;
      case 'instagram':
        this.platforms.set('instagram', new InstagramPlatform(config));
        break;
      default:
        throw new Error(`Unsupported platform: ${config.platform}`);
    }
  }

  /**
   * Get platform instance
   */
  getPlatform(platform: SocialPlatformType): IPlatform | undefined {
    return this.platforms.get(platform);
  }

  /**
   * Get platform configuration
   */
  getPlatformConfig(platform: SocialPlatformType): PlatformConfigType | undefined {
    return this.configs.get(platform);
  }

  /**
   * Get platform capabilities
   */
  getPlatformCapabilities(platform: SocialPlatformType): PlatformCapabilities {
    return PLATFORM_CAPABILITIES[platform];
  }

  /**
   * Get all configured platforms
   */
  getConfiguredPlatforms(): SocialPlatformType[] {
    return Array.from(this.platforms.keys());
  }

  /**
   * Check if platform is configured
   */
  isPlatformConfigured(platform: SocialPlatformType): boolean {
    return this.platforms.has(platform);
  }

  /**
   * Validate content against platform constraints
   */
  validateContent(platform: SocialPlatformType, content: {
    text: string;
    media?: Array<{ size: number; mimeType: string }>;
  }): { valid: boolean; errors: string[] } {
    const capabilities = this.getPlatformCapabilities(platform);
    const errors: string[] = [];

    // Check text length
    if (content.text.length > capabilities.maxTextLength) {
      errors.push(`Text exceeds maximum length of ${capabilities.maxTextLength} characters`);
    }

    // Check media
    if (content.media) {
      for (const item of content.media) {
        if (item.size > capabilities.maxMediaSize) {
          errors.push(`Media file exceeds maximum size of ${capabilities.maxMediaSize} bytes`);
        }
        
        if (!capabilities.supportedMediaTypes.includes(item.mimeType)) {
          errors.push(`Media type ${item.mimeType} is not supported`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check rate limits for platform
   */
  checkRateLimit(platform: SocialPlatformType, postsInLastHour: number, postsInLastDay: number): {
    allowed: boolean;
    reason?: string;
  } {
    const capabilities = this.getPlatformCapabilities(platform);

    if (postsInLastHour >= capabilities.rateLimits.postsPerHour) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${capabilities.rateLimits.postsPerHour} posts per hour`,
      };
    }

    if (postsInLastDay >= capabilities.rateLimits.postsPerDay) {
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${capabilities.rateLimits.postsPerDay} posts per day`,
      };
    }

    return { allowed: true };
  }

  /**
   * Get optimal posting time for platform
   */
  getOptimalPostingTime(platform: SocialPlatformType): {
    hour: number;
    dayOfWeek: number;
    timezone: string;
  } {
    // This would typically come from analytics data
    // For now, return platform-specific defaults
    const defaults = {
      linkedin: { hour: 9, dayOfWeek: 2, timezone: 'UTC' }, // Tuesday 9 AM
      twitter: { hour: 12, dayOfWeek: 3, timezone: 'UTC' }, // Wednesday 12 PM
      facebook: { hour: 15, dayOfWeek: 4, timezone: 'UTC' }, // Thursday 3 PM
      instagram: { hour: 11, dayOfWeek: 5, timezone: 'UTC' }, // Friday 11 AM
      youtube: { hour: 14, dayOfWeek: 6, timezone: 'UTC' }, // Saturday 2 PM
      whatsapp: { hour: 10, dayOfWeek: 1, timezone: 'UTC' }, // Monday 10 AM
    };

    return defaults[platform];
  }

  /**
   * Format content for platform
   */
  formatContentForPlatform(platform: SocialPlatformType, content: {
    text: string;
    hashtags: string[];
    mentions: string[];
  }): string {
    let formattedContent = content.text;

    // Add mentions
    if (content.mentions.length > 0) {
      const mentionFormat = platform === 'twitter' ? '@' : '@';
      const mentions = content.mentions.map(mention => `${mentionFormat}${mention}`).join(' ');
      formattedContent = `${mentions}\n\n${formattedContent}`;
    }

    // Add hashtags
    if (content.hashtags.length > 0) {
      const hashtags = content.hashtags.map(tag => `#${tag.replace(/^#/, '')}`).join(' ');
      formattedContent = `${formattedContent}\n\n${hashtags}`;
    }

    // Platform-specific formatting
    switch (platform) {
      case 'linkedin':
        // LinkedIn prefers line breaks and professional tone
        formattedContent = formattedContent.replace(/\n/g, '\n\n');
        break;
      case 'twitter':
        // Twitter has character limits, ensure it fits
        const capabilities = this.getPlatformCapabilities(platform);
        if (formattedContent.length > capabilities.maxTextLength) {
          formattedContent = formattedContent.substring(0, capabilities.maxTextLength - 3) + '...';
        }
        break;
      case 'facebook':
        // Facebook allows longer content, no special formatting needed
        break;
      case 'instagram':
        // Instagram is visual-first, shorter captions work better
        break;
    }

    return formattedContent;
  }

  /**
   * Get platform-specific posting recommendations
   */
  getPostingRecommendations(platform: SocialPlatformType): {
    maxHashtags: number;
    maxMentions: number;
    preferredContentLength: number;
    bestMediaTypes: string[];
    tips: string[];
  } {
    const recommendations = {
      linkedin: {
        maxHashtags: 5,
        maxMentions: 3,
        preferredContentLength: 1500,
        bestMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
        tips: [
          'Use professional tone',
          'Include industry insights',
          'Ask engaging questions',
          'Share valuable content',
        ],
      },
      twitter: {
        maxHashtags: 3,
        maxMentions: 2,
        preferredContentLength: 240,
        bestMediaTypes: ['image/jpeg', 'image/png', 'image/gif'],
        tips: [
          'Keep it concise',
          'Use trending hashtags',
          'Engage with replies quickly',
          'Post at peak hours',
        ],
      },
      facebook: {
        maxHashtags: 3,
        maxMentions: 5,
        preferredContentLength: 500,
        bestMediaTypes: ['image/jpeg', 'video/mp4'],
        tips: [
          'Use eye-catching visuals',
          'Ask questions to boost engagement',
          'Share behind-the-scenes content',
          'Use Facebook-native video',
        ],
      },
      instagram: {
        maxHashtags: 10,
        maxMentions: 5,
        preferredContentLength: 300,
        bestMediaTypes: ['image/jpeg', 'video/mp4'],
        tips: [
          'High-quality visuals are essential',
          'Use relevant hashtags',
          'Post consistently',
          'Engage with your audience',
        ],
      },
      youtube: {
        maxHashtags: 5,
        maxMentions: 2,
        preferredContentLength: 1000,
        bestMediaTypes: ['video/mp4'],
        tips: [
          'Create compelling thumbnails',
          'Optimize video titles',
          'Use relevant keywords',
          'Encourage subscriptions',
        ],
      },
      whatsapp: {
        maxHashtags: 0,
        maxMentions: 10,
        preferredContentLength: 500,
        bestMediaTypes: ['image/jpeg', 'video/mp4', 'audio/mpeg'],
        tips: [
          'Keep messages personal',
          'Use broadcast lists wisely',
          'Respect privacy settings',
          'Avoid spam-like behavior',
        ],
      },
    };

    return recommendations[platform];
  }
}