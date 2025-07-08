// Main CMS exports
export * from './api';
export * from './types';

// Core classes
export { PageManager } from './api/page-manager';
export { BlockEditor } from './editor/block-editor';
export { ContentBlockValidator } from './utils/content-block-validator';
export { SEOOptimizer } from './utils/seo-optimizer';
export { PageRenderer } from './utils/page-renderer';

// Types
export type {
  CMSPageType,
  CMSTemplateType,
  BlogPostType,
  ContentBlockType,
  PageTypeType,
  PageStatusType,
  PageVisibilityType,
  SEOMetadataType,
  CMSConfig,
  CMSApiResponse,
  CMSEvent,
  CMSPlugin,
} from './types';

// Editor types
export type {
  BlockOperation,
  EditorState,
  BlockTemplate,
} from './editor/block-editor';

// Utility types
export type {
  ValidationResult,
  BlockValidationRule,
} from './utils/content-block-validator';

export type {
  SEOAnalysis,
  SEOIssue,
} from './utils/seo-optimizer';

export type {
  RenderOptions,
  RenderedPage,
} from './utils/page-renderer';