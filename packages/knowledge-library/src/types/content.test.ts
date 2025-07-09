import { describe, it, expect } from 'vitest';
import { 
  ContentType, 
  ContentStatus, 
  ContentVisibility, 
  ContentLevel, 
  ContentCategory, 
  ContentLanguage,
  ContentMedia,
  ContentAuthor,
  ContentContributor,
  ContentVersion,
  ContentInteraction,
  ContentComment,
  ContentRating,
  ContentCollection,
  LearningPathStep,
  LearningPath,
  ContentProgress,
  KnowledgeContent,
  type ContentTypeType,
  type ContentStatusType,
  type ContentVisibilityType,
  type ContentLevelType,
  type ContentCategoryType,
  type ContentLanguageType,
  type ContentMediaType,
  type ContentAuthorType,
  type ContentContributorType,
  type ContentVersionType,
  type ContentInteractionType,
  type ContentCommentType,
  type ContentRatingType,
  type ContentCollectionType,
  type LearningPathStepType,
  type LearningPathType,
  type ContentProgressType,
  type KnowledgeContentType,
} from './content';

describe('Content Type Schemas', () => {
  describe('ContentType', () => {
    it('should validate valid content types', () => {
      const validTypes: ContentTypeType[] = [
        'article',
        'video',
        'audio',
        'document',
        'course',
        'tutorial',
        'guide',
        'template',
        'tool',
        'research',
        'case_study',
        'discussion',
        'wisdom_story',
        'cultural_practice',
        'language_resource',
        'oral_history',
        'traditional_knowledge',
        'community_story',
        'experience_sharing',
        'q_and_a',
        'book_summary',
        'infographic',
        'presentation',
        'worksheet',
        'checklist',
        'framework',
        'methodology',
      ];

      validTypes.forEach(type => {
        expect(() => ContentType.parse(type)).not.toThrow();
      });
    });

    it('should reject invalid content types', () => {
      const invalidTypes = ['invalid_type', 'article_test', 'video_extra'];

      invalidTypes.forEach(type => {
        expect(() => ContentType.parse(type)).toThrow();
      });
    });
  });

  describe('ContentStatus', () => {
    it('should validate valid content statuses', () => {
      const validStatuses: ContentStatusType[] = [
        'draft',
        'review',
        'published',
        'archived',
        'deprecated',
      ];

      validStatuses.forEach(status => {
        expect(() => ContentStatus.parse(status)).not.toThrow();
      });
    });

    it('should reject invalid content statuses', () => {
      const invalidStatuses = ['pending', 'active', 'inactive'];

      invalidStatuses.forEach(status => {
        expect(() => ContentStatus.parse(status)).toThrow();
      });
    });
  });

  describe('ContentVisibility', () => {
    it('should validate valid visibility options', () => {
      const validVisibilities: ContentVisibilityType[] = [
        'public',
        'community',
        'private',
        'unlisted',
      ];

      validVisibilities.forEach(visibility => {
        expect(() => ContentVisibility.parse(visibility)).not.toThrow();
      });
    });

    it('should reject invalid visibility options', () => {
      const invalidVisibilities = ['protected', 'internal', 'restricted'];

      invalidVisibilities.forEach(visibility => {
        expect(() => ContentVisibility.parse(visibility)).toThrow();
      });
    });
  });

  describe('ContentLevel', () => {
    it('should validate valid content levels', () => {
      const validLevels: ContentLevelType[] = [
        'beginner',
        'intermediate',
        'advanced',
        'expert',
        'all_levels',
      ];

      validLevels.forEach(level => {
        expect(() => ContentLevel.parse(level)).not.toThrow();
      });
    });

    it('should reject invalid content levels', () => {
      const invalidLevels = ['basic', 'professional', 'master'];

      invalidLevels.forEach(level => {
        expect(() => ContentLevel.parse(level)).toThrow();
      });
    });
  });

  describe('ContentCategory', () => {
    it('should validate valid SaSarjan prosperity categories', () => {
      const validCategories: ContentCategoryType[] = [
        'knowledge_commons',
        'economic_empowerment',
        'environmental_stewardship',
        'social_connection',
        'cultural_preservation',
        'health_wellbeing',
        'governance_participation',
        'spiritual_growth',
        'technology_innovation',
        'education_learning',
        'general',
      ];

      validCategories.forEach(category => {
        expect(() => ContentCategory.parse(category)).not.toThrow();
      });
    });

    it('should reject invalid content categories', () => {
      const invalidCategories = ['business', 'entertainment', 'sports'];

      invalidCategories.forEach(category => {
        expect(() => ContentCategory.parse(category)).toThrow();
      });
    });
  });

  describe('ContentLanguage', () => {
    it('should validate valid Indian languages', () => {
      const validLanguages: ContentLanguageType[] = [
        'en',
        'hi',
        'ta',
        'te',
        'ml',
        'kn',
        'bn',
        'gu',
        'mr',
        'pa',
        'or',
        'as',
        'ur',
        'sa',
        'multi',
      ];

      validLanguages.forEach(language => {
        expect(() => ContentLanguage.parse(language)).not.toThrow();
      });
    });

    it('should reject invalid language codes', () => {
      const invalidLanguages = ['fr', 'de', 'es', 'zh'];

      invalidLanguages.forEach(language => {
        expect(() => ContentLanguage.parse(language)).toThrow();
      });
    });
  });

  describe('ContentMedia', () => {
    it('should validate valid media object', () => {
      const validMedia: ContentMediaType = {
        id: 'media-1',
        type: 'image',
        url: 'https://example.com/image.jpg',
        title: 'Test Image',
        description: 'A test image',
        size: 1024,
        mimeType: 'image/jpeg',
        uploadedAt: new Date(),
      };

      expect(() => ContentMedia.parse(validMedia)).not.toThrow();
    });

    it('should require mandatory fields', () => {
      const invalidMedia = {
        type: 'image',
        // Missing id and url
      };

      expect(() => ContentMedia.parse(invalidMedia)).toThrow();
    });

    it('should validate media types', () => {
      const validTypes = ['image', 'video', 'audio', 'document', 'file'];

      validTypes.forEach(type => {
        const media = {
          id: 'media-1',
          type,
          url: 'https://example.com/file.ext',
          uploadedAt: new Date(),
        };

        expect(() => ContentMedia.parse(media)).not.toThrow();
      });
    });
  });

  describe('ContentAuthor', () => {
    it('should validate valid author object', () => {
      const validAuthor: ContentAuthorType = {
        id: 'author-1',
        name: 'Test Author',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'A test author',
        credentials: ['PhD', 'Expert'],
        socialLinks: {
          twitter: 'https://twitter.com/testauthor',
          linkedin: 'https://linkedin.com/in/testauthor',
        },
        location: 'Mumbai, India',
        expertise: ['Knowledge Management', 'Education'],
        verified: true,
      };

      expect(() => ContentAuthor.parse(validAuthor)).not.toThrow();
    });

    it('should require mandatory fields', () => {
      const invalidAuthor = {
        // Missing id and name
        email: 'test@example.com',
      };

      expect(() => ContentAuthor.parse(invalidAuthor)).toThrow();
    });

    it('should validate email format', () => {
      const invalidAuthor = {
        id: 'author-1',
        name: 'Test Author',
        email: 'invalid-email',
      };

      expect(() => ContentAuthor.parse(invalidAuthor)).toThrow();
    });

    it('should validate URL formats', () => {
      const invalidAuthor = {
        id: 'author-1',
        name: 'Test Author',
        avatar: 'not-a-url',
      };

      expect(() => ContentAuthor.parse(invalidAuthor)).toThrow();
    });
  });

  describe('ContentContributor', () => {
    it('should validate valid contributor object', () => {
      const validContributor: ContentContributorType = {
        authorId: 'author-1',
        role: 'primary_author',
        contribution: 'Original author',
        contributedAt: new Date(),
      };

      expect(() => ContentContributor.parse(validContributor)).not.toThrow();
    });

    it('should validate contributor roles', () => {
      const validRoles = ['primary_author', 'co_author', 'editor', 'reviewer', 'translator', 'curator'];

      validRoles.forEach(role => {
        const contributor = {
          authorId: 'author-1',
          role,
          contributedAt: new Date(),
        };

        expect(() => ContentContributor.parse(contributor)).not.toThrow();
      });
    });
  });

  describe('ContentVersion', () => {
    it('should validate valid version object', () => {
      const validVersion: ContentVersionType = {
        version: '1.0.0',
        changelog: 'Initial version',
        publishedAt: new Date(),
        publishedBy: 'author-1',
        previousVersion: '0.9.0',
      };

      expect(() => ContentVersion.parse(validVersion)).not.toThrow();
    });

    it('should require mandatory fields', () => {
      const invalidVersion = {
        // Missing version, publishedAt, publishedBy
        changelog: 'Initial version',
      };

      expect(() => ContentVersion.parse(invalidVersion)).toThrow();
    });
  });

  describe('ContentInteraction', () => {
    it('should validate valid interaction object', () => {
      const validInteraction: ContentInteractionType = {
        userId: 'user-1',
        type: 'like',
        data: { source: 'web' },
        timestamp: new Date(),
      };

      expect(() => ContentInteraction.parse(validInteraction)).not.toThrow();
    });

    it('should validate interaction types', () => {
      const validTypes = ['like', 'bookmark', 'share', 'comment', 'rating', 'download', 'view'];

      validTypes.forEach(type => {
        const interaction = {
          userId: 'user-1',
          type,
          timestamp: new Date(),
        };

        expect(() => ContentInteraction.parse(interaction)).not.toThrow();
      });
    });
  });

  describe('ContentComment', () => {
    it('should validate valid comment object', () => {
      const validComment: ContentCommentType = {
        id: 'comment-1',
        userId: 'user-1',
        content: 'Great article!',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        likes: 5,
        replies: 2,
      };

      expect(() => ContentComment.parse(validComment)).not.toThrow();
    });

    it('should support nested comments', () => {
      const nestedComment: ContentCommentType = {
        id: 'comment-2',
        userId: 'user-2',
        parentId: 'comment-1',
        content: 'I agree!',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        likes: 0,
        replies: 0,
      };

      expect(() => ContentComment.parse(nestedComment)).not.toThrow();
    });
  });

  describe('ContentRating', () => {
    it('should validate valid rating object', () => {
      const validRating: ContentRatingType = {
        userId: 'user-1',
        rating: 5,
        review: 'Excellent content!',
        aspects: {
          accuracy: 5,
          clarity: 4,
          usefulness: 5,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => ContentRating.parse(validRating)).not.toThrow();
    });

    it('should validate rating range', () => {
      const invalidRating = {
        userId: 'user-1',
        rating: 6, // Invalid: above 5
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => ContentRating.parse(invalidRating)).toThrow();
    });

    it('should validate aspect ratings', () => {
      const invalidRating = {
        userId: 'user-1',
        rating: 4,
        aspects: {
          accuracy: 6, // Invalid: above 5
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => ContentRating.parse(invalidRating)).toThrow();
    });
  });

  describe('KnowledgeContent', () => {
    it('should validate complete knowledge content object', () => {
      const validContent: KnowledgeContentType = {
        id: 'content-1',
        title: 'Test Knowledge Content',
        slug: 'test-knowledge-content',
        description: 'A comprehensive test content',
        content: 'This is the main content body with valuable information.',
        excerpt: 'A comprehensive test content',
        type: 'article',
        status: 'published',
        visibility: 'public',
        level: 'intermediate',
        category: 'knowledge_commons',
        language: 'en',
        
        // Authorship
        primaryAuthor: 'author-1',
        contributors: [{
          authorId: 'author-1',
          role: 'primary_author',
          contribution: 'Original author',
          contributedAt: new Date(),
        }],
        
        // Metadata
        tags: ['test', 'knowledge', 'education'],
        keywords: ['test', 'knowledge', 'content'],
        topics: ['testing', 'knowledge-management'],
        
        // Media
        featuredImage: 'https://example.com/featured.jpg',
        media: [],
        
        // Learning
        estimatedReadTime: 5,
        prerequisites: ['basic-knowledge'],
        learningObjectives: ['Understanding concepts'],
        skillsGained: ['testing', 'knowledge-management'],
        
        // Analytics
        viewCount: 100,
        likeCount: 10,
        bookmarkCount: 5,
        shareCount: 3,
        commentCount: 2,
        downloadCount: 1,
        averageRating: 4.5,
        ratingCount: 8,
        
        // Versioning
        version: '1.0',
        versions: [{
          version: '1.0',
          changelog: 'Initial version',
          publishedAt: new Date(),
          publishedBy: 'author-1',
        }],
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        
        // Quality
        isVerified: true,
        qualityScore: 85,
        
        // Features
        isInteractive: false,
        hasAssessment: false,
        allowComments: true,
        allowRatings: true,
        allowDownloads: true,
      };

      expect(() => KnowledgeContent.parse(validContent)).not.toThrow();
    });

    it('should require mandatory fields', () => {
      const invalidContent = {
        // Missing required fields
        title: 'Test Content',
        content: 'Content body',
      };

      expect(() => KnowledgeContent.parse(invalidContent)).toThrow();
    });

    it('should validate with accessibility features', () => {
      const contentWithAccessibility: Partial<KnowledgeContentType> = {
        id: 'content-1',
        title: 'Accessible Content',
        slug: 'accessible-content',
        description: 'Content with accessibility features',
        content: 'This content has accessibility features',
        type: 'article',
        status: 'published',
        visibility: 'public',
        level: 'beginner',
        category: 'knowledge_commons',
        language: 'en',
        primaryAuthor: 'author-1',
        contributors: [],
        tags: [],
        keywords: [],
        topics: [],
        media: [],
        versions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        likeCount: 0,
        bookmarkCount: 0,
        shareCount: 0,
        commentCount: 0,
        downloadCount: 0,
        averageRating: 0,
        ratingCount: 0,
        version: '1.0',
        isVerified: false,
        isInteractive: false,
        hasAssessment: false,
        allowComments: true,
        allowRatings: true,
        allowDownloads: true,
        accessibilityFeatures: ['alt_text', 'captions', 'transcripts'],
      };

      expect(() => KnowledgeContent.parse(contentWithAccessibility)).not.toThrow();
    });

    it('should validate with translations', () => {
      const contentWithTranslations: Partial<KnowledgeContentType> = {
        id: 'content-1',
        title: 'Multilingual Content',
        slug: 'multilingual-content',
        description: 'Content with multiple languages',
        content: 'This content has translations',
        type: 'article',
        status: 'published',
        visibility: 'public',
        level: 'beginner',
        category: 'knowledge_commons',
        language: 'en',
        primaryAuthor: 'author-1',
        contributors: [],
        tags: [],
        keywords: [],
        topics: [],
        media: [],
        versions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        likeCount: 0,
        bookmarkCount: 0,
        shareCount: 0,
        commentCount: 0,
        downloadCount: 0,
        averageRating: 0,
        ratingCount: 0,
        version: '1.0',
        isVerified: false,
        isInteractive: false,
        hasAssessment: false,
        allowComments: true,
        allowRatings: true,
        allowDownloads: true,
        translations: [{
          language: 'hi',
          title: 'बहुभाषी सामग्री',
          description: 'कई भाषाओं के साथ सामग्री',
          content: 'इस सामग्री में अनुवाद हैं',
          translatedBy: 'translator-1',
          translatedAt: new Date(),
        }],
      };

      expect(() => KnowledgeContent.parse(contentWithTranslations)).not.toThrow();
    });
  });

  describe('LearningPath', () => {
    it('should validate valid learning path object', () => {
      const validLearningPath: LearningPathType = {
        id: 'path-1',
        title: 'Test Learning Path',
        description: 'A comprehensive learning path',
        slug: 'test-learning-path',
        createdBy: 'author-1',
        level: 'intermediate',
        category: 'education_learning',
        steps: [{
          id: 'step-1',
          contentId: 'content-1',
          order: 1,
          isRequired: true,
          estimatedTime: 30,
        }],
        tags: ['learning', 'education'],
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => LearningPath.parse(validLearningPath)).not.toThrow();
    });

    it('should validate learning path steps', () => {
      const validStep: LearningPathStepType = {
        id: 'step-1',
        contentId: 'content-1',
        order: 1,
        isRequired: true,
        estimatedTime: 30,
        prerequisites: ['basic-knowledge'],
        completionCriteria: 'Complete the quiz',
      };

      expect(() => LearningPathStep.parse(validStep)).not.toThrow();
    });
  });

  describe('ContentProgress', () => {
    it('should validate valid progress object', () => {
      const validProgress: ContentProgressType = {
        userId: 'user-1',
        contentId: 'content-1',
        progress: 75,
        timeSpent: 120,
        lastAccessed: new Date(),
        isCompleted: false,
        notes: 'Making good progress',
        bookmarks: ['section-1', 'section-3'],
      };

      expect(() => ContentProgress.parse(validProgress)).not.toThrow();
    });

    it('should validate progress range', () => {
      const invalidProgress = {
        userId: 'user-1',
        contentId: 'content-1',
        progress: 150, // Invalid: above 100
        timeSpent: 120,
        lastAccessed: new Date(),
        isCompleted: false,
      };

      expect(() => ContentProgress.parse(invalidProgress)).toThrow();
    });
  });
});