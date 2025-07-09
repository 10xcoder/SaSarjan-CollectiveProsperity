'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring, ImageOptimizer, LazyLoader } from '../../lib/performance';

interface ContentBlock {
  id: string;
  type: string;
  order: number;
  data: any;
  settings?: any;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  type: string;
  template: string;
  status: string;
  visibility: string;
  blocks: ContentBlock[];
  settings: any;
  seo: any;
}

interface Props {
  page: PageData;
}

export default function LandingPageRenderer({ page }: Props) {
  useEffect(() => {
    // Initialize performance monitoring
    if (typeof window !== 'undefined') {
      // Initialize performance tracking
      initPerformanceMonitoring(page.id);
      
      // Preload critical images from hero blocks
      const heroBlocks = page.blocks.filter(block => block.type === 'hero');
      const criticalImages = heroBlocks
        .map(block => block.data.backgroundImage)
        .filter(Boolean);
      
      if (criticalImages.length > 0) {
        ImageOptimizer.preloadCriticalImages(criticalImages);
      }
      
      console.log('Page viewed:', page.slug);
    }
  }, [page.id, page.slug, page.blocks]);

  // Sort blocks by order
  const sortedBlocks = [...page.blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen">
      {/* Render each content block */}
      {sortedBlocks.map((block) => (
        <div key={block.id}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock data={block.data} />;
    case 'features':
      return <FeaturesBlock data={block.data} />;
    case 'text':
      return <TextBlock data={block.data} />;
    case 'cta':
      return <CTABlock data={block.data} />;
    case 'stats':
      return <StatsBlock data={block.data} />;
    case 'testimonials':
      return <TestimonialsBlock data={block.data} />;
    case 'faq':
      return <FAQBlock data={block.data} />;
    case 'team':
      return <TeamBlock data={block.data} />;
    case 'apps_showcase':
      return <AppsShowcaseBlock data={block.data} />;
    case 'prosperity_categories':
      return <ProsperityCategoriesBlock data={block.data} />;
    default:
      return null;
  }
}

// Hero Block Component
function HeroBlock({ data }: { data: any }) {
  const alignment = data.alignment || 'center';
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      {data.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${data.backgroundImage})` }}
        />
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-4xl ${alignment === 'center' ? 'mx-auto' : ''} ${alignmentClasses[alignment as keyof typeof alignmentClasses]}`}>
          {data.headline && (
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {data.headline}
            </h1>
          )}
          {data.subheadline && (
            <h2 className="text-xl md:text-2xl mb-6 text-blue-100">
              {data.subheadline}
            </h2>
          )}
          {data.description && (
            <p className="text-lg md:text-xl mb-8 text-blue-100">
              {data.description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {data.ctaPrimary && (
              <a
                href={data.ctaPrimary.url}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-800 bg-white hover:bg-blue-50 transition-colors"
              >
                {data.ctaPrimary.text}
              </a>
            )}
            {data.ctaSecondary && (
              <a
                href={data.ctaSecondary.url}
                className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-800 transition-colors"
              >
                {data.ctaSecondary.text}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Block Component
function FeaturesBlock({ data }: { data: any }) {
  const layout = data.layout || 'grid';
  const columns = data.columns || 3;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-lg text-gray-600">
                {data.subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className={`grid gap-8 ${
          columns === 2 ? 'md:grid-cols-2' :
          columns === 3 ? 'md:grid-cols-3' :
          columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
          'md:grid-cols-3'
        }`}>
          {data.features?.map((feature: any) => (
            <div key={feature.id} className="text-center">
              {feature.icon && (
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-blue-600">{feature.icon}</span>
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
              {feature.link && (
                <a
                  href={feature.link}
                  className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Learn more →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Text Block Component
function TextBlock({ data }: { data: any }) {
  const alignment = data.alignment || 'left';
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`prose max-w-none ${alignmentClasses[alignment as keyof typeof alignmentClasses]}`}
          dangerouslySetInnerHTML={{ __html: data.content || '' }}
        />
      </div>
    </section>
  );
}

// CTA Block Component
function CTABlock({ data }: { data: any }) {
  const alignment = data.alignment || 'center';
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const buttonSizes = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: data.backgroundColor || '#f3f4f6',
        backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={alignmentClasses[alignment as keyof typeof alignmentClasses]}>
          {data.headline && (
            <h2 className="text-3xl font-bold mb-4" style={{ color: data.textColor || '#1f2937' }}>
              {data.headline}
            </h2>
          )}
          {data.description && (
            <p className="text-lg mb-8" style={{ color: data.textColor || '#6b7280' }}>
              {data.description}
            </p>
          )}
          {data.button && (
            <a
              href={data.button.url}
              className={`inline-flex items-center font-medium rounded-md transition-colors ${
                buttonSizes[data.button.size as keyof typeof buttonSizes] || buttonSizes.medium
              } ${
                data.button.style === 'primary' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : data.button.style === 'secondary'
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : data.button.style === 'outline'
                  ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              {data.button.text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// Apps Showcase Block Component (10xGrowth specific)
function AppsShowcaseBlock({ data }: { data: any }) {
  // Mock data for demonstration - in real implementation, this would fetch from the database
  const mockApps = [
    {
      id: '1',
      name: 'TalentExcel',
      description: 'Lifelong Learning & Earning Platform',
      category: 'Career',
      icon: '🎯',
    },
    {
      id: '2',
      name: '10xGrowth',
      description: 'Business Growth Accelerator',
      category: 'Business',
      icon: '📈',
    },
    {
      id: '3',
      name: 'SevaPremi',
      description: 'Local Area Improvement Network',
      category: 'Community',
      icon: '🤝',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-lg text-gray-600">
                {data.subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockApps.map((app) => (
            <div key={app.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{app.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{app.name}</h3>
                  <span className="text-sm text-gray-500">{app.category}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{app.description}</p>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Prosperity Categories Block Component
function ProsperityCategoriesBlock({ data }: { data: any }) {
  // Mock data for demonstration
  const mockCategories = [
    { id: '1', name: 'Personal Transformation', icon: '🌱', description: 'Individual growth and self-improvement' },
    { id: '2', name: 'Organizational Excellence', icon: '🏢', description: 'Building better organizations' },
    { id: '3', name: 'Community Resilience', icon: '🤝', description: 'Strengthening communities' },
    { id: '4', name: 'Economic Empowerment', icon: '💰', description: 'Financial growth and stability' },
  ];

  const columns = data.columns || 4;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-lg text-gray-600">
                {data.subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className={`grid gap-6 ${
          columns === 2 ? 'md:grid-cols-2' :
          columns === 3 ? 'md:grid-cols-3' :
          columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
          'md:grid-cols-4'
        }`}>
          {mockCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              {data.showIcons && (
                <span className="text-4xl mb-4 block">{category.icon}</span>
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.name}
              </h3>
              {data.showDescriptions && (
                <p className="text-gray-600 text-sm">
                  {category.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Stats Block Component
function StatsBlock({ data }: { data: any }) {
  const layout = data.layout || 'grid';
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-lg text-gray-600">
                {data.subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className={`${
          layout === 'horizontal' 
            ? 'flex flex-wrap justify-center gap-8' 
            : 'grid gap-8 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {data.stats?.map((stat: any) => (
            <div key={stat.id} className="text-center">
              {stat.icon && (
                <span className="text-4xl mb-2 block">{stat.icon}</span>
              )}
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stat.prefix}{stat.value}{stat.suffix}
              </div>
              <div className="text-lg font-medium text-gray-900 mb-1">
                {stat.label}
              </div>
              {stat.description && (
                <p className="text-sm text-gray-600">
                  {stat.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Block Component
function TestimonialsBlock({ data }: { data: any }) {
  const layout = data.layout || 'carousel';
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-lg text-gray-600">
                {data.subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className={`${
          layout === 'grid' 
            ? 'grid gap-8 md:grid-cols-2 lg:grid-cols-3'
            : 'max-w-4xl mx-auto'
        }`}>
          {data.testimonials?.map((testimonial: any) => (
            <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg">
              {testimonial.rating && (
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              )}
              <blockquote className="text-gray-700 mb-4">
                "{testimonial.quote || testimonial.content}"
              </blockquote>
              <div className="flex items-center">
                {(testimonial.author?.avatar || testimonial.avatar) && (
                  <img
                    src={testimonial.author?.avatar || testimonial.avatar}
                    alt={testimonial.author?.name || testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                    loading="lazy"
                  />
                )}
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.author?.name || testimonial.name}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {testimonial.author?.title || testimonial.role}
                    {testimonial.author?.company && `, ${testimonial.author.company}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Block Component
function FAQBlock({ data }: { data: any }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-lg text-gray-600">
                {data.subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          {data.faqs?.map((faq: any) => (
            <details key={faq.id} className="bg-white rounded-lg shadow">
              <summary className="p-6 font-medium text-gray-900 cursor-pointer hover:bg-gray-50">
                {faq.question}
              </summary>
              <div className="px-6 pb-6 text-gray-700">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// Team Block Component
function TeamBlock({ data }: { data: any }) {
  const columns = data.columns || 3;
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {data.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {data.title}
            </h2>
            {data.subtitle && (
              <p className="text-lg text-gray-600">
                {data.subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className={`grid gap-8 ${
          columns === 2 ? 'md:grid-cols-2' :
          columns === 3 ? 'md:grid-cols-3' :
          columns === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
          'md:grid-cols-3'
        }`}>
          {data.members?.map((member: any) => (
            <div key={member.id} className="text-center">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                loading="lazy"
                srcSet={ImageOptimizer.generateSrcSet(member.avatar)}
                sizes="(max-width: 640px) 128px, 128px"
              />
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="text-blue-600 font-medium mb-2">
                {member.title}
              </p>
              {member.bio && (
                <p className="text-gray-600 text-sm mb-4">
                  {member.bio}
                </p>
              )}
              {member.social && (
                <div className="flex justify-center space-x-3">
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      LinkedIn
                    </a>
                  )}
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-600"
                    >
                      Twitter
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}