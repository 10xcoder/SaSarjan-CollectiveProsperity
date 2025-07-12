import { APP_ASSETS } from './registry';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  ogImage?: string;
  twitterImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
}

export function generateSEOTags(appId: string, metadata: SEOMetadata): Record<string, string> {
  const appAssets = APP_ASSETS[appId];
  
  const tags: Record<string, string> = {
    // Basic meta tags
    'title': metadata.title,
    'description': metadata.description,
  };

  if (metadata.keywords?.length) {
    tags['keywords'] = metadata.keywords.join(', ');
  }

  if (metadata.author) {
    tags['author'] = metadata.author;
  }

  // Open Graph tags
  tags['og:title'] = metadata.title;
  tags['og:description'] = metadata.description;
  tags['og:type'] = 'website';
  
  if (metadata.ogImage || appAssets?.ogImage) {
    tags['og:image'] = metadata.ogImage || appAssets?.ogImage || '';
  }

  // Twitter Card tags
  tags['twitter:card'] = metadata.twitterCard || 'summary_large_image';
  tags['twitter:title'] = metadata.title;
  tags['twitter:description'] = metadata.description;
  
  if (metadata.twitterImage || appAssets?.twitterImage) {
    tags['twitter:image'] = metadata.twitterImage || appAssets?.twitterImage || '';
  }

  // Canonical URL
  if (metadata.canonicalUrl) {
    tags['canonical'] = metadata.canonicalUrl;
  }

  return tags;
}

export function generateNextJSMetadata(appId: string, metadata: SEOMetadata) {
  const appAssets = APP_ASSETS[appId];
  const tags = generateSEOTags(appId, metadata);

  return {
    title: tags.title,
    description: tags.description,
    keywords: metadata.keywords,
    authors: metadata.author ? [{ name: metadata.author }] : undefined,
    openGraph: {
      title: tags['og:title'],
      description: tags['og:description'],
      type: 'website',
      images: tags['og:image'] ? [tags['og:image']] : undefined,
    },
    twitter: {
      card: tags['twitter:card'] as 'summary' | 'summary_large_image',
      title: tags['twitter:title'],
      description: tags['twitter:description'],
      images: tags['twitter:image'] ? [tags['twitter:image']] : undefined,
    },
    icons: appAssets ? {
      icon: [
        { url: appAssets.favicon.png16, sizes: '16x16', type: 'image/png' },
        { url: appAssets.favicon.png32, sizes: '32x32', type: 'image/png' },
      ],
      apple: appAssets.favicon.appleTouchIcon,
    } : undefined,
  };
}