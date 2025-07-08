import { z } from 'zod';
import { SocialPlatform } from './social-platforms';

// OAuth flow types
export const OAuthFlow = z.enum([
  'authorization_code',
  'client_credentials',
  'refresh_token',
]);

export type OAuthFlowType = z.infer<typeof OAuthFlow>;

// OAuth token schema
export const OAuthToken = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  tokenType: z.string().default('Bearer'),
  expiresIn: z.number().optional(),
  expiresAt: z.date().optional(),
  scope: z.array(z.string()).optional(),
});

export type OAuthTokenType = z.infer<typeof OAuthToken>;

// Platform authentication status
export const AuthStatus = z.enum([
  'connected',
  'disconnected',
  'expired',
  'error',
  'pending',
]);

export type AuthStatusType = z.infer<typeof AuthStatus>;

// Platform authentication record
export const PlatformAuth = z.object({
  id: z.string(),
  userId: z.string(),
  appId: z.string(),
  platform: SocialPlatform,
  status: AuthStatus,
  tokens: OAuthToken.optional(),
  platformUserId: z.string().optional(),
  platformUsername: z.string().optional(),
  platformDisplayName: z.string().optional(),
  platformProfileImage: z.string().optional(),
  scopes: z.array(z.string()).default([]),
  lastConnectedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  lastError: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export type PlatformAuthType = z.infer<typeof PlatformAuth>;

// OAuth authorization URL request
export const AuthUrlRequest = z.object({
  platform: SocialPlatform,
  redirectUri: z.string(),
  scopes: z.array(z.string()).optional(),
  state: z.string().optional(),
});

export type AuthUrlRequestType = z.infer<typeof AuthUrlRequest>;

// OAuth authorization URL response
export const AuthUrlResponse = z.object({
  url: z.string(),
  state: z.string(),
  codeVerifier: z.string().optional(), // for PKCE
});

export type AuthUrlResponseType = z.infer<typeof AuthUrlResponse>;

// OAuth callback request
export const AuthCallbackRequest = z.object({
  platform: SocialPlatform,
  code: z.string(),
  state: z.string(),
  redirectUri: z.string(),
  codeVerifier: z.string().optional(), // for PKCE
});

export type AuthCallbackRequestType = z.infer<typeof AuthCallbackRequest>;

// OAuth callback response
export const AuthCallbackResponse = z.object({
  success: z.boolean(),
  tokens: OAuthToken.optional(),
  platformUserId: z.string().optional(),
  platformUsername: z.string().optional(),
  platformDisplayName: z.string().optional(),
  error: z.string().optional(),
});

export type AuthCallbackResponseType = z.infer<typeof AuthCallbackResponse>;

// Token refresh request
export const RefreshTokenRequest = z.object({
  platform: SocialPlatform,
  refreshToken: z.string(),
});

export type RefreshTokenRequestType = z.infer<typeof RefreshTokenRequest>;

// Token refresh response
export const RefreshTokenResponse = z.object({
  success: z.boolean(),
  tokens: OAuthToken.optional(),
  error: z.string().optional(),
});

export type RefreshTokenResponseType = z.infer<typeof RefreshTokenResponse>;

// Platform disconnection request
export const DisconnectRequest = z.object({
  platform: SocialPlatform,
  revokeTokens: z.boolean().default(true),
});

export type DisconnectRequestType = z.infer<typeof DisconnectRequest>;

// Platform account info
export const PlatformAccountInfo = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string(),
  email: z.string().optional(),
  profileImageUrl: z.string().optional(),
  profileUrl: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  verified: z.boolean().default(false),
  followerCount: z.number().optional(),
  followingCount: z.number().optional(),
  postCount: z.number().optional(),
  joinedAt: z.date().optional(),
  lastActivityAt: z.date().optional(),
});

export type PlatformAccountInfoType = z.infer<typeof PlatformAccountInfo>;

// Authentication error types
export const AuthError = z.object({
  code: z.string(),
  message: z.string(),
  platform: SocialPlatform,
  timestamp: z.date(),
  details: z.record(z.unknown()).optional(),
});

export type AuthErrorType = z.infer<typeof AuthError>;

// Common OAuth error codes
export const OAUTH_ERROR_CODES = {
  INVALID_REQUEST: 'invalid_request',
  INVALID_CLIENT: 'invalid_client',
  INVALID_GRANT: 'invalid_grant',
  UNAUTHORIZED_CLIENT: 'unauthorized_client',
  UNSUPPORTED_GRANT_TYPE: 'unsupported_grant_type',
  INVALID_SCOPE: 'invalid_scope',
  ACCESS_DENIED: 'access_denied',
  TEMPORARILY_UNAVAILABLE: 'temporarily_unavailable',
  EXPIRED_TOKEN: 'expired_token',
  NETWORK_ERROR: 'network_error',
  RATE_LIMITED: 'rate_limited',
} as const;

// Auth configuration for each platform
export const AuthConfig = z.object({
  platform: SocialPlatform,
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string(),
  scopes: z.array(z.string()),
  authUrl: z.string(),
  tokenUrl: z.string(),
  revokeUrl: z.string().optional(),
  userInfoUrl: z.string().optional(),
  pkce: z.boolean().default(false),
  additionalParams: z.record(z.string()).optional(),
});

export type AuthConfigType = z.infer<typeof AuthConfig>;