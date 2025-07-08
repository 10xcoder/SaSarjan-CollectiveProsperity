import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthManager } from '../../api/auth-manager';
import { PlatformManager } from '../../api/platform-manager';
import { SocialPlatformType, OAuthTokenType, PlatformAccountInfoType } from '../../types';

describe('AuthManager', () => {
  let authManager: AuthManager;
  let platformManager: PlatformManager;
  let mockPlatform: any;

  beforeEach(() => {
    platformManager = new PlatformManager();
    authManager = new AuthManager(platformManager);

    // Mock platform instance
    mockPlatform = {
      getAuthConfig: vi.fn(() => ({
        platform: 'linkedin',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        scopes: ['r_liteprofile', 'w_member_social'],
        pkce: false,
      })),
      exchangeCodeForTokens: vi.fn(),
      refreshTokens: vi.fn(),
      revokeTokens: vi.fn(),
      getUserInfo: vi.fn(),
    };

    // Mock platform manager
    vi.spyOn(platformManager, 'getPlatform').mockReturnValue(mockPlatform);
  });

  describe('Auth URL Generation', () => {
    it('should generate auth URL for LinkedIn', async () => {
      const request = {
        platform: 'linkedin' as SocialPlatformType,
        redirectUri: 'http://localhost:3000/callback',
        scopes: ['r_liteprofile', 'w_member_social'],
      };

      const result = await authManager.generateAuthUrl(request);

      expect(result.url).toContain('https://www.linkedin.com/oauth/v2/authorization');
      expect(result.url).toContain('client_id=test-client-id');
      expect(result.url).toContain('redirect_uri=http://localhost:3000/callback');
      expect(result.url).toContain('scope=r_liteprofile%20w_member_social');
      expect(result.state).toBeDefined();
      expect(result.codeVerifier).toBeUndefined(); // LinkedIn doesn't use PKCE
    });

    it('should generate state parameter when not provided', async () => {
      const request = {
        platform: 'linkedin' as SocialPlatformType,
        redirectUri: 'http://localhost:3000/callback',
      };

      const result = await authManager.generateAuthUrl(request);

      expect(result.state).toBeDefined();
      expect(result.state.length).toBeGreaterThan(0);
    });

    it('should use provided state parameter', async () => {
      const request = {
        platform: 'linkedin' as SocialPlatformType,
        redirectUri: 'http://localhost:3000/callback',
        state: 'custom-state-123',
      };

      const result = await authManager.generateAuthUrl(request);

      expect(result.state).toBe('custom-state-123');
    });

    it('should throw error for unconfigured platform', async () => {
      vi.spyOn(platformManager, 'getPlatform').mockReturnValue(undefined);

      const request = {
        platform: 'linkedin' as SocialPlatformType,
        redirectUri: 'http://localhost:3000/callback',
      };

      await expect(authManager.generateAuthUrl(request)).rejects.toThrow(
        'Platform linkedin not configured'
      );
    });
  });

  describe('OAuth Callback Handling', () => {
    it('should handle successful callback', async () => {
      const mockTokens: OAuthTokenType = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      };

      const mockAccountInfo: PlatformAccountInfoType = {
        id: 'test-user-id',
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com',
      };

      mockPlatform.exchangeCodeForTokens.mockResolvedValue(mockTokens);
      mockPlatform.getUserInfo.mockResolvedValue(mockAccountInfo);

      const request = {
        platform: 'linkedin' as SocialPlatformType,
        code: 'auth-code-123',
        state: 'state-123',
        redirectUri: 'http://localhost:3000/callback',
      };

      const result = await authManager.handleCallback(request);

      expect(result.success).toBe(true);
      expect(result.tokens).toEqual(mockTokens);
      expect(result.platformUserId).toBe('test-user-id');
      expect(result.platformUsername).toBe('testuser');
      expect(result.platformDisplayName).toBe('Test User');

      expect(mockPlatform.exchangeCodeForTokens).toHaveBeenCalledWith({
        code: 'auth-code-123',
        redirectUri: 'http://localhost:3000/callback',
        codeVerifier: undefined,
      });
    });

    it('should handle callback failure', async () => {
      mockPlatform.exchangeCodeForTokens.mockRejectedValue(new Error('Invalid code'));

      const request = {
        platform: 'linkedin' as SocialPlatformType,
        code: 'invalid-code',
        state: 'state-123',
        redirectUri: 'http://localhost:3000/callback',
      };

      const result = await authManager.handleCallback(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid code');
      expect(result.tokens).toBeUndefined();
    });
  });

  describe('Token Storage', () => {
    it('should store authentication credentials', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                id: 'auth-record-id',
                userId: 'user-123',
                platform: 'linkedin',
                status: 'connected',
              },
              error: null,
            })),
          })),
        })),
      });

      const tokens: OAuthTokenType = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        tokenType: 'Bearer',
      };

      const accountInfo: PlatformAccountInfoType = {
        id: 'platform-user-id',
        username: 'testuser',
        displayName: 'Test User',
      };

      const result = await authManager.storeAuth(
        'user-123',
        'app-456',
        'linkedin',
        tokens,
        accountInfo
      );

      expect(result.userId).toBe('user-123');
      expect(result.platform).toBe('linkedin');
      expect(result.status).toBe('connected');
    });

    it('should handle storage errors', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' },
            })),
          })),
        })),
      });

      const tokens: OAuthTokenType = {
        accessToken: 'test-access-token',
        tokenType: 'Bearer',
      };

      const accountInfo: PlatformAccountInfoType = {
        id: 'platform-user-id',
        username: 'testuser',
        displayName: 'Test User',
      };

      await expect(authManager.storeAuth(
        'user-123',
        'app-456',
        'linkedin',
        tokens,
        accountInfo
      )).rejects.toThrow('Failed to store auth: Database error');
    });
  });

  describe('Token Refresh', () => {
    it('should refresh expired tokens', async () => {
      const mockNewTokens: OAuthTokenType = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      mockPlatform.refreshTokens.mockResolvedValue(mockNewTokens);

      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      });

      const request = {
        platform: 'linkedin' as SocialPlatformType,
        refreshToken: 'old-refresh-token',
      };

      const result = await authManager.refreshTokens(request);

      expect(result.success).toBe(true);
      expect(result.tokens).toEqual(mockNewTokens);

      expect(mockPlatform.refreshTokens).toHaveBeenCalledWith('old-refresh-token');
    });

    it('should handle refresh failure', async () => {
      mockPlatform.refreshTokens.mockRejectedValue(new Error('Invalid refresh token'));

      const request = {
        platform: 'linkedin' as SocialPlatformType,
        refreshToken: 'invalid-refresh-token',
      };

      const result = await authManager.refreshTokens(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid refresh token');
    });
  });

  describe('Platform Disconnection', () => {
    it('should disconnect platform with token revocation', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      
      // Mock getting auth record
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                tokens: { accessToken: 'test-token' },
              },
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      });

      await authManager.disconnect('user-123', 'linkedin', { revokeTokens: true });

      expect(mockPlatform.revokeTokens).toHaveBeenCalledWith('test-token');
    });

    it('should disconnect platform without token revocation', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      });

      await authManager.disconnect('user-123', 'linkedin', { revokeTokens: false });

      expect(mockPlatform.revokeTokens).not.toHaveBeenCalled();
    });
  });

  describe('Auth Status Checking', () => {
    it('should return connected status for valid auth', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                status: 'connected',
                expiresAt: new Date(Date.now() + 3600 * 1000), // Future date
              },
              error: null,
            })),
          })),
        })),
      });

      const status = await authManager.getAuthStatus('user-123', 'linkedin');
      expect(status).toBe('connected');
    });

    it('should return expired status for expired auth', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                status: 'connected',
                expiresAt: new Date(Date.now() - 3600 * 1000), // Past date
              },
              error: null,
            })),
          })),
        })),
      });

      const status = await authManager.getAuthStatus('user-123', 'linkedin');
      expect(status).toBe('expired');
    });

    it('should return disconnected status for no auth record', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: null,
            })),
          })),
        })),
      });

      const status = await authManager.getAuthStatus('user-123', 'linkedin');
      expect(status).toBe('disconnected');
    });
  });

  describe('Token Validation', () => {
    it('should ensure valid tokens for non-expired auth', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                tokens: {
                  accessToken: 'valid-token',
                  refreshToken: 'refresh-token',
                },
                expiresAt: new Date(Date.now() + 3600 * 1000), // Future date
              },
              error: null,
            })),
          })),
        })),
      });

      const tokens = await authManager.ensureValidTokens('user-123', 'linkedin');
      
      expect(tokens).toBeDefined();
      expect(tokens?.accessToken).toBe('valid-token');
    });

    it('should refresh tokens for expired auth', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      
      // First call returns expired auth
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: {
                tokens: {
                  accessToken: 'expired-token',
                  refreshToken: 'refresh-token',
                },
                expiresAt: new Date(Date.now() - 3600 * 1000), // Past date
              },
              error: null,
            })),
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      });

      const mockNewTokens: OAuthTokenType = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenType: 'Bearer',
      };

      mockPlatform.refreshTokens.mockResolvedValue(mockNewTokens);

      const tokens = await authManager.ensureValidTokens('user-123', 'linkedin');
      
      expect(tokens).toEqual(mockNewTokens);
      expect(mockPlatform.refreshTokens).toHaveBeenCalledWith('refresh-token');
    });

    it('should return null for auth without tokens', async () => {
      const mockSupabase = (globalThis as any).mockSupabaseClient;
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: null,
              error: null,
            })),
          })),
        })),
      });

      const tokens = await authManager.ensureValidTokens('user-123', 'linkedin');
      expect(tokens).toBeNull();
    });
  });
});