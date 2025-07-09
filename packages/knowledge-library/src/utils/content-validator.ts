import { z } from 'zod';
import { KnowledgeContentType } from '../types';

export class ContentValidator {
  private static instance: ContentValidator;

  private constructor() {}

  static getInstance(): ContentValidator {
    if (!ContentValidator.instance) {
      ContentValidator.instance = new ContentValidator();
    }
    return ContentValidator.instance;
  }

  async validateContent(content: Partial<KnowledgeContentType>): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!content.title?.trim()) {
      errors.push('Title is required');
    }

    if (!content.content?.trim()) {
      errors.push('Content is required');
    }

    if (!content.type) {
      errors.push('Content type is required');
    }

    if (!content.category) {
      errors.push('Category is required');
    }

    // Content quality validation
    if (content.title && content.title.length < 10) {
      warnings.push('Title might be too short for good SEO');
    }

    if (content.content && content.content.length < 100) {
      warnings.push('Content might be too short for meaningful value');
    }

    // Language validation
    if (content.language && !['en', 'hi', 'mr', 'gu', 'ta', 'te', 'kn', 'bn'].includes(content.language)) {
      warnings.push('Language not commonly supported in Indian context');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateMediaAttachment(media: any): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!media.type) {
      errors.push('Media type is required');
    }

    if (!media.url) {
      errors.push('Media URL is required');
    }

    // File size validation (50MB limit)
    if (media.size && media.size > 50 * 1024 * 1024) {
      errors.push('File size exceeds 50MB limit');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  sanitizeContent(content: string): string {
    // Basic HTML sanitization - remove script tags and dangerous elements
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/href\s*=\s*["']?[^"']*alert\([^)]*\)[^"']*["']?/gi, '')
      .replace(/href\s*=\s*["']?[^"']*javascript:[^"']*["']?/gi, '');
  }

  async validateCreateRequest(request: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    // Basic validation for create request
    return this.validateContent(request);
  }

  async validateUpdateRequest(request: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    // Basic validation for update request
    return this.validateContent(request);
  }

  extractKeywords(content: string): string[] {
    // Simple keyword extraction
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'been', 'have', 'were', 'said', 'each', 'will', 'when', 'what', 'which', 'their', 'there'].includes(word));

    // Count frequency and return top keywords
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
}