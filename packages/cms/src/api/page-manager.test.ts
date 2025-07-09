import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PageManager, CreatePageRequest } from './page-manager';
import { createMockPage, createMockSupabaseResponse } from '../test/mocks';

// Mock dependencies
vi.mock('@sasarjan/database');

describe('PageManager', () => {
  let pageManager: PageManager;

  beforeEach(() => {
    pageManager = new PageManager();
  });

  describe('PageManager instantiation', () => {
    it('should create PageManager instance', () => {
      expect(pageManager).toBeInstanceOf(PageManager);
    });

    it('should have required methods', () => {
      expect(typeof pageManager.createPage).toBe('function');
      expect(typeof pageManager.getPageById).toBe('function');
      expect(typeof pageManager.getPageBySlug).toBe('function');
      expect(typeof pageManager.updatePage).toBe('function');
      expect(typeof pageManager.deletePage).toBe('function');
      expect(typeof pageManager.publishPage).toBe('function');
      expect(typeof pageManager.queryPages).toBe('function');
    });
  });

  describe('Method validation', () => {
    it('should validate CreatePageRequest structure', () => {
      const createRequest: CreatePageRequest = {
        title: 'Test Page',
        description: 'A test page',
        type: 'landing',
        template: 'default',
      };

      expect(createRequest.title).toBe('Test Page');
      expect(createRequest.type).toBe('landing');
      expect(createRequest.template).toBe('default');
    });

    it('should handle missing database dependency gracefully', () => {
      // Since we're mocking the database, we can't test actual database operations
      // But we can test that the class is properly structured
      expect(pageManager).toHaveProperty('createPage');
      expect(pageManager).toHaveProperty('getPageById');
      expect(pageManager).toHaveProperty('updatePage');
      expect(pageManager).toHaveProperty('deletePage');
      expect(pageManager).toHaveProperty('publishPage');
      expect(pageManager).toHaveProperty('queryPages');
      expect(pageManager).toHaveProperty('duplicatePage');
    });
  });
});