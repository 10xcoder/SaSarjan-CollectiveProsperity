import { nanoid } from 'nanoid';
import axios from 'axios';
import { MediaAttachmentType, MediaTypeType, SocialPlatformType } from '../types';
import { createSupabaseClient } from '@sasarjan/database';

export interface MediaUploadOptions {
  userId: string;
  file: File | Buffer;
  filename: string;
  mimeType: string;
  alt?: string;
  compress?: boolean;
  platforms?: SocialPlatformType[];
}

export interface MediaProcessingOptions {
  resize?: {
    width: number;
    height: number;
    fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  quality?: number; // 1-100 for images
  format?: 'jpeg' | 'png' | 'webp' | 'gif';
  watermark?: {
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
  };
}

export class MediaManager {
  private supabase = createSupabaseClient();
  private storageProvider: 'supabase' | 'cloudinary' | 's3' = 'supabase';

  constructor(storageProvider: 'supabase' | 'cloudinary' | 's3' = 'supabase') {
    this.storageProvider = storageProvider;
  }

  /**
   * Upload media file
   */
  async uploadMedia(options: MediaUploadOptions): Promise<MediaAttachmentType> {
    // Validate file size and type
    this.validateMediaFile(options);

    // Generate unique filename
    const fileId = nanoid();
    const extension = this.getFileExtension(options.filename);
    const uniqueFilename = `${fileId}.${extension}`;

    // Determine media type
    const mediaType = this.getMediaType(options.mimeType);

    let uploadedUrl: string;
    let thumbnailUrl: string | undefined;

    switch (this.storageProvider) {
      case 'supabase':
        uploadedUrl = await this.uploadToSupabase(options, uniqueFilename);
        break;
      case 'cloudinary':
        uploadedUrl = await this.uploadToCloudinary(options, uniqueFilename);
        break;
      case 's3':
        uploadedUrl = await this.uploadToS3(options, uniqueFilename);
        break;
      default:
        throw new Error(`Unsupported storage provider: ${this.storageProvider}`);
    }

    // Generate thumbnail for videos and large images
    if (mediaType === 'video' || mediaType === 'image') {
      thumbnailUrl = await this.generateThumbnail(uploadedUrl, mediaType);
    }

    // Get file dimensions if applicable
    const dimensions = await this.getMediaDimensions(uploadedUrl, mediaType);

    // Create media record
    const mediaAttachment: MediaAttachmentType = {
      id: fileId,
      type: mediaType,
      url: uploadedUrl,
      thumbnailUrl,
      filename: options.filename,
      size: this.getFileSize(options.file),
      mimeType: options.mimeType,
      alt: options.alt,
      width: dimensions?.width,
      height: dimensions?.height,
      duration: dimensions?.duration,
    };

    // Store in database
    await this.storeMediaRecord(options.userId, mediaAttachment);

    return mediaAttachment;
  }

  /**
   * Process media for specific platform requirements
   */
  async processMediaForPlatform(
    media: MediaAttachmentType,
    platform: SocialPlatformType,
    options?: MediaProcessingOptions
  ): Promise<MediaAttachmentType> {
    const platformRequirements = this.getPlatformMediaRequirements(platform);
    
    // Check if processing is needed
    if (!this.needsProcessing(media, platformRequirements, options)) {
      return media;
    }

    // Process the media
    const processedUrl = await this.processMedia(media.url, platform, options);
    
    // Create new media record for processed version
    const processedMedia: MediaAttachmentType = {
      ...media,
      id: nanoid(),
      url: processedUrl,
    };

    return processedMedia;
  }

  /**
   * Get media by ID
   */
  async getMedia(mediaId: string): Promise<MediaAttachmentType | null> {
    const { data, error } = await this.supabase
      .from('media_attachments')
      .select('*')
      .eq('id', mediaId)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  /**
   * Get user media library
   */
  async getUserMedia(
    userId: string,
    options: {
      type?: MediaTypeType;
      limit?: number;
      offset?: number;
      sortBy?: 'createdAt' | 'filename' | 'size';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{ media: MediaAttachmentType[]; total: number }> {
    let query = this.supabase
      .from('media_attachments')
      .select('*', { count: 'exact' })
      .eq('userId', userId);

    if (options.type) {
      query = query.eq('type', options.type);
    }

    if (options.sortBy) {
      query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get user media: ${error.message}`);
    }

    return {
      media: data || [],
      total: count || 0,
    };
  }

  /**
   * Delete media
   */
  async deleteMedia(userId: string, mediaId: string): Promise<void> {
    const media = await this.getMedia(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    // Delete from storage
    await this.deleteFromStorage(media.url);

    if (media.thumbnailUrl) {
      await this.deleteFromStorage(media.thumbnailUrl);
    }

    // Delete from database
    await this.supabase
      .from('media_attachments')
      .delete()
      .eq('id', mediaId)
      .eq('userId', userId);
  }

  /**
   * Validate media file
   */
  private validateMediaFile(options: MediaUploadOptions): void {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const fileSize = this.getFileSize(options.file);

    if (fileSize > maxSize) {
      throw new Error(`File size exceeds maximum of ${maxSize} bytes`);
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
    ];

    if (!allowedTypes.includes(options.mimeType)) {
      throw new Error(`File type ${options.mimeType} is not supported`);
    }
  }

  /**
   * Get media type from MIME type
   */
  private getMediaType(mimeType: string): MediaTypeType {
    if (mimeType.startsWith('image/')) {
      return mimeType === 'image/gif' ? 'gif' : 'image';
    }
    if (mimeType.startsWith('video/')) {
      return 'video';
    }
    if (mimeType.startsWith('audio/')) {
      return 'audio';
    }
    return 'document';
  }

  /**
   * Get file size
   */
  private getFileSize(file: File | Buffer): number {
    if (file instanceof File) {
      return file.size;
    }
    return file.length;
  }

  /**
   * Get file extension
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Upload to Supabase Storage
   */
  private async uploadToSupabase(options: MediaUploadOptions, filename: string): Promise<string> {
    const bucket = 'social-media';
    const path = `${options.userId}/${filename}`;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, options.file, {
        contentType: options.mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  /**
   * Upload to Cloudinary (placeholder)
   */
  private async uploadToCloudinary(options: MediaUploadOptions, filename: string): Promise<string> {
    // This would integrate with Cloudinary API
    throw new Error('Cloudinary integration not implemented');
  }

  /**
   * Upload to S3 (placeholder)
   */
  private async uploadToS3(options: MediaUploadOptions, filename: string): Promise<string> {
    // This would integrate with AWS S3 API
    throw new Error('S3 integration not implemented');
  }

  /**
   * Generate thumbnail
   */
  private async generateThumbnail(url: string, mediaType: MediaTypeType): Promise<string | undefined> {
    // This would generate thumbnails using image processing libraries
    // For now, return undefined
    return undefined;
  }

  /**
   * Get media dimensions
   */
  private async getMediaDimensions(url: string, mediaType: MediaTypeType): Promise<{
    width?: number;
    height?: number;
    duration?: number;
  } | undefined> {
    // This would analyze media files to get dimensions
    // For now, return undefined
    return undefined;
  }

  /**
   * Store media record in database
   */
  private async storeMediaRecord(userId: string, media: MediaAttachmentType): Promise<void> {
    await this.supabase
      .from('media_attachments')
      .insert({
        ...media,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  }

  /**
   * Get platform media requirements
   */
  private getPlatformMediaRequirements(platform: SocialPlatformType): {
    maxWidth?: number;
    maxHeight?: number;
    aspectRatio?: string;
    maxSize: number;
    formats: string[];
  } {
    const requirements = {
      linkedin: {
        maxWidth: 1200,
        maxHeight: 627,
        aspectRatio: '1.91:1',
        maxSize: 100 * 1024 * 1024,
        formats: ['jpeg', 'png', 'gif'],
      },
      twitter: {
        maxWidth: 1200,
        maxHeight: 675,
        aspectRatio: '16:9',
        maxSize: 5 * 1024 * 1024,
        formats: ['jpeg', 'png', 'gif'],
      },
      facebook: {
        maxWidth: 1200,
        maxHeight: 630,
        aspectRatio: '1.91:1',
        maxSize: 25 * 1024 * 1024,
        formats: ['jpeg', 'png'],
      },
      instagram: {
        maxWidth: 1080,
        maxHeight: 1080,
        aspectRatio: '1:1',
        maxSize: 100 * 1024 * 1024,
        formats: ['jpeg', 'png'],
      },
      youtube: {
        maxWidth: 1920,
        maxHeight: 1080,
        aspectRatio: '16:9',
        maxSize: 256 * 1024 * 1024,
        formats: ['mp4'],
      },
      whatsapp: {
        maxSize: 16 * 1024 * 1024,
        formats: ['jpeg', 'png', 'mp4', 'mpeg'],
      },
    };

    return requirements[platform];
  }

  /**
   * Check if media needs processing
   */
  private needsProcessing(
    media: MediaAttachmentType,
    requirements: any,
    options?: MediaProcessingOptions
  ): boolean {
    // Check if custom processing options are provided
    if (options) {
      return true;
    }

    // Check if media exceeds platform requirements
    if (media.size > requirements.maxSize) {
      return true;
    }

    if (media.width && requirements.maxWidth && media.width > requirements.maxWidth) {
      return true;
    }

    if (media.height && requirements.maxHeight && media.height > requirements.maxHeight) {
      return true;
    }

    return false;
  }

  /**
   * Process media (placeholder)
   */
  private async processMedia(
    url: string,
    platform: SocialPlatformType,
    options?: MediaProcessingOptions
  ): Promise<string> {
    // This would process media using image/video processing libraries
    // For now, return original URL
    return url;
  }

  /**
   * Delete from storage
   */
  private async deleteFromStorage(url: string): Promise<void> {
    if (this.storageProvider === 'supabase') {
      // Extract path from Supabase URL and delete
      const bucket = 'social-media';
      const urlParts = url.split('/');
      const path = urlParts.slice(-2).join('/'); // Get last two parts (userId/filename)
      
      await this.supabase.storage
        .from(bucket)
        .remove([path]);
    }
    // Add other storage providers as needed
  }
}