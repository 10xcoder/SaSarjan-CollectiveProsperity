import axios from 'axios';
import { IPlatform } from '../api/platform-manager';
import {
  TwitterConfig,
  PlatformCapabilities,
  PLATFORM_CAPABILITIES,
  AuthConfigType,
  OAuthTokenType,
  PlatformAccountInfoType,
} from '../types';

export class TwitterPlatform implements IPlatform {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  getAuthConfig(): AuthConfigType {
    return {
      platform: 'twitter',
      clientId: this.config.clientId || this.config.apiKey,
      clientSecret: this.config.clientSecret || this.config.apiSecretKey,
      redirectUri: this.config.redirectUri || '',
      scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      revokeUrl: 'https://api.twitter.com/2/oauth2/revoke',
      userInfoUrl: 'https://api.twitter.com/2/users/me',
      pkce: true,
    };
  }

  getCapabilities(): PlatformCapabilities {
    return PLATFORM_CAPABILITIES.twitter;
  }

  async exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
    codeVerifier?: string;
  }): Promise<OAuthTokenType> {
    try {
      const response = await axios.post('https://api.twitter.com/2/oauth2/token', {
        grant_type: 'authorization_code',
        code: params.code,
        redirect_uri: params.redirectUri,
        client_id: this.config.clientId,
        code_verifier: params.codeVerifier,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
        },
      });

      const data = response.data;
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type || 'Bearer',
        expiresIn: data.expires_in,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
        scope: data.scope ? data.scope.split(' ') : undefined,
      };
    } catch (error) {
      throw new Error(`Twitter token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refreshTokens(refreshToken: string): Promise<OAuthTokenType> {
    try {
      const response = await axios.post('https://api.twitter.com/2/oauth2/token', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
        },
      });

      const data = response.data;
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        tokenType: data.token_type || 'Bearer',
        expiresIn: data.expires_in,
        expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
        scope: data.scope ? data.scope.split(' ') : undefined,
      };
    } catch (error) {
      throw new Error(`Twitter token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async revokeTokens(accessToken: string): Promise<void> {
    try {
      await axios.post('https://api.twitter.com/2/oauth2/revoke', {
        token: accessToken,
        client_id: this.config.clientId,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
        },
      });
    } catch (error) {
      console.warn('Twitter token revocation failed:', error);
    }
  }

  async getUserInfo(accessToken: string): Promise<PlatformAccountInfoType> {
    try {
      const response = await axios.get('https://api.twitter.com/2/users/me', {
        params: {
          'user.fields': 'id,name,username,profile_image_url,public_metrics,verified,description,location,url',
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const user = response.data.data;

      return {
        id: user.id,
        username: user.username,
        displayName: user.name,
        profileImageUrl: user.profile_image_url,
        profileUrl: `https://twitter.com/${user.username}`,
        bio: user.description,
        location: user.location,
        website: user.url,
        verified: user.verified || false,
        followerCount: user.public_metrics?.followers_count,
        followingCount: user.public_metrics?.following_count,
        postCount: user.public_metrics?.tweet_count,
      };
    } catch (error) {
      throw new Error(`Twitter user info fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateTokens(accessToken: string): Promise<boolean> {
    try {
      await axios.get('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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
      const postData: any = {
        text: params.content,
      };

      // Handle media uploads
      if (params.media && params.media.length > 0) {
        const mediaIds = [];
        
        for (const media of params.media) {
          if (media.type === 'image') {
            // Upload image to Twitter
            const mediaId = await this.uploadMedia(params.accessToken, media.url, 'image');
            mediaIds.push(mediaId);
          }
        }

        if (mediaIds.length > 0) {
          postData.media = { media_ids: mediaIds };
        }
      }

      // Create tweet
      const response = await axios.post('https://api.twitter.com/2/tweets', postData, {
        headers: {
          'Authorization': `Bearer ${params.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const tweetId = response.data.data.id;
      const username = await this.getUsername(params.accessToken);
      
      return {
        id: tweetId,
        url: `https://twitter.com/${username}/status/${tweetId}`,
      };
    } catch (error) {
      throw new Error(`Twitter post failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        // Get tweet metrics
        const response = await axios.get(`https://api.twitter.com/2/tweets/${params.postId}`, {
          params: {
            'tweet.fields': 'public_metrics,non_public_metrics,organic_metrics',
          },
          headers: {
            'Authorization': `Bearer ${params.accessToken}`,
          },
        });

        const tweet = response.data.data;
        const metrics = tweet.public_metrics || {};

        return {
          postId: params.postId,
          likes: metrics.like_count || 0,
          retweets: metrics.retweet_count || 0,
          replies: metrics.reply_count || 0,
          quotes: metrics.quote_count || 0,
          impressions: tweet.organic_metrics?.impression_count || 0,
          profileClicks: tweet.organic_metrics?.profile_clicks || 0,
          urlClicks: tweet.organic_metrics?.url_link_clicks || 0,
        };
      } else {
        // Get user metrics
        const response = await axios.get('https://api.twitter.com/2/users/me', {
          params: {
            'user.fields': 'public_metrics',
          },
          headers: {
            'Authorization': `Bearer ${params.accessToken}`,
          },
        });

        const metrics = response.data.data.public_metrics || {};

        return {
          followers: metrics.followers_count || 0,
          following: metrics.following_count || 0,
          tweets: metrics.tweet_count || 0,
          listed: metrics.listed_count || 0,
        };
      }
    } catch (error) {
      throw new Error(`Twitter analytics fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async uploadMedia(accessToken: string, mediaUrl: string, mediaType: 'image' | 'video'): Promise<string> {
    try {
      // Download media
      const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
      const mediaBuffer = Buffer.from(mediaResponse.data);

      // Upload to Twitter
      const uploadResponse = await axios.post('https://upload.twitter.com/1.1/media/upload.json', mediaBuffer, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/octet-stream',
        },
      });

      return uploadResponse.data.media_id_string;
    } catch (error) {
      throw new Error(`Media upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getUsername(accessToken: string): Promise<string> {
    try {
      const response = await axios.get('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      return response.data.data.username;
    } catch (error) {
      return 'user';
    }
  }
}