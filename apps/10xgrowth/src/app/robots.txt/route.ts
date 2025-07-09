export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://10xgrowth.com/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Disallow temporary pages
Disallow: /temp/
Disallow: /_next/

# Allow important pages
Allow: /
Allow: /browse
Allow: /post-project
Allow: /how-it-works
Allow: /pricing
Allow: /about
Allow: /contact

# Crawl delay for aggressive bots
Crawl-delay: 1`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}