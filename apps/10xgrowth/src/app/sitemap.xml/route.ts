import { createSupabaseClient } from '@sasarjan/database';

export async function GET() {
  const supabase = createSupabaseClient();

  // Get all published pages
  const { data: pages } = await supabase
    .from('cms_pages')
    .select('slug, updated_at, type')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .eq('app_id', '10xgrowth');

  const baseUrl = 'https://10xgrowth.com';
  
  // Static pages
  const staticPages = [
    { url: '/', lastmod: new Date().toISOString(), priority: '1.0', changefreq: 'daily' },
    { url: '/browse', lastmod: new Date().toISOString(), priority: '0.9', changefreq: 'daily' },
    { url: '/post-project', lastmod: new Date().toISOString(), priority: '0.9', changefreq: 'weekly' },
    { url: '/how-it-works', lastmod: new Date().toISOString(), priority: '0.8', changefreq: 'monthly' },
  ];

  // Dynamic pages from CMS
  const dynamicPages = pages?.map((page: any) => ({
    url: `/${page.slug}`,
    lastmod: new Date(page.updated_at).toISOString(),
    priority: getPriority(page.type),
    changefreq: getChangeFreq(page.type),
  })) || [];

  const allPages = [...staticPages, ...dynamicPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function getPriority(pageType: string): string {
  switch (pageType) {
    case 'landing': return '0.9';
    case 'pricing': return '0.8';
    case 'about': return '0.7';
    case 'features': return '0.7';
    case 'contact': return '0.6';
    default: return '0.5';
  }
}

function getChangeFreq(pageType: string): string {
  switch (pageType) {
    case 'landing': return 'weekly';
    case 'pricing': return 'monthly';
    case 'about': return 'monthly';
    case 'features': return 'monthly';
    default: return 'yearly';
  }
}