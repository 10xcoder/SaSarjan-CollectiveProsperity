import { ContentBlockType } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface BlockValidationRule {
  name: string;
  validate: (block: ContentBlockType) => ValidationResult;
}

export class ContentBlockValidator {
  private rules: BlockValidationRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Validate a single block
   */
  validateBlock(block: ContentBlockType): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Run all validation rules
    for (const rule of this.rules) {
      const ruleResult = rule.validate(block);
      result.errors.push(...ruleResult.errors);
      result.warnings.push(...ruleResult.warnings);
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate multiple blocks
   */
  validateBlocks(blocks: ContentBlockType[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Validate each block
    blocks.forEach((block, index) => {
      const blockResult = this.validateBlock(block);
      
      // Prefix errors and warnings with block information
      const prefix = `Block ${index + 1} (${block.type}): `;
      result.errors.push(...blockResult.errors.map(error => prefix + error));
      result.warnings.push(...blockResult.warnings.map(warning => prefix + warning));
    });

    // Validate block relationships and structure
    const structureResult = this.validateBlockStructure(blocks);
    result.errors.push(...structureResult.errors);
    result.warnings.push(...structureResult.warnings);

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Add custom validation rule
   */
  addRule(rule: BlockValidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove validation rule by name
   */
  removeRule(name: string): void {
    this.rules = this.rules.filter(rule => rule.name !== name);
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Required fields validation
    this.addRule({
      name: 'required-fields',
      validate: (block) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!block.id) {
          errors.push('Block ID is required');
        }

        if (!block.type) {
          errors.push('Block type is required');
        }

        if (typeof block.order !== 'number') {
          errors.push('Block order must be a number');
        }

        return { isValid: errors.length === 0, errors, warnings };
      },
    });

    // Hero block validation
    this.addRule({
      name: 'hero-block',
      validate: (block) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (block.type === 'hero') {
          const data = (block as any).data;
          
          if (!data.headline || data.headline.trim() === '') {
            errors.push('Hero headline is required');
          }

          if (data.headline && data.headline.length > 100) {
            warnings.push('Hero headline is quite long (>100 characters)');
          }

          if (data.backgroundImage && !this.isValidUrl(data.backgroundImage)) {
            errors.push('Invalid background image URL');
          }

          if (data.backgroundVideo && !this.isValidUrl(data.backgroundVideo)) {
            errors.push('Invalid background video URL');
          }

          if (data.ctaPrimary && (!data.ctaPrimary.text || !data.ctaPrimary.url)) {
            errors.push('Primary CTA must have both text and URL');
          }
        }

        return { isValid: errors.length === 0, errors, warnings };
      },
    });

    // Features block validation
    this.addRule({
      name: 'features-block',
      validate: (block) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (block.type === 'features') {
          const data = (block as any).data;
          
          if (!data.features || !Array.isArray(data.features)) {
            errors.push('Features array is required');
          } else {
            data.features.forEach((feature: any, index: number) => {
              if (!feature.title || feature.title.trim() === '') {
                errors.push(`Feature ${index + 1} title is required`);
              }

              if (!feature.description || feature.description.trim() === '') {
                errors.push(`Feature ${index + 1} description is required`);
              }

              if (feature.image && !this.isValidUrl(feature.image)) {
                errors.push(`Feature ${index + 1} has invalid image URL`);
              }

              if (feature.link && !this.isValidUrl(feature.link)) {
                errors.push(`Feature ${index + 1} has invalid link URL`);
              }
            });

            if (data.features.length === 0) {
              warnings.push('Features block has no features');
            }

            if (data.features.length > 12) {
              warnings.push('Features block has many features (>12), consider splitting');
            }
          }

          if (data.columns && (data.columns < 1 || data.columns > 6)) {
            errors.push('Features columns must be between 1 and 6');
          }
        }

        return { isValid: errors.length === 0, errors, warnings };
      },
    });

    // Text block validation
    this.addRule({
      name: 'text-block',
      validate: (block) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (block.type === 'text') {
          const data = (block as any).data;
          
          if (!data.content || data.content.trim() === '') {
            warnings.push('Text block is empty');
          }

          if (data.content && data.content.length > 10000) {
            warnings.push('Text content is very long (>10,000 characters)');
          }

          if (data.format === 'html') {
            // Basic HTML validation
            if (!this.isValidHTML(data.content)) {
              errors.push('Invalid HTML in text content');
            }
          }
        }

        return { isValid: errors.length === 0, errors, warnings };
      },
    });

    // Image block validation
    this.addRule({
      name: 'image-block',
      validate: (block) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (block.type === 'image') {
          const data = (block as any).data;
          
          if (!data.src || !this.isValidUrl(data.src)) {
            errors.push('Valid image URL is required');
          }

          if (!data.alt || data.alt.trim() === '') {
            warnings.push('Image alt text is missing (important for accessibility)');
          }

          if (data.link && !this.isValidUrl(data.link)) {
            errors.push('Invalid link URL');
          }
        }

        return { isValid: errors.length === 0, errors, warnings };
      },
    });

    // Video block validation
    this.addRule({
      name: 'video-block',
      validate: (block) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (block.type === 'video') {
          const data = (block as any).data;
          
          if (!data.src || !this.isValidUrl(data.src)) {
            errors.push('Valid video URL is required');
          }

          if (data.poster && !this.isValidUrl(data.poster)) {
            errors.push('Invalid poster image URL');
          }

          if (data.autoplay && !data.muted) {
            warnings.push('Autoplay videos should be muted for better user experience');
          }
        }

        return { isValid: errors.length === 0, errors, warnings };
      },
    });

    // Form block validation
    this.addRule({
      name: 'form-block',
      validate: (block) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (block.type === 'form') {
          const data = (block as any).data;
          
          if (!data.action || !this.isValidUrl(data.action)) {
            errors.push('Valid form action URL is required');
          }

          if (!data.fields || !Array.isArray(data.fields)) {
            errors.push('Form fields array is required');
          } else {
            data.fields.forEach((field: any, index: number) => {
              if (!field.id) {
                errors.push(`Form field ${index + 1} ID is required`);
              }

              if (!field.type) {
                errors.push(`Form field ${index + 1} type is required`);
              }

              if (!field.label || field.label.trim() === '') {
                errors.push(`Form field ${index + 1} label is required`);
              }

              if (field.type === 'select' && (!field.options || field.options.length === 0)) {
                errors.push(`Select field ${index + 1} must have options`);
              }
            });

            if (data.fields.length === 0) {
              warnings.push('Form has no fields');
            }

            if (data.fields.length > 20) {
              warnings.push('Form has many fields (>20), consider splitting into multiple steps');
            }
          }
        }

        return { isValid: errors.length === 0, errors, warnings };
      },
    });

    // CTA block validation
    this.addRule({
      name: 'cta-block',
      validate: (block) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (block.type === 'cta') {
          const data = (block as any).data;
          
          if (!data.headline || data.headline.trim() === '') {
            errors.push('CTA headline is required');
          }

          if (!data.button || !data.button.text || !data.button.url) {
            errors.push('CTA button must have text and URL');
          }

          if (data.button && !this.isValidUrl(data.button.url)) {
            errors.push('Invalid CTA button URL');
          }

          if (data.backgroundImage && !this.isValidUrl(data.backgroundImage)) {
            errors.push('Invalid background image URL');
          }
        }

        return { isValid: errors.length === 0, errors, warnings };
      },
    });

    // Performance validation
    this.addRule({
      name: 'performance',
      validate: (block) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check for potential performance issues
        if (block.type === 'video' && (block as any).data.autoplay) {
          warnings.push('Autoplay videos can impact page load performance');
        }

        if (block.type === 'image') {
          const src = (block as any).data.src;
          if (src && src.includes('unsplash.com') && !src.includes('w_')) {
            warnings.push('Consider optimizing image size for better performance');
          }
        }

        return { isValid: errors.length === 0, errors, warnings };
      },
    });

    // Accessibility validation
    this.addRule({
      name: 'accessibility',
      validate: (block) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (block.type === 'image') {
          const data = (block as any).data;
          if (!data.alt || data.alt.trim() === '') {
            warnings.push('Missing alt text reduces accessibility');
          }
        }

        if (block.type === 'video') {
          const data = (block as any).data;
          if (!data.caption) {
            warnings.push('Consider adding captions for better accessibility');
          }
        }

        if (block.type === 'form') {
          const data = (block as any).data;
          data.fields?.forEach((field: any, index: number) => {
            if (!field.label) {
              warnings.push(`Form field ${index + 1} should have a label for accessibility`);
            }
          });
        }

        return { isValid: errors.length === 0, errors, warnings };
      },
    });
  }

  /**
   * Validate overall block structure
   */
  private validateBlockStructure(blocks: ContentBlockType[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for duplicate IDs
    const ids = blocks.map(block => block.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate block IDs found: ${duplicateIds.join(', ')}`);
    }

    // Check block order consistency
    const orders = blocks.map(block => block.order);
    const sortedOrders = [...orders].sort((a, b) => a - b);
    if (JSON.stringify(orders) !== JSON.stringify(sortedOrders)) {
      warnings.push('Block order values are not sequential');
    }

    // Page structure recommendations
    const heroBlocks = blocks.filter(block => block.type === 'hero');
    if (heroBlocks.length === 0) {
      warnings.push('Consider adding a hero block for better user engagement');
    }
    if (heroBlocks.length > 1) {
      warnings.push('Multiple hero blocks may confuse users');
    }

    const ctaBlocks = blocks.filter(block => block.type === 'cta');
    if (ctaBlocks.length === 0 && blocks.length > 3) {
      warnings.push('Consider adding a call-to-action block');
    }

    // Check for empty page
    if (blocks.length === 0) {
      warnings.push('Page has no content blocks');
    }

    // Check for too many blocks
    if (blocks.length > 20) {
      warnings.push('Page has many blocks (>20), consider splitting into multiple pages');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      // Check for relative URLs
      return url.startsWith('/') || url.startsWith('#');
    }
  }

  /**
   * Basic HTML validation
   */
  private isValidHTML(html: string): boolean {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const errorNode = doc.querySelector('parsererror');
      return !errorNode;
    } catch {
      return false;
    }
  }
}