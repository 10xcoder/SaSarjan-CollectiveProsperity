-- Seed landing pages for 10xGrowth app
-- This script creates the essential landing pages for the 10xGrowth freelancer marketplace

-- Home page
INSERT INTO cms_pages (
    id,
    title,
    slug,
    description,
    type,
    template,
    status,
    visibility,
    app_id,
    blocks,
    settings,
    seo,
    published_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '10xGrowth - Scale Your Business with Expert Freelancers',
    'home',
    'Connect with top-tier freelancers to accelerate your business growth',
    'landing',
    'home',
    'published',
    'public',
    '10xgrowth',
    '[
        {
            "id": "hero_home",
            "type": "hero",
            "order": 0,
            "data": {
                "headline": "Scale Your Business 10X with Expert Freelancers",
                "subheadline": "Connect with Top 1% Talent Worldwide",
                "description": "Access a curated network of verified professionals who can help you achieve exponential growth. From developers to designers, marketers to consultants.",
                "ctaPrimary": {
                    "text": "Find Freelancers",
                    "url": "/browse"
                },
                "ctaSecondary": {
                    "text": "Join as Freelancer",
                    "url": "/join-freelancers"
                },
                "backgroundImage": "/images/hero-bg.jpg",
                "alignment": "center"
            }
        },
        {
            "id": "stats_home",
            "type": "stats",
            "order": 1,
            "data": {
                "headline": "Trusted by Growth-Focused Companies",
                "stats": [
                    {
                        "label": "Active Freelancers",
                        "value": "50,000+",
                        "icon": "users"
                    },
                    {
                        "label": "Projects Completed",
                        "value": "100,000+",
                        "icon": "briefcase"
                    },
                    {
                        "label": "Client Satisfaction",
                        "value": "98%",
                        "icon": "star"
                    },
                    {
                        "label": "Average Project Value",
                        "value": "$5,000",
                        "icon": "dollar"
                    }
                ]
            }
        },
        {
            "id": "features_home",
            "type": "features",
            "order": 2,
            "data": {
                "headline": "Why Choose 10xGrowth?",
                "subheadline": "Everything you need to scale your business",
                "features": [
                    {
                        "title": "Vetted Professionals",
                        "description": "Every freelancer is thoroughly vetted for skills, experience, and professionalism",
                        "icon": "shield-check"
                    },
                    {
                        "title": "Secure Payments",
                        "description": "Safe and secure payment processing with milestone-based releases",
                        "icon": "lock"
                    },
                    {
                        "title": "24/7 Support",
                        "description": "Dedicated support team to help you at every step of your journey",
                        "icon": "support"
                    },
                    {
                        "title": "Quality Guarantee",
                        "description": "100% satisfaction guarantee or your money back",
                        "icon": "badge-check"
                    }
                ],
                "layout": "grid"
            }
        },
        {
            "id": "cta_home",
            "type": "cta",
            "order": 3,
            "data": {
                "headline": "Ready to Scale Your Business?",
                "description": "Join thousands of companies achieving 10X growth with our freelancer network",
                "ctaPrimary": {
                    "text": "Get Started Free",
                    "url": "/register"
                },
                "backgroundColor": "primary",
                "textColor": "white"
            }
        }
    ]'::jsonb,
    '{
        "showHeader": true,
        "showFooter": true,
        "theme": "light"
    }'::jsonb,
    '{
        "title": "10xGrowth - Scale Your Business with Expert Freelancers",
        "description": "Connect with top-tier freelancers to accelerate your business growth. Find developers, designers, marketers, and consultants.",
        "keywords": ["freelancers", "business growth", "remote work", "talent marketplace", "10x growth"],
        "ogImage": "/images/og-home.jpg",
        "canonical": "https://10xgrowth.com"
    }'::jsonb,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (slug, app_id) DO UPDATE SET
    title = EXCLUDED.title,
    blocks = EXCLUDED.blocks,
    status = 'published',
    visibility = 'public',
    updated_at = NOW();

-- Join Freelancers page
INSERT INTO cms_pages (
    id,
    title,
    slug,
    description,
    type,
    template,
    status,
    visibility,
    app_id,
    blocks,
    settings,
    seo,
    published_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Join 10xGrowth as a Freelancer',
    'join-freelancers',
    'Start earning with premium clients on exciting projects',
    'landing',
    'freelancer',
    'published',
    'public',
    '10xgrowth',
    '[
        {
            "id": "hero_freelancer",
            "type": "hero",
            "order": 0,
            "data": {
                "headline": "Turn Your Skills into Success",
                "subheadline": "Join the 10xGrowth Freelancer Network",
                "description": "Work with premium clients, set your own rates, and build your dream career on your terms.",
                "ctaPrimary": {
                    "text": "Apply as Freelancer",
                    "url": "/freelancer/apply"
                },
                "backgroundImage": "/images/freelancer-hero.jpg",
                "alignment": "left"
            }
        },
        {
            "id": "features_freelancer",
            "type": "features",
            "order": 1,
            "data": {
                "headline": "Why Freelancers Love 10xGrowth",
                "subheadline": "Benefits that help you succeed",
                "features": [
                    {
                        "title": "Premium Clients",
                        "description": "Work with established companies that value quality and pay competitive rates",
                        "icon": "star"
                    },
                    {
                        "title": "Flexible Schedule",
                        "description": "Choose your projects and work on your own schedule from anywhere",
                        "icon": "clock"
                    },
                    {
                        "title": "Secure Payments",
                        "description": "Get paid on time, every time with our secure payment protection",
                        "icon": "shield"
                    },
                    {
                        "title": "Skill Development",
                        "description": "Access free courses and resources to enhance your skills",
                        "icon": "academic-cap"
                    },
                    {
                        "title": "Community Support",
                        "description": "Join a thriving community of professionals and grow together",
                        "icon": "users"
                    },
                    {
                        "title": "Career Growth",
                        "description": "Build your portfolio and reputation with high-quality projects",
                        "icon": "trending-up"
                    }
                ],
                "layout": "grid"
            }
        },
        {
            "id": "testimonials_freelancer",
            "type": "testimonials",
            "order": 2,
            "data": {
                "headline": "Success Stories from Our Freelancers",
                "testimonials": [
                    {
                        "name": "Sarah Johnson",
                        "role": "Full Stack Developer",
                        "content": "10xGrowth transformed my freelance career. I now work with amazing clients and earn 3x what I made before.",
                        "avatar": "/images/testimonial-1.jpg",
                        "rating": 5
                    },
                    {
                        "name": "Michael Chen",
                        "role": "UI/UX Designer",
                        "content": "The quality of projects on 10xGrowth is unmatched. I love the creative freedom and professional growth opportunities.",
                        "avatar": "/images/testimonial-2.jpg",
                        "rating": 5
                    },
                    {
                        "name": "Priya Patel",
                        "role": "Digital Marketing Expert",
                        "content": "Best platform for serious freelancers. Great clients, timely payments, and excellent support team.",
                        "avatar": "/images/testimonial-3.jpg",
                        "rating": 5
                    }
                ]
            }
        },
        {
            "id": "faq_freelancer",
            "type": "faq",
            "order": 3,
            "data": {
                "headline": "Frequently Asked Questions",
                "faqs": [
                    {
                        "question": "How do I get started?",
                        "answer": "Simply click ''Apply as Freelancer'', complete your profile, and our team will review your application within 48 hours."
                    },
                    {
                        "question": "What are the fees?",
                        "answer": "We charge a competitive 10% service fee on completed projects. No hidden fees or monthly subscriptions."
                    },
                    {
                        "question": "How do I get paid?",
                        "answer": "Payments are processed weekly via bank transfer, PayPal, or Payoneer. You choose your preferred method."
                    },
                    {
                        "question": "Can I work from anywhere?",
                        "answer": "Yes! 10xGrowth is a global platform. Work from anywhere with an internet connection."
                    }
                ]
            }
        },
        {
            "id": "cta_freelancer",
            "type": "cta",
            "order": 4,
            "data": {
                "headline": "Ready to Start Your Journey?",
                "description": "Join thousands of successful freelancers on 10xGrowth",
                "ctaPrimary": {
                    "text": "Apply Now - It''s Free",
                    "url": "/freelancer/apply"
                },
                "backgroundColor": "gradient",
                "textColor": "white"
            }
        }
    ]'::jsonb,
    '{
        "showHeader": true,
        "showFooter": true,
        "theme": "light"
    }'::jsonb,
    '{
        "title": "Join 10xGrowth as a Freelancer | Premium Freelance Opportunities",
        "description": "Start earning with premium clients on exciting projects. Join the 10xGrowth freelancer network today.",
        "keywords": ["freelance jobs", "freelancer platform", "remote work", "freelance opportunities", "work from home"],
        "ogImage": "/images/og-freelancer.jpg",
        "canonical": "https://10xgrowth.com/join-freelancers"
    }'::jsonb,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (slug, app_id) DO UPDATE SET
    title = EXCLUDED.title,
    blocks = EXCLUDED.blocks,
    status = 'published',
    visibility = 'public',
    updated_at = NOW();

-- For Businesses page
INSERT INTO cms_pages (
    id,
    title,
    slug,
    description,
    type,
    template,
    status,
    visibility,
    app_id,
    blocks,
    settings,
    seo,
    published_at,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Hire Expert Freelancers for Your Business',
    'for-businesses',
    'Find and hire top freelancers to scale your business faster',
    'landing',
    'business',
    'published',
    'public',
    '10xgrowth',
    '[
        {
            "id": "hero_business",
            "type": "hero",
            "order": 0,
            "data": {
                "headline": "Hire the Top 1% of Freelance Talent",
                "subheadline": "Scale Your Business Faster with Expert Professionals",
                "description": "Access pre-vetted freelancers across 100+ skills. From quick tasks to long-term projects, find the perfect match for your needs.",
                "ctaPrimary": {
                    "text": "Post a Project",
                    "url": "/post-project"
                },
                "ctaSecondary": {
                    "text": "Browse Talent",
                    "url": "/browse"
                },
                "backgroundImage": "/images/business-hero.jpg",
                "alignment": "center"
            }
        },
        {
            "id": "features_business",
            "type": "features",
            "order": 1,
            "data": {
                "headline": "Everything You Need to Succeed",
                "subheadline": "Built for businesses that want to scale",
                "features": [
                    {
                        "title": "Pre-Vetted Talent",
                        "description": "Save time with our rigorous vetting process. Only the top 1% make it through.",
                        "icon": "badge-check"
                    },
                    {
                        "title": "Quick Matching",
                        "description": "Get matched with perfect freelancers within 24 hours of posting your project.",
                        "icon": "lightning-bolt"
                    },
                    {
                        "title": "Flexible Engagement",
                        "description": "Hire for one-off projects, part-time, or full-time engagements.",
                        "icon": "adjustments"
                    },
                    {
                        "title": "Transparent Pricing",
                        "description": "No hidden fees. Pay only for the work done with clear, upfront pricing.",
                        "icon": "currency-dollar"
                    },
                    {
                        "title": "Project Management",
                        "description": "Built-in tools to manage projects, track progress, and collaborate effectively.",
                        "icon": "clipboard-list"
                    },
                    {
                        "title": "Dedicated Support",
                        "description": "Get help from our success team whenever you need it.",
                        "icon": "support"
                    }
                ],
                "layout": "grid"
            }
        },
        {
            "id": "stats_business",
            "type": "stats",
            "order": 2,
            "data": {
                "headline": "Trusted by Leading Companies",
                "stats": [
                    {
                        "label": "Businesses Served",
                        "value": "10,000+",
                        "icon": "office-building"
                    },
                    {
                        "label": "Success Rate",
                        "value": "95%",
                        "icon": "chart-bar"
                    },
                    {
                        "label": "Time Saved",
                        "value": "70%",
                        "icon": "clock"
                    },
                    {
                        "label": "Cost Reduction",
                        "value": "40%",
                        "icon": "trending-down"
                    }
                ]
            }
        },
        {
            "id": "cta_business",
            "type": "cta",
            "order": 3,
            "data": {
                "headline": "Ready to Scale Your Team?",
                "description": "Post your first project free and see the difference quality talent makes",
                "ctaPrimary": {
                    "text": "Post a Project Free",
                    "url": "/post-project"
                },
                "backgroundColor": "dark",
                "textColor": "white"
            }
        }
    ]'::jsonb,
    '{
        "showHeader": true,
        "showFooter": true,
        "theme": "light"
    }'::jsonb,
    '{
        "title": "Hire Expert Freelancers for Your Business | 10xGrowth",
        "description": "Find and hire top freelancers to scale your business faster. Access pre-vetted talent across 100+ skills.",
        "keywords": ["hire freelancers", "freelance talent", "business growth", "remote team", "outsourcing"],
        "ogImage": "/images/og-business.jpg",
        "canonical": "https://10xgrowth.com/for-businesses"
    }'::jsonb,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (slug, app_id) DO UPDATE SET
    title = EXCLUDED.title,
    blocks = EXCLUDED.blocks,
    status = 'published',
    visibility = 'public',
    updated_at = NOW();

-- Select all created pages to verify
SELECT 
    slug,
    title,
    status,
    visibility,
    app_id,
    created_at
FROM cms_pages 
WHERE app_id = '10xgrowth'
ORDER BY created_at DESC;