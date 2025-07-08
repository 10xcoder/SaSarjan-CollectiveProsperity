import React, { useState, useCallback } from 'react';
import {
  SocialPlatformType,
  CreatePostRequestType,
  MediaAttachmentType,
  PostPriorityType,
} from '../types';

export interface PostComposerProps {
  userId: string;
  availablePlatforms: SocialPlatformType[];
  connectedPlatforms: SocialPlatformType[];
  onCreatePost: (request: CreatePostRequestType) => Promise<void>;
  onUploadMedia: (file: File) => Promise<MediaAttachmentType>;
  className?: string;
}

export function PostComposer({
  userId,
  availablePlatforms,
  connectedPlatforms,
  onCreatePost,
  onUploadMedia,
  className = '',
}: PostComposerProps) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatformType[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [media, setMedia] = useState<MediaAttachmentType[]>([]);
  const [priority, setPriority] = useState<PostPriorityType>('normal');
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>();
  const [isScheduled, setIsScheduled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlatformToggle = useCallback((platform: SocialPlatformType) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  }, []);

  const handleHashtagAdd = useCallback((hashtag: string) => {
    const cleanTag = hashtag.replace(/^#/, '');
    if (cleanTag && !hashtags.includes(cleanTag)) {
      setHashtags(prev => [...prev, cleanTag]);
    }
  }, [hashtags]);

  const handleHashtagRemove = useCallback((hashtag: string) => {
    setHashtags(prev => prev.filter(tag => tag !== hashtag));
  }, []);

  const handleMentionAdd = useCallback((mention: string) => {
    const cleanMention = mention.replace(/^@/, '');
    if (cleanMention && !mentions.includes(cleanMention)) {
      setMentions(prev => [...prev, cleanMention]);
    }
  }, [mentions]);

  const handleMentionRemove = useCallback((mention: string) => {
    setMentions(prev => prev.filter(m => m !== mention));
  }, []);

  const handleMediaUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    try {
      const uploadPromises = Array.from(files).map(file => onUploadMedia(file));
      const uploadedMedia = await Promise.all(uploadPromises);
      setMedia(prev => [...prev, ...uploadedMedia]);
    } catch (error) {
      console.error('Media upload failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  }, [onUploadMedia]);

  const handleMediaRemove = useCallback((mediaId: string) => {
    setMedia(prev => prev.filter(m => m.id !== mediaId));
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!content.trim() || selectedPlatforms.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      const request: CreatePostRequestType = {
        content: content.trim(),
        hashtags,
        mentions,
        media,
        platforms: selectedPlatforms,
        priority,
        scheduledAt: isScheduled ? scheduledAt : undefined,
        platformConfigs: [],
        metadata: {
          composer: 'react-component',
        },
      };

      await onCreatePost(request);
      
      // Reset form
      setContent('');
      setSelectedPlatforms([]);
      setHashtags([]);
      setMentions([]);
      setMedia([]);
      setPriority('normal');
      setScheduledAt(undefined);
      setIsScheduled(false);
    } catch (error) {
      console.error('Post creation failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  }, [content, selectedPlatforms, hashtags, mentions, media, priority, isScheduled, scheduledAt, onCreatePost]);

  const characterCount = content.length;
  const isOverLimit = selectedPlatforms.some(platform => {
    // This would use platform capabilities to check limits
    if (platform === 'twitter') return characterCount > 280;
    return false;
  });

  return (
    <div className={`post-composer ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Area */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className={`w-full p-3 border rounded-lg resize-none ${
              isOverLimit ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            disabled={isLoading}
          />
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className={characterCount > 250 ? 'text-orange-500' : 'text-gray-500'}>
              {characterCount} characters
            </span>
            {isOverLimit && (
              <span className="text-red-500">Exceeds platform limits</span>
            )}
          </div>
        </div>

        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {connectedPlatforms.map(platform => (
              <button
                key={platform}
                type="button"
                onClick={() => handlePlatformToggle(platform)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  selectedPlatforms.includes(platform)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                disabled={isLoading}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <label className="block text-sm font-medium mb-2">Hashtags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {hashtags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleHashtagRemove(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  disabled={isLoading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add hashtag (without #)"
            className="w-full p-2 border rounded"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleHashtagAdd(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            disabled={isLoading}
          />
        </div>

        {/* Media */}
        <div>
          <label className="block text-sm font-medium mb-2">Media</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {media.map(item => (
              <div key={item.id} className="relative">
                <img
                  src={item.thumbnailUrl || item.url}
                  alt={item.alt || item.filename}
                  className="w-20 h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => handleMediaRemove(item.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          />
        </div>

        {/* Scheduling */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              disabled={isLoading}
            />
            <span className="text-sm font-medium">Schedule for later</span>
          </label>
          {isScheduled && (
            <input
              type="datetime-local"
              value={scheduledAt ? scheduledAt.toISOString().slice(0, 16) : ''}
              onChange={(e) => setScheduledAt(e.target.value ? new Date(e.target.value) : undefined)}
              className="mt-2 w-full p-2 border rounded"
              disabled={isLoading}
            />
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as PostPriorityType)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !content.trim() || selectedPlatforms.length === 0 || isOverLimit}
          className="w-full bg-blue-500 text-white p-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading 
            ? 'Creating...' 
            : isScheduled 
              ? 'Schedule Post' 
              : 'Publish Now'
          }
        </button>
      </form>
    </div>
  );
}