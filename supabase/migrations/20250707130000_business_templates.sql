-- Business Templates for 10xGrowth
-- Created: 07-Jul-2025, Monday 15:30 IST

-- Clear existing templates to replace with improved versions
DELETE FROM cms_templates WHERE slug IN ('b2b-growth-landing', 'service-categories-showcase');

-- Insert comprehensive business templates for 10xGrowth
INSERT INTO cms_templates (id, name, slug, description, category, type, blocks, settings, preview_image, tags, industry, created_by) VALUES

-- 1. Enhanced B2B Growth Landing Page
(
    uuid_generate_v4(),
    'B2B Growth Landing Page Pro',
    'b2b-growth-landing-pro',
    'Professional landing page optimized for B2B lead generation with proven conversion elements',
    'business',
    'landing',
    '[
        {
            "id": "hero-main",
            "type": "hero",
            "order": 1,
            "data": {
                "headline": "Scale Your Business 10X with Expert Freelancers",
                "subheadline": "Join 500+ Companies Already Growing",
                "description": "Connect with vetted professionals who deliver results. From development to marketing, find the perfect talent to accelerate your business growth.",
                "ctaPrimary": {
                    "text": "Find Expert Freelancers",
                    "url": "/browse-freelancers",
                    "style": "primary"
                },
                "ctaSecondary": {
                    "text": "Post Your Project",
                    "url": "/post-project",
                    "style": "secondary"
                },
                "alignment": "center",
                "backgroundImage": "/images/hero-bg-business.jpg"
            }
        },
        {
            "id": "stats-section",
            "type": "stats",
            "order": 2,
            "data": {
                "title": "Trusted by Growing Businesses",
                "layout": "horizontal",
                "animated": true,
                "stats": [
                    {
                        "id": "stat-1",
                        "value": "500+",
                        "label": "Companies Served",
                        "description": "Businesses scaling with our platform",
                        "icon": "🏢",
                        "order": 1
                    },
                    {
                        "id": "stat-2",
                        "value": "2000+",
                        "label": "Expert Freelancers",
                        "description": "Vetted professionals ready to help",
                        "icon": "👥",
                        "order": 2
                    },
                    {
                        "id": "stat-3",
                        "value": "95%",
                        "label": "Success Rate",
                        "description": "Projects completed successfully",
                        "icon": "✅",
                        "order": 3
                    },
                    {
                        "id": "stat-4",
                        "value": "48hr",
                        "label": "Average Match Time",
                        "description": "Time to find the right freelancer",
                        "icon": "⚡",
                        "order": 4
                    }
                ]
            }
        },
        {
            "id": "features-main",
            "type": "features",
            "order": 3,
            "data": {
                "title": "Why Growing Businesses Choose 10xGrowth",
                "subtitle": "Everything you need to scale efficiently",
                "layout": "grid",
                "columns": 3,
                "features": [
                    {
                        "id": "feat-vetting",
                        "title": "Rigorous Vetting Process",
                        "description": "All freelancers undergo comprehensive skill assessments, background checks, and portfolio reviews before joining our platform.",
                        "icon": "🛡️",
                        "order": 1
                    },
                    {
                        "id": "feat-matching",
                        "title": "AI-Powered Matching",
                        "description": "Our intelligent system matches you with freelancers based on your specific requirements, timeline, and budget.",
                        "icon": "🎯",
                        "order": 2
                    },
                    {
                        "id": "feat-management",
                        "title": "Project Management Tools",
                        "description": "Built-in tools for milestone tracking, communication, file sharing, and payment management.",
                        "icon": "📊",
                        "order": 3
                    },
                    {
                        "id": "feat-security",
                        "title": "Secure Payments",
                        "description": "Escrow-protected payments with milestone-based releases ensure your money is safe until work is completed.",
                        "icon": "🔒",
                        "order": 4
                    },
                    {
                        "id": "feat-support",
                        "title": "24/7 Support",
                        "description": "Dedicated account managers and round-the-clock support to ensure your projects stay on track.",
                        "icon": "🤝",
                        "order": 5
                    },
                    {
                        "id": "feat-scaling",
                        "title": "Scale on Demand",
                        "description": "Quickly scale your team up or down based on project needs without the overhead of full-time hiring.",
                        "icon": "📈",
                        "order": 6
                    }
                ]
            }
        },
        {
            "id": "prosperity-categories",
            "type": "prosperity_categories",
            "order": 4,
            "data": {
                "title": "Expertise Across All Business Functions",
                "subtitle": "Find specialists in every area of business growth",
                "layout": "grid",
                "columns": 4,
                "showDescriptions": true,
                "showIcons": true,
                "showCounts": true
            }
        },
        {
            "id": "testimonials-section",
            "type": "testimonials",
            "order": 5,
            "data": {
                "title": "What Our Clients Say",
                "subtitle": "Real results from real businesses",
                "layout": "carousel",
                "testimonials": [
                    {
                        "id": "test-1",
                        "quote": "10xGrowth helped us find a development team that delivered our MVP in just 6 weeks. The quality exceeded our expectations.",
                        "author": {
                            "name": "Priya Sharma",
                            "title": "CEO",
                            "company": "TechStart Solutions",
                            "avatar": "/images/testimonial-1.jpg"
                        },
                        "rating": 5,
                        "order": 1
                    },
                    {
                        "id": "test-2",
                        "quote": "The marketing consultant we found through 10xGrowth increased our conversion rate by 300% in just 2 months.",
                        "author": {
                            "name": "Rajesh Kumar",
                            "title": "Founder",
                            "company": "GrowthLabs",
                            "avatar": "/images/testimonial-2.jpg"
                        },
                        "rating": 5,
                        "order": 2
                    },
                    {
                        "id": "test-3",
                        "quote": "Finding quality freelancers used to take weeks. With 10xGrowth, we had our ideal designer matched within 24 hours.",
                        "author": {
                            "name": "Meera Patel",
                            "title": "Product Manager",
                            "company": "InnovateCorp",
                            "avatar": "/images/testimonial-3.jpg"
                        },
                        "rating": 5,
                        "order": 3
                    }
                ]
            }
        },
        {
            "id": "cta-final",
            "type": "cta",
            "order": 6,
            "data": {
                "headline": "Ready to Scale Your Business?",
                "description": "Join hundreds of companies already growing 10X faster with our expert freelancer network. Get matched with your ideal talent in under 48 hours.",
                "button": {
                    "text": "Start Your Growth Journey",
                    "url": "/signup",
                    "style": "primary",
                    "size": "large"
                },
                "alignment": "center",
                "backgroundColor": "#1e40af",
                "textColor": "#ffffff"
            }
        }
    ]'::jsonb,
    '{
        "theme": "professional-growth",
        "colors": {
            "primary": "#1e40af",
            "secondary": "#64748b",
            "accent": "#10b981"
        },
        "typography": {
            "headingFont": "Inter",
            "bodyFont": "Inter"
        },
        "layout": {
            "maxWidth": "1200px",
            "spacing": "comfortable"
        }
    }'::jsonb,
    '/templates/b2b-growth-pro-preview.jpg',
    ARRAY['b2b', 'growth', 'freelancer', 'professional', 'lead-generation'],
    'technology',
    '00000000-0000-0000-0000-000000000001'
),

-- 2. Freelancer Marketplace Landing
(
    uuid_generate_v4(),
    'Freelancer Marketplace Landing',
    'freelancer-marketplace',
    'Showcase your freelancer marketplace with category browsing and talent discovery',
    'marketplace',
    'landing',
    '[
        {
            "id": "hero-marketplace",
            "type": "hero",
            "order": 1,
            "data": {
                "headline": "Find Expert Freelancers for Every Project",
                "subheadline": "Browse by Category, Skill, or Location",
                "description": "Discover pre-vetted professionals ready to take your business to the next level. From quick tasks to long-term partnerships.",
                "ctaPrimary": {
                    "text": "Browse Freelancers",
                    "url": "/browse",
                    "style": "primary"
                },
                "ctaSecondary": {
                    "text": "How It Works",
                    "url": "/how-it-works",
                    "style": "outline"
                },
                "alignment": "center"
            }
        },
        {
            "id": "apps-showcase",
            "type": "apps_showcase",
            "order": 2,
            "data": {
                "title": "Explore Our Service Categories",
                "subtitle": "Find the right expertise for your business needs",
                "layout": "grid",
                "showCategories": true,
                "showMetrics": true,
                "maxApps": 6
            }
        },
        {
            "id": "process-features",
            "type": "features",
            "order": 3,
            "data": {
                "title": "How It Works",
                "subtitle": "Simple steps to find your perfect freelancer",
                "layout": "grid",
                "columns": 3,
                "features": [
                    {
                        "id": "step-1",
                        "title": "1. Post Your Project",
                        "description": "Describe your project requirements, timeline, and budget. Our system will help optimize your posting for better matches.",
                        "icon": "📝",
                        "order": 1
                    },
                    {
                        "id": "step-2",
                        "title": "2. Review Proposals",
                        "description": "Receive proposals from qualified freelancers within hours. Review portfolios, ratings, and previous work samples.",
                        "icon": "👀",
                        "order": 2
                    },
                    {
                        "id": "step-3",
                        "title": "3. Start Working",
                        "description": "Choose your freelancer, set milestones, and begin your project with built-in collaboration tools.",
                        "icon": "🚀",
                        "order": 3
                    }
                ]
            }
        },
        {
            "id": "cta-marketplace",
            "type": "cta",
            "order": 4,
            "data": {
                "headline": "Start Your Next Project Today",
                "description": "Over 2000 skilled freelancers are waiting to help you succeed",
                "button": {
                    "text": "Post a Project",
                    "url": "/post-project",
                    "style": "primary",
                    "size": "large"
                },
                "alignment": "center"
            }
        }
    ]'::jsonb,
    '{
        "theme": "marketplace",
        "colors": {
            "primary": "#3b82f6",
            "secondary": "#8b5cf6"
        }
    }'::jsonb,
    '/templates/marketplace-preview.jpg',
    ARRAY['marketplace', 'freelancer', 'categories', 'discovery'],
    'technology',
    '00000000-0000-0000-0000-000000000001'
),

-- 3. Service-Specific Landing Page
(
    uuid_generate_v4(),
    'Service Category Landing',
    'service-category-landing',
    'Focused landing page for specific service categories with expert showcases',
    'service',
    'landing',
    '[
        {
            "id": "hero-service",
            "type": "hero",
            "order": 1,
            "data": {
                "headline": "Top [Service] Freelancers",
                "subheadline": "Vetted Experts Ready to Deliver",
                "description": "Find experienced [service] professionals who understand your business needs and deliver exceptional results on time.",
                "ctaPrimary": {
                    "text": "View [Service] Experts",
                    "url": "/freelancers/[category]",
                    "style": "primary"
                },
                "alignment": "center"
            }
        },
        {
            "id": "service-features",
            "type": "features",
            "order": 2,
            "data": {
                "title": "Why Choose Our [Service] Experts",
                "layout": "grid",
                "columns": 2,
                "features": [
                    {
                        "id": "expert-1",
                        "title": "Industry Experience",
                        "description": "All our [service] freelancers have proven track records working with businesses in your industry.",
                        "icon": "⭐",
                        "order": 1
                    },
                    {
                        "id": "expert-2",
                        "title": "Quality Guarantee",
                        "description": "100% satisfaction guarantee with unlimited revisions until you are completely happy with the results.",
                        "icon": "✅",
                        "order": 2
                    }
                ]
            }
        },
        {
            "id": "cta-service",
            "type": "cta",
            "order": 3,
            "data": {
                "headline": "Ready to Get Started?",
                "description": "Browse [service] experts or post your project to receive custom proposals",
                "button": {
                    "text": "Find [Service] Experts",
                    "url": "/freelancers/[category]",
                    "style": "primary",
                    "size": "medium"
                },
                "alignment": "center"
            }
        }
    ]'::jsonb,
    '{
        "theme": "service-focused",
        "customizable": true,
        "variables": {
            "service": "Service Name",
            "category": "category-slug"
        }
    }'::jsonb,
    '/templates/service-category-preview.jpg',
    ARRAY['service', 'category', 'experts', 'specialized'],
    'technology',
    '00000000-0000-0000-0000-000000000001'
),

-- 4. Pricing Page Template
(
    uuid_generate_v4(),
    'Pricing & Plans Page',
    'pricing-plans',
    'Comprehensive pricing page with feature comparisons and FAQ section',
    'pricing',
    'page',
    '[
        {
            "id": "hero-pricing",
            "type": "hero",
            "order": 1,
            "data": {
                "headline": "Simple, Transparent Pricing",
                "subheadline": "Choose the Plan That Fits Your Business",
                "description": "No hidden fees, no setup costs. Only pay for what you need.",
                "alignment": "center"
            }
        },
        {
            "id": "pricing-text",
            "type": "text",
            "order": 2,
            "data": {
                "content": "<div class=\"max-w-4xl mx-auto\"><h2 class=\"text-2xl font-bold text-center mb-8\">Flexible Pricing Options</h2><div class=\"grid md:grid-cols-3 gap-8 mb-12\"><div class=\"bg-white p-8 rounded-lg shadow border\"><h3 class=\"text-xl font-semibold mb-4\">Starter</h3><div class=\"text-3xl font-bold mb-4\">Free</div><ul class=\"space-y-2 mb-6\"><li>✓ Browse freelancers</li><li>✓ Basic messaging</li><li>✓ 5% platform fee</li></ul><button class=\"w-full bg-gray-600 text-white py-2 px-4 rounded\">Get Started</button></div><div class=\"bg-blue-50 p-8 rounded-lg shadow border-2 border-blue-500\"><h3 class=\"text-xl font-semibold mb-4\">Professional</h3><div class=\"text-3xl font-bold mb-4\">$29<span class=\"text-sm font-normal\">/month</span></div><ul class=\"space-y-2 mb-6\"><li>✓ Everything in Starter</li><li>✓ Priority support</li><li>✓ 3% platform fee</li><li>✓ Advanced project tools</li></ul><button class=\"w-full bg-blue-600 text-white py-2 px-4 rounded\">Start Trial</button></div><div class=\"bg-white p-8 rounded-lg shadow border\"><h3 class=\"text-xl font-semibold mb-4\">Enterprise</h3><div class=\"text-3xl font-bold mb-4\">Custom</div><ul class=\"space-y-2 mb-6\"><li>✓ Everything in Professional</li><li>✓ Dedicated account manager</li><li>✓ Custom integrations</li><li>✓ Volume discounts</li></ul><button class=\"w-full bg-gray-600 text-white py-2 px-4 rounded\">Contact Sales</button></div></div></div>",
                "format": "html",
                "alignment": "center"
            }
        },
        {
            "id": "pricing-faq",
            "type": "faq",
            "order": 3,
            "data": {
                "title": "Frequently Asked Questions",
                "layout": "accordion",
                "faqs": [
                    {
                        "id": "faq-1",
                        "question": "How does the platform fee work?",
                        "answer": "Our platform fee is a small percentage of the project total that covers payment processing, dispute resolution, and platform maintenance.",
                        "order": 1
                    },
                    {
                        "id": "faq-2",
                        "question": "Can I cancel my subscription anytime?",
                        "answer": "Yes, you can cancel your subscription at any time. Your account will remain active until the end of your current billing period.",
                        "order": 2
                    },
                    {
                        "id": "faq-3",
                        "question": "Do you offer refunds?",
                        "answer": "We offer a 30-day money-back guarantee for all paid plans if you are not satisfied with our service.",
                        "order": 3
                    }
                ]
            }
        }
    ]'::jsonb,
    '{
        "theme": "pricing",
        "colors": {
            "primary": "#2563eb",
            "secondary": "#64748b"
        }
    }'::jsonb,
    '/templates/pricing-preview.jpg',
    ARRAY['pricing', 'plans', 'comparison', 'faq'],
    'business',
    '00000000-0000-0000-0000-000000000001'
),

-- 5. About/Company Page Template
(
    uuid_generate_v4(),
    'About Company Page',
    'about-company',
    'Professional about page with team showcase, mission, and company values',
    'company',
    'page',
    '[
        {
            "id": "hero-about",
            "type": "hero",
            "order": 1,
            "data": {
                "headline": "Building the Future of Work",
                "subheadline": "Connecting Businesses with World-Class Talent",
                "description": "Our mission is to democratize access to expert talent and help businesses grow without traditional hiring constraints.",
                "alignment": "center"
            }
        },
        {
            "id": "company-story",
            "type": "text",
            "order": 2,
            "data": {
                "content": "<div class=\"max-w-4xl mx-auto\"><h2 class=\"text-3xl font-bold text-center mb-8\">Our Story</h2><p class=\"text-lg text-gray-700 mb-6\">Founded in 2024, 10xGrowth was born from a simple observation: talented freelancers and growing businesses were struggling to find each other efficiently. Traditional hiring was too slow and expensive for project-based work, while freelancers faced challenges proving their worth to new clients.</p><p class=\"text-lg text-gray-700 mb-6\">We built 10xGrowth to solve these problems with intelligent matching, comprehensive vetting, and tools that make remote collaboration seamless. Today, we are proud to facilitate thousands of successful projects and help businesses scale without limits.</p></div>",
                "format": "html",
                "alignment": "center"
            }
        },
        {
            "id": "company-values",
            "type": "features",
            "order": 3,
            "data": {
                "title": "Our Values",
                "layout": "grid",
                "columns": 3,
                "features": [
                    {
                        "id": "value-1",
                        "title": "Quality First",
                        "description": "We believe in maintaining the highest standards for both freelancers and clients on our platform.",
                        "icon": "⭐",
                        "order": 1
                    },
                    {
                        "id": "value-2",
                        "title": "Transparency",
                        "description": "Clear communication, honest pricing, and transparent processes are at the core of everything we do.",
                        "icon": "🔍",
                        "order": 2
                    },
                    {
                        "id": "value-3",
                        "title": "Global Impact",
                        "description": "We are creating opportunities for talent worldwide while helping businesses access the best skills regardless of location.",
                        "icon": "🌍",
                        "order": 3
                    }
                ]
            }
        },
        {
            "id": "team-section",
            "type": "team",
            "order": 4,
            "data": {
                "title": "Meet Our Team",
                "subtitle": "The people behind 10xGrowth",
                "layout": "grid",
                "columns": 3,
                "members": [
                    {
                        "id": "member-1",
                        "name": "Sarah Johnson",
                        "title": "CEO & Co-Founder",
                        "bio": "Former consultant with 10+ years helping businesses scale operations.",
                        "avatar": "/images/team-sarah.jpg",
                        "social": {
                            "linkedin": "https://linkedin.com/in/sarahjohnson"
                        },
                        "order": 1
                    },
                    {
                        "id": "member-2",
                        "name": "Michael Chen",
                        "title": "CTO & Co-Founder",
                        "bio": "Tech veteran with experience building scalable platforms at top companies.",
                        "avatar": "/images/team-michael.jpg",
                        "social": {
                            "linkedin": "https://linkedin.com/in/michaelchen"
                        },
                        "order": 2
                    },
                    {
                        "id": "member-3",
                        "name": "Priya Sharma",
                        "title": "Head of Growth",
                        "bio": "Growth strategist focused on connecting businesses with the right talent.",
                        "avatar": "/images/team-priya.jpg",
                        "social": {
                            "linkedin": "https://linkedin.com/in/priyasharma"
                        },
                        "order": 3
                    }
                ]
            }
        }
    ]'::jsonb,
    '{
        "theme": "corporate",
        "colors": {
            "primary": "#1e40af",
            "secondary": "#64748b"
        }
    }'::jsonb,
    '/templates/about-preview.jpg',
    ARRAY['about', 'company', 'team', 'values', 'story'],
    'business',
    '00000000-0000-0000-0000-000000000001'
);

-- Success message
SELECT 'Enhanced business templates have been successfully created!' as message;