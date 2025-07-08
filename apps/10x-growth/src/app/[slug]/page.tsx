import { createSupabaseClient } from '@sasarjan/database';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import LandingPageRenderer from '../components/LandingPageRenderer';
import { 
  generateWebPageSchema, 
  generateOrganizationSchema, 
  generateWebsiteSchema,
  generateServiceSchema,
  generateBreadcrumbSchema 
} from '../../lib/structured-data';

interface Props {
  params: { slug: string };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createSupabaseClient();
  
  const { data: page } = await supabase
    .from('cms_pages')
    .select('title, description, seo, slug')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .single();

  if (!page) {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found.',
    };
  }

  const seo = page.seo || {};
  
  return {
    title: seo.title || page.title || '10xGrowth',
    description: seo.description || page.description || 'Scale your business with top freelancers',
    keywords: seo.keywords || [],
    openGraph: {
      title: seo.ogTitle || seo.title || page.title,
      description: seo.ogDescription || seo.description || page.description,
      url: `https://10xgrowth.com/${page.slug}`,
      siteName: '10xGrowth',
      images: seo.ogImage ? [
        {
          url: seo.ogImage,
          width: 1200,
          height: 630,
          alt: seo.ogTitle || page.title,
        }
      ] : [],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: seo.twitterCard || 'summary_large_image',
      title: seo.twitterTitle || seo.ogTitle || page.title,
      description: seo.twitterDescription || seo.ogDescription || page.description,
      images: seo.twitterImage ? [seo.twitterImage] : [],
    },
    robots: {
      index: !seo.noindex,
      follow: !seo.nofollow,
      googleBot: {
        index: !seo.noindex,
        follow: !seo.nofollow,
      },
    },
    alternates: {
      canonical: seo.canonical || `https://10xgrowth.com/${page.slug}`,
    },
  };
}

export default async function DynamicLandingPage({ params }: Props) {
  const supabase = createSupabaseClient();

  // Fetch the page data
  const { data: page, error } = await supabase
    .from('cms_pages')
    .select(`
      id,
      title,
      slug,
      description,
      type,
      template,
      status,
      visibility,
      blocks,
      settings,
      seo,
      published_at,
      created_at,
      updated_at
    `)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (error || !page) {
    notFound();
  }

  // Check visibility
  if (page.visibility !== 'public') {
    notFound();
  }

  // Track page view (analytics)
  try {
    await supabase.rpc('increment_page_views', { 
      page_id: page.id 
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }

  // Generate structured data
  const structuredData = [
    generateOrganizationSchema(),
    generateWebsiteSchema(),
    generateWebPageSchema({ page }),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://10xgrowth.com' },
      { name: page.title, url: `https://10xgrowth.com/${page.slug}` }
    ])
  ];

  // Add service schema for landing pages
  if (page.type === 'landing') {
    structuredData.push(generateServiceSchema());
  }

  return (
    <>
      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      
      <LandingPageRenderer page={page} />
    </>
  );
}

// Generate static params for ISR
export async function generateStaticParams() {
  const supabase = createSupabaseClient();
  
  const { data: pages } = await supabase
    .from('cms_pages')
    .select('slug')
    .eq('status', 'published')
    .eq('visibility', 'public');

  return pages?.map((page) => ({
    slug: page.slug,
  })) || [];
}