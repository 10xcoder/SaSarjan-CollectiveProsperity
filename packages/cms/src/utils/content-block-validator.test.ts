import { describe, it, expect, beforeEach } from 'vitest';
import { ContentBlockValidator } from './content-block-validator';
import { createMockContentBlock } from '../test/mocks';

describe('ContentBlockValidator', () => {
  let validator: ContentBlockValidator;

  beforeEach(() => {
    validator = new ContentBlockValidator();
  });

  describe('single block validation', () => {
    it('should validate a valid block', () => {
      const block = createMockContentBlock();
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate required fields', () => {
      const block = createMockContentBlock({
        id: '',
        type: '' as any,
        order: 'invalid' as any,
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Block ID is required');
      expect(result.errors).toContain('Block type is required');
      expect(result.errors).toContain('Block order must be a number');
    });
  });

  describe('hero block validation', () => {
    it('should validate hero block with valid data', () => {
      const block = createMockContentBlock({
        type: 'hero',
        data: {
          headline: 'Welcome to our platform',
          subheadline: 'Build amazing things',
          ctaPrimary: {
            text: 'Get Started',
            url: 'https://example.com/signup',
          },
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require headline for hero block', () => {
      const block = createMockContentBlock({
        type: 'hero',
        data: {
          headline: '',
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hero headline is required');
    });

    it('should warn about long headlines', () => {
      const longHeadline = 'A'.repeat(101);
      const block = createMockContentBlock({
        type: 'hero',
        data: {
          headline: longHeadline,
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Hero headline is quite long (>100 characters)');
    });

    it('should validate background image URLs', () => {
      const block = createMockContentBlock({
        type: 'hero',
        data: {
          headline: 'Test',
          backgroundImage: 'invalid-url',
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid background image URL');
    });

    it('should validate CTA button', () => {
      const block = createMockContentBlock({
        type: 'hero',
        data: {
          headline: 'Test',
          ctaPrimary: {
            text: '',
            url: '',
          },
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Primary CTA must have both text and URL');
    });
  });

  describe('features block validation', () => {
    it('should validate features block with valid data', () => {
      const block = createMockContentBlock({
        type: 'features',
        data: {
          title: 'Our Features',
          features: [
            {
              id: 'feature-1',
              title: 'Feature 1',
              description: 'Great feature',
              icon: '🚀',
              order: 1,
            },
          ],
          columns: 3,
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require features array', () => {
      const block = {
        id: 'test-block',
        type: 'features' as const,
        order: 0,
        settings: {},
        styles: {},
        data: {
          title: 'Our Features',
          // Missing features array
        },
      };
      
      const result = validator.validateBlock(block as any);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Features array is required');
    });

    it('should validate individual features', () => {
      const block = createMockContentBlock({
        type: 'features',
        data: {
          features: [
            {
              title: '',
              description: '',
              image: 'invalid-url',
              link: 'invalid-url',
            },
          ],
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Feature 1 title is required');
      expect(result.errors).toContain('Feature 1 description is required');
      expect(result.errors).toContain('Feature 1 has invalid image URL');
      expect(result.errors).toContain('Feature 1 has invalid link URL');
    });

    it('should warn about empty features', () => {
      const block = createMockContentBlock({
        type: 'features',
        data: {
          features: [],
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Features block has no features');
    });

    it('should validate columns count', () => {
      const block = createMockContentBlock({
        type: 'features',
        data: {
          features: [],
          columns: 10,
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Features columns must be between 1 and 6');
    });
  });

  describe('text block validation', () => {
    it('should validate text block with HTML content', () => {
      const block = createMockContentBlock({
        type: 'text',
        data: {
          content: '<p>Hello world</p>',
          format: 'html',
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about empty content', () => {
      const block = createMockContentBlock({
        type: 'text',
        data: {
          content: '',
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Text block is empty');
    });

    it('should warn about very long content', () => {
      const longContent = 'A'.repeat(10001);
      const block = createMockContentBlock({
        type: 'text',
        data: {
          content: longContent,
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Text content is very long (>10,000 characters)');
    });
  });

  describe('image block validation', () => {
    it('should validate image block with valid data', () => {
      const block = createMockContentBlock({
        type: 'image',
        data: {
          src: 'https://example.com/image.jpg',
          alt: 'Test image',
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require valid image URL', () => {
      const block = createMockContentBlock({
        type: 'image',
        data: {
          src: 'invalid-url',
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid image URL is required');
    });

    it('should warn about missing alt text', () => {
      const block = createMockContentBlock({
        type: 'image',
        data: {
          src: 'https://example.com/image.jpg',
          alt: '',
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Image alt text is missing (important for accessibility)');
    });

    it('should validate link URLs', () => {
      const block = createMockContentBlock({
        type: 'image',
        data: {
          src: 'https://example.com/image.jpg',
          link: 'invalid-url',
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid link URL');
    });
  });

  describe('video block validation', () => {
    it('should validate video block with valid data', () => {
      const block = createMockContentBlock({
        type: 'video',
        data: {
          src: 'https://example.com/video.mp4',
          autoplay: false,
          muted: false,
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require valid video URL', () => {
      const block = createMockContentBlock({
        type: 'video',
        data: {
          src: 'invalid-url',
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid video URL is required');
    });

    it('should warn about autoplay without muted', () => {
      const block = createMockContentBlock({
        type: 'video',
        data: {
          src: 'https://example.com/video.mp4',
          autoplay: true,
          muted: false,
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Autoplay videos should be muted for better user experience');
    });
  });

  describe('form block validation', () => {
    it('should validate form block with valid data', () => {
      const block = createMockContentBlock({
        type: 'form',
        data: {
          action: 'https://example.com/submit',
          fields: [
            {
              id: 'field-1',
              type: 'text',
              label: 'Name',
              required: true,
            },
          ],
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require valid action URL', () => {
      const block = createMockContentBlock({
        type: 'form',
        data: {
          action: 'invalid-url',
          fields: [],
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Valid form action URL is required');
    });

    it('should validate form fields', () => {
      const block = createMockContentBlock({
        type: 'form',
        data: {
          action: 'https://example.com/submit',
          fields: [
            {
              id: '',
              type: '',
              label: '',
            },
            {
              id: 'select-1',
              type: 'select',
              label: 'Choose',
              options: [],
            },
          ],
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Form field 1 ID is required');
      expect(result.errors).toContain('Form field 1 type is required');
      expect(result.errors).toContain('Form field 1 label is required');
      expect(result.errors).toContain('Select field 2 must have options');
    });
  });

  describe('cta block validation', () => {
    it('should validate CTA block with valid data', () => {
      const block = createMockContentBlock({
        type: 'cta',
        data: {
          headline: 'Get Started Today',
          button: {
            text: 'Sign Up',
            url: 'https://example.com/signup',
          },
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require headline', () => {
      const block = createMockContentBlock({
        type: 'cta',
        data: {
          headline: '',
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('CTA headline is required');
    });

    it('should require button with text and URL', () => {
      const block = createMockContentBlock({
        type: 'cta',
        data: {
          headline: 'Test',
          button: {
            text: '',
            url: '',
          },
        },
      });
      
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('CTA button must have text and URL');
    });
  });

  describe('multiple blocks validation', () => {
    it('should validate multiple blocks', () => {
      const blocks = [
        createMockContentBlock({ id: 'block-1', type: 'hero' }),
        createMockContentBlock({ id: 'block-2', type: 'features' }),
      ];
      
      const result = validator.validateBlocks(blocks);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect duplicate IDs', () => {
      const blocks = [
        createMockContentBlock({ id: 'duplicate' }),
        createMockContentBlock({ id: 'duplicate' }),
      ];
      
      const result = validator.validateBlocks(blocks);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Duplicate block IDs found: duplicate');
    });

    it('should warn about page structure', () => {
      const blocks = [
        createMockContentBlock({ id: 'block-1', type: 'text' }),
        createMockContentBlock({ id: 'block-2', type: 'text' }),
      ];
      
      const result = validator.validateBlocks(blocks);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Consider adding a hero block for better user engagement');
    });

    it('should warn about too many blocks', () => {
      const blocks = Array.from({ length: 21 }, (_, i) => 
        createMockContentBlock({ id: `block-${i}` })
      );
      
      const result = validator.validateBlocks(blocks);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Page has many blocks (>20), consider splitting into multiple pages');
    });
  });

  describe('custom rules', () => {
    it('should allow adding custom rules', () => {
      validator.addRule({
        name: 'custom-rule',
        validate: (block) => ({
          isValid: false,
          errors: ['Custom error'],
          warnings: [],
        }),
      });
      
      const block = createMockContentBlock();
      const result = validator.validateBlock(block);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Custom error');
    });

    it('should allow removing rules', () => {
      validator.addRule({
        name: 'removable-rule',
        validate: (block) => ({
          isValid: false,
          errors: ['Should be removed'],
          warnings: [],
        }),
      });
      
      validator.removeRule('removable-rule');
      
      const block = createMockContentBlock();
      const result = validator.validateBlock(block);
      
      expect(result.errors).not.toContain('Should be removed');
    });
  });
});