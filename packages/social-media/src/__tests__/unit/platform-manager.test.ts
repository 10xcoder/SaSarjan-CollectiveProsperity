import { describe, it, expect, beforeEach } from 'vitest';
import { PlatformManager } from '../../api/platform-manager';
import { SocialPlatformType, PlatformConfigType } from '../../types';

describe('PlatformManager', () => {
  let platformManager: PlatformManager;

  beforeEach(() => {
    platformManager = new PlatformManager();
  });

  describe('Platform Configuration', () => {
    it('should configure LinkedIn platform correctly', () => {
      const config: PlatformConfigType = {
        platform: 'linkedin',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'http://localhost:3000/callback',
        scope: ['r_liteprofile', 'w_member_social'],
      };

      platformManager.configurePlatform(config);
      
      expect(platformManager.isPlatformConfigured('linkedin')).toBe(true);
      expect(platformManager.getPlatformConfig('linkedin')).toEqual(config);
    });

    it('should configure multiple platforms', () => {
      const linkedInConfig: PlatformConfigType = {
        platform: 'linkedin',
        clientId: 'linkedin-client-id',
        clientSecret: 'linkedin-client-secret',
        redirectUri: 'http://localhost:3000/callback',
        scope: ['r_liteprofile', 'w_member_social'],
      };

      const twitterConfig: PlatformConfigType = {
        platform: 'twitter',
        apiKey: 'twitter-api-key',
        apiSecretKey: 'twitter-api-secret',
        accessToken: 'twitter-access-token',
        accessTokenSecret: 'twitter-access-secret',
      };

      platformManager.configurePlatform(linkedInConfig);
      platformManager.configurePlatform(twitterConfig);

      expect(platformManager.getConfiguredPlatforms()).toContain('linkedin');
      expect(platformManager.getConfiguredPlatforms()).toContain('twitter');
      expect(platformManager.getConfiguredPlatforms()).toHaveLength(2);
    });
  });

  describe('Platform Capabilities', () => {
    it('should return correct capabilities for LinkedIn', () => {
      const capabilities = platformManager.getPlatformCapabilities('linkedin');
      
      expect(capabilities.canPost).toBe(true);
      expect(capabilities.canSchedule).toBe(true);
      expect(capabilities.canUploadMedia).toBe(true);
      expect(capabilities.maxTextLength).toBe(3000);
      expect(capabilities.supportedMediaTypes).toContain('image/jpeg');
      expect(capabilities.rateLimits.postsPerHour).toBe(100);
    });

    it('should return correct capabilities for Twitter', () => {
      const capabilities = platformManager.getPlatformCapabilities('twitter');
      
      expect(capabilities.canPost).toBe(true);
      expect(capabilities.maxTextLength).toBe(280);
      expect(capabilities.supportedMediaTypes).toContain('image/jpeg');
      expect(capabilities.rateLimits.postsPerHour).toBe(50);
    });
  });

  describe('Content Validation', () => {
    it('should validate content within Twitter limits', () => {
      const result = platformManager.validateContent('twitter', {
        text: 'This is a test tweet',
        media: [{
          size: 1024 * 1024, // 1MB
          mimeType: 'image/jpeg',
        }],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject content exceeding Twitter text limit', () => {
      const longText = 'a'.repeat(300); // Exceeds 280 character limit
      
      const result = platformManager.validateContent('twitter', {
        text: longText,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Text exceeds maximum length of 280 characters');
    });

    it('should reject unsupported media types', () => {
      const result = platformManager.validateContent('twitter', {
        text: 'Test',
        media: [{
          size: 1024,
          mimeType: 'application/pdf', // Not supported
        }],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Media type application/pdf is not supported');
    });

    it('should reject media files exceeding size limit', () => {
      const result = platformManager.validateContent('twitter', {
        text: 'Test',
        media: [{
          size: 10 * 1024 * 1024, // 10MB, exceeds Twitter's 5MB limit
          mimeType: 'image/jpeg',
        }],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Media file exceeds maximum size of 5242880 bytes');
    });
  });

  describe('Rate Limit Checking', () => {
    it('should allow posting within rate limits', () => {
      const result = platformManager.checkRateLimit('twitter', 10, 50);
      
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject posting when hourly limit exceeded', () => {
      const result = platformManager.checkRateLimit('twitter', 50, 100);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Rate limit exceeded: 50 posts per hour');
    });

    it('should reject posting when daily limit exceeded', () => {
      const result = platformManager.checkRateLimit('twitter', 10, 300);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Rate limit exceeded: 300 posts per day');
    });
  });

  describe('Content Formatting', () => {
    it('should format content for Twitter correctly', () => {
      const formatted = platformManager.formatContentForPlatform('twitter', {
        text: 'Check out this amazing content!',
        hashtags: ['amazing', 'content'],
        mentions: ['testuser'],
      });

      expect(formatted).toContain('@testuser');
      expect(formatted).toContain('#amazing');
      expect(formatted).toContain('#content');
      expect(formatted).toContain('Check out this amazing content!');
    });

    it('should truncate long content for Twitter', () => {
      const longText = 'a'.repeat(300);
      
      const formatted = platformManager.formatContentForPlatform('twitter', {
        text: longText,
        hashtags: [],
        mentions: [],
      });

      expect(formatted.length).toBeLessThanOrEqual(280);
      expect(formatted).toMatch(/\.\.\.$/);
    });

    it('should format content for LinkedIn with line breaks', () => {
      const formatted = platformManager.formatContentForPlatform('linkedin', {
        text: 'Line 1\nLine 2',
        hashtags: ['professional'],
        mentions: [],
      });

      expect(formatted).toContain('Line 1\n\nLine 2');
      expect(formatted).toContain('#professional');
    });
  });

  describe('Posting Recommendations', () => {
    it('should return LinkedIn recommendations', () => {
      const recommendations = platformManager.getPostingRecommendations('linkedin');
      
      expect(recommendations.maxHashtags).toBe(5);
      expect(recommendations.maxMentions).toBe(3);
      expect(recommendations.preferredContentLength).toBe(1500);
      expect(recommendations.tips).toContain('Use professional tone');
    });

    it('should return Twitter recommendations', () => {
      const recommendations = platformManager.getPostingRecommendations('twitter');
      
      expect(recommendations.maxHashtags).toBe(3);
      expect(recommendations.preferredContentLength).toBe(240);
      expect(recommendations.tips).toContain('Keep it concise');
    });
  });

  describe('Optimal Posting Times', () => {
    it('should return optimal posting time for LinkedIn', () => {
      const optimalTime = platformManager.getOptimalPostingTime('linkedin');
      
      expect(optimalTime.hour).toBe(9);
      expect(optimalTime.dayOfWeek).toBe(2); // Tuesday
      expect(optimalTime.timezone).toBe('UTC');
    });

    it('should return optimal posting time for Twitter', () => {
      const optimalTime = platformManager.getOptimalPostingTime('twitter');
      
      expect(optimalTime.hour).toBe(12);
      expect(optimalTime.dayOfWeek).toBe(3); // Wednesday
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported platform configuration', () => {
      const unsupportedConfig = {
        platform: 'tiktok' as SocialPlatformType,
        clientId: 'test',
        clientSecret: 'test',
      };

      expect(() => {
        platformManager.configurePlatform(unsupportedConfig as any);
      }).toThrow('Unsupported platform: tiktok');
    });

    it('should return undefined for unconfigured platform', () => {
      expect(platformManager.getPlatform('linkedin')).toBeUndefined();
      expect(platformManager.getPlatformConfig('linkedin')).toBeUndefined();
    });
  });
});