-- SaSarjan CMS Schema
-- Created: 07-Jul-2025, Monday 14:30 IST
-- Purpose: Add CMS functionality for multiple landing pages

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CMS Pages table
CREATE TABLE cms_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'landing', -- landing, about, pricing, features, etc.
    template VARCHAR(50) NOT NULL DEFAULT 'default',
    status VARCHAR(20) DEFAULT 'draft', -- draft, review, scheduled, published, archived, unpublished
    visibility VARCHAR(20) DEFAULT 'public', -- public, unlisted, private, password_protected, members_only
    
    -- Content structure
    blocks JSONB DEFAULT '[]'::jsonb, -- Array of content blocks
    
    -- SEO and Metadata
    seo JSONB DEFAULT '{}'::jsonb,
    
    -- Authorship
    created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    last_edited_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    
    -- Organization
    app_id VARCHAR(50) NOT NULL DEFAULT '10xgrowth', -- Which app this page belongs to
    organization_id UUID, -- For multi-tenant support
    parent_page_id UUID REFERENCES cms_pages(id) ON DELETE SET NULL,
    
    -- Categorization
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Publishing
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Versioning
    version VARCHAR(20) DEFAULT '1.0',
    versions JSONB DEFAULT '[]'::jsonb,
    
    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,
    
    -- Localization
    language VARCHAR(10) DEFAULT 'en',
    translations JSONB DEFAULT '[]'::jsonb,
    
    -- Performance
    cache_settings JSONB DEFAULT '{"enabled": true, "ttl": 3600, "varyByUser": false, "varyByDevice": false}'::jsonb,
    
    -- A/B Testing
    experiments JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    UNIQUE(slug, app_id), -- Unique slug per app
    CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived', 'unpublished')),
    CHECK (visibility IN ('public', 'unlisted', 'private', 'password_protected', 'members_only'))
);

-- Page Analytics table
CREATE TABLE page_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES cms_pages(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    average_time_on_page INTEGER DEFAULT 0, -- seconds
    conversion_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    
    -- Referrer data
    top_referrers JSONB DEFAULT '[]'::jsonb,
    top_countries JSONB DEFAULT '[]'::jsonb,
    
    -- Device breakdown
    device_breakdown JSONB DEFAULT '{"mobile": 0, "tablet": 0, "desktop": 0}'::jsonb,
    
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CMS Templates table
CREATE TABLE cms_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100), -- business, marketing, portfolio, etc.
    type VARCHAR(50) DEFAULT 'page', -- page, blog, landing
    
    -- Template content
    blocks JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    
    -- Template metadata
    preview_image TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    industry VARCHAR(100), -- tech, healthcare, finance, etc.
    
    -- Versioning
    version VARCHAR(20) DEFAULT '1.0',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, archived
    is_premium BOOLEAN DEFAULT false,
    
    -- Usage stats
    usage_count INTEGER DEFAULT 0,
    
    -- Authorship
    created_by UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Custom fields
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Navigation table
CREATE TABLE cms_navigation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(50) NOT NULL, -- primary, secondary, footer, sidebar, custom
    items JSONB DEFAULT '[]'::jsonb,
    app_id VARCHAR(50) NOT NULL DEFAULT '10xgrowth',
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(location, app_id)
);

-- Form Submissions table
CREATE TABLE cms_form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id VARCHAR(255) NOT NULL,
    page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    user_agent TEXT,
    ip_address INET,
    referer TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'new', -- new, read, processed, spam
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Revisions table
CREATE TABLE cms_content_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- page, template
    entity_id UUID NOT NULL,
    version VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,
    changelog TEXT,
    created_by UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Media Library table
CREATE TABLE cms_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL, -- in bytes
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    caption TEXT,
    description TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Media metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- width, height, duration, etc.
    
    -- Organization
    app_id VARCHAR(50) NOT NULL DEFAULT '10xgrowth',
    uploaded_by UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
    
    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_pages_status ON cms_pages(status);
CREATE INDEX idx_cms_pages_app_id ON cms_pages(app_id);
CREATE INDEX idx_cms_pages_created_by ON cms_pages(created_by);
CREATE INDEX idx_cms_pages_published_at ON cms_pages(published_at);
CREATE INDEX idx_cms_pages_type ON cms_pages(type);

CREATE INDEX idx_page_analytics_page_id ON page_analytics(page_id);

CREATE INDEX idx_cms_templates_slug ON cms_templates(slug);
CREATE INDEX idx_cms_templates_category ON cms_templates(category);
CREATE INDEX idx_cms_templates_status ON cms_templates(status);

CREATE INDEX idx_cms_navigation_app_id ON cms_navigation(app_id);
CREATE INDEX idx_cms_navigation_location ON cms_navigation(location);

CREATE INDEX idx_cms_form_submissions_page_id ON cms_form_submissions(page_id);
CREATE INDEX idx_cms_form_submissions_status ON cms_form_submissions(status);
CREATE INDEX idx_cms_form_submissions_form_id ON cms_form_submissions(form_id);

CREATE INDEX idx_cms_content_revisions_entity_id ON cms_content_revisions(entity_id);
CREATE INDEX idx_cms_content_revisions_entity_type ON cms_content_revisions(entity_type);

CREATE INDEX idx_cms_media_app_id ON cms_media(app_id);
CREATE INDEX idx_cms_media_uploaded_by ON cms_media(uploaded_by);
CREATE INDEX idx_cms_media_mime_type ON cms_media(mime_type);

-- Row Level Security (RLS) policies
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;

-- Admin access policies (super admin and app admins can manage their app's content)
CREATE POLICY "Admin can manage cms_pages" ON cms_pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.status = 'active'
            AND (
                admin_users.role = 'super_admin' 
                OR (admin_users.role = 'admin' AND cms_pages.app_id IN (
                    SELECT app_id FROM admin_users au2 WHERE au2.id = auth.uid()
                ))
            )
        )
    );

-- Public read access for published pages
CREATE POLICY "Public can view published pages" ON cms_pages
    FOR SELECT USING (status = 'published' AND visibility = 'public');

-- Admin can view page analytics
CREATE POLICY "Admin can view analytics" ON page_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.status = 'active'
        )
    );

-- Public can view active templates
CREATE POLICY "Public can view templates" ON cms_templates
    FOR SELECT USING (status = 'active');

-- Admin can manage templates
CREATE POLICY "Admin can manage templates" ON cms_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.status = 'active'
        )
    );

-- Public can view navigation
CREATE POLICY "Public can view navigation" ON cms_navigation
    FOR SELECT USING (is_active = true);

-- Admin can manage navigation
CREATE POLICY "Admin can manage navigation" ON cms_navigation
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.status = 'active'
        )
    );

-- Admin can view form submissions
CREATE POLICY "Admin can view form submissions" ON cms_form_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.status = 'active'
        )
    );

-- Admin can manage content revisions
CREATE POLICY "Admin can manage revisions" ON cms_content_revisions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.status = 'active'
        )
    );

-- Admin can manage media
CREATE POLICY "Admin can manage media" ON cms_media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.status = 'active'
        )
    );

-- Add updated_at triggers
CREATE TRIGGER update_cms_pages_updated_at BEFORE UPDATE ON cms_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_analytics_updated_at BEFORE UPDATE ON page_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_templates_updated_at BEFORE UPDATE ON cms_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_navigation_updated_at BEFORE UPDATE ON cms_navigation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_form_submissions_updated_at BEFORE UPDATE ON cms_form_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_media_updated_at BEFORE UPDATE ON cms_media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a default super admin if not exists
INSERT INTO admin_users (id, email, full_name, role, permissions, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@sasarjan.com',
    'System Administrator',
    'super_admin',
    ARRAY['read', 'write', 'delete', 'publish'],
    'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert default 10xgrowth business templates
INSERT INTO cms_templates (id, name, slug, description, category, type, blocks, settings, preview_image, tags, industry, created_by) VALUES
(
    uuid_generate_v4(),
    'B2B Growth Landing Page',
    'b2b-growth-landing',
    'Professional landing page template for B2B growth services and freelancer marketplaces',
    'business',
    'landing',
    '[
        {
            "id": "hero-1",
            "type": "hero",
            "order": 1,
            "data": {
                "headline": "Scale Your Business with Top Freelancers",
                "subheadline": "Join 10X Growth Platform",
                "description": "Connect with skilled professionals who can accelerate your business growth. From development to marketing, find the perfect freelancer for your next project.",
                "ctaPrimary": {
                    "text": "Find Freelancers",
                    "url": "/browse",
                    "style": "primary"
                },
                "ctaSecondary": {
                    "text": "Post a Project",
                    "url": "/post-project",
                    "style": "secondary"
                },
                "alignment": "center"
            }
        },
        {
            "id": "features-1",
            "type": "features",
            "order": 2,
            "data": {
                "title": "Why Choose 10X Growth?",
                "subtitle": "Everything you need to scale your business",
                "layout": "grid",
                "columns": 3,
                "features": [
                    {
                        "id": "feat-1",
                        "title": "Vetted Professionals",
                        "description": "All freelancers are thoroughly vetted for skills and reliability",
                        "icon": "shield-check",
                        "order": 1
                    },
                    {
                        "id": "feat-2",
                        "title": "Quick Matching",
                        "description": "Find the right freelancer for your project in minutes, not days",
                        "icon": "zap",
                        "order": 2
                    },
                    {
                        "id": "feat-3",
                        "title": "Secure Payments",
                        "description": "Protected payments with milestone-based releases",
                        "icon": "lock",
                        "order": 3
                    }
                ]
            }
        },
        {
            "id": "cta-1",
            "type": "cta",
            "order": 3,
            "data": {
                "headline": "Ready to Scale Your Business?",
                "description": "Join thousands of companies already growing with our platform",
                "button": {
                    "text": "Get Started Today",
                    "url": "/signup",
                    "style": "primary",
                    "size": "large"
                },
                "alignment": "center"
            }
        }
    ]'::jsonb,
    '{
        "theme": "professional",
        "colors": {
            "primary": "#2563eb",
            "secondary": "#64748b"
        },
        "typography": {
            "headingFont": "Inter",
            "bodyFont": "Inter"
        }
    }'::jsonb,
    '/templates/b2b-growth-preview.jpg',
    ARRAY['b2b', 'growth', 'freelancer', 'professional'],
    'technology',
    '00000000-0000-0000-0000-000000000001'
),
(
    uuid_generate_v4(),
    'Service Categories Showcase',
    'service-categories-showcase',
    'Showcase different service categories available on your platform',
    'business',
    'page',
    '[
        {
            "id": "hero-2",
            "type": "hero",
            "order": 1,
            "data": {
                "headline": "Professional Services for Every Need",
                "description": "Explore our comprehensive range of services from expert freelancers",
                "alignment": "center"
            }
        },
        {
            "id": "prosperity-cats-1",
            "type": "prosperity_categories",
            "order": 2,
            "data": {
                "title": "Browse by Category",
                "layout": "grid",
                "columns": 4,
                "showDescriptions": true,
                "showIcons": true
            }
        }
    ]'::jsonb,
    '{
        "theme": "modern",
        "layout": "full-width"
    }'::jsonb,
    '/templates/categories-preview.jpg',
    ARRAY['categories', 'services', 'showcase'],
    'technology',
    '00000000-0000-0000-0000-000000000001'
);

-- Success message
SELECT 'CMS schema has been successfully created with business templates!' as message;