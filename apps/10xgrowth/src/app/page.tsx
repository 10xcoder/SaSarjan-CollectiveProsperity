import { createSupabaseClient } from '@sasarjan/database';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import LandingPageRenderer from './components/LandingPageRenderer';
import { 
  generateWebPageSchema, 
  generateOrganizationSchema, 
  generateWebsiteSchema,
  generateServiceSchema,
  generateBreadcrumbSchema 
} from '../lib/structured-data';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  const supabase = createSupabaseClient();
  
  const { data: page } = await supabase
    .from('cms_pages')
    .select('title, description, seo, slug')
    .eq('slug', 'home')
    .eq('status', 'published')
    .eq('visibility', 'public')
    .single();

  if (!page) {
    return {
      title: '10xGrowth - Scale Your Business with Global Talent',
      description: 'The premier platform connecting businesses with top-tier freelancers for exponential growth.',
    };
  }

  const seo = page.seo || {};
  
  return {
    title: seo.title || page.title || '10xGrowth - Scale Your Business with Global Talent',
    description: seo.description || page.description || 'The premier platform connecting businesses with top-tier freelancers for exponential growth.',
    keywords: seo.keywords || ['business growth', 'freelancer platform', 'global talent'],
    openGraph: {
      title: seo.ogTitle || seo.title || page.title,
      description: seo.ogDescription || seo.description || page.description,
      url: 'https://10xgrowth.com',
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
      canonical: seo.canonical || 'https://10xgrowth.com',
    },
  };
}

// Import new components
import HeroSection from '../components/homepage/HeroSection';
import StudiosSection from '../components/homepage/StudiosSection';
import ProcessSection from '../components/homepage/ProcessSection';
import SaaSSection from '../components/homepage/SaaSSection';
import MetricsSection from '../components/homepage/MetricsSection';
import TestimonialsSection from '../components/homepage/TestimonialsSection';
import CTASection from '../components/homepage/CTASection';

export default async function HomePage() {
  // Check if we should use CMS or new homepage
  const useCMS = process.env.USE_CMS_HOMEPAGE === 'true';
  
  if (!useCMS) {
    // Always show new enhanced homepage
    const structuredData = [
      generateOrganizationSchema(),
      generateWebsiteSchema(),
      generateWebPageSchema({ 
        page: { 
          id: 'homepage',
          title: '10xGrowth - Business Growth Accelerator',
          slug: '/',
          description: 'Transform your vision into victory with our Studios-as-a-Service model',
          type: 'homepage',
          updated_at: new Date().toISOString()
        } 
      }),
      generateServiceSchema()
    ];

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
        
        <div className="min-h-screen">
          <HeroSection />
          <StudiosSection />
          <ProcessSection />
          <SaaSSection />
          <MetricsSection />
          <TestimonialsSection />
          <CTASection />
        </div>
      </>
    );
  }

  // CMS Mode (fallback)
  const supabase = createSupabaseClient();

  // Fetch the home page data from CMS
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
    .eq('slug', 'home')
    .eq('status', 'published')
    .single();

  // If no home page found in CMS, show new enhanced homepage as fallback
  if (error || !page) {
    return (
      <div className="min-h-screen">
        <HeroSection />
        <StudiosSection />
        <ProcessSection />
        <SaaSSection />
        <MetricsSection />
        <TestimonialsSection />
        <CTASection />
      </div>
    );
  }

  // Check visibility
  if (page.visibility !== 'public') {
    notFound();
  }

  // Track page view (analytics) - temporarily disabled to prevent errors
  // try {
  //   await supabase.rpc('increment_page_views', { 
  //     page_id: page.id 
  //   });
  // } catch (error) {
  //   console.error('Failed to track page view:', error);
  // }

  // Generate structured data
  const structuredData = [
    generateOrganizationSchema(),
    generateWebsiteSchema(),
    generateWebPageSchema({ page }),
    generateServiceSchema()
  ];

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