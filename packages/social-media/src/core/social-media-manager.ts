import { PlatformManager } from '../api/platform-manager';
import { AuthManager } from '../api/auth-manager';
import { PostManager } from '../api/post-manager';
import { MediaManager } from '../api/media-manager';
import { Scheduler } from '../api/scheduler';
import { AnalyticsManager } from '../api/analytics-manager';
import {
  SocialMediaConfigType,
  AppSocialConfigType,
  PlatformConfigType,
  CreatePostRequestType,
  SocialPostType,
  SocialPlatformType,
} from '../types';

export class SocialMediaManager {
  private platformManager: PlatformManager;
  private authManager: AuthManager;
  private postManager: PostManager;
  private mediaManager: MediaManager;
  private scheduler: Scheduler;
  private analyticsManager: AnalyticsManager;
  private config?: SocialMediaConfigType;

  constructor() {
    // Initialize managers
    this.platformManager = new PlatformManager();
    this.authManager = new AuthManager(this.platformManager);
    this.mediaManager = new MediaManager();
    this.scheduler = new Scheduler();
    this.analyticsManager = new AnalyticsManager(this.platformManager, this.authManager);
    
    // Initialize post manager with dependencies
    this.postManager = new PostManager(
      this.platformManager,
      this.authManager,
      this.mediaManager,
      this.scheduler
    );

    // Set circular dependency
    this.scheduler.setPostManager(this.postManager);
  }

  /**
   * Initialize with configuration
   */
  async initialize(config: SocialMediaConfigType): Promise<void> {
    this.config = config;

    // Configure platforms for each app
    for (const appConfig of config.apps) {
      for (const platformConfig of appConfig.platforms) {
        this.platformManager.configurePlatform(platformConfig);
      }
    }
  }

  /**
   * Configure platform for an app
   */
  configurePlatform(appId: string, platformConfig: PlatformConfigType): void {
    this.platformManager.configurePlatform(platformConfig);
  }

  /**
   * Get authentication URL for a platform
   */
  async getAuthUrl(request: {
    platform: SocialPlatformType;
    redirectUri: string;
    scopes?: string[];
    state?: string;
  }) {
    return this.authManager.generateAuthUrl(request);
  }

  /**
   * Handle OAuth callback
   */
  async handleAuthCallback(request: {
    platform: SocialPlatformType;
    code: string;
    state: string;
    redirectUri: string;
    codeVerifier?: string;
  }) {
    return this.authManager.handleCallback(request);
  }

  /**
   * Connect a platform for a user
   */
  async connectPlatform(
    userId: string,
    appId: string,
    platform: SocialPlatformType,
    authResult: any
  ) {
    if (!authResult.success || !authResult.tokens || !authResult.platformUserId) {
      throw new Error('Invalid auth result');
    }

    return this.authManager.storeAuth(
      userId,
      appId,
      platform,
      authResult.tokens,
      {
        id: authResult.platformUserId,
        username: authResult.platformUsername || '',
        displayName: authResult.platformDisplayName || '',
        verified: false,
      }
    );
  }

  /**
   * Disconnect a platform
   */
  async disconnectPlatform(
    userId: string,
    platform: SocialPlatformType,
    revokeTokens = true
  ) {
    return this.authManager.disconnect(userId, platform, { platform, revokeTokens });
  }

  /**
   * Get connected platforms for a user
   */
  async getConnectedPlatforms(userId: string) {
    return this.authManager.getConnectedPlatforms(userId);
  }

  /**
   * Create a social media post
   */
  async createPost(userId: string, request: CreatePostRequestType): Promise<SocialPostType> {
    return this.postManager.createPost(userId, request);
  }

  /**
   * Publish a post immediately
   */
  async publishPost(userId: string, postId: string) {
    return this.postManager.publishPost(userId, postId);
  }

  /**
   * Update a post
   */
  async updatePost(userId: string, request: { id: string; [key: string]: any }) {
    return this.postManager.updatePost(userId, request);
  }

  /**
   * Delete a post
   */
  async deletePost(userId: string, postId: string) {
    return this.postManager.deletePost(userId, postId);
  }

  /**
   * Get user posts
   */
  async getUserPosts(userId: string, options?: any) {
    return this.postManager.getUserPosts(userId, options);
  }

  /**
   * Schedule a post
   */
  async schedulePost(userId: string, request: CreatePostRequestType & { scheduledAt: Date }) {
    return this.postManager.createPost(userId, request);
  }

  /**
   * Get scheduled posts
   */
  async getScheduledPosts(userId: string, options?: any) {
    return this.scheduler.getScheduledPosts(userId, options);
  }

  /**
   * Upload media
   */
  async uploadMedia(options: any) {
    return this.mediaManager.uploadMedia(options);
  }

  /**
   * Get user media library
   */
  async getUserMedia(userId: string, options?: any) {
    return this.mediaManager.getUserMedia(userId, options);
  }

  /**
   * Get analytics for a post
   */
  async getPostAnalytics(userId: string, postId: string) {
    return this.analyticsManager.getPostAnalytics(userId, postId);
  }

  /**
   * Get account analytics
   */
  async getAccountAnalytics(userId: string, platform: SocialPlatformType, options?: any) {
    return this.analyticsManager.getAccountAnalytics(userId, platform, options);
  }

  /**
   * Create post template
   */
  async createTemplate(userId: string, template: any) {
    return this.postManager.createTemplate(userId, template);
  }

  /**
   * Get user templates
   */
  async getUserTemplates(userId: string) {
    return this.postManager.getUserTemplates(userId);
  }

  /**
   * Create post from template
   */
  async createPostFromTemplate(userId: string, templateId: string, variables: Record<string, string>) {
    return this.postManager.createPostFromTemplate(userId, templateId, variables);
  }

  /**
   * Get platform capabilities
   */
  getPlatformCapabilities(platform: SocialPlatformType) {
    return this.platformManager.getPlatformCapabilities(platform);
  }

  /**
   * Validate content for platforms
   */
  validateContent(platform: SocialPlatformType, content: any) {
    return this.platformManager.validateContent(platform, content);
  }

  /**
   * Get posting recommendations
   */
  getPostingRecommendations(platform: SocialPlatformType) {
    return this.platformManager.getPostingRecommendations(platform);
  }

  /**
   * Suggest optimal posting time
   */
  suggestOptimalPostingTime(platforms: SocialPlatformType[], userTimezone?: string) {
    return this.scheduler.suggestOptimalTime(platforms, userTimezone);
  }

  /**
   * Get configured platforms
   */
  getConfiguredPlatforms(): SocialPlatformType[] {
    return this.platformManager.getConfiguredPlatforms();
  }

  /**
   * Check if platform is configured
   */
  isPlatformConfigured(platform: SocialPlatformType): boolean {
    return this.platformManager.isPlatformConfigured(platform);
  }

  /**
   * Stop the manager (cleanup)
   */
  stop(): void {
    this.scheduler.stop();
  }
}