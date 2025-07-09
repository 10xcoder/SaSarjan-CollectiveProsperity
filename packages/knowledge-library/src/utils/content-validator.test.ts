import { describe, it, expect, beforeEach } from 'vitest';
import { ContentValidator } from './content-validator';
import { KnowledgeContentType } from '../types';

describe('ContentValidator', () => {
  let validator: ContentValidator;

  beforeEach(() => {
    validator = ContentValidator.getInstance();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ContentValidator.getInstance();
      const instance2 = ContentValidator.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('validateContent', () => {
    it('should validate valid content', async () => {
      const validContent: Partial<KnowledgeContentType> = {
        title: 'Test Knowledge Content Article',
        content: 'This is a comprehensive test content with valuable information that provides useful insights to readers.',
        type: 'article',
        category: 'knowledge_commons',
        language: 'en',
      };

      const result = await validator.validateContent(validContent);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should validate content with warnings', async () => {
      const contentWithWarnings: Partial<KnowledgeContentType> = {
        title: 'Short', // Too short for SEO
        content: 'Short content.', // Too short for meaningful value
        type: 'article',
        category: 'knowledge_commons',
        language: 'fr', // Not commonly supported in Indian context
      };

      const result = await validator.validateContent(contentWithWarnings);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(3);
      expect(result.warnings).toContain('Title might be too short for good SEO');
      expect(result.warnings).toContain('Content might be too short for meaningful value');
      expect(result.warnings).toContain('Language not commonly supported in Indian context');
    });

    it('should reject content with missing required fields', async () => {
      const invalidContent: Partial<KnowledgeContentType> = {
        // Missing title, content, type, and category
        language: 'en',
      };

      const result = await validator.validateContent(invalidContent);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(4);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('Content is required');
      expect(result.errors).toContain('Content type is required');
      expect(result.errors).toContain('Category is required');
    });

    it('should reject content with empty title', async () => {
      const invalidContent: Partial<KnowledgeContentType> = {
        title: '   ', // Empty/whitespace title
        content: 'Valid content here',
        type: 'article',
        category: 'knowledge_commons',
      };

      const result = await validator.validateContent(invalidContent);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should reject content with empty content', async () => {
      const invalidContent: Partial<KnowledgeContentType> = {
        title: 'Valid title',
        content: '   ', // Empty/whitespace content
        type: 'article',
        category: 'knowledge_commons',
      };

      const result = await validator.validateContent(invalidContent);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content is required');
    });

    it('should validate supported Indian languages', async () => {
      const supportedLanguages = ['en', 'hi', 'mr', 'gu', 'ta', 'te', 'kn', 'bn'];

      for (const language of supportedLanguages) {
        const content: Partial<KnowledgeContentType> = {
          title: 'Test Title',
          content: 'Test content with sufficient length for validation',
          type: 'article',
          category: 'knowledge_commons',
          language: language as any,
        };

        const result = await validator.validateContent(content);
        expect(result.warnings).not.toContain('Language not commonly supported in Indian context');
      }
    });

    it('should warn about unsupported languages', async () => {
      const unsupportedLanguages = ['fr', 'de', 'es', 'zh', 'ja'];

      for (const language of unsupportedLanguages) {
        const content: Partial<KnowledgeContentType> = {
          title: 'Test Title',
          content: 'Test content with sufficient length for validation',
          type: 'article',
          category: 'knowledge_commons',
          language: language as any,
        };

        const result = await validator.validateContent(content);
        expect(result.warnings).toContain('Language not commonly supported in Indian context');
      }
    });
  });

  describe('validateMediaAttachment', () => {
    it('should validate valid media', () => {
      const validMedia = {
        id: 'media-1',
        type: 'image',
        url: 'https://example.com/image.jpg',
        title: 'Test Image',
        description: 'A test image',
        size: 1024 * 1024, // 1MB
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      };

      const result = validator.validateMediaAttachment(validMedia);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require media type', () => {
      const invalidMedia = {
        id: 'media-1',
        // Missing type
        url: 'https://example.com/image.jpg',
      };

      const result = validator.validateMediaAttachment(invalidMedia);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Media type is required');
    });

    it('should require media URL', () => {
      const invalidMedia = {
        id: 'media-1',
        type: 'image',
        // Missing url
      };

      const result = validator.validateMediaAttachment(invalidMedia);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Media URL is required');
    });

    it('should enforce file size limits', () => {
      const oversizedMedia = {
        id: 'media-1',
        type: 'video',
        url: 'https://example.com/video.mp4',
        size: 60 * 1024 * 1024, // 60MB (over 50MB limit)
      };

      const result = validator.validateMediaAttachment(oversizedMedia);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size exceeds 50MB limit');
    });

    it('should accept files within size limits', () => {
      const validSizedMedia = {
        id: 'media-1',
        type: 'video',
        url: 'https://example.com/video.mp4',
        size: 40 * 1024 * 1024, // 40MB (within 50MB limit)
      };

      const result = validator.validateMediaAttachment(validSizedMedia);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate without size field', () => {
      const mediaWithoutSize = {
        id: 'media-1',
        type: 'image',
        url: 'https://example.com/image.jpg',
        // No size field
      };

      const result = validator.validateMediaAttachment(mediaWithoutSize);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('sanitizeContent', () => {
    it('should remove script tags', () => {
      const maliciousContent = `
        <p>Good content</p>
        <script>alert('malicious');</script>
        <p>More content</p>
      `;

      const sanitized = validator.sanitizeContent(maliciousContent);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert(');
      expect(sanitized).toContain('<p>Good content</p>');
      expect(sanitized).toContain('<p>More content</p>');
    });

    it('should remove iframe tags', () => {
      const maliciousContent = `
        <p>Good content</p>
        <iframe src="https://malicious.com"></iframe>
        <p>More content</p>
      `;

      const sanitized = validator.sanitizeContent(maliciousContent);

      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).not.toContain('malicious.com');
      expect(sanitized).toContain('<p>Good content</p>');
      expect(sanitized).toContain('<p>More content</p>');
    });

    it('should remove javascript: URLs', () => {
      const maliciousContent = `
        <a href="javascript:alert('hack')">Click me</a>
        <p>Good content</p>
      `;

      const sanitized = validator.sanitizeContent(maliciousContent);

      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain("alert('hack')");
      expect(sanitized).toContain('<p>Good content</p>');
    });

    it('should remove event handlers', () => {
      const maliciousContent = `
        <button onclick="alert('hack')">Click me</button>
        <img src="image.jpg" onload="malicious()">
        <p onmouseover="bad()">Hover me</p>
      `;

      const sanitized = validator.sanitizeContent(maliciousContent);

      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('onload');
      expect(sanitized).not.toContain('onmouseover');
      expect(sanitized).not.toContain('alert(');
      expect(sanitized).not.toContain('malicious()');
      expect(sanitized).not.toContain('bad()');
    });

    it('should preserve safe HTML', () => {
      const safeContent = `
        <h1>Title</h1>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <a href="https://example.com">Safe link</a>
        <img src="image.jpg" alt="Description">
      `;

      const sanitized = validator.sanitizeContent(safeContent);

      expect(sanitized).toContain('<h1>Title</h1>');
      expect(sanitized).toContain('<p>Paragraph with <strong>bold</strong>');
      expect(sanitized).toContain('<ul>');
      expect(sanitized).toContain('<li>Item 1</li>');
      expect(sanitized).toContain('<a href="https://example.com">');
      expect(sanitized).toContain('<img src="image.jpg" alt="Description">');
    });

    it('should handle mixed content', () => {
      const mixedContent = `
        <h1>Safe Title</h1>
        <script>alert('malicious');</script>
        <p>Safe paragraph</p>
        <iframe src="https://malicious.com"></iframe>
        <a href="javascript:hack()">Malicious link</a>
        <button onclick="bad()">Safe button text</button>
        <p>Final safe paragraph</p>
      `;

      const sanitized = validator.sanitizeContent(mixedContent);

      // Safe content should remain
      expect(sanitized).toContain('<h1>Safe Title</h1>');
      expect(sanitized).toContain('<p>Safe paragraph</p>');
      expect(sanitized).toContain('<p>Final safe paragraph</p>');
      expect(sanitized).toContain('Safe button text');

      // Malicious content should be removed
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('alert(');
      expect(sanitized).not.toContain('hack()');
      expect(sanitized).not.toContain('bad()');
    });

    it('should handle empty content', () => {
      expect(validator.sanitizeContent('')).toBe('');
    });

    it('should handle content without HTML', () => {
      const plainText = 'This is plain text content without any HTML tags.';
      expect(validator.sanitizeContent(plainText)).toBe(plainText);
    });
  });

  describe('validateCreateRequest', () => {
    it('should validate valid create request', async () => {
      const validRequest = {
        title: 'Test Knowledge Content Article',
        content: 'This is a comprehensive test content with valuable information.',
        type: 'article',
        category: 'knowledge_commons',
        language: 'en',
        tags: ['test', 'knowledge'],
        description: 'A test description',
      };

      const result = await validator.validateCreateRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate create request with warnings', async () => {
      const requestWithWarnings = {
        title: 'Short', // Too short for SEO
        content: 'Short content.', // Too short for meaningful value
        type: 'article',
        category: 'knowledge_commons',
        language: 'fr', // Not commonly supported
      };

      const result = await validator.validateCreateRequest(requestWithWarnings);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should reject invalid create request', async () => {
      const invalidRequest = {
        // Missing required fields
        tags: ['test'],
      };

      const result = await validator.validateCreateRequest(invalidRequest);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateUpdateRequest', () => {
    it('should validate valid update request', async () => {
      const validRequest = {
        title: 'Updated Knowledge Content Article',
        content: 'This is updated comprehensive content with valuable information.',
        type: 'article',
        category: 'knowledge_commons',
        language: 'en',
      };

      const result = await validator.validateUpdateRequest(validRequest);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate partial update request', async () => {
      const partialRequest = {
        title: 'Updated title only',
        // Other fields are optional in update
      };

      const result = await validator.validateUpdateRequest(partialRequest);

      expect(result.isValid).toBe(false); // Still needs required fields
      expect(result.errors).toContain('Content is required');
      expect(result.errors).toContain('Content type is required');
      expect(result.errors).toContain('Category is required');
    });

    it('should validate update request with warnings', async () => {
      const requestWithWarnings = {
        title: 'Short', // Too short for SEO
        content: 'Short content.', // Too short for meaningful value
        type: 'article',
        category: 'knowledge_commons',
        language: 'de', // Not commonly supported
      };

      const result = await validator.validateUpdateRequest(requestWithWarnings);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from content', () => {
      const content = `
        This is a comprehensive article about knowledge management systems.
        Knowledge management is essential for organizations to capture, store,
        and share information effectively. Modern systems help teams collaborate
        and make informed decisions.
      `;

      const keywords = validator.extractKeywords(content);

      expect(keywords).toBeInstanceOf(Array);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.length).toBeLessThanOrEqual(10);
      expect(keywords).toContain('knowledge');
      expect(keywords).toContain('management');
      expect(keywords).toContain('systems');
    });

    it('should filter out short words', () => {
      const content = 'This is a test with and or but the';

      const keywords = validator.extractKeywords(content);

      // Should not contain words with 3 or fewer characters
      expect(keywords).not.toContain('is');
      expect(keywords).not.toContain('a');
      expect(keywords).not.toContain('and');
      expect(keywords).not.toContain('or');
      expect(keywords).not.toContain('but');
      expect(keywords).not.toContain('the');
    });

    it('should filter out common stop words', () => {
      const content = `
        This comprehensive article discusses what will happen when they have
        been working with their teams. Each team member said that from
        their perspective, which approach will work best.
      `;

      const keywords = validator.extractKeywords(content);

      // Should not contain common stop words
      expect(keywords).not.toContain('this');
      expect(keywords).not.toContain('that');
      expect(keywords).not.toContain('with');
      expect(keywords).not.toContain('from');
      expect(keywords).not.toContain('they');
      expect(keywords).not.toContain('been');
      expect(keywords).not.toContain('have');
      expect(keywords).not.toContain('were');
      expect(keywords).not.toContain('said');
      expect(keywords).not.toContain('each');
      expect(keywords).not.toContain('will');
      expect(keywords).not.toContain('when');
      expect(keywords).not.toContain('what');
      expect(keywords).not.toContain('which');
      expect(keywords).not.toContain('their');
    });

    it('should handle empty content', () => {
      const keywords = validator.extractKeywords('');
      expect(keywords).toBeInstanceOf(Array);
      expect(keywords).toHaveLength(0);
    });

    it('should handle content with only short words', () => {
      const content = 'a an the is at of in on to';
      const keywords = validator.extractKeywords(content);
      expect(keywords).toHaveLength(0);
    });

    it('should handle content with only stop words', () => {
      const content = 'this that with from they been have were said each';
      const keywords = validator.extractKeywords(content);
      expect(keywords).toHaveLength(0);
    });

    it('should count word frequency correctly', () => {
      const content = `
        Knowledge management systems are important. Knowledge sharing is crucial.
        Effective knowledge systems help organizations. Knowledge workers need
        good systems for knowledge management.
      `;

      const keywords = validator.extractKeywords(content);

      // 'knowledge' appears most frequently, so it should be first
      expect(keywords[0]).toBe('knowledge');
      expect(keywords).toContain('systems');
      expect(keywords).toContain('management');
    });

    it('should return maximum 10 keywords', () => {
      const content = `
        apple banana cherry date elderberry fig grape honeydew
        kiwi lemon mango nectarine orange papaya quince raspberry
        strawberry tangerine ugli vanilla watermelon xerophyte
        yellowfruit zucchini
      `;

      const keywords = validator.extractKeywords(content);

      expect(keywords.length).toBeLessThanOrEqual(10);
    });

    it('should handle special characters and punctuation', () => {
      const content = `
        Knowledge-management systems work well! They help organizations
        store, retrieve, and share information effectively. Modern web-based
        platforms make collaboration easier.
      `;

      const keywords = validator.extractKeywords(content);

      // Should handle hyphenated words and punctuation
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords).toContain('knowledge');
      expect(keywords).toContain('management');
      expect(keywords).toContain('systems');
    });

    it('should be case insensitive', () => {
      const content = `
        KNOWLEDGE Management Systems are Important. knowledge sharing is CRUCIAL.
        Knowledge workers need Good systems.
      `;

      const keywords = validator.extractKeywords(content);

      // Should normalize case
      expect(keywords).toContain('knowledge');
      expect(keywords).toContain('management');
      expect(keywords).toContain('systems');
      expect(keywords).toContain('important');
      expect(keywords).toContain('crucial');
    });
  });
});