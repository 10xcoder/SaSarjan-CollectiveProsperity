import axios from 'axios';
import { IPlatform } from '../api/platform-manager';
import {
  LinkedInConfig,
  PlatformCapabilities,
  PLATFORM_CAPABILITIES,
  AuthConfigType,
  OAuthTokenType,
  PlatformAccountInfoType,
} from '../types';

export class LinkedInPlatform implements IPlatform {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  getAuthConfig(): AuthConfigType {
    return {
      platform: 'linkedin',
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: this.config.redirectUri,
      scopes: this.config.scope || ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      userInfoUrl: 'https://api.linkedin.com/v2/people/~',
      pkce: false,
    };
  }

  getCapabilities(): PlatformCapabilities {
    return PLATFORM_CAPABILITIES.linkedin;
  }

  async exchangeCodeForTokens(params: {
    code: string;
    redirectUri: string;
    codeVerifier?: string;
  }): Promise<OAuthTokenType> {
    try {
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
        grant_type: 'authorization_code',
        code: params.code,
        redirect_uri: params.redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
      throw new Error(`LinkedIn token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refreshTokens(refreshToken: string): Promise<OAuthTokenType> {
    try {
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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
      throw new Error(`LinkedIn token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async revokeTokens(accessToken: string): Promise<void> {
    try {
      await axios.post('https://www.linkedin.com/oauth/v2/revoke', {
        token: accessToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (error) {
      // LinkedIn revocation might fail silently, which is acceptable
      console.warn('LinkedIn token revocation failed:', error);
    }
  }

  async getUserInfo(accessToken: string): Promise<PlatformAccountInfoType> {
    try {
      const [profileResponse, emailResponse] = await Promise.all([
        axios.get('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }),
        axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }),
      ]);

      const profile = profileResponse.data;
      const email = emailResponse.data.elements?.[0]?.['handle~']?.emailAddress;

      const firstName = profile.firstName?.localized?.en_US || '';
      const lastName = profile.lastName?.localized?.en_US || '';
      const displayName = `${firstName} ${lastName}`.trim();

      let profileImageUrl: string | undefined;
      const profilePicture = profile.profilePicture?.['displayImage~']?.elements?.[0];
      if (profilePicture) {
        profileImageUrl = profilePicture.identifiers?.[0]?.identifier;
      }

      return {
        id: profile.id,
        username: profile.id, // LinkedIn doesn't have usernames
        displayName,
        email,
        profileImageUrl,
        profileUrl: `https://www.linkedin.com/in/${profile.id}`,
        verified: false, // LinkedIn API doesn't provide verification status
      };
    } catch (error) {
      throw new Error(`LinkedIn user info fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateTokens(accessToken: string): Promise<boolean> {
    try {
      await axios.get('https://api.linkedin.com/v2/people/~', {
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
      // Get user ID first
      const userResponse = await axios.get('https://api.linkedin.com/v2/people/~', {
        headers: {
          'Authorization': `Bearer ${params.accessToken}`,
        },
      });

      const userId = userResponse.data.id;
      const author = `urn:li:person:${userId}`;

      // Prepare post data
      const postData: any = {
        author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: params.content,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      // Add media if provided
      if (params.media && params.media.length > 0) {
        const media = params.media[0]; // LinkedIn supports one media item per post
        
        if (media.type === 'image') {
          // For images, we would need to upload them first to LinkedIn's asset API
          // This is a simplified version
          postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
        } else if (media.type === 'video') {
          postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'VIDEO';
        }
      }

      // Create the post
      const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
        headers: {
          'Authorization': `Bearer ${params.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
      });

      const postId = response.data.id;
      
      return {
        id: postId,
        url: `https://www.linkedin.com/feed/update/${postId}`,
      };
    } catch (error) {
      throw new Error(`LinkedIn post failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAnalytics(params: {
    accessToken: string;
    postId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Record<string, unknown>> {
    try {
      // LinkedIn analytics require different endpoints based on what you're measuring
      // This is a simplified implementation
      
      if (params.postId) {
        // Get post-specific analytics
        const response = await axios.get(`https://api.linkedin.com/v2/socialActions/${params.postId}`, {
          headers: {
            'Authorization': `Bearer ${params.accessToken}`,
          },
        });

        return {
          postId: params.postId,
          likes: response.data.numLikes || 0,
          comments: response.data.numComments || 0,
          shares: response.data.numShares || 0,
        };
      } else {
        // Get general account analytics
        // This would require organization access for most metrics
        return {
          message: 'Account analytics require organization access',
        };
      }
    } catch (error) {
      throw new Error(`LinkedIn analytics fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}