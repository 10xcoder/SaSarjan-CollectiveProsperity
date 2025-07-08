import axios from 'axios';
import { IPlatform } from '../api/platform-manager';
import {
  InstagramConfig,
  PlatformCapabilities,
  PLATFORM_CAPABILITIES,
  AuthConfigType,
  OAuthTokenType,
  PlatformAccountInfoType,
} from '../types';

export class InstagramPlatform implements IPlatform {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  getAuthConfig(): AuthConfigType {
    return {
      platform: 'instagram',
      clientId: this.config.appId || '',
      clientSecret: this.config.appSecret || '',
      redirectUri: this.config.redirectUri || '',
      scopes: ['instagram_basic', 'instagram_content_publish'],
      authUrl: 'https://api.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
      userInfoUrl: 'https://graph.instagram.com/me',
      pkce: false,
    };
  }

  getCapabilities(): PlatformCapabilities {
    return PLATFORM_CAPABILITIES.instagram;
  }

  async exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
    codeVerifier?: string;
  }): Promise<OAuthTokenType> {
    try {
      // Instagram uses Facebook's Graph API for business accounts
      const response = await axios.post('https://api.instagram.com/oauth/access_token', {
        client_id: this.config.appId,
        client_secret: this.config.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: params.redirectUri,
        code: params.code,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = response.data;
      
      return {
        accessToken: data.access_token,
        tokenType: 'Bearer',
        // Instagram tokens don't expire for basic use
      };
    } catch (error) {
      throw new Error(`Instagram token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refreshTokens(refreshToken: string): Promise<OAuthTokenType> {
    // Instagram Basic Display API tokens need to be refreshed differently
    throw new Error('Instagram token refresh not implemented for basic display API');
  }

  async revokeTokens(accessToken: string): Promise<void> {
    // Instagram doesn't have a revoke endpoint for basic tokens
    console.warn('Instagram token revocation not available for basic display API');
  }

  async getUserInfo(accessToken: string): Promise<PlatformAccountInfoType> {
    try {
      const response = await axios.get('https://graph.instagram.com/me', {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: accessToken,
        },
      });

      const user = response.data;

      return {
        id: user.id,
        username: user.username,
        displayName: user.username,
        profileUrl: `https://instagram.com/${user.username}`,
        postCount: user.media_count,
        verified: false,
      };
    } catch (error) {
      throw new Error(`Instagram user info fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateTokens(accessToken: string): Promise<boolean> {
    try {
      await axios.get('https://graph.instagram.com/me', {
        params: {
          access_token: accessToken,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async post(params: {
    accessToken: string;
    content: string;
    media?: Array<{ url: string; type: string; alt?: string }>;
    scheduledFor?: Date;
  }): Promise<{ id: string; url?: string }> {
    try {
      // Instagram requires media for posts
      if (!params.media || params.media.length === 0) {
        throw new Error('Instagram posts require media');
      }

      const media = params.media[0];
      const userId = this.config.userId;

      if (!userId) {
        throw new Error('Instagram user ID is required for posting');
      }

      // Step 1: Create media container
      const containerData: any = {
        image_url: media.url,
        caption: params.content,
        access_token: params.accessToken,
      };

      if (media.type === 'video') {
        containerData.media_type = 'VIDEO';
        delete containerData.image_url;
        containerData.video_url = media.url;
      }

      const containerResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${userId}/media`,
        containerData
      );

      const containerId = containerResponse.data.id;

      // Step 2: Publish media container
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${userId}/media_publish`,
        {
          creation_id: containerId,
          access_token: params.accessToken,
        }
      );

      const mediaId = publishResponse.data.id;

      // Get username for URL
      const userInfo = await this.getUserInfo(params.accessToken);
      
      return {
        id: mediaId,
        url: `https://instagram.com/p/${mediaId}`,
      };
    } catch (error) {
      throw new Error(`Instagram post failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAnalytics(params: {
    accessToken: string;
    postId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Record<string, unknown>> {
    try {
      if (params.postId) {
        // Get media insights
        const response = await axios.get(`https://graph.facebook.com/v18.0/${params.postId}/insights`, {
          params: {
            metric: 'impressions,reach,likes,comments,saves,shares',
            access_token: params.accessToken,
          },
        });

        const insights = response.data.data || [];
        const metrics: Record<string, number> = {};

        insights.forEach((insight: any) => {
          metrics[insight.name] = insight.values?.[0]?.value || 0;
        });

        return {
          postId: params.postId,
          ...metrics,
        };
      } else {
        // Get account insights
        const userId = this.config.userId;
        if (!userId) {
          throw new Error('Instagram user ID is required for analytics');
        }

        const response = await axios.get(`https://graph.facebook.com/v18.0/${userId}/insights`, {
          params: {
            metric: 'impressions,reach,profile_views,follower_count',
            period: 'day',
            access_token: params.accessToken,
          },
        });

        const insights = response.data.data || [];
        const metrics: Record<string, number> = {};

        insights.forEach((insight: any) => {
          const latestValue = insight.values?.[insight.values.length - 1]?.value || 0;
          metrics[insight.name] = latestValue;
        });

        return metrics;
      }
    } catch (error) {
      throw new Error(`Instagram analytics fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}