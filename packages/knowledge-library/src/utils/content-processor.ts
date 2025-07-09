import { KnowledgeContentType, ContentMediaType } from '../types';

export class ContentProcessor {
  private static instance: ContentProcessor;

  private constructor() {}

  static getInstance(): ContentProcessor {
    if (!ContentProcessor.instance) {
      ContentProcessor.instance = new ContentProcessor();
    }
    return ContentProcessor.instance;
  }

  processContent(content: Partial<KnowledgeContentType>, options?: { extractKeywords?: boolean }): {
    content?: string;
    excerpt?: string;
    keywords?: string[];
    estimatedReadTime?: number;
    qualityScore?: number;
  } {
    const processedContent = { ...content };
    const metadata: Record<string, any> = {};

    // Generate slug from title
    if (content.title && !content.slug) {
      processedContent.slug = this.generateSlug(content.title);
    }

    // Extract and process excerpt
    if (content.content && !content.excerpt) {
      processedContent.excerpt = this.generateExcerpt(content.content);
    }

    // Calculate reading time
    if (content.content) {
      metadata.estimatedReadTime = this.calculateReadingTime(content.content);
    }

    // Process keywords
    if (content.content) {
      const keywords = this.extractKeywords(content.content);
      processedContent.keywords = keywords;
      metadata.keywordDensity = this.calculateKeywordDensity(content.content, keywords);
    }

    // Quality scoring
    metadata.qualityScore = this.calculateQualityScore(processedContent);

    return {
      content: processedContent.content,
      excerpt: processedContent.excerpt,
      keywords: processedContent.keywords,
      estimatedReadTime: metadata.estimatedReadTime,
      qualityScore: metadata.qualityScore,
    };
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  generateExcerpt(content: string, maxLength: number = 160): string {
    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, '');
    
    if (textContent.length <= maxLength) {
      return textContent;
    }

    // Find the last complete sentence within the limit
    const truncated = textContent.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastPeriod > maxLength * 0.7) {
      return truncated.substring(0, lastPeriod + 1);
    } else if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    } else {
      return truncated + '...';
    }
  }

  calculateReadingTime(content: string): number {
    const wordsPerMinute = 200; // Average reading speed
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  extractKeywords(content: string): string[] {
    const text = content.replace(/<[^>]*>/g, '').toLowerCase();
    const words = text.match(/\b\w{4,}\b/g) || [];
    
    // Common stop words to filter out
    const stopWords = new Set([
      'this', 'that', 'with', 'from', 'they', 'been', 'have', 'were', 
      'said', 'each', 'which', 'their', 'what', 'will', 'there', 'when'
    ]);

    const wordCount = words
      .filter(word => !stopWords.has(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  calculateKeywordDensity(content: string, keywords: string[]): Record<string, number> {
    const text = content.replace(/<[^>]*>/g, '').toLowerCase();
    const totalWords = text.split(/\s+/).length;

    return keywords.reduce((acc, keyword) => {
      const matches = (text.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
      acc[keyword] = (matches / totalWords) * 100;
      return acc;
    }, {} as Record<string, number>);
  }

  calculateQualityScore(content: Partial<KnowledgeContentType>): number {
    let score = 0;

    // Title quality (20 points)
    if (content.title) {
      if (content.title.length >= 10 && content.title.length <= 60) score += 20;
      else if (content.title.length >= 5) score += 10;
    }

    // Content length (25 points)
    if (content.content) {
      const wordCount = content.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      if (wordCount >= 300) score += 25;
      else if (wordCount >= 150) score += 15;
      else if (wordCount >= 50) score += 5;
    }

    // Metadata completeness (25 points)
    if (content.description) score += 8;
    if (content.category) score += 8;
    if (content.tags && content.tags.length > 0) score += 9;

    // Media presence (15 points)
    if (content.media && content.media.length > 0) score += 15;

    // SEO factors (15 points)
    if (content.excerpt) score += 5;
    if (content.keywords && content.keywords.length > 0) score += 5;
    if (content.slug) score += 5;

    return Math.min(score, 100);
  }

  processMediaAttachment(media: Partial<ContentMediaType>): ContentMediaType {
    const processed = { ...media } as ContentMediaType;

    // Ensure required fields
    if (!processed.id) {
      processed.id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (!processed.uploadedAt) {
      processed.uploadedAt = new Date();
    }

    // Generate thumbnail URL for videos and images
    if (processed.type === 'video' || processed.type === 'image') {
      if (!processed.thumbnailUrl && processed.url) {
        // In a real implementation, this would generate actual thumbnails
        const urlParts = processed.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        const baseName = filename.replace(/\.[^.]+$/, '');
        const baseUrl = urlParts.slice(0, -1).join('/');
        processed.thumbnailUrl = `${baseUrl}/${baseName}_thumb.jpg`;
      }
    }

    return processed;
  }
}