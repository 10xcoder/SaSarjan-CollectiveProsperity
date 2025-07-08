import { SEOMetadataType, ContentBlockType } from '../types';

export interface SEOAnalysis {
  score: number; // 0-100
  issues: SEOIssue[];
  recommendations: string[];
  keywords: string[];
  readabilityScore: number;
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  severity: 'high' | 'medium' | 'low';
}

export class SEOOptimizer {
  private stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
    'had', 'what', 'said', 'each', 'which', 'she', 'do', 'how', 'their',
    'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some',
    'her', 'would', 'make', 'like', 'into', 'time', 'has', 'two',
    'more', 'very', 'when', 'come', 'may', 'see', 'him', 'long',
    'get', 'been', 'my', 'now', 'way', 'who', 'oil', 'its', 'sit',
    'did', 'yes', 'his', 'your', 'how', 'man', 'new', 'write', 'go',
    'where', 'think', 'too', 'old', 'any', 'after', 'us', 'our',
    'work', 'life', 'only', 'can', 'still', 'should', 'back',
    'other', 'many', 'than', 'first', 'well', 'way', 'even', 'want',
    'because', 'any', 'these', 'give', 'day', 'most', 'us', 'his',
    'her', 'him', 'my', 'me', 'all', 'would', 'there', 'their'
  ]);

  /**
   * Optimize SEO metadata based on content
   */
  optimizeSEO(
    currentSEO: Partial<SEOMetadataType>,
    blocks: ContentBlockType[]
  ): SEOMetadataType {
    const contentText = this.extractTextFromBlocks(blocks);
    const keywords = this.extractKeywords(contentText);
    const pageTitle = currentSEO.title || this.generateTitle(blocks);
    const pageDescription = currentSEO.description || this.generateDescription(contentText);

    return {
      // Basic meta tags
      title: pageTitle,
      description: pageDescription,
      keywords: currentSEO.keywords || keywords.slice(0, 10),
      canonical: currentSEO.canonical,
      noindex: currentSEO.noindex || false,
      nofollow: currentSEO.nofollow || false,

      // Open Graph
      ogTitle: currentSEO.ogTitle || pageTitle,
      ogDescription: currentSEO.ogDescription || pageDescription,
      ogImage: currentSEO.ogImage || this.extractFeaturedImage(blocks),
      ogType: currentSEO.ogType || 'website',
      ogUrl: currentSEO.ogUrl,

      // Twitter Card
      twitterCard: currentSEO.twitterCard || 'summary_large_image',
      twitterSite: currentSEO.twitterSite,
      twitterCreator: currentSEO.twitterCreator,
      twitterTitle: currentSEO.twitterTitle || pageTitle,
      twitterDescription: currentSEO.twitterDescription || pageDescription,
      twitterImage: currentSEO.twitterImage || this.extractFeaturedImage(blocks),

      // Structured Data
      structuredData: currentSEO.structuredData || this.generateStructuredData(blocks, {
        title: pageTitle,
        description: pageDescription,
      }),

      // Additional Meta Tags
      additionalMeta: currentSEO.additionalMeta || [],
    };
  }

  /**
   * Analyze SEO quality of a page
   */
  analyzeSEO(seo: SEOMetadataType, blocks: ContentBlockType[]): SEOAnalysis {
    const issues: SEOIssue[] = [];
    const recommendations: string[] = [];
    const contentText = this.extractTextFromBlocks(blocks);
    const keywords = this.extractKeywords(contentText);

    let score = 100;

    // Title analysis
    if (!seo.title) {
      issues.push({
        type: 'error',
        message: 'Missing page title',
        field: 'title',
        severity: 'high',
      });
      score -= 20;
    } else {
      if (seo.title.length < 30) {
        issues.push({
          type: 'warning',
          message: 'Title is too short (recommended: 30-60 characters)',
          field: 'title',
          severity: 'medium',
        });
        score -= 10;
      }
      if (seo.title.length > 60) {
        issues.push({
          type: 'warning',
          message: 'Title is too long and may be truncated in search results',
          field: 'title',
          severity: 'medium',
        });
        score -= 10;
      }
    }

    // Description analysis
    if (!seo.description) {
      issues.push({
        type: 'error',
        message: 'Missing meta description',
        field: 'description',
        severity: 'high',
      });
      score -= 15;
    } else {
      if (seo.description.length < 120) {
        issues.push({
          type: 'warning',
          message: 'Description is too short (recommended: 120-160 characters)',
          field: 'description',
          severity: 'medium',
        });
        score -= 5;
      }
      if (seo.description.length > 160) {
        issues.push({
          type: 'warning',
          message: 'Description is too long and may be truncated',
          field: 'description',
          severity: 'medium',
        });
        score -= 5;
      }
    }

    // Keywords analysis
    if (!seo.keywords || seo.keywords.length === 0) {
      issues.push({
        type: 'info',
        message: 'No keywords specified',
        field: 'keywords',
        severity: 'low',
      });
      recommendations.push('Add relevant keywords to improve search visibility');
      score -= 5;
    }

    // Open Graph analysis
    if (!seo.ogTitle) {
      issues.push({
        type: 'warning',
        message: 'Missing Open Graph title',
        field: 'ogTitle',
        severity: 'medium',
      });
      score -= 5;
    }

    if (!seo.ogDescription) {
      issues.push({
        type: 'warning',
        message: 'Missing Open Graph description',
        field: 'ogDescription',
        severity: 'medium',
      });
      score -= 5;
    }

    if (!seo.ogImage) {
      issues.push({
        type: 'warning',
        message: 'Missing Open Graph image',
        field: 'ogImage',
        severity: 'medium',
      });
      score -= 5;
    }

    // Content analysis
    const headings = this.extractHeadings(blocks);
    if (headings.h1.length === 0) {
      issues.push({
        type: 'error',
        message: 'Missing H1 heading',
        severity: 'high',
      });
      score -= 15;
      recommendations.push('Add an H1 heading to clearly define the page topic');
    }

    if (headings.h1.length > 1) {
      issues.push({
        type: 'warning',
        message: 'Multiple H1 headings found',
        severity: 'medium',
      });
      score -= 10;
      recommendations.push('Use only one H1 heading per page');
    }

    if (headings.h2.length === 0 && contentText.length > 1000) {
      issues.push({
        type: 'warning',
        message: 'Long content without H2 headings',
        severity: 'medium',
      });
      score -= 5;
      recommendations.push('Break up long content with H2 headings for better structure');
    }

    // Content length analysis
    if (contentText.length < 300) {
      issues.push({
        type: 'warning',
        message: 'Content is quite short (less than 300 words)',
        severity: 'medium',
      });
      score -= 10;
      recommendations.push('Add more content to provide value to users and search engines');
    }

    // Image analysis
    const images = this.extractImages(blocks);
    const imagesWithoutAlt = images.filter(img => !img.alt || img.alt.trim() === '');
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'warning',
        message: `${imagesWithoutAlt.length} images missing alt text`,
        severity: 'medium',
      });
      score -= imagesWithoutAlt.length * 2;
      recommendations.push('Add descriptive alt text to all images for accessibility and SEO');
    }

    // Internal linking
    const links = this.extractLinks(blocks);
    if (links.internal.length === 0 && links.external.length > 0) {
      issues.push({
        type: 'info',
        message: 'No internal links found',
        severity: 'low',
      });
      recommendations.push('Add internal links to related pages to improve site navigation');
    }

    // Readability score
    const readabilityScore = this.calculateReadabilityScore(contentText);
    if (readabilityScore < 60) {
      issues.push({
        type: 'warning',
        message: 'Content may be difficult to read',
        severity: 'medium',
      });
      score -= 10;
      recommendations.push('Simplify sentences and use shorter paragraphs for better readability');
    }

    // Generate recommendations
    if (issues.length === 0) {
      recommendations.push('Great! Your page follows SEO best practices');
    }

    if (seo.keywords && seo.keywords.length > 0) {
      const titleIncludesKeywords = seo.keywords.some(keyword => 
        seo.title?.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!titleIncludesKeywords) {
        recommendations.push('Consider including target keywords in the page title');
      }
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      recommendations,
      keywords,
      readabilityScore,
    };
  }

  /**
   * Generate title from blocks
   */
  private generateTitle(blocks: ContentBlockType[]): string {
    // Look for hero block headline first
    const heroBlock = blocks.find(block => block.type === 'hero');
    if (heroBlock) {
      const headline = (heroBlock as any).data.headline;
      if (headline) return headline;
    }

    // Look for first H1 heading
    const headings = this.extractHeadings(blocks);
    if (headings.h1.length > 0) {
      return headings.h1[0];
    }

    // Fallback to first text content
    const textContent = this.extractTextFromBlocks(blocks);
    const firstSentence = textContent.split('.')[0];
    return firstSentence.length > 60 ? firstSentence.substring(0, 57) + '...' : firstSentence;
  }

  /**
   * Generate description from content
   */
  private generateDescription(content: string): string {
    // Remove HTML tags and extra whitespace
    const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    
    // Get first paragraph or sentence that's meaningful
    const sentences = cleanContent.split(/[.!?]+/);
    let description = '';
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 50) {
        description = trimmed;
        break;
      }
    }

    // Ensure it's within ideal length
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }

    return description || cleanContent.substring(0, 157) + '...';
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string): string[] {
    // Remove HTML and normalize text
    const cleanContent = content
      .replace(/<[^>]*>/g, ' ')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Split into words and filter
    const words = cleanContent.split(' ')
      .filter(word => word.length > 3)
      .filter(word => !this.stopWords.has(word))
      .filter(word => !/^\d+$/.test(word)); // Remove pure numbers

    // Count word frequency
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // Sort by frequency and return top keywords
    return Array.from(wordCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  /**
   * Extract text content from all blocks
   */
  private extractTextFromBlocks(blocks: ContentBlockType[]): string {
    let text = '';

    blocks.forEach(block => {
      switch (block.type) {
        case 'hero':
          const heroData = (block as any).data;
          text += `${heroData.headline || ''} ${heroData.subheadline || ''} ${heroData.description || ''} `;
          break;

        case 'text':
          const textData = (block as any).data;
          text += `${textData.content || ''} `;
          break;

        case 'features':
          const featuresData = (block as any).data;
          text += `${featuresData.title || ''} ${featuresData.subtitle || ''} `;
          featuresData.features?.forEach((feature: any) => {
            text += `${feature.title || ''} ${feature.description || ''} `;
          });
          break;

        case 'cta':
          const ctaData = (block as any).data;
          text += `${ctaData.headline || ''} ${ctaData.description || ''} `;
          break;

        case 'testimonials':
          const testimonialsData = (block as any).data;
          text += `${testimonialsData.title || ''} ${testimonialsData.subtitle || ''} `;
          testimonialsData.testimonials?.forEach((testimonial: any) => {
            text += `${testimonial.quote || ''} `;
          });
          break;

        case 'faq':
          const faqData = (block as any).data;
          text += `${faqData.title || ''} ${faqData.subtitle || ''} `;
          faqData.faqs?.forEach((faq: any) => {
            text += `${faq.question || ''} ${faq.answer || ''} `;
          });
          break;

        case 'stats':
          const statsData = (block as any).data;
          text += `${statsData.title || ''} ${statsData.subtitle || ''} `;
          statsData.stats?.forEach((stat: any) => {
            text += `${stat.label || ''} ${stat.description || ''} `;
          });
          break;

        case 'team':
          const teamData = (block as any).data;
          text += `${teamData.title || ''} ${teamData.subtitle || ''} `;
          teamData.members?.forEach((member: any) => {
            text += `${member.name || ''} ${member.title || ''} ${member.bio || ''} `;
          });
          break;
      }
    });

    return text;
  }

  /**
   * Extract headings from blocks
   */
  private extractHeadings(blocks: ContentBlockType[]): { h1: string[]; h2: string[]; h3: string[] } {
    const headings = { h1: [] as string[], h2: [] as string[], h3: [] as string[] };

    blocks.forEach(block => {
      if (block.type === 'hero') {
        const headline = (block as any).data.headline;
        if (headline) headings.h1.push(headline);
      }

      if (block.type === 'text') {
        const content = (block as any).data.content;
        if (content) {
          const h1Matches = content.match(/<h1[^>]*>(.*?)<\/h1>/gi);
          const h2Matches = content.match(/<h2[^>]*>(.*?)<\/h2>/gi);
          const h3Matches = content.match(/<h3[^>]*>(.*?)<\/h3>/gi);
          
          h1Matches?.forEach((match: string) => {
            const text = match.replace(/<[^>]*>/g, '').trim();
            if (text) headings.h1.push(text);
          });
          
          h2Matches?.forEach((match: string) => {
            const text = match.replace(/<[^>]*>/g, '').trim();
            if (text) headings.h2.push(text);
          });
          
          h3Matches?.forEach((match: string) => {
            const text = match.replace(/<[^>]*>/g, '').trim();
            if (text) headings.h3.push(text);
          });
        }
      }

      // Other blocks with titles count as H2
      if (['features', 'testimonials', 'faq', 'stats', 'team'].includes(block.type)) {
        const title = (block as any).data.title;
        if (title) headings.h2.push(title);
      }
    });

    return headings;
  }

  /**
   * Extract images from blocks
   */
  private extractImages(blocks: ContentBlockType[]): Array<{ src: string; alt: string }> {
    const images: Array<{ src: string; alt: string }> = [];

    blocks.forEach(block => {
      if (block.type === 'image') {
        const data = (block as any).data;
        images.push({ src: data.src, alt: data.alt || '' });
      }

      if (block.type === 'hero' && (block as any).data.backgroundImage) {
        images.push({ src: (block as any).data.backgroundImage, alt: '' });
      }

      // Extract images from HTML content
      if (block.type === 'text') {
        const content = (block as any).data.content;
        const imgMatches = content.match(/<img[^>]*>/gi);
        imgMatches?.forEach((img: string) => {
          const srcMatch = img.match(/src=["']([^"']*)["']/);
          const altMatch = img.match(/alt=["']([^"']*)["']/);
          if (srcMatch) {
            images.push({
              src: srcMatch[1],
              alt: altMatch ? altMatch[1] : '',
            });
          }
        });
      }
    });

    return images;
  }

  /**
   * Extract links from blocks
   */
  private extractLinks(blocks: ContentBlockType[]): { internal: string[]; external: string[] } {
    const links = { internal: [] as string[], external: [] as string[] };

    blocks.forEach(block => {
      if (block.type === 'text') {
        const content = (block as any).data.content;
        const linkMatches = content.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi);
        linkMatches?.forEach((link: string) => {
          const hrefMatch = link.match(/href=["']([^"']*)["']/);
          if (hrefMatch) {
            const href = hrefMatch[1];
            if (href.startsWith('http') || href.startsWith('//')) {
              links.external.push(href);
            } else if (href.startsWith('/') || href.startsWith('#')) {
              links.internal.push(href);
            }
          }
        });
      }
    });

    return links;
  }

  /**
   * Extract featured image from blocks
   */
  private extractFeaturedImage(blocks: ContentBlockType[]): string | undefined {
    // Look for hero background image first
    const heroBlock = blocks.find(block => block.type === 'hero');
    if (heroBlock && (heroBlock as any).data.backgroundImage) {
      return (heroBlock as any).data.backgroundImage;
    }

    // Look for first image block
    const imageBlock = blocks.find(block => block.type === 'image');
    if (imageBlock) {
      return (imageBlock as any).data.src;
    }

    return undefined;
  }

  /**
   * Calculate readability score (simplified Flesch Reading Ease)
   */
  private calculateReadabilityScore(text: string): number {
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (!cleanText) return 0;

    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Simplified Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in a word (simplified)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }

    // Adjust for silent 'e'
    if (word.endsWith('e')) {
      syllableCount--;
    }

    return Math.max(1, syllableCount);
  }

  /**
   * Generate structured data for the page
   */
  private generateStructuredData(blocks: ContentBlockType[], metadata: { title: string; description: string }): Record<string, any> {
    const structuredData: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: metadata.title,
      description: metadata.description,
    };

    // Add organization info if available
    const teamBlock = blocks.find(block => block.type === 'team');
    if (teamBlock) {
      structuredData.author = {
        '@type': 'Organization',
        name: 'SaSarjan',
      };
    }

    // Add FAQ structured data if FAQ block exists
    const faqBlock = blocks.find(block => block.type === 'faq');
    if (faqBlock) {
      const faqData = (faqBlock as any).data;
      if (faqData.faqs && faqData.faqs.length > 0) {
        structuredData.mainEntity = {
          '@type': 'FAQPage',
          mainEntity: faqData.faqs.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        };
      }
    }

    return structuredData;
  }
}