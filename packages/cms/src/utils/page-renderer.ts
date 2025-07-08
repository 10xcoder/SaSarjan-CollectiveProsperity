import { CMSPageType, ContentBlockType } from '../types';

export interface RenderOptions {
  mode: 'production' | 'preview' | 'development';
  baseUrl?: string;
  assetUrl?: string;
  includeStyles?: boolean;
  includeScripts?: boolean;
  minify?: boolean;
}

export interface RenderedPage {
  html: string;
  css: string;
  js: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    openGraph: Record<string, string>;
    structuredData: Record<string, any>;
  };
}

export class PageRenderer {
  private baseUrl: string;
  private assetUrl: string;

  constructor(baseUrl = '', assetUrl = '') {
    this.baseUrl = baseUrl;
    this.assetUrl = assetUrl;
  }

  /**
   * Render page to HTML string
   */
  async renderToHTML(page: CMSPageType, options: RenderOptions = { mode: 'production' }): Promise<string> {
    const rendered = await this.renderPage(page, options);
    return this.buildHTMLDocument(rendered, options);
  }

  /**
   * Render page to structured format
   */
  async renderPage(page: CMSPageType, options: RenderOptions = { mode: 'production' }): Promise<RenderedPage> {
    const blocksHTML = await this.renderBlocks(page.blocks, options);
    const pageCSS = this.generatePageCSS(page, options);
    const pageJS = this.generatePageJS(page, options);

    return {
      html: blocksHTML,
      css: pageCSS,
      js: pageJS,
      metadata: {
        title: page.seo?.title || page.title,
        description: page.seo?.description || page.description || '',
        keywords: page.seo?.keywords || [],
        openGraph: this.buildOpenGraphData(page),
        structuredData: page.seo?.structuredData || {},
      },
    };
  }

  /**
   * Render all blocks to HTML
   */
  private async renderBlocks(blocks: ContentBlockType[], options: RenderOptions): Promise<string> {
    const renderedBlocks = await Promise.all(
      blocks
        .sort((a, b) => a.order - b.order)
        .map(block => this.renderBlock(block, options))
    );

    return renderedBlocks.join('\n');
  }

  /**
   * Render individual block to HTML
   */
  private async renderBlock(block: ContentBlockType, options: RenderOptions): Promise<string> {
    const blockId = `block-${block.id}`;
    const blockClasses = this.generateBlockClasses(block);
    const blockStyles = this.generateBlockStyles(block);

    let content = '';

    switch (block.type) {
      case 'hero':
        content = this.renderHeroBlock(block as any);
        break;
      case 'features':
        content = this.renderFeaturesBlock(block as any);
        break;
      case 'text':
        content = this.renderTextBlock(block as any);
        break;
      case 'image':
        content = this.renderImageBlock(block as any);
        break;
      case 'video':
        content = this.renderVideoBlock(block as any);
        break;
      case 'cta':
        content = this.renderCTABlock(block as any);
        break;
      case 'testimonials':
        content = this.renderTestimonialsBlock(block as any);
        break;
      case 'faq':
        content = this.renderFAQBlock(block as any);
        break;
      case 'form':
        content = this.renderFormBlock(block as any);
        break;
      case 'stats':
        content = this.renderStatsBlock(block as any);
        break;
      case 'team':
        content = this.renderTeamBlock(block as any);
        break;
      case 'apps_showcase':
        content = this.renderAppsShowcaseBlock(block as any);
        break;
      case 'prosperity_categories':
        content = this.renderProsperityCategoriesBlock(block as any);
        break;
      default:
        content = `<!-- Unknown block type: ${block.type} -->`;
    }

    return `
      <div id="${blockId}" class="${blockClasses}" style="${blockStyles}">
        ${content}
      </div>
    `;
  }

  /**
   * Render Hero block
   */
  private renderHeroBlock(block: any): string {
    const data = block.data;
    const alignment = data.alignment || 'center';
    const hasBackground = data.backgroundImage || data.backgroundVideo;

    let backgroundStyle = '';
    if (data.backgroundImage) {
      backgroundStyle = `background-image: url('${data.backgroundImage}'); background-size: cover; background-position: center;`;
    }

    let overlay = '';
    if (hasBackground && data.overlay?.enabled) {
      overlay = `<div class="hero-overlay" style="background-color: ${data.overlay.color || 'rgba(0,0,0,0.5)'}; position: absolute; inset: 0;"></div>`;
    }

    let video = '';
    if (data.backgroundVideo) {
      video = `
        <video autoplay muted loop style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;">
          <source src="${data.backgroundVideo}" type="video/mp4">
        </video>
      `;
    }

    let buttons = '';
    if (data.ctaPrimary) {
      buttons += `<a href="${data.ctaPrimary.url}" class="btn btn-${data.ctaPrimary.style || 'primary'}" style="margin-right: 1rem;">${data.ctaPrimary.text}</a>`;
    }
    if (data.ctaSecondary) {
      buttons += `<a href="${data.ctaSecondary.url}" class="btn btn-${data.ctaSecondary.style || 'secondary'}">${data.ctaSecondary.text}</a>`;
    }

    return `
      <section class="hero hero-${alignment}" style="position: relative; min-height: 60vh; display: flex; align-items: center; ${backgroundStyle}">
        ${video}
        ${overlay}
        <div class="hero-content" style="position: relative; z-index: 1; text-align: ${alignment}; padding: 2rem; max-width: 800px; margin: 0 auto;">
          <h1 class="hero-headline" style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem; color: ${hasBackground ? 'white' : 'inherit'};">
            ${data.headline}
          </h1>
          ${data.subheadline ? `<h2 class="hero-subheadline" style="font-size: 1.5rem; margin-bottom: 1rem; color: ${hasBackground ? 'rgba(255,255,255,0.9)' : 'inherit'};">${data.subheadline}</h2>` : ''}
          ${data.description ? `<p class="hero-description" style="font-size: 1.125rem; margin-bottom: 2rem; color: ${hasBackground ? 'rgba(255,255,255,0.8)' : 'inherit'};">${data.description}</p>` : ''}
          ${buttons ? `<div class="hero-actions">${buttons}</div>` : ''}
        </div>
      </section>
    `;
  }

  /**
   * Render Features block
   */
  private renderFeaturesBlock(block: any): string {
    const data = block.data;
    const columns = data.columns || 3;
    const layout = data.layout || 'grid';

    const featuresHTML = data.features?.map((feature: any) => `
      <div class="feature-item" style="text-align: center; padding: 1.5rem;">
        ${feature.icon ? `<div class="feature-icon" style="font-size: 2.5rem; margin-bottom: 1rem;">${feature.icon}</div>` : ''}
        ${feature.image ? `<img src="${feature.image}" alt="${feature.title}" style="width: 64px; height: 64px; margin-bottom: 1rem; border-radius: 8px;">` : ''}
        <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem;">
          ${feature.link ? `<a href="${feature.link}" style="text-decoration: none; color: inherit;">${feature.title}</a>` : feature.title}
        </h3>
        <p style="color: #6b7280; line-height: 1.6;">${feature.description}</p>
      </div>
    `).join('') || '';

    return `
      <section class="features" style="padding: 4rem 2rem;">
        <div style="max-width: 1200px; margin: 0 auto;">
          ${data.title ? `<h2 style="text-align: center; font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">${data.title}</h2>` : ''}
          ${data.subtitle ? `<p style="text-align: center; font-size: 1.125rem; color: #6b7280; margin-bottom: 3rem;">${data.subtitle}</p>` : ''}
          <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
            ${featuresHTML}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render Text block
   */
  private renderTextBlock(block: any): string {
    const data = block.data;
    const alignment = data.alignment || 'left';
    const maxWidth = data.maxWidth || '800px';

    return `
      <div class="text-content" style="padding: 2rem; text-align: ${alignment}; max-width: ${maxWidth}; margin: 0 auto;">
        <div style="line-height: 1.6; color: #374151;">
          ${data.content}
        </div>
      </div>
    `;
  }

  /**
   * Render Image block
   */
  private renderImageBlock(block: any): string {
    const data = block.data;
    const alignment = data.alignment || 'center';

    let containerStyle = 'padding: 2rem;';
    if (alignment === 'center') containerStyle += ' text-align: center;';
    if (alignment === 'left') containerStyle += ' text-align: left;';
    if (alignment === 'right') containerStyle += ' text-align: right;';

    let imageStyle = 'max-width: 100%; height: auto; border-radius: 8px;';
    if (alignment === 'full') {
      containerStyle = 'padding: 0;';
      imageStyle = 'width: 100%; height: auto;';
    }

    const image = `
      <img 
        src="${data.src}" 
        alt="${data.alt}" 
        style="${imageStyle}"
        ${data.lazy ? 'loading="lazy"' : ''}
      >
    `;

    return `
      <div class="image-block" style="${containerStyle}">
        ${data.link ? `<a href="${data.link}">${image}</a>` : image}
        ${data.caption ? `<p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280; font-style: italic;">${data.caption}</p>` : ''}
      </div>
    `;
  }

  /**
   * Render Video block
   */
  private renderVideoBlock(block: any): string {
    const data = block.data;
    const aspectRatio = data.aspectRatio || '16:9';
    const [width, height] = aspectRatio.split(':').map(Number);
    const paddingBottom = (height / width) * 100;

    let videoHTML = '';
    if (data.provider === 'youtube' && data.videoId) {
      videoHTML = `
        <iframe 
          src="https://www.youtube.com/embed/${data.videoId}${data.autoplay ? '?autoplay=1' : ''}"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      `;
    } else if (data.provider === 'vimeo' && data.videoId) {
      videoHTML = `
        <iframe 
          src="https://player.vimeo.com/video/${data.videoId}${data.autoplay ? '?autoplay=1' : ''}"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
        ></iframe>
      `;
    } else {
      videoHTML = `
        <video 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          ${data.controls ? 'controls' : ''}
          ${data.autoplay ? 'autoplay' : ''}
          ${data.loop ? 'loop' : ''}
          ${data.muted ? 'muted' : ''}
          ${data.poster ? `poster="${data.poster}"` : ''}
        >
          <source src="${data.src}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
    }

    return `
      <div class="video-block" style="padding: 2rem;">
        <div style="position: relative; padding-bottom: ${paddingBottom}%; height: 0; overflow: hidden;">
          ${videoHTML}
        </div>
        ${data.caption ? `<p style="margin-top: 0.5rem; text-align: center; font-size: 0.875rem; color: #6b7280; font-style: italic;">${data.caption}</p>` : ''}
      </div>
    `;
  }

  /**
   * Render CTA block
   */
  private renderCTABlock(block: any): string {
    const data = block.data;
    const alignment = data.alignment || 'center';
    const hasBackground = data.backgroundImage || data.backgroundColor;

    let containerStyle = `padding: 4rem 2rem; text-align: ${alignment};`;
    if (data.backgroundColor) {
      containerStyle += ` background-color: ${data.backgroundColor};`;
    }
    if (data.backgroundImage) {
      containerStyle += ` background-image: url('${data.backgroundImage}'); background-size: cover; background-position: center;`;
    }
    if (data.textColor) {
      containerStyle += ` color: ${data.textColor};`;
    }

    const buttonSize = data.button.size || 'medium';
    let buttonStyle = 'display: inline-block; padding: 0.75rem 1.5rem; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;';
    
    if (buttonSize === 'small') buttonStyle = buttonStyle.replace('0.75rem 1.5rem', '0.5rem 1rem');
    if (buttonSize === 'large') buttonStyle = buttonStyle.replace('0.75rem 1.5rem', '1rem 2rem');

    return `
      <section class="cta-block" style="${containerStyle}">
        <div style="max-width: 800px; margin: 0 auto;">
          <h2 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">${data.headline}</h2>
          ${data.description ? `<p style="font-size: 1.125rem; margin-bottom: 2rem; opacity: 0.9;">${data.description}</p>` : ''}
          <a href="${data.button.url}" style="${buttonStyle}">${data.button.text}</a>
        </div>
      </section>
    `;
  }

  /**
   * Render FAQ block
   */
  private renderFAQBlock(block: any): string {
    const data = block.data;

    const faqsHTML = data.faqs?.map((faq: any, index: number) => `
      <div class="faq-item" style="border-bottom: 1px solid #e5e7eb; padding: 1.5rem 0;">
        <button class="faq-question" style="width: 100%; text-align: left; font-weight: 600; font-size: 1.125rem; background: none; border: none; cursor: pointer; padding: 0;" onclick="toggleFAQ(${index})">
          ${faq.question}
          <span class="faq-icon" style="float: right; transition: transform 0.2s;">+</span>
        </button>
        <div class="faq-answer" id="faq-answer-${index}" style="max-height: 0; overflow: hidden; transition: max-height 0.3s ease;">
          <div style="padding-top: 1rem; color: #6b7280; line-height: 1.6;">${faq.answer}</div>
        </div>
      </div>
    `).join('') || '';

    return `
      <section class="faq-block" style="padding: 4rem 2rem;">
        <div style="max-width: 800px; margin: 0 auto;">
          ${data.title ? `<h2 style="text-align: center; font-size: 2.5rem; font-weight: bold; margin-bottom: 3rem;">${data.title}</h2>` : ''}
          <div class="faq-list">
            ${faqsHTML}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render Stats block (placeholder)
   */
  private renderStatsBlock(block: any): string {
    const data = block.data;
    
    const statsHTML = data.stats?.map((stat: any) => `
      <div class="stat-item" style="text-align: center; padding: 1rem;">
        ${stat.icon ? `<div style="font-size: 2rem; margin-bottom: 0.5rem;">${stat.icon}</div>` : ''}
        <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem; color: #3b82f6;">
          ${stat.prefix || ''}${stat.value}${stat.suffix || ''}
        </div>
        <div style="font-weight: 600; margin-bottom: 0.5rem;">${stat.label}</div>
        ${stat.description ? `<div style="font-size: 0.875rem; color: #6b7280;">${stat.description}</div>` : ''}
      </div>
    `).join('') || '';

    return `
      <section class="stats-block" style="padding: 4rem 2rem; background-color: #f9fafb;">
        <div style="max-width: 1200px; margin: 0 auto;">
          ${data.title ? `<h2 style="text-align: center; font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">${data.title}</h2>` : ''}
          ${data.subtitle ? `<p style="text-align: center; font-size: 1.125rem; color: #6b7280; margin-bottom: 3rem;">${data.subtitle}</p>` : ''}
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
            ${statsHTML}
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Render other block types (simplified)
   */
  private renderTestimonialsBlock(block: any): string {
    return `<div class="testimonials-block"><!-- Testimonials implementation --></div>`;
  }

  private renderFormBlock(block: any): string {
    return `<div class="form-block"><!-- Form implementation --></div>`;
  }

  private renderTeamBlock(block: any): string {
    return `<div class="team-block"><!-- Team implementation --></div>`;
  }

  private renderAppsShowcaseBlock(block: any): string {
    return `<div class="apps-showcase-block"><!-- Apps showcase implementation --></div>`;
  }

  private renderProsperityCategoriesBlock(block: any): string {
    return `<div class="prosperity-categories-block"><!-- Prosperity categories implementation --></div>`;
  }

  /**
   * Generate block classes
   */
  private generateBlockClasses(block: ContentBlockType): string {
    const classes = [`block-${block.type}`];
    
    if (block.settings?.className) {
      classes.push(block.settings.className);
    }

    return classes.join(' ');
  }

  /**
   * Generate block styles
   */
  private generateBlockStyles(block: ContentBlockType): string {
    const styles: string[] = [];

    if (block.styles) {
      Object.entries(block.styles).forEach(([property, value]) => {
        styles.push(`${property}: ${value}`);
      });
    }

    return styles.join('; ');
  }

  /**
   * Generate page CSS
   */
  private generatePageCSS(page: CMSPageType, options: RenderOptions): string {
    let css = `
      /* Reset and base styles */
      * { box-sizing: border-box; }
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      img { max-width: 100%; height: auto; }
      
      /* Button styles */
      .btn { display: inline-block; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 6px; font-weight: 500; transition: all 0.2s; }
      .btn-primary { background-color: #3b82f6; color: white; }
      .btn-primary:hover { background-color: #2563eb; }
      .btn-secondary { background-color: #6b7280; color: white; }
      .btn-secondary:hover { background-color: #4b5563; }
      .btn-outline { background-color: transparent; color: #3b82f6; border: 2px solid #3b82f6; }
      .btn-outline:hover { background-color: #3b82f6; color: white; }
      
      /* Responsive */
      @media (max-width: 768px) {
        .hero-headline { font-size: 2rem !important; }
        .hero-content { padding: 1rem !important; }
        .features-grid { grid-template-columns: 1fr !important; }
      }
    `;

    // Add custom CSS from page settings
    if (page.settings?.customCSS) {
      css += '\n' + page.settings.customCSS;
    }

    return css;
  }

  /**
   * Generate page JavaScript
   */
  private generatePageJS(page: CMSPageType, options: RenderOptions): string {
    let js = `
      // FAQ toggle functionality
      function toggleFAQ(index) {
        const answer = document.getElementById('faq-answer-' + index);
        const icon = answer.parentElement.querySelector('.faq-icon');
        
        if (answer.style.maxHeight === '0px' || answer.style.maxHeight === '') {
          answer.style.maxHeight = answer.scrollHeight + 'px';
          icon.textContent = '-';
        } else {
          answer.style.maxHeight = '0px';
          icon.textContent = '+';
        }
      }
      
      // Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
          page_title: '${page.title}',
          page_location: window.location.href
        });
      }
    `;

    // Add custom JavaScript from page settings
    if (page.settings?.customJS) {
      js += '\n' + page.settings.customJS;
    }

    return js;
  }

  /**
   * Build Open Graph data
   */
  private buildOpenGraphData(page: CMSPageType): Record<string, string> {
    return {
      'og:title': page.seo?.ogTitle || page.title,
      'og:description': page.seo?.ogDescription || page.description || '',
      'og:type': page.seo?.ogType || 'website',
      'og:image': page.seo?.ogImage || '',
      'og:url': page.seo?.ogUrl || '',
    };
  }

  /**
   * Build complete HTML document
   */
  private buildHTMLDocument(rendered: RenderedPage, options: RenderOptions): string {
    const lang = options.mode === 'production' ? 'en' : 'en';
    
    return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${rendered.metadata.title}</title>
  <meta name="description" content="${rendered.metadata.description}">
  ${rendered.metadata.keywords.length > 0 ? `<meta name="keywords" content="${rendered.metadata.keywords.join(', ')}">` : ''}
  
  <!-- Open Graph -->
  ${Object.entries(rendered.metadata.openGraph)
    .map(([property, content]) => content ? `<meta property="${property}" content="${content}">` : '')
    .filter(Boolean)
    .join('\n  ')}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  
  <!-- Structured Data -->
  ${Object.keys(rendered.metadata.structuredData).length > 0 
    ? `<script type="application/ld+json">${JSON.stringify(rendered.metadata.structuredData)}</script>` 
    : ''}
  
  <!-- Styles -->
  ${options.includeStyles !== false ? `<style>${rendered.css}</style>` : ''}
</head>
<body>
  ${rendered.html}
  
  <!-- Scripts -->
  ${options.includeScripts !== false ? `<script>${rendered.js}</script>` : ''}
</body>
</html>
    `.trim();
  }
}