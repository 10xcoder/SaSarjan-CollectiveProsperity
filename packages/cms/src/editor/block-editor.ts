import { nanoid } from 'nanoid';
import {
  ContentBlockType,
  ContentBlockBaseType,
  HeroBlock,
  FeaturesBlock,
  TextBlock,
  ImageBlock,
  VideoBlock,
  CTABlock,
  TestimonialsBlock,
  FAQBlock,
  FormBlock,
  StatsBlock,
  TeamBlock,
  AppsShowcaseBlock,
  ProsperityCategoriesBlock,
} from '../types';

export interface BlockOperation {
  type: 'add' | 'update' | 'delete' | 'move' | 'duplicate';
  blockId?: string;
  block?: ContentBlockType;
  position?: number;
  targetPosition?: number;
  data?: Record<string, any>;
}

export interface EditorState {
  blocks: ContentBlockType[];
  selectedBlockId: string | null;
  isDirty: boolean;
  history: ContentBlockType[][];
  historyIndex: number;
  draggedBlockId: string | null;
  clipboardBlock: ContentBlockType | null;
}

export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  preview: string;
  block: Partial<ContentBlockType>;
}

export class BlockEditor {
  private state: EditorState;
  private listeners: Array<(state: EditorState) => void> = [];
  private maxHistorySize = 50;

  constructor(initialBlocks: ContentBlockType[] = []) {
    this.state = {
      blocks: initialBlocks,
      selectedBlockId: null,
      isDirty: false,
      history: [initialBlocks],
      historyIndex: 0,
      draggedBlockId: null,
      clipboardBlock: null,
    };
  }

  /**
   * Get current editor state
   */
  getState(): EditorState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: EditorState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Update state and add to history
   */
  private updateState(newBlocks: ContentBlockType[]): void {
    // Add to history if blocks changed
    if (JSON.stringify(newBlocks) !== JSON.stringify(this.state.blocks)) {
      const newHistory = this.state.history.slice(0, this.state.historyIndex + 1);
      newHistory.push(newBlocks);
      
      // Limit history size
      if (newHistory.length > this.maxHistorySize) {
        newHistory.shift();
      } else {
        this.state.historyIndex++;
      }
      
      this.state.history = newHistory;
      this.state.isDirty = true;
    }

    this.state.blocks = newBlocks;
    this.notifyListeners();
  }

  /**
   * Execute block operation
   */
  executeOperation(operation: BlockOperation): boolean {
    try {
      let newBlocks = [...this.state.blocks];

      switch (operation.type) {
        case 'add':
          if (operation.block) {
            const position = operation.position ?? newBlocks.length;
            newBlocks.splice(position, 0, operation.block);
          }
          break;

        case 'update':
          if (operation.blockId && operation.data) {
            const index = newBlocks.findIndex(b => b.id === operation.blockId);
            if (index >= 0) {
              newBlocks[index] = {
                ...newBlocks[index],
                ...operation.data,
              };
            }
          }
          break;

        case 'delete':
          if (operation.blockId) {
            newBlocks = newBlocks.filter(b => b.id !== operation.blockId);
            if (this.state.selectedBlockId === operation.blockId) {
              this.state.selectedBlockId = null;
            }
          }
          break;

        case 'move':
          if (operation.blockId && operation.targetPosition !== undefined) {
            const index = newBlocks.findIndex(b => b.id === operation.blockId);
            if (index >= 0) {
              const [block] = newBlocks.splice(index, 1);
              newBlocks.splice(operation.targetPosition, 0, block);
            }
          }
          break;

        case 'duplicate':
          if (operation.blockId) {
            const index = newBlocks.findIndex(b => b.id === operation.blockId);
            if (index >= 0) {
              const originalBlock = newBlocks[index];
              const duplicatedBlock = {
                ...originalBlock,
                id: nanoid(),
              };
              newBlocks.splice(index + 1, 0, duplicatedBlock);
            }
          }
          break;

        default:
          return false;
      }

      this.updateState(newBlocks);
      return true;
    } catch (error) {
      console.error('Failed to execute block operation:', error);
      return false;
    }
  }

  /**
   * Add block at position
   */
  addBlock(blockType: string, position?: number, data?: Record<string, any>): string {
    const block = this.createBlock(blockType, data);
    this.executeOperation({
      type: 'add',
      block,
      position,
    });
    return block.id;
  }

  /**
   * Update block data
   */
  updateBlock(blockId: string, data: Record<string, any>): boolean {
    return this.executeOperation({
      type: 'update',
      blockId,
      data,
    });
  }

  /**
   * Delete block
   */
  deleteBlock(blockId: string): boolean {
    return this.executeOperation({
      type: 'delete',
      blockId,
    });
  }

  /**
   * Move block to new position
   */
  moveBlock(blockId: string, targetPosition: number): boolean {
    return this.executeOperation({
      type: 'move',
      blockId,
      targetPosition,
    });
  }

  /**
   * Duplicate block
   */
  duplicateBlock(blockId: string): boolean {
    return this.executeOperation({
      type: 'duplicate',
      blockId,
    });
  }

  /**
   * Select block
   */
  selectBlock(blockId: string | null): void {
    this.state.selectedBlockId = blockId;
    this.notifyListeners();
  }

  /**
   * Copy block to clipboard
   */
  copyBlock(blockId: string): boolean {
    const block = this.state.blocks.find(b => b.id === blockId);
    if (block) {
      this.state.clipboardBlock = { ...block };
      return true;
    }
    return false;
  }

  /**
   * Paste block from clipboard
   */
  pasteBlock(position?: number): string | null {
    if (this.state.clipboardBlock) {
      const newBlock = {
        ...this.state.clipboardBlock,
        id: nanoid(),
      };
      this.executeOperation({
        type: 'add',
        block: newBlock,
        position,
      });
      return newBlock.id;
    }
    return null;
  }

  /**
   * Undo last operation
   */
  undo(): boolean {
    if (this.state.historyIndex > 0) {
      this.state.historyIndex--;
      this.state.blocks = [...this.state.history[this.state.historyIndex]];
      this.state.isDirty = true;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Redo last undone operation
   */
  redo(): boolean {
    if (this.state.historyIndex < this.state.history.length - 1) {
      this.state.historyIndex++;
      this.state.blocks = [...this.state.history[this.state.historyIndex]];
      this.state.isDirty = true;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Clear all blocks
   */
  clear(): void {
    this.updateState([]);
    this.state.selectedBlockId = null;
  }

  /**
   * Import blocks from JSON
   */
  importBlocks(blocks: ContentBlockType[]): boolean {
    try {
      // Validate blocks
      const validatedBlocks = blocks.map(block => this.validateBlock(block));
      this.updateState(validatedBlocks);
      return true;
    } catch (error) {
      console.error('Failed to import blocks:', error);
      return false;
    }
  }

  /**
   * Export blocks to JSON
   */
  exportBlocks(): ContentBlockType[] {
    return JSON.parse(JSON.stringify(this.state.blocks));
  }

  /**
   * Mark as saved (clear dirty flag)
   */
  markAsSaved(): void {
    this.state.isDirty = false;
    this.notifyListeners();
  }

  /**
   * Start drag operation
   */
  startDrag(blockId: string): void {
    this.state.draggedBlockId = blockId;
    this.notifyListeners();
  }

  /**
   * End drag operation
   */
  endDrag(): void {
    this.state.draggedBlockId = null;
    this.notifyListeners();
  }

  /**
   * Create new block of specified type
   */
  private createBlock(blockType: string, data?: Record<string, any>): ContentBlockType {
    const baseBlock: ContentBlockBaseType = {
      id: nanoid(),
      type: blockType,
      order: this.state.blocks.length,
      settings: {},
      styles: {},
      ...data,
    };

    switch (blockType) {
      case 'hero':
        return {
          ...baseBlock,
          type: 'hero',
          data: {
            headline: 'Welcome to Our Platform',
            subheadline: 'Building the future together',
            description: 'Join thousands of users who are already part of our community.',
            alignment: 'center',
            overlay: { enabled: false, color: 'rgba(0,0,0,0.5)' },
            ...data?.data,
          },
        } as HeroBlock;

      case 'features':
        return {
          ...baseBlock,
          type: 'features',
          data: {
            title: 'Our Features',
            layout: 'grid',
            columns: 3,
            features: [],
            ...data?.data,
          },
        } as FeaturesBlock;

      case 'text':
        return {
          ...baseBlock,
          type: 'text',
          data: {
            content: '<p>Add your content here...</p>',
            format: 'html',
            alignment: 'left',
            ...data?.data,
          },
        } as TextBlock;

      case 'image':
        return {
          ...baseBlock,
          type: 'image',
          data: {
            src: 'https://via.placeholder.com/800x400',
            alt: 'Placeholder image',
            alignment: 'center',
            lazy: true,
            ...data?.data,
          },
        } as ImageBlock;

      case 'video':
        return {
          ...baseBlock,
          type: 'video',
          data: {
            src: '',
            aspectRatio: '16:9',
            autoplay: false,
            loop: false,
            muted: false,
            controls: true,
            ...data?.data,
          },
        } as VideoBlock;

      case 'cta':
        return {
          ...baseBlock,
          type: 'cta',
          data: {
            headline: 'Ready to Get Started?',
            description: 'Join our community today and start your journey.',
            button: {
              text: 'Get Started',
              url: '#',
              style: 'primary',
              size: 'medium',
            },
            alignment: 'center',
            ...data?.data,
          },
        } as CTABlock;

      case 'testimonials':
        return {
          ...baseBlock,
          type: 'testimonials',
          data: {
            title: 'What Our Users Say',
            layout: 'carousel',
            testimonials: [],
            ...data?.data,
          },
        } as TestimonialsBlock;

      case 'faq':
        return {
          ...baseBlock,
          type: 'faq',
          data: {
            title: 'Frequently Asked Questions',
            layout: 'accordion',
            searchable: false,
            faqs: [],
            ...data?.data,
          },
        } as FAQBlock;

      case 'form':
        return {
          ...baseBlock,
          type: 'form',
          data: {
            title: 'Contact Us',
            formId: nanoid(),
            action: '/api/contact',
            method: 'POST',
            successMessage: 'Thank you for your message!',
            errorMessage: 'Something went wrong. Please try again.',
            fields: [
              {
                id: nanoid(),
                type: 'text',
                label: 'Name',
                required: true,
                order: 1,
              },
              {
                id: nanoid(),
                type: 'email',
                label: 'Email',
                required: true,
                order: 2,
              },
              {
                id: nanoid(),
                type: 'textarea',
                label: 'Message',
                required: true,
                order: 3,
              },
            ],
            ...data?.data,
          },
        } as FormBlock;

      case 'stats':
        return {
          ...baseBlock,
          type: 'stats',
          data: {
            title: 'Our Impact',
            layout: 'grid',
            animated: true,
            stats: [],
            ...data?.data,
          },
        } as StatsBlock;

      case 'team':
        return {
          ...baseBlock,
          type: 'team',
          data: {
            title: 'Meet Our Team',
            layout: 'grid',
            columns: 3,
            members: [],
            ...data?.data,
          },
        } as TeamBlock;

      case 'apps_showcase':
        return {
          ...baseBlock,
          type: 'apps_showcase',
          data: {
            title: 'Discover Our Apps',
            layout: 'grid',
            showCategories: true,
            showMetrics: true,
            ...data?.data,
          },
        } as AppsShowcaseBlock;

      case 'prosperity_categories':
        return {
          ...baseBlock,
          type: 'prosperity_categories',
          data: {
            title: 'Prosperity Categories',
            layout: 'grid',
            columns: 4,
            showDescriptions: true,
            showIcons: true,
            showCounts: false,
            ...data?.data,
          },
        } as ProsperityCategoriesBlock;

      default:
        throw new Error(`Unknown block type: ${blockType}`);
    }
  }

  /**
   * Validate block structure
   */
  private validateBlock(block: any): ContentBlockType {
    if (!block.id) {
      block.id = nanoid();
    }
    if (typeof block.order !== 'number') {
      block.order = 0;
    }
    if (!block.settings) {
      block.settings = {};
    }
    if (!block.styles) {
      block.styles = {};
    }
    return block as ContentBlockType;
  }

  /**
   * Get available block templates
   */
  static getBlockTemplates(): BlockTemplate[] {
    return [
      {
        id: 'hero-simple',
        name: 'Simple Hero',
        description: 'Clean hero section with headline and CTA',
        category: 'Headers',
        icon: '🎯',
        preview: '/templates/hero-simple.png',
        block: {
          type: 'hero',
          data: {
            headline: 'Welcome to Our Platform',
            description: 'Discover amazing features and join our community.',
            ctaPrimary: {
              text: 'Get Started',
              url: '#',
              style: 'primary',
            },
            alignment: 'center',
          },
        },
      },
      {
        id: 'features-grid',
        name: 'Features Grid',
        description: '3-column feature showcase',
        category: 'Features',
        icon: '📋',
        preview: '/templates/features-grid.png',
        block: {
          type: 'features',
          data: {
            title: 'Why Choose Us',
            layout: 'grid',
            columns: 3,
            features: [
              {
                id: nanoid(),
                title: 'Fast & Reliable',
                description: 'Built for speed and reliability.',
                icon: '⚡',
                order: 1,
              },
              {
                id: nanoid(),
                title: 'Secure',
                description: 'Your data is safe with us.',
                icon: '🔒',
                order: 2,
              },
              {
                id: nanoid(),
                title: 'Easy to Use',
                description: 'Intuitive design for everyone.',
                icon: '✨',
                order: 3,
              },
            ],
          },
        },
      },
      {
        id: 'cta-centered',
        name: 'Centered CTA',
        description: 'Call-to-action with centered layout',
        category: 'CTAs',
        icon: '📢',
        preview: '/templates/cta-centered.png',
        block: {
          type: 'cta',
          data: {
            headline: 'Ready to Start?',
            description: 'Join thousands of satisfied users today.',
            button: {
              text: 'Sign Up Now',
              url: '#',
              style: 'primary',
              size: 'large',
            },
            alignment: 'center',
          },
        },
      },
      {
        id: 'faq-accordion',
        name: 'FAQ Accordion',
        description: 'Collapsible FAQ section',
        category: 'Content',
        icon: '❓',
        preview: '/templates/faq-accordion.png',
        block: {
          type: 'faq',
          data: {
            title: 'Frequently Asked Questions',
            layout: 'accordion',
            faqs: [
              {
                id: nanoid(),
                question: 'How do I get started?',
                answer: 'Simply sign up for an account and follow our onboarding guide.',
                order: 1,
              },
              {
                id: nanoid(),
                question: 'Is there a free trial?',
                answer: 'Yes, we offer a 14-day free trial with full access to all features.',
                order: 2,
              },
            ],
          },
        },
      },
    ];
  }
}