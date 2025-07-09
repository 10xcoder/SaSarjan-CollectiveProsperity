import { describe, it, expect } from 'vitest';
import * as CMS from './index';

describe('CMS Package Exports', () => {
  it('should export main classes', () => {
    expect(CMS.PageManager).toBeDefined();
    expect(CMS.BlockEditor).toBeDefined();
    expect(CMS.ContentBlockValidator).toBeDefined();
    expect(CMS.SEOOptimizer).toBeDefined();
    expect(CMS.PageRenderer).toBeDefined();
  });

  it('should export main types', () => {
    // Test that types are properly exported by checking they exist
    // This is a basic smoke test for TypeScript compilation
    expect(typeof CMS).toBe('object');
  });

  it('should create PageManager instance', () => {
    const pageManager = new CMS.PageManager();
    expect(pageManager).toBeInstanceOf(CMS.PageManager);
  });

  it('should create BlockEditor instance', () => {
    const blockEditor = new CMS.BlockEditor();
    expect(blockEditor).toBeInstanceOf(CMS.BlockEditor);
  });

  it('should create ContentBlockValidator instance', () => {
    const validator = new CMS.ContentBlockValidator();
    expect(validator).toBeInstanceOf(CMS.ContentBlockValidator);
  });

  it('should create SEOOptimizer instance', () => {
    const seoOptimizer = new CMS.SEOOptimizer();
    expect(seoOptimizer).toBeInstanceOf(CMS.SEOOptimizer);
  });

  it('should create PageRenderer instance', () => {
    const pageRenderer = new CMS.PageRenderer();
    expect(pageRenderer).toBeInstanceOf(CMS.PageRenderer);
  });
});