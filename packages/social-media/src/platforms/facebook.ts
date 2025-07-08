import axios from 'axios';
import { IPlatform } from '../api/platform-manager';
import {
  FacebookConfig,
  PlatformCapabilities,
  PLATFORM_CAPABILITIES,
  AuthConfigType,
  OAuthTokenType,
  PlatformAccountInfoType,
} from '../types';

export class FacebookPlatform implements IPlatform {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  getAuthConfig(): AuthConfigType {
    return {
      platform: 'facebook',
      clientId: this.config.appId,
      clientSecret: this.config.appSecret,
      redirectUri: this.config.redirectUri || '',
      scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/v18.0/me',
      pkce: false,
    };
  }

  getCapabilities(): PlatformCapabilities {
    return PLATFORM_CAPABILITIES.facebook;
  }

  async exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
    codeVerifier?: string;
  }): Promise<OAuthTokenType> {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: this.config.appId,
          redirect_uri: params.redirectUri,
          client_secret: this.config.appSecret,
          code: params.code,
        },
      });

      const data = response.data;
      
      return {
        accessToken: data.access_token,
        tokenType: data.token_type || 'Bearer',
        expiresIn: data.expires_in,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
      };
    } catch (error) {
      throw new Error(`Facebook token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refreshTokens(refreshToken: string): Promise<OAuthTokenType> {
    // Facebook uses long-lived tokens instead of refresh tokens
    throw new Error('Facebook does not support refresh tokens. Use long-lived tokens instead.');
  }

  async revokeTokens(accessToken: string): Promise<void> {
    try {
      await axios.delete(`https://graph.facebook.com/v18.0/me/permissions`, {
        params: {
          access_token: accessToken,
        },
      });
    } catch (error) {
      console.warn('Facebook token revocation failed:', error);
    }
  }

  async getUserInfo(accessToken: string): Promise<PlatformAccountInfoType> {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/me', {
        params: {
          fields: 'id,name,email,picture',
          access_token: accessToken,
        },
      });

      const user = response.data;

      return {
        id: user.id,
        username: user.id, // Facebook doesn't have usernames for regular users
        displayName: user.name,
        email: user.email,
        profileImageUrl: user.picture?.data?.url,
        profileUrl: `https://facebook.com/${user.id}`,
        verified: false,
      };
    } catch (error) {
      throw new Error(`Facebook user info fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateTokens(accessToken: string): Promise<boolean> {
    try {
      await axios.get('https://graph.facebook.com/v18.0/me', {
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
      // Get pages if pageId is configured
      let targetId = 'me';
      if (this.config.pageId) {
        targetId = this.config.pageId;
      }

      const postData: any = {
        message: params.content,
        access_token: params.accessToken,
      };

      // Handle media
      if (params.media && params.media.length > 0) {
        const media = params.media[0]; // Facebook supports one main media item
        
        if (media.type === 'image') {
          postData.url = media.url;
        } else if (media.type === 'video') {
          // For video, we would need to upload it first
          postData.source = media.url;
        }
      }

      // Handle scheduling
      if (params.scheduledFor) {
        postData.scheduled_publish_time = Math.floor(params.scheduledFor.getTime() / 1000);
        postData.published = false;
      }

      // Create post
      const response = await axios.post(`https://graph.facebook.com/v18.0/${targetId}/feed`, postData);

      const postId = response.data.id;
      
      return {
        id: postId,
        url: `https://facebook.com/${postId}`,
      };
    } catch (error) {
      throw new Error(`Facebook post failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        // Get post insights
        const response = await axios.get(`https://graph.facebook.com/v18.0/${params.postId}`, {
          params: {
            fields: 'insights.metric(post_impressions,post_clicks,post_reactions_total,post_shares)',
            access_token: params.accessToken,
          },
        });

        const insights = response.data.insights?.data || [];
        const metrics: Record<string, number> = {};

        insights.forEach((insight: any) => {
          const value = insight.values?.[0]?.value || 0;
          switch (insight.name) {
            case 'post_impressions':
              metrics.impressions = value;
              break;
            case 'post_clicks':
              metrics.clicks = value;
              break;
            case 'post_reactions_total':
              metrics.reactions = value;
              break;
            case 'post_shares':
              metrics.shares = value;
              break;
          }
        });

        return {
          postId: params.postId,
          ...metrics,
        };
      } else {
        // Get page insights
        const targetId = this.config.pageId || 'me';
        const response = await axios.get(`https://graph.facebook.com/v18.0/${targetId}/insights`, {
          params: {
            metric: 'page_fans,page_impressions,page_engaged_users',
            access_token: params.accessToken,
          },
        });

        const insights = response.data.data || [];
        const metrics: Record<string, number> = {};

        insights.forEach((insight: any) => {
          const value = insight.values?.[insight.values.length - 1]?.value || 0;
          switch (insight.name) {
            case 'page_fans':
              metrics.followers = value;
              break;
            case 'page_impressions':
              metrics.impressions = value;
              break;
            case 'page_engaged_users':
              metrics.engagedUsers = value;
              break;
          }
        });

        return metrics;
      }
    } catch (error) {
      throw new Error(`Facebook analytics fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}