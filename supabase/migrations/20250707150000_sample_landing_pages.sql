-- Sample Landing Pages for Testing
-- Created: 07-Jul-2025, Monday 15:45 IST

-- Create admin users table if it doesn't exist (it should from profile system migration)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a super admin user
INSERT INTO admin_users (id, email, full_name, role, status, created_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@10xgrowth.com',
    'Super Admin',
    'super_admin',
    'active',
    NOW()
) ON CONFLICT (email) DO UPDATE SET 
    status = 'active',
    role = 'super_admin';

-- Sample Landing Page 1: Business Growth Landing
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
    created_by,
    created_at,
    updated_at
) VALUES (
    '10000000-1111-2222-3333-444444444444',
    'Scale Your Business with Expert Freelancers',
    'business-growth',
    'Connect with top-tier freelancers to accelerate your business growth and achieve 10X results',
    'landing',
    'business',
    'published',
    'public',
    '10xgrowth',
    '[
        {
            "id": "hero_1",
            "type": "hero",
            "order": 0,
            "data": {
                "headline": "Scale Your Business with Expert Freelancers",
                "subheadline": "Connect with Top Talent Worldwide",
                "description": "Access a global network of verified professionals who can help you achieve 10X growth. From development to marketing, find the perfect freelancer for your project.",
                "ctaPrimary": {
                    "text": "Browse Freelancers",
                    "url": "/browse"
                },
                "ctaSecondary": {
                    "text": "Post a Project",
                    "url": "/post-project"
                },
                "alignment": "center",
                "backgroundImage": ""
            }
        },
        {
            "id": "features_1", 
            "type": "features",
            "order": 1,
            "data": {
                "title": "Why Choose 10xGrowth",
                "subtitle": "The platform that connects ambition with expertise",
                "columns": 3,
                "features": [
                    {
                        "id": "f1",
                        "title": "Verified Professionals",
                        "description": "All freelancers are thoroughly vetted with proven track records and verified skills.",
                        "icon": "✅"
                    },
                    {
                        "id": "f2",
                        "title": "Secure Payments",
                        "description": "Protected payment system with milestone-based releases and dispute resolution.",
                        "icon": "🔒"
                    },
                    {
                        "id": "f3",
                        "title": "Quality Guarantee",
                        "description": "100% satisfaction guarantee with dedicated support throughout your project.",
                        "icon": "🏆"
                    }
                ]
            }
        },
        {
            "id": "stats_1",
            "type": "stats", 
            "order": 2,
            "data": {
                "title": "Trusted by Thousands",
                "stats": [
                    {
                        "id": "s1",
                        "value": "10000",
                        "suffix": "+",
                        "label": "Projects Completed",
                        "icon": "📊"
                    },
                    {
                        "id": "s2",
                        "value": "5000",
                        "suffix": "+", 
                        "label": "Active Freelancers",
                        "icon": "👥"
                    },
                    {
                        "id": "s3",
                        "value": "98",
                        "suffix": "%",
                        "label": "Success Rate",
                        "icon": "⭐"
                    },
                    {
                        "id": "s4",
                        "value": "24",
                        "suffix": "h",
                        "label": "Avg. Response Time",
                        "icon": "⚡"
                    }
                ]
            }
        },
        {
            "id": "testimonials_1",
            "type": "testimonials",
            "order": 3,
            "data": {
                "title": "What Our Clients Say",
                "testimonials": [
                    {
                        "id": "t1",
                        "quote": "10xGrowth helped us find the perfect developer for our startup. The quality of work exceeded our expectations and we launched 2 months ahead of schedule!",
                        "author": {
                            "name": "Sarah Johnson",
                            "title": "CEO",
                            "company": "TechStart Inc.",
                            "avatar": "https://via.placeholder.com/80/0066CC/FFFFFF?text=SJ"
                        },
                        "rating": 5
                    },
                    {
                        "id": "t2", 
                        "quote": "As a freelancer, this platform has connected me with amazing clients. The payment protection and project management tools are top-notch.",
                        "author": {
                            "name": "Rahul Sharma",
                            "title": "Full Stack Developer",
                            "company": "Independent",
                            "avatar": "https://via.placeholder.com/80/CC6600/FFFFFF?text=RS"
                        },
                        "rating": 5
                    },
                    {
                        "id": "t3",
                        "quote": "We''ve completed over 50 projects through 10xGrowth. The talent pool is incredible and the platform makes collaboration seamless.",
                        "author": {
                            "name": "Emily Chen",
                            "title": "Marketing Director", 
                            "company": "Growth Labs",
                            "avatar": "https://via.placeholder.com/80/CC0066/FFFFFF?text=EC"
                        },
                        "rating": 5
                    }
                ]
            }
        },
        {
            "id": "cta_1",
            "type": "cta",
            "order": 4,
            "data": {
                "headline": "Ready to 10X Your Business?",
                "description": "Join thousands of successful companies who have achieved remarkable growth with our platform. Start your project today!",
                "button": {
                    "text": "Get Started Now",
                    "url": "/get-started",
                    "style": "primary",
                    "size": "large"
                },
                "alignment": "center",
                "backgroundColor": "#1e40af",
                "textColor": "#ffffff"
            }
        }
    ]',
    '{"theme": "business", "headerStyle": "modern", "fontFamily": "Inter"}',
    '{
        "title": "Scale Your Business with Expert Freelancers | 10xGrowth",
        "description": "Connect with top-tier freelancers to accelerate your business growth. Verified professionals, secure payments, and quality guarantee. Start your project today!",
        "keywords": ["freelancers", "business growth", "remote work", "project management", "startup"],
        "ogTitle": "Scale Your Business with Expert Freelancers",
        "ogDescription": "Access a global network of verified professionals who can help you achieve 10X growth",
        "ogImage": "https://10xgrowth.com/images/og-business-growth.jpg",
        "twitterCard": "summary_large_image",
        "canonical": "https://10xgrowth.com/business-growth"
    }',
    NOW(),
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
),

-- Sample Landing Page 2: Freelancer Onboarding
(
    '20000000-1111-2222-3333-444444444444', 
    'Join 10xGrowth as a Freelancer',
    'join-freelancers',
    'Start earning with the best clients. Join our exclusive network of top freelancers and get access to high-quality projects.',
    'landing',
    'freelancer',
    'published',
    'public',
    '10xgrowth',
    '[
        {
            "id": "hero_2",
            "type": "hero",
            "order": 0,
            "data": {
                "headline": "Turn Your Skills into Success",
                "subheadline": "Join 10xGrowth Freelancer Network",
                "description": "Connect with premium clients, work on exciting projects, and build your career with our exclusive freelancer platform.",
                "ctaPrimary": {
                    "text": "Apply as Freelancer",
                    "url": "/freelancer/apply"
                },
                "ctaSecondary": {
                    "text": "View Success Stories",
                    "url": "/success-stories"
                },
                "alignment": "center"
            }
        },
        {
            "id": "features_2",
            "type": "features", 
            "order": 1,
            "data": {
                "title": "Freelancer Benefits",
                "subtitle": "Everything you need to succeed",
                "columns": 3,
                "features": [
                    {
                        "id": "f1",
                        "title": "Premium Clients",
                        "description": "Work with verified businesses and startups that value quality work.",
                        "icon": "💼"
                    },
                    {
                        "id": "f2",
                        "title": "Fair Pricing", 
                        "description": "Set your own rates and get paid what you''re worth. No lowball offers.",
                        "icon": "💰"
                    },
                    {
                        "id": "f3",
                        "title": "Growth Support",
                        "description": "Access training, mentorship, and tools to advance your career.",
                        "icon": "📈"
                    }
                ]
            }
        },
        {
            "id": "stats_2",
            "type": "stats",
            "order": 2, 
            "data": {
                "title": "Freelancer Success Metrics",
                "stats": [
                    {
                        "id": "s1",
                        "value": "₹75000",
                        "suffix": "",
                        "label": "Average Monthly Earnings",
                        "icon": "💸"
                    },
                    {
                        "id": "s2",
                        "value": "4.9",
                        "suffix": "/5",
                        "label": "Average Client Rating",
                        "icon": "⭐"
                    },
                    {
                        "id": "s3",
                        "value": "85",
                        "suffix": "%",
                        "label": "Get Repeat Clients",
                        "icon": "🔄"
                    }
                ]
            }
        },
        {
            "id": "cta_2",
            "type": "cta",
            "order": 3,
            "data": {
                "headline": "Ready to Start Your Freelance Journey?",
                "description": "Join thousands of successful freelancers who have built thriving careers on our platform.",
                "button": {
                    "text": "Apply Now",
                    "url": "/freelancer/apply",
                    "style": "primary",
                    "size": "large"
                },
                "alignment": "center",
                "backgroundColor": "#059669",
                "textColor": "#ffffff"
            }
        }
    ]',
    '{"theme": "freelancer", "headerStyle": "clean", "fontFamily": "Poppins"}',
    '{
        "title": "Join 10xGrowth as a Freelancer | Premium Opportunities",
        "description": "Start earning with the best clients. Join our exclusive network of top freelancers and get access to high-quality projects with fair pricing.",
        "keywords": ["freelancer jobs", "remote work", "freelance opportunities", "work from home", "skill monetization"],
        "ogTitle": "Join 10xGrowth Freelancer Network",
        "ogDescription": "Turn your skills into success with premium clients and high-quality projects",
        "canonical": "https://10xgrowth.com/join-freelancers"
    }',
    NOW(),
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
),

-- Sample Landing Page 3: About Us
(
    '30000000-1111-2222-3333-444444444444',
    'About 10xGrowth - Connecting Talent with Opportunity', 
    'about',
    'Learn about our mission to democratize access to global talent and help businesses achieve extraordinary growth.',
    'about',
    'company',
    'published',
    'public',
    '10xgrowth',
    '[
        {
            "id": "hero_3",
            "type": "hero",
            "order": 0,
            "data": {
                "headline": "Building the Future of Work",
                "subheadline": "Connecting Talent with Opportunity Worldwide",
                "description": "We believe that great work can happen anywhere. Our mission is to create a world where talent has no borders and opportunities are accessible to all.",
                "alignment": "center"
            }
        },
        {
            "id": "text_1",
            "type": "text",
            "order": 1,
            "data": {
                "content": "<div class=\"max-w-4xl mx-auto\"><h2 class=\"text-3xl font-bold mb-6 text-center\">Our Story</h2><p class=\"text-lg mb-6\">Founded in 2024, 10xGrowth emerged from a simple yet powerful vision: to democratize access to global talent and help businesses achieve extraordinary growth through the power of skilled freelancers.</p><p class=\"text-lg mb-6\">What started as a platform to connect businesses with freelancers has evolved into a comprehensive ecosystem that nurtures talent, facilitates meaningful work relationships, and drives innovation across industries.</p><p class=\"text-lg mb-6\">Today, we''re proud to serve thousands of businesses and freelancers worldwide, creating opportunities that transcend geographical boundaries and traditional employment models.</p></div>",
                "alignment": "left"
            }
        },
        {
            "id": "stats_3",
            "type": "stats",
            "order": 2,
            "data": {
                "title": "Our Impact in Numbers",
                "stats": [
                    {
                        "id": "s1", 
                        "value": "50",
                        "suffix": "+",
                        "label": "Countries Represented"
                    },
                    {
                        "id": "s2",
                        "value": "1M",
                        "suffix": "+", 
                        "label": "Hours of Work Completed"
                    },
                    {
                        "id": "s3",
                        "value": "₹100Cr",
                        "suffix": "+",
                        "label": "Freelancer Earnings"
                    },
                    {
                        "id": "s4",
                        "value": "99.2",
                        "suffix": "%",
                        "label": "Platform Uptime"
                    }
                ]
            }
        },
        {
            "id": "team_1",
            "type": "team",
            "order": 3,
            "data": {
                "title": "Meet Our Leadership Team",
                "subtitle": "Passionate individuals driving our mission forward",
                "columns": 3,
                "members": [
                    {
                        "id": "m1",
                        "name": "Arjun Patel",
                        "title": "Chief Executive Officer",
                        "bio": "Visionary leader with 15+ years of experience building global platforms that connect talent with opportunity.",
                        "avatar": "https://via.placeholder.com/150/0066CC/FFFFFF?text=AP",
                        "social": {
                            "linkedin": "https://linkedin.com/in/arjunpatel",
                            "twitter": "https://twitter.com/arjunpatel"
                        }
                    },
                    {
                        "id": "m2",
                        "name": "Priya Sharma",
                        "title": "Chief Technology Officer", 
                        "bio": "Technology innovator passionate about creating seamless experiences that empower remote work.",
                        "avatar": "https://via.placeholder.com/150/CC6600/FFFFFF?text=PS",
                        "social": {
                            "linkedin": "https://linkedin.com/in/priyasharma"
                        }
                    },
                    {
                        "id": "m3",
                        "name": "Vikram Singh",
                        "title": "Head of Community",
                        "bio": "Community builder focused on fostering meaningful connections between freelancers and businesses.",
                        "avatar": "https://via.placeholder.com/150/CC0066/FFFFFF?text=VS",
                        "social": {
                            "linkedin": "https://linkedin.com/in/vikramsingh"
                        }
                    }
                ]
            }
        }
    ]',
    '{"theme": "corporate", "headerStyle": "professional", "fontFamily": "Inter"}',
    '{
        "title": "About 10xGrowth - Connecting Talent with Opportunity",
        "description": "Learn about our mission to democratize access to global talent and help businesses achieve extraordinary growth through skilled freelancers.",
        "keywords": ["about 10xgrowth", "company story", "remote work", "global talent", "freelance platform"],
        "canonical": "https://10xgrowth.com/about"
    }',
    NOW(),
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
);

-- Insert some initial analytics data for testing
INSERT INTO page_analytics (page_id, views, unique_views, bounce_rate, average_time_on_page)
VALUES 
    ('10000000-1111-2222-3333-444444444444', 150, 120, 35.5, 180),
    ('20000000-1111-2222-3333-444444444444', 95, 82, 28.3, 210),
    ('30000000-1111-2222-3333-444444444444', 45, 38, 22.1, 240);

-- Success message
SELECT 'Sample landing pages created successfully!' as message,
       'business-growth' as page1_slug,
       'join-freelancers' as page2_slug, 
       'about' as page3_slug;