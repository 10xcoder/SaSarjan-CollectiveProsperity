import { nanoid } from 'nanoid';
import {
  SocialPlatformType,
  PlatformAuthType,
  AuthUrlRequestType,
  AuthUrlResponseType,
  AuthCallbackRequestType,
  AuthCallbackResponseType,
  RefreshTokenRequestType,
  RefreshTokenResponseType,
  DisconnectRequestType,
  AuthStatusType,
  OAuthTokenType,
  PlatformAccountInfoType,
  AuthErrorType,
  OAUTH_ERROR_CODES,
} from '../types';
import { PlatformManager } from './platform-manager';
import { createSupabaseClient } from '@sasarjan/database';

export class AuthManager {
  private platformManager: PlatformManager;
  private supabase = createSupabaseClient();

  constructor(platformManager: PlatformManager) {
    this.platformManager = platformManager;
  }

  /**
   * Generate OAuth authorization URL for a platform
   */
  async generateAuthUrl(request: AuthUrlRequestType): Promise<AuthUrlResponseType> {
    try {
      const platform = this.platformManager.getPlatform(request.platform);
      if (!platform) {
        throw new Error(`Platform ${request.platform} not configured`);
      }

      const config = platform.getAuthConfig();
      const state = request.state || nanoid();
      
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: request.redirectUri,
        response_type: 'code',
        state,
        scope: (request.scopes || config.scopes).join(' '),
      });

      // Add platform-specific parameters
      if (config.additionalParams) {
        Object.entries(config.additionalParams).forEach(([key, value]) => {
          params.append(key, value);
        });
      }

      const url = `${config.authUrl}?${params.toString()}`;

      return {
        url,
        state,
        codeVerifier: config.pkce ? nanoid() : undefined,
      };
    } catch (error) {
      throw this.createAuthError(
        request.platform,
        OAUTH_ERROR_CODES.INVALID_REQUEST,
        `Failed to generate auth URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleCallback(request: AuthCallbackRequestType): Promise<AuthCallbackResponseType> {
    try {
      const platform = this.platformManager.getPlatform(request.platform);
      if (!platform) {
        throw new Error(`Platform ${request.platform} not configured`);
      }

      // Exchange code for tokens
      const tokens = await platform.exchangeCodeForTokens({
        code: request.code,
        redirectUri: request.redirectUri,
        codeVerifier: request.codeVerifier,
      });

      // Get user information
      const accountInfo = await platform.getUserInfo(tokens.accessToken);

      return {
        success: true,
        tokens,
        platformUserId: accountInfo.id,
        platformUsername: accountInfo.username,
        platformDisplayName: accountInfo.displayName,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Store authentication credentials
   */
  async storeAuth(
    userId: string,
    appId: string,
    platform: SocialPlatformType,
    tokens: OAuthTokenType,
    accountInfo: PlatformAccountInfoType
  ): Promise<PlatformAuthType> {
    const authRecord: PlatformAuthType = {
      id: nanoid(),
      userId,
      appId,
      platform,
      status: 'connected',
      tokens,
      platformUserId: accountInfo.id,
      platformUsername: accountInfo.username,
      platformDisplayName: accountInfo.displayName,
      platformProfileImage: accountInfo.profileImageUrl,
      scopes: tokens.scope || [],
      lastConnectedAt: new Date(),
      expiresAt: tokens.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { data, error } = await this.supabase
      .from('social_platform_auth')
      .insert(authRecord)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to store auth: ${error.message}`);
    }

    return data;
  }

  /**
   * Refresh expired tokens
   */
  async refreshTokens(request: RefreshTokenRequestType): Promise<RefreshTokenResponseType> {
    try {
      const platform = this.platformManager.getPlatform(request.platform);
      if (!platform) {
        throw new Error(`Platform ${request.platform} not configured`);
      }

      const tokens = await platform.refreshTokens(request.refreshToken);

      // Update stored tokens
      await this.updateStoredTokens(request.platform, tokens);

      return {
        success: true,
        tokens,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Disconnect platform and revoke tokens
   */
  async disconnect(
    userId: string,
    platform: SocialPlatformType,
    request: DisconnectRequestType
  ): Promise<void> {
    try {
      if (request.revokeTokens) {
        const auth = await this.getAuth(userId, platform);
        if (auth?.tokens) {
          const platformInstance = this.platformManager.getPlatform(platform);
          await platformInstance?.revokeTokens(auth.tokens.accessToken);
        }
      }

      // Update status to disconnected
      await this.supabase
        .from('social_platform_auth')
        .update({
          status: 'disconnected',
          updatedAt: new Date(),
        })
        .eq('userId', userId)
        .eq('platform', platform);
    } catch (error) {
      throw this.createAuthError(
        platform,
        OAUTH_ERROR_CODES.NETWORK_ERROR,
        `Failed to disconnect: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get authentication status for a platform
   */
  async getAuthStatus(userId: string, platform: SocialPlatformType): Promise<AuthStatusType> {
    const auth = await this.getAuth(userId, platform);
    
    if (!auth) {
      return 'disconnected';
    }

    if (auth.status === 'error') {
      return 'error';
    }

    if (auth.expiresAt && auth.expiresAt < new Date()) {
      return 'expired';
    }

    return auth.status;
  }

  /**
   * Get stored authentication for a user and platform
   */
  async getAuth(userId: string, platform: SocialPlatformType): Promise<PlatformAuthType | null> {
    const { data, error } = await this.supabase
      .from('social_platform_auth')
      .select('*')
      .eq('userId', userId)
      .eq('platform', platform)
      .eq('status', 'connected')
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Get all connected platforms for a user
   */
  async getConnectedPlatforms(userId: string): Promise<PlatformAuthType[]> {
    const { data, error } = await this.supabase
      .from('social_platform_auth')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'connected');

    if (error) {
      throw new Error(`Failed to get connected platforms: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Validate and refresh tokens if needed
   */
  async ensureValidTokens(userId: string, platform: SocialPlatformType): Promise<OAuthTokenType | null> {
    const auth = await this.getAuth(userId, platform);
    
    if (!auth?.tokens) {
      return null;
    }

    // Check if tokens are expired
    if (auth.expiresAt && auth.expiresAt < new Date()) {
      if (auth.tokens.refreshToken) {
        const refreshResult = await this.refreshTokens({
          platform,
          refreshToken: auth.tokens.refreshToken,
        });
        
        if (refreshResult.success && refreshResult.tokens) {
          return refreshResult.tokens;
        }
      }
      
      // Mark as expired if refresh failed
      await this.markAsExpired(userId, platform);
      return null;
    }

    return auth.tokens;
  }

  /**
   * Update stored tokens
   */
  private async updateStoredTokens(platform: SocialPlatformType, tokens: OAuthTokenType): Promise<void> {
    await this.supabase
      .from('social_platform_auth')
      .update({
        tokens,
        expiresAt: tokens.expiresAt,
        updatedAt: new Date(),
      })
      .eq('platform', platform);
  }

  /**
   * Mark authentication as expired
   */
  private async markAsExpired(userId: string, platform: SocialPlatformType): Promise<void> {
    await this.supabase
      .from('social_platform_auth')
      .update({
        status: 'expired',
        updatedAt: new Date(),
      })
      .eq('userId', userId)
      .eq('platform', platform);
  }

  /**
   * Create standardized auth error
   */
  private createAuthError(platform: SocialPlatformType, code: string, message: string): AuthErrorType {
    return {
      code,
      message,
      platform,
      timestamp: new Date(),
    };
  }

  /**
   * Log authentication events
   */
  private async logAuthEvent(
    userId: string,
    platform: SocialPlatformType,
    event: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    await this.supabase
      .from('social_auth_logs')
      .insert({
        userId,
        platform,
        event,
        details,
        timestamp: new Date(),
      });
  }
}