import { useState, useEffect, useCallback } from 'react';
import { SocialMediaManager } from '../core/social-media-manager';
import { SocialPlatformType, CreatePostRequestType, SocialPostType } from '../types';

export interface UseSocialMediaOptions {
  userId: string;
  appId: string;
}

export function useSocialMedia({ userId, appId }: UseSocialMediaOptions) {
  const [socialMediaManager] = useState(() => new SocialMediaManager());
  const [connectedPlatforms, setConnectedPlatforms] = useState<SocialPlatformType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load connected platforms
  const loadConnectedPlatforms = useCallback(async () => {
    try {
      setIsLoading(true);
      const platforms = await socialMediaManager.getConnectedPlatforms(userId);
      setConnectedPlatforms(platforms.map(p => p.platform));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load platforms');
    } finally {
      setIsLoading(false);
    }
  }, [socialMediaManager, userId]);

  // Create post
  const createPost = useCallback(async (request: CreatePostRequestType): Promise<SocialPostType> => {
    try {
      setIsLoading(true);
      const post = await socialMediaManager.createPost(userId, request);
      setError(null);
      return post;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create post';
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [socialMediaManager, userId]);

  // Publish post
  const publishPost = useCallback(async (postId: string) => {
    try {
      setIsLoading(true);
      const result = await socialMediaManager.publishPost(userId, postId);
      setError(null);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to publish post';
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [socialMediaManager, userId]);

  // Get auth URL
  const getAuthUrl = useCallback(async (platform: SocialPlatformType, redirectUri: string) => {
    try {
      return await socialMediaManager.getAuthUrl({ platform, redirectUri });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to get auth URL';
      setError(error);
      throw err;
    }
  }, [socialMediaManager]);

  // Handle auth callback
  const handleAuthCallback = useCallback(async (params: {
    platform: SocialPlatformType;
    code: string;
    state: string;
    redirectUri: string;
  }) => {
    try {
      setIsLoading(true);
      const result = await socialMediaManager.handleAuthCallback(params);
      
      if (result.success && result.tokens && result.platformUserId) {
        await socialMediaManager.connectPlatform(userId, appId, params.platform, result);
        await loadConnectedPlatforms(); // Refresh connected platforms
      }
      
      setError(null);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to handle auth callback';
      setError(error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [socialMediaManager, userId, appId, loadConnectedPlatforms]);

  // Initialize on mount
  useEffect(() => {
    loadConnectedPlatforms();
  }, [loadConnectedPlatforms]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socialMediaManager.stop();
    };
  }, [socialMediaManager]);

  return {
    socialMediaManager,
    connectedPlatforms,
    isLoading,
    error,
    createPost,
    publishPost,
    getAuthUrl,
    handleAuthCallback,
    loadConnectedPlatforms,
  };
}