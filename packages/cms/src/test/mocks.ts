import { vi } from 'vitest';
import { CMSPageType, ContentBlockType, SEOMetadataType } from '../types';

// Mock data factories
export const createMockPage = (overrides?: Partial<CMSPageType>): CMSPageType => ({
  id: 'page-123',
  title: 'Test Page',
  slug: 'test-page',
  description: 'A test page',
  type: 'landing',
  template: 'default',
  status: 'draft',
  visibility: 'public',
  
  blocks: [],
  seo: {
    title: 'Test Page',
    description: 'A test page',
    keywords: ['test'],
    ogTitle: 'Test Page',
    ogDescription: 'A test page',
    ogImage: undefined,
    ogType: 'website',
    twitterCard: 'summary',
    twitterTitle: 'Test Page',
    twitterDescription: 'A test page',
    twitterImage: undefined,
    canonical: undefined,
    noindex: false,
    nofollow: false,
    structuredData: undefined,
  },
  
  createdBy: 'user-123',
  lastEditedBy: 'user-123',
  
  appId: 'app-123',
  organizationId: 'org-123',
  parentPageId: undefined,
  childPages: [],
  
  tags: [],
  categories: [],
  
  publishedAt: undefined,
  scheduledAt: undefined,
  expiresAt: undefined,
  
  version: '1.0',
  versions: [],
  
  settings: {
    showInNavigation: false,
    allowComments: false,
    allowSharing: true,
    membershipRequired: false,
    trackingEnabled: true,
  },
  
  language: 'en',
  translations: [],
  
  cacheSettings: {
    enabled: true,
    ttl: 3600,
    varyByUser: false,
    varyByDevice: false,
  },
  
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  
  customFields: undefined,
  metadata: undefined,
  
  ...overrides,
});

export const createMockContentBlock = (overrides?: Partial<ContentBlockType>): ContentBlockType => {
  const base = {
    id: 'block-123',
    type: 'text' as const,
    order: 0,
    settings: {},
    styles: {},
    data: {
      content: 'Sample text content',
      format: 'html' as const,
      alignment: 'left' as const,
    },
    ...overrides,
  };
  
  // If type is changed, update data structure accordingly
  if (overrides?.type) {
    switch (overrides.type) {
      case 'hero':
        return {
          ...base,
          type: 'hero',
          data: {
            headline: 'Sample headline',
            subheadline: 'Sample subheadline',
            description: 'Sample description',
            alignment: 'center' as const,
            ...overrides.data,
          },
        } as ContentBlockType;
      case 'features':
        return {
          ...base,
          type: 'features',
          data: {
            title: 'Sample features',
            layout: 'grid' as const,
            columns: 3,
            features: [],
            ...overrides.data,
          },
        } as ContentBlockType;
      case 'image':
        return {
          ...base,
          type: 'image',
          data: {
            src: 'https://example.com/image.jpg',
            alt: 'Sample image',
            alignment: 'center' as const,
            lazy: true,
            ...overrides.data,
          },
        } as ContentBlockType;
      case 'video':
        return {
          ...base,
          type: 'video',
          data: {
            src: 'https://example.com/video.mp4',
            autoplay: false,
            loop: false,
            muted: false,
            controls: true,
            aspectRatio: '16:9' as const,
            ...overrides.data,
          },
        } as ContentBlockType;
      case 'cta':
        return {
          ...base,
          type: 'cta',
          data: {
            headline: 'Sample CTA',
            description: 'Sample description',
            button: {
              text: 'Click me',
              url: 'https://example.com',
              style: 'primary' as const,
              size: 'medium' as const,
            },
            alignment: 'center' as const,
            ...overrides.data,
          },
        } as ContentBlockType;
      case 'form':
        return {
          ...base,
          type: 'form',
          data: {
            title: 'Sample form',
            formId: 'form-123',
            action: 'https://example.com/submit',
            method: 'POST' as const,
            fields: [],
            ...overrides.data,
          },
        } as ContentBlockType;
      default:
        break;
    }
  }
  
  return base as ContentBlockType;
};

export const createMockSEOMetadata = (overrides?: Partial<SEOMetadataType>): SEOMetadataType => ({
  title: 'Test Page',
  description: 'A test page',
  keywords: ['test'],
  ogTitle: 'Test Page',
  ogDescription: 'A test page',
  ogImage: undefined,
  ogType: 'website',
  twitterCard: 'summary',
  twitterTitle: 'Test Page',
  twitterDescription: 'A test page',
  twitterImage: undefined,
  canonical: undefined,
  noindex: false,
  nofollow: false,
  structuredData: undefined,
  ...overrides,
});

// Mock Supabase responses
export const createMockSupabaseResponse = (data: any, error?: any) => ({
  data,
  error,
  count: data ? (Array.isArray(data) ? data.length : 1) : 0,
});

// Mock Supabase client
export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
});