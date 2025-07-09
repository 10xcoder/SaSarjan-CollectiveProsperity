-- Quick test to create the missing pages directly
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
    gen_random_uuid(),
    'Scale Your Business with Expert Freelancers',
    'business-growth',
    'Connect with top-tier freelancers to accelerate your business growth',
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
                "description": "Access a global network of verified professionals who can help you achieve 10X growth.",
                "ctaPrimary": {
                    "text": "Browse Freelancers",
                    "url": "/browse"
                },
                "alignment": "center"
            }
        }
    ]'::jsonb,
    '{}'::jsonb,
    '{
        "title": "Scale Your Business with Expert Freelancers | 10xGrowth",
        "description": "Connect with top-tier freelancers to accelerate your business growth"
    }'::jsonb,
    NOW(),
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (slug, app_id) DO UPDATE SET
    status = 'published',
    visibility = 'public',
    updated_at = NOW();

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
    gen_random_uuid(),
    'Join 10xGrowth as a Freelancer',
    'join-freelancers',
    'Start earning with the best clients',
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
                "description": "Connect with premium clients and work on exciting projects",
                "ctaPrimary": {
                    "text": "Apply as Freelancer",
                    "url": "/freelancer/apply"
                },
                "alignment": "center"
            }
        }
    ]'::jsonb,
    '{}'::jsonb,
    '{
        "title": "Join 10xGrowth as a Freelancer | Premium Opportunities",
        "description": "Start earning with the best clients"
    }'::jsonb,
    NOW(),
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (slug, app_id) DO UPDATE SET
    status = 'published',
    visibility = 'public',
    updated_at = NOW();

SELECT 'CMS pages created/updated successfully!' as message;