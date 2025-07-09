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

export default async function HomePage() {
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

  // If no home page found in CMS, show fallback
  if (error || !page) {
    return (
      <div className="min-h-screen">
        {/* Fallback Home Page */}
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Scale Your Business 10X with Global Talent
            </h1>
            <h2 className="text-xl md:text-2xl mb-6 text-blue-100">
              The Premier Platform for Business Growth
            </h2>
            <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-4xl mx-auto">
              Connect with verified professionals worldwide. From startups to enterprises, 
              unlock exponential growth through our curated network of top-tier freelancers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/browse"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-800 bg-white hover:bg-blue-50 transition-colors"
              >
                Find Freelancers
              </a>
              <a
                href="/join-freelancers"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-800 transition-colors"
              >
                Join as Freelancer
              </a>
            </div>
          </div>
        </section>

        {/* Quick Links to Landing Pages */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Explore Our Solutions</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">🚀 Business Growth</h3>
                <p className="text-gray-600 mb-4">
                  Scale your business with expert freelancers. Access verified professionals for all your growth needs.
                </p>
                <a
                  href="/business-growth"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Learn More →
                </a>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
                <h3 className="text-xl font-semibold mb-3 text-green-600">💼 Join as Freelancer</h3>
                <p className="text-gray-600 mb-4">
                  Turn your skills into success. Join our exclusive network of top freelancers worldwide.
                </p>
                <a
                  href="/join-freelancers"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Apply Now →
                </a>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center">
                <h3 className="text-xl font-semibold mb-3 text-purple-600">🏢 About 10xGrowth</h3>
                <p className="text-gray-600 mb-4">
                  Discover our mission to connect talent with opportunity and build the future of work.
                </p>
                <a
                  href="/about"
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
                >
                  Our Story →
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
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