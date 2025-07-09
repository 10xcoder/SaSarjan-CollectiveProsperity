import { describe, it, expect, beforeEach } from 'vitest';
import { ContentProcessor } from './content-processor';
import { KnowledgeContentType, ContentMediaType } from '../types';

describe('ContentProcessor', () => {
  let processor: ContentProcessor;

  beforeEach(() => {
    processor = ContentProcessor.getInstance();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ContentProcessor.getInstance();
      const instance2 = ContentProcessor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('processContent', () => {
    it('should process content with all features', () => {
      const content: Partial<KnowledgeContentType> = {
        title: 'Comprehensive Guide to Knowledge Management',
        content: `
          <h1>Knowledge Management Systems</h1>
          <p>Knowledge management is the process of creating, sharing, using, and managing 
          knowledge and information within an organization. It involves capturing tacit 
          knowledge from employees and converting it into explicit knowledge that can be 
          shared across the organization.</p>
          
          <h2>Benefits of Knowledge Management</h2>
          <p>Organizations that implement effective knowledge management systems can 
          expect to see improved decision-making, increased innovation, reduced costs, 
          and enhanced collaboration among team members.</p>
          
          <h3>Key Components</h3>
          <ul>
            <li>Knowledge capture and creation</li>
            <li>Knowledge storage and organization</li>
            <li>Knowledge sharing and distribution</li>
            <li>Knowledge application and utilization</li>
          </ul>
        `,
        type: 'guide',
      };

      const result = processor.processContent(content, { extractKeywords: true });

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('excerpt');
      expect(result).toHaveProperty('keywords');
      expect(result).toHaveProperty('estimatedReadTime');
      expect(result).toHaveProperty('qualityScore');

      expect(result.excerpt).toBeDefined();
      expect(result.excerpt!.length).toBeLessThanOrEqual(160);
      expect(result.keywords).toContain('knowledge');
      expect(result.keywords).toContain('management');
      expect(result.estimatedReadTime).toBeGreaterThan(0);
      expect(result.qualityScore).toBeGreaterThan(0);
    });

    it('should handle minimal content', () => {
      const content: Partial<KnowledgeContentType> = {
        title: 'Short Title',
        content: 'Brief content.',
        type: 'article',
      };

      const result = processor.processContent(content);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('excerpt');
      expect(result).toHaveProperty('keywords');
      expect(result).toHaveProperty('estimatedReadTime');
      expect(result).toHaveProperty('qualityScore');

      expect(result.excerpt).toBe('Brief content.');
      expect(result.estimatedReadTime).toBe(1); // Minimum read time
      expect(result.qualityScore).toBeLessThan(50); // Low quality due to short content
    });

    it('should handle content without title', () => {
      const content: Partial<KnowledgeContentType> = {
        content: 'Content without title',
        type: 'article',
      };

      const result = processor.processContent(content);

      expect(result.content).toBe('Content without title');
      expect(result.excerpt).toBe('Content without title');
    });

    it('should handle content without content field', () => {
      const content: Partial<KnowledgeContentType> = {
        title: 'Title Only',
        type: 'article',
      };

      const result = processor.processContent(content);

      expect(result.content).toBeUndefined();
      expect(result.excerpt).toBeUndefined();
      expect(result.keywords).toBeUndefined();
      expect(result.estimatedReadTime).toBeUndefined();
    });
  });

  describe('generateSlug', () => {
    it('should generate valid slug from title', () => {
      const title = 'Comprehensive Guide to Knowledge Management';
      const slug = processor.generateSlug(title);

      expect(slug).toBe('comprehensive-guide-to-knowledge-management');
    });

    it('should handle special characters', () => {
      const title = 'API Design: Best Practices & Guidelines!';
      const slug = processor.generateSlug(title);

      expect(slug).toBe('api-design-best-practices-guidelines');
    });

    it('should handle multiple spaces and hyphens', () => {
      const title = 'Multiple   Spaces  -  And -- Hyphens';
      const slug = processor.generateSlug(title);

      expect(slug).toBe('multiple-spaces-and-hyphens');
    });

    it('should handle leading and trailing spaces', () => {
      const title = '  Leading and Trailing Spaces  ';
      const slug = processor.generateSlug(title);

      expect(slug).toBe('leading-and-trailing-spaces');
    });

    it('should handle numbers and mixed case', () => {
      const title = 'Top 10 JavaScript Tips for 2024';
      const slug = processor.generateSlug(title);

      expect(slug).toBe('top-10-javascript-tips-for-2024');
    });

    it('should handle underscores', () => {
      const title = 'API_Design_Best_Practices';
      const slug = processor.generateSlug(title);

      expect(slug).toBe('api-design-best-practices');
    });

    it('should handle empty title', () => {
      const title = '';
      const slug = processor.generateSlug(title);

      expect(slug).toBe('');
    });

    it('should handle title with only special characters', () => {
      const title = '!@#$%^&*()';
      const slug = processor.generateSlug(title);

      expect(slug).toBe('');
    });

    it('should handle Unicode characters', () => {
      const title = 'ज्ञान प्रबंधन गाइड';
      const slug = processor.generateSlug(title);

      expect(slug).toMatch(/^[a-z0-9-]*$/); // Should only contain lowercase letters, numbers, and hyphens
    });
  });

  describe('generateExcerpt', () => {
    it('should generate excerpt from content', () => {
      const content = `
        <p>This is a comprehensive article about knowledge management systems. 
        Knowledge management is essential for organizations to capture, store, 
        and share information effectively. Modern systems help teams collaborate 
        and make informed decisions.</p>
        <p>Additional paragraph with more information.</p>
      `;

      const excerpt = processor.generateExcerpt(content);

      expect(excerpt.length).toBeLessThanOrEqual(160);
      expect(excerpt).not.toContain('<p>');
      expect(excerpt).not.toContain('</p>');
      expect(excerpt).toContain('knowledge management');
    });

    it('should handle short content', () => {
      const content = 'This is short content.';
      const excerpt = processor.generateExcerpt(content);

      expect(excerpt).toBe('This is short content.');
    });

    it('should truncate at sentence boundary', () => {
      const content = 'First sentence. Second sentence that might be cut off due to length limits. Third sentence.';
      const excerpt = processor.generateExcerpt(content, 50);

      expect(excerpt).toBe('First sentence.');
    });

    it('should truncate at word boundary if no sentence boundary', () => {
      const content = 'This is a very long sentence without any periods that should be truncated at word boundaries';
      const excerpt = processor.generateExcerpt(content, 50);

      expect(excerpt).toMatch(/\.\.\.$/); // Should end with ...
      expect(excerpt.length).toBeLessThanOrEqual(53); // 50 + "..."
      expect(excerpt).not.toContain('truncated at word'); // Should not cut in middle of word
    });

    it('should handle custom max length', () => {
      const content = 'This is a test content that should be truncated at a custom length.';
      const excerpt = processor.generateExcerpt(content, 30);

      expect(excerpt.length).toBeLessThanOrEqual(33); // 30 + "..."
    });

    it('should remove HTML tags', () => {
      const content = '<h1>Title</h1><p>This is <strong>bold</strong> text with <em>italic</em> styling.</p>';
      const excerpt = processor.generateExcerpt(content);

      expect(excerpt).not.toContain('<h1>');
      expect(excerpt).not.toContain('<p>');
      expect(excerpt).not.toContain('<strong>');
      expect(excerpt).not.toContain('<em>');
      expect(excerpt).toContain('Title');
      expect(excerpt).toContain('bold');
      expect(excerpt).toContain('italic');
    });

    it('should handle empty content', () => {
      const excerpt = processor.generateExcerpt('');
      expect(excerpt).toBe('');
    });

    it('should handle content with only HTML tags', () => {
      const content = '<p></p><div></div><span></span>';
      const excerpt = processor.generateExcerpt(content);

      expect(excerpt).toBe('');
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time for normal content', () => {
      // Create content with approximately 400 words
      const content = Array(400).fill('word').join(' ');
      const readingTime = processor.calculateReadingTime(content);

      // At 200 words per minute, 400 words should take 2 minutes
      expect(readingTime).toBe(2);
    });

    it('should calculate reading time for short content', () => {
      const content = 'This is a short sentence with ten words exactly.';
      const readingTime = processor.calculateReadingTime(content);

      // Should round up to minimum 1 minute
      expect(readingTime).toBe(1);
    });

    it('should calculate reading time for long content', () => {
      // Create content with approximately 1000 words
      const content = Array(1000).fill('word').join(' ');
      const readingTime = processor.calculateReadingTime(content);

      // At 200 words per minute, 1000 words should take 5 minutes
      expect(readingTime).toBe(5);
    });

    it('should handle HTML content', () => {
      const content = `
        <h1>Title</h1>
        <p>This is a paragraph with ${Array(200).fill('word').join(' ')}</p>
        <ul>
          <li>List item with ${Array(100).fill('word').join(' ')}</li>
        </ul>
      `;
      const readingTime = processor.calculateReadingTime(content);

      // Should calculate based on text content, not HTML tags
      expect(readingTime).toBe(2); // ~300 words / 200 wpm = 1.5, rounded up to 2
    });

    it('should handle empty content', () => {
      const readingTime = processor.calculateReadingTime('');
      expect(readingTime).toBe(1); // Minimum 1 minute
    });

    it('should handle content with only HTML tags', () => {
      const content = '<p></p><div></div><span></span>';
      const readingTime = processor.calculateReadingTime(content);

      expect(readingTime).toBe(1); // Minimum 1 minute
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from content', () => {
      const content = `
        Knowledge management systems are essential for modern organizations.
        These systems help capture, store, and share institutional knowledge.
        Effective knowledge management improves decision-making and innovation.
      `;

      const keywords = processor.extractKeywords(content);

      expect(keywords).toBeInstanceOf(Array);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.length).toBeLessThanOrEqual(10);
      expect(keywords).toContain('knowledge');
      expect(keywords).toContain('management');
      expect(keywords).toContain('systems');
    });

    it('should filter out stop words', () => {
      const content = `
        This comprehensive article discusses what will happen when they have
        been working with their teams. Which approach will work best for
        modern organizations and their knowledge management systems.
      `;

      const keywords = processor.extractKeywords(content);

      // Should not contain stop words
      expect(keywords).not.toContain('this');
      expect(keywords).not.toContain('that');
      expect(keywords).not.toContain('with');
      expect(keywords).not.toContain('from');
      expect(keywords).not.toContain('they');
      expect(keywords).not.toContain('been');
      expect(keywords).not.toContain('have');
      expect(keywords).not.toContain('were');
      expect(keywords).not.toContain('said');
      expect(keywords).not.toContain('which');
      expect(keywords).not.toContain('what');
      expect(keywords).not.toContain('when');
      expect(keywords).not.toContain('will');
      expect(keywords).not.toContain('there');
    });

    it('should filter out short words', () => {
      const content = 'This is a test with and or but the API';

      const keywords = processor.extractKeywords(content);

      // Should not contain words with less than 4 characters
      expect(keywords).not.toContain('is');
      expect(keywords).not.toContain('a');
      expect(keywords).not.toContain('and');
      expect(keywords).not.toContain('or');
      expect(keywords).not.toContain('but');
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('API'); // 3 characters
    });

    it('should handle HTML content', () => {
      const content = `
        <h1>Knowledge Management</h1>
        <p>Knowledge management <strong>systems</strong> are essential for 
        <em>modern organizations</em>. These systems help capture and share 
        institutional knowledge.</p>
      `;

      const keywords = processor.extractKeywords(content);

      expect(keywords).toContain('knowledge');
      expect(keywords).toContain('management');
      expect(keywords).toContain('systems');
      expect(keywords).toContain('organizations');
    });

    it('should return maximum 10 keywords', () => {
      const content = `
        apple banana cherry date elderberry fig grape honeydew
        kiwi lemon mango nectarine orange papaya quince raspberry
        strawberry tangerine watermelon
      `;

      const keywords = processor.extractKeywords(content);

      expect(keywords.length).toBeLessThanOrEqual(10);
    });

    it('should handle empty content', () => {
      const keywords = processor.extractKeywords('');
      expect(keywords).toBeInstanceOf(Array);
      expect(keywords).toHaveLength(0);
    });
  });

  describe('calculateKeywordDensity', () => {
    it('should calculate keyword density', () => {
      const content = `
        Knowledge management systems are essential. Knowledge sharing helps
        organizations grow. Modern knowledge systems improve collaboration.
      `;
      const keywords = ['knowledge', 'systems', 'management'];

      const density = processor.calculateKeywordDensity(content, keywords);

      expect(density).toHaveProperty('knowledge');
      expect(density).toHaveProperty('systems');
      expect(density).toHaveProperty('management');

      // 'knowledge' appears 3 times out of ~17 words = ~17.6%
      expect(density.knowledge).toBeGreaterThan(15);
      expect(density.knowledge).toBeLessThan(25);

      // 'systems' appears 2 times out of ~17 words = ~11.8%
      expect(density.systems).toBeGreaterThan(10);
      expect(density.systems).toBeLessThan(15);

      // 'management' appears 1 time out of ~17 words = ~5.9%
      expect(density.management).toBeGreaterThan(5);
      expect(density.management).toBeLessThan(10);
    });

    it('should handle HTML content', () => {
      const content = `
        <h1>Knowledge Management</h1>
        <p>Knowledge management <strong>systems</strong> are essential.</p>
      `;
      const keywords = ['knowledge', 'management', 'systems'];

      const density = processor.calculateKeywordDensity(content, keywords);

      expect(density).toHaveProperty('knowledge');
      expect(density).toHaveProperty('management');
      expect(density).toHaveProperty('systems');

      // Should calculate based on text content, not HTML tags
      expect(density.knowledge).toBeGreaterThan(0);
      expect(density.management).toBeGreaterThan(0);
      expect(density.systems).toBeGreaterThan(0);
    });

    it('should handle keywords not in content', () => {
      const content = 'This is test content without target keywords.';
      const keywords = ['missing', 'absent', 'notfound'];

      const density = processor.calculateKeywordDensity(content, keywords);

      expect(density.missing).toBe(0);
      expect(density.absent).toBe(0);
      expect(density.notfound).toBe(0);
    });

    it('should handle empty content', () => {
      const content = '';
      const keywords = ['test', 'keywords'];

      const density = processor.calculateKeywordDensity(content, keywords);

      expect(density.test).toBe(0);
      expect(density.keywords).toBe(0);
    });

    it('should handle empty keywords', () => {
      const content = 'This is test content.';
      const keywords: string[] = [];

      const density = processor.calculateKeywordDensity(content, keywords);

      expect(Object.keys(density)).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const content = 'KNOWLEDGE management and Knowledge Systems are important.';
      const keywords = ['knowledge', 'management', 'systems'];

      const density = processor.calculateKeywordDensity(content, keywords);

      expect(density.knowledge).toBeGreaterThan(0);
      expect(density.management).toBeGreaterThan(0);
      expect(density.systems).toBeGreaterThan(0);
    });
  });

  describe('calculateQualityScore', () => {
    it('should calculate quality score for high-quality content', () => {
      const content: Partial<KnowledgeContentType> = {
        title: 'Comprehensive Guide to Knowledge Management Systems',
        content: Array(400).fill('word').join(' '), // 400 words
        description: 'A comprehensive guide covering all aspects of knowledge management systems.',
        category: 'knowledge_commons',
        tags: ['knowledge', 'management', 'systems', 'guide'],
        media: [
          { id: 'img1', type: 'image', url: 'https://example.com/img1.jpg', uploadedAt: new Date() },
        ],
        excerpt: 'A comprehensive guide covering all aspects...',
        keywords: ['knowledge', 'management', 'systems'],
        slug: 'comprehensive-guide-knowledge-management-systems',
      };

      const score = processor.calculateQualityScore(content);

      expect(score).toBeGreaterThan(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate quality score for medium-quality content', () => {
      const content: Partial<KnowledgeContentType> = {
        title: 'Knowledge Management',
        content: Array(200).fill('word').join(' '), // 200 words
        description: 'About knowledge management.',
        category: 'knowledge_commons',
        tags: ['knowledge'],
      };

      const score = processor.calculateQualityScore(content);

      expect(score).toBeGreaterThan(40);
      expect(score).toBeLessThan(80);
    });

    it('should calculate quality score for low-quality content', () => {
      const content: Partial<KnowledgeContentType> = {
        title: 'Short',
        content: 'Brief content.',
        // Missing description, category, tags, etc.
      };

      const score = processor.calculateQualityScore(content);

      expect(score).toBeLessThan(40);
    });

    it('should give points for optimal title length', () => {
      const goodTitle: Partial<KnowledgeContentType> = {
        title: 'Optimal Length Title for SEO', // 30 characters
        content: Array(300).fill('word').join(' '),
      };

      const shortTitle: Partial<KnowledgeContentType> = {
        title: 'Short', // 5 characters
        content: Array(300).fill('word').join(' '),
      };

      const longTitle: Partial<KnowledgeContentType> = {
        title: 'This is a very long title that exceeds the optimal length for SEO purposes and might be truncated', // >60 characters
        content: Array(300).fill('word').join(' '),
      };

      const goodScore = processor.calculateQualityScore(goodTitle);
      const shortScore = processor.calculateQualityScore(shortTitle);
      const longScore = processor.calculateQualityScore(longTitle);

      expect(goodScore).toBeGreaterThan(shortScore);
      expect(goodScore).toBeGreaterThan(longScore);
    });

    it('should give points for content length', () => {
      const longContent: Partial<KnowledgeContentType> = {
        title: 'Test Title',
        content: Array(400).fill('word').join(' '), // 400 words
      };

      const mediumContent: Partial<KnowledgeContentType> = {
        title: 'Test Title',
        content: Array(200).fill('word').join(' '), // 200 words
      };

      const shortContent: Partial<KnowledgeContentType> = {
        title: 'Test Title',
        content: Array(100).fill('word').join(' '), // 100 words
      };

      const longScore = processor.calculateQualityScore(longContent);
      const mediumScore = processor.calculateQualityScore(mediumContent);
      const shortScore = processor.calculateQualityScore(shortContent);

      expect(longScore).toBeGreaterThan(mediumScore);
      expect(mediumScore).toBeGreaterThan(shortScore);
    });

    it('should give points for metadata completeness', () => {
      const completeMetadata: Partial<KnowledgeContentType> = {
        title: 'Test Title',
        content: Array(300).fill('word').join(' '),
        description: 'Test description',
        category: 'knowledge_commons',
        tags: ['tag1', 'tag2'],
      };

      const incompleteMetadata: Partial<KnowledgeContentType> = {
        title: 'Test Title',
        content: Array(300).fill('word').join(' '),
        // Missing description, category, tags
      };

      const completeScore = processor.calculateQualityScore(completeMetadata);
      const incompleteScore = processor.calculateQualityScore(incompleteMetadata);

      expect(completeScore).toBeGreaterThan(incompleteScore);
    });

    it('should give points for media presence', () => {
      const withMedia: Partial<KnowledgeContentType> = {
        title: 'Test Title',
        content: Array(300).fill('word').join(' '),
        media: [
          { id: 'img1', type: 'image', url: 'https://example.com/img1.jpg', uploadedAt: new Date() },
        ],
      };

      const withoutMedia: Partial<KnowledgeContentType> = {
        title: 'Test Title',
        content: Array(300).fill('word').join(' '),
        media: [],
      };

      const withMediaScore = processor.calculateQualityScore(withMedia);
      const withoutMediaScore = processor.calculateQualityScore(withoutMedia);

      expect(withMediaScore).toBeGreaterThan(withoutMediaScore);
    });

    it('should give points for SEO factors', () => {
      const withSEO: Partial<KnowledgeContentType> = {
        title: 'Test Title',
        content: Array(300).fill('word').join(' '),
        excerpt: 'Test excerpt',
        keywords: ['keyword1', 'keyword2'],
        slug: 'test-title',
      };

      const withoutSEO: Partial<KnowledgeContentType> = {
        title: 'Test Title',
        content: Array(300).fill('word').join(' '),
        // Missing excerpt, keywords, slug
      };

      const withSEOScore = processor.calculateQualityScore(withSEO);
      const withoutSEOScore = processor.calculateQualityScore(withoutSEO);

      expect(withSEOScore).toBeGreaterThan(withoutSEOScore);
    });

    it('should never exceed 100 points', () => {
      const perfectContent: Partial<KnowledgeContentType> = {
        title: 'Perfect Title Length for SEO Optimization',
        content: Array(1000).fill('word').join(' '), // Very long content
        description: 'Perfect description for this content.',
        category: 'knowledge_commons',
        tags: ['tag1', 'tag2', 'tag3'],
        media: [
          { id: 'img1', type: 'image', url: 'https://example.com/img1.jpg', uploadedAt: new Date() },
          { id: 'vid1', type: 'video', url: 'https://example.com/vid1.mp4', uploadedAt: new Date() },
        ],
        excerpt: 'Perfect excerpt for this content.',
        keywords: ['keyword1', 'keyword2', 'keyword3'],
        slug: 'perfect-title-length-seo-optimization',
      };

      const score = processor.calculateQualityScore(perfectContent);

      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle empty content', () => {
      const emptyContent: Partial<KnowledgeContentType> = {};

      const score = processor.calculateQualityScore(emptyContent);

      expect(score).toBe(0);
    });
  });

  describe('processMediaAttachment', () => {
    it('should process media attachment with all fields', () => {
      const media: Partial<ContentMediaType> = {
        type: 'image',
        url: 'https://example.com/image.jpg',
        title: 'Test Image',
        description: 'A test image',
        size: 1024,
        mimeType: 'image/jpeg',
      };

      const processed = processor.processMediaAttachment(media);

      expect(processed.id).toBeDefined();
      expect(processed.uploadedAt).toBeDefined();
      expect(processed.type).toBe('image');
      expect(processed.url).toBe('https://example.com/image.jpg');
      expect(processed.title).toBe('Test Image');
      expect(processed.description).toBe('A test image');
      expect(processed.size).toBe(1024);
      expect(processed.mimeType).toBe('image/jpeg');
    });

    it('should generate ID if not provided', () => {
      const media: Partial<ContentMediaType> = {
        type: 'image',
        url: 'https://example.com/image.jpg',
      };

      const processed = processor.processMediaAttachment(media);

      expect(processed.id).toBeDefined();
      expect(processed.id).toMatch(/^media_\d+_[a-z0-9]+$/);
    });

    it('should set uploadedAt if not provided', () => {
      const media: Partial<ContentMediaType> = {
        type: 'image',
        url: 'https://example.com/image.jpg',
      };

      const processed = processor.processMediaAttachment(media);

      expect(processed.uploadedAt).toBeDefined();
      expect(processed.uploadedAt).toBeInstanceOf(Date);
    });

    it('should preserve existing ID and uploadedAt', () => {
      const existingId = 'existing-media-id';
      const existingDate = new Date('2023-01-01');
      const media: Partial<ContentMediaType> = {
        id: existingId,
        type: 'image',
        url: 'https://example.com/image.jpg',
        uploadedAt: existingDate,
      };

      const processed = processor.processMediaAttachment(media);

      expect(processed.id).toBe(existingId);
      expect(processed.uploadedAt).toBe(existingDate);
    });

    it('should generate thumbnail URL for images', () => {
      const media: Partial<ContentMediaType> = {
        type: 'image',
        url: 'https://example.com/image.jpg',
      };

      const processed = processor.processMediaAttachment(media);

      expect(processed.thumbnailUrl).toBe('https://example.com/image_thumb.jpg');
    });

    it('should generate thumbnail URL for videos', () => {
      const media: Partial<ContentMediaType> = {
        type: 'video',
        url: 'https://example.com/video.mp4',
      };

      const processed = processor.processMediaAttachment(media);

      expect(processed.thumbnailUrl).toBe('https://example.com/video_thumb.jpg');
    });

    it('should not generate thumbnail URL for audio', () => {
      const media: Partial<ContentMediaType> = {
        type: 'audio',
        url: 'https://example.com/audio.mp3',
      };

      const processed = processor.processMediaAttachment(media);

      expect(processed.thumbnailUrl).toBeUndefined();
    });

    it('should not generate thumbnail URL for documents', () => {
      const media: Partial<ContentMediaType> = {
        type: 'document',
        url: 'https://example.com/document.pdf',
      };

      const processed = processor.processMediaAttachment(media);

      expect(processed.thumbnailUrl).toBeUndefined();
    });

    it('should preserve existing thumbnail URL', () => {
      const existingThumbnail = 'https://example.com/existing_thumb.jpg';
      const media: Partial<ContentMediaType> = {
        type: 'image',
        url: 'https://example.com/image.jpg',
        thumbnailUrl: existingThumbnail,
      };

      const processed = processor.processMediaAttachment(media);

      expect(processed.thumbnailUrl).toBe(existingThumbnail);
    });

    it('should handle media with different file extensions', () => {
      const testCases = [
        { url: 'https://example.com/image.png', expected: 'https://example.com/image_thumb.jpg' },
        { url: 'https://example.com/video.avi', expected: 'https://example.com/video_thumb.jpg' },
        { url: 'https://example.com/image.jpeg', expected: 'https://example.com/image_thumb.jpg' },
        { url: 'https://example.com/video.mov', expected: 'https://example.com/video_thumb.jpg' },
      ];

      testCases.forEach(({ url, expected }) => {
        const media: Partial<ContentMediaType> = {
          type: url.includes('video') ? 'video' : 'image',
          url,
        };

        const processed = processor.processMediaAttachment(media);
        expect(processed.thumbnailUrl).toBe(expected);
      });
    });

    it('should handle URLs without file extensions', () => {
      const media: Partial<ContentMediaType> = {
        type: 'image',
        url: 'https://example.com/image',
      };

      const processed = processor.processMediaAttachment(media);

      // The regex won't match if there's no extension, so it appends _thumb.jpg to the original URL
      expect(processed.thumbnailUrl).toBe('https://example.com/image_thumb.jpg');
    });
  });
});