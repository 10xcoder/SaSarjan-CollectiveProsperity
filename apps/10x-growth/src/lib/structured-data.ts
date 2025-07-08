// Structured Data utilities for SEO
export interface StructuredDataProps {
  page: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    type: string;
    published_at?: string;
    updated_at: string;
    seo?: any;
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "10xGrowth",
    "description": "Business Growth Accelerator - Connect with expert freelancers to scale your business 10X faster",
    "url": "https://10xgrowth.com",
    "logo": "https://10xgrowth.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-0123",
      "contactType": "customer service",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://twitter.com/10xgrowth",
      "https://linkedin.com/company/10xgrowth",
      "https://facebook.com/10xgrowth"
    ],
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "Sarah Johnson"
      },
      {
        "@type": "Person", 
        "name": "Michael Chen"
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    }
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "10xGrowth",
    "description": "Business Growth Accelerator Platform",
    "url": "https://10xgrowth.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://10xgrowth.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function generateWebPageSchema({ page }: StructuredDataProps) {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.title,
    "description": page.description || page.seo?.description,
    "url": `https://10xgrowth.com/${page.slug}`,
    "datePublished": page.published_at,
    "dateModified": page.updated_at,
    "publisher": {
      "@type": "Organization",
      "name": "10xGrowth",
      "url": "https://10xgrowth.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://10xgrowth.com/${page.slug}`
    }
  };

  // Add specific schema based on page type
  switch (page.type) {
    case 'landing':
      return {
        ...baseSchema,
        "@type": ["WebPage", "LandingPage"],
        "about": {
          "@type": "Service",
          "name": "Business Growth Services",
          "description": "Expert freelancer marketplace for business acceleration"
        }
      };
    
    case 'pricing':
      return {
        ...baseSchema,
        "@type": ["WebPage", "PricePage"],
        "about": {
          "@type": "Product",
          "name": "10xGrowth Platform",
          "description": "Freelancer marketplace platform with flexible pricing plans"
        }
      };
    
    case 'about':
      return {
        ...baseSchema,
        "@type": ["WebPage", "AboutPage"],
        "about": {
          "@type": "Organization",
          "name": "10xGrowth"
        }
      };
    
    default:
      return baseSchema;
  }
}

export function generateServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Business Growth Acceleration",
    "description": "Connect with expert freelancers to scale your business operations and achieve 10X growth",
    "provider": {
      "@type": "Organization",
      "name": "10xGrowth",
      "url": "https://10xgrowth.com"
    },
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Freelance Services",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Technology Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Web Development"
              }
            },
            {
              "@type": "Offer", 
              "itemOffered": {
                "@type": "Service",
                "name": "Mobile App Development"
              }
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Marketing Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Digital Marketing"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service", 
                "name": "Content Marketing"
              }
            }
          ]
        }
      ]
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Priya Sharma"
        },
        "reviewBody": "10xGrowth helped us find a development team that delivered our MVP in just 6 weeks. The quality exceeded our expectations."
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateFAQSchema(faqs: Array<{question: string, answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "10xGrowth",
    "description": "Business Growth Accelerator and Freelancer Marketplace",
    "url": "https://10xgrowth.com",
    "telephone": "+1-555-0123",
    "email": "hello@10xgrowth.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Business District",
      "addressLocality": "Mumbai",
      "addressRegion": "Maharashtra", 
      "postalCode": "400001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "19.0760",
      "longitude": "72.8777"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday", 
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "priceRange": "$$",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Credit Card, Debit Card, UPI, Bank Transfer"
  };
}

export function generatePersonSchema(person: {
  name: string;
  title: string;
  bio?: string;
  image?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
  };
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": person.name,
    "jobTitle": person.title,
    "description": person.bio,
    "image": person.image,
    "url": person.social?.linkedin,
    "sameAs": [
      person.social?.linkedin,
      person.social?.twitter
    ].filter(Boolean),
    "worksFor": {
      "@type": "Organization",
      "name": "10xGrowth"
    }
  };
}

export function injectStructuredData(schemas: object[]) {
  if (typeof window === 'undefined') return null;
  
  // Remove existing structured data
  const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
  existingScripts.forEach(script => script.remove());
  
  // Add new structured data
  schemas.forEach(schema => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}