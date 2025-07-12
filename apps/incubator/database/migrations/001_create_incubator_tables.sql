-- Incubator.in Database Schema
-- Created: 2025-07-12
-- Purpose: Core tables for incubator discovery and matching platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core incubators table
CREATE TABLE incubators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  
  -- Location data (structured JSON)
  location JSONB NOT NULL DEFAULT '{}', -- {city, state, country, lat, lng, address}
  
  -- Program characteristics
  type TEXT[] NOT NULL DEFAULT '{}', -- ['physical', 'virtual', 'hybrid']
  sectors TEXT[] NOT NULL DEFAULT '{}', -- ['healthtech', 'fintech', 'edtech', etc.]
  stage_focus TEXT[] NOT NULL DEFAULT '{}', -- ['idea', 'mvp', 'growth', 'scale']
  
  -- Program details
  founded_year INTEGER,
  portfolio_size INTEGER DEFAULT 0,
  notable_alumni TEXT[] DEFAULT '{}',
  
  -- Facilities and offerings (structured JSON)
  facilities JSONB DEFAULT '{}', -- {office_space, lab_access, meeting_rooms, etc.}
  programs JSONB DEFAULT '{}', -- {duration, batch_size, equity_range, funding_range}
  application_process JSONB DEFAULT '{}', -- {deadlines, requirements, timeline}
  
  -- Status and verification
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  application_status TEXT DEFAULT 'open', -- 'open', 'closed', 'rolling'
  
  -- SEO and metadata
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(name, '') || ' ' ||
      COALESCE(description, '') || ' ' ||
      COALESCE(array_to_string(sectors, ' '), '') || ' ' ||
      COALESCE(location->>'city', '') || ' ' ||
      COALESCE(location->>'state', '') || ' ' ||
      COALESCE(location->>'country', '')
    )
  ) STORED
);

-- Benefits and offerings table
CREATE TABLE incubator_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incubator_id UUID NOT NULL REFERENCES incubators(id) ON DELETE CASCADE,
  
  -- Benefit details
  type TEXT NOT NULL, -- 'mentorship', 'funding', 'infrastructure', 'network', 'credits'
  title TEXT NOT NULL,
  description TEXT,
  value JSONB DEFAULT '{}', -- {amount, currency, duration, etc.}
  
  -- Display options
  is_highlighted BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media and assets table
CREATE TABLE incubator_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incubator_id UUID NOT NULL REFERENCES incubators(id) ON DELETE CASCADE,
  
  -- Media details
  type TEXT NOT NULL, -- 'image', 'video', 'document'
  url TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT,
  
  -- Organization
  category TEXT, -- 'logo', 'gallery', 'testimonial', 'document'
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incubator programs (separate from main table for detailed program info)
CREATE TABLE incubator_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incubator_id UUID NOT NULL REFERENCES incubators(id) ON DELETE CASCADE,
  
  -- Program details
  name TEXT NOT NULL,
  description TEXT,
  duration_months INTEGER,
  batch_size INTEGER,
  
  -- Financial terms
  equity_percentage_min DECIMAL(5,2),
  equity_percentage_max DECIMAL(5,2),
  funding_amount_min INTEGER, -- in USD cents
  funding_amount_max INTEGER, -- in USD cents
  
  -- Requirements
  stage_requirements TEXT[], -- ['idea', 'mvp', 'revenue']
  sector_focus TEXT[],
  location_requirements JSONB DEFAULT '{}',
  
  -- Application details
  application_deadline TIMESTAMPTZ,
  is_rolling_admission BOOLEAN DEFAULT false,
  requirements JSONB DEFAULT '{}', -- {team_size, revenue_min, etc.}
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alumni and success stories
CREATE TABLE incubator_alumni (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incubator_id UUID NOT NULL REFERENCES incubators(id) ON DELETE CASCADE,
  
  -- Company details
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  company_website TEXT,
  description TEXT,
  
  -- Success metrics
  valuation_usd INTEGER, -- in USD cents
  funding_raised_usd INTEGER, -- in USD cents
  employees_count INTEGER,
  
  -- Program details
  program_year INTEGER,
  program_name TEXT,
  
  -- Display
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews and ratings (for future implementation)
CREATE TABLE incubator_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incubator_id UUID NOT NULL REFERENCES incubators(id) ON DELETE CASCADE,
  
  -- Review details
  reviewer_name TEXT,
  reviewer_title TEXT,
  reviewer_company TEXT,
  
  -- Rating (1-5 scale)
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  mentorship_rating INTEGER CHECK (mentorship_rating >= 1 AND mentorship_rating <= 5),
  network_rating INTEGER CHECK (network_rating >= 1 AND network_rating <= 5),
  resources_rating INTEGER CHECK (resources_rating >= 1 AND resources_rating <= 5),
  
  -- Content
  review_text TEXT,
  pros TEXT,
  cons TEXT,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_incubators_location_gin ON incubators USING GIN (location);
CREATE INDEX idx_incubators_sectors_gin ON incubators USING GIN (sectors);
CREATE INDEX idx_incubators_type_gin ON incubators USING GIN (type);
CREATE INDEX idx_incubators_stage_focus_gin ON incubators USING GIN (stage_focus);
CREATE INDEX idx_incubators_search_vector_gin ON incubators USING GIN (search_vector);
CREATE INDEX idx_incubators_active ON incubators (is_active) WHERE is_active = true;
CREATE INDEX idx_incubators_verified ON incubators (is_verified) WHERE is_verified = true;
CREATE INDEX idx_incubators_application_status ON incubators (application_status);

CREATE INDEX idx_incubator_benefits_type ON incubator_benefits (type);
CREATE INDEX idx_incubator_benefits_incubator_id ON incubator_benefits (incubator_id);

CREATE INDEX idx_incubator_media_type ON incubator_media (type);
CREATE INDEX idx_incubator_media_category ON incubator_media (category);
CREATE INDEX idx_incubator_media_incubator_id ON incubator_media (incubator_id);

CREATE INDEX idx_incubator_programs_active ON incubator_programs (is_active) WHERE is_active = true;
CREATE INDEX idx_incubator_programs_deadline ON incubator_programs (application_deadline);
CREATE INDEX idx_incubator_programs_incubator_id ON incubator_programs (incubator_id);

CREATE INDEX idx_incubator_alumni_featured ON incubator_alumni (is_featured) WHERE is_featured = true;
CREATE INDEX idx_incubator_alumni_incubator_id ON incubator_alumni (incubator_id);

CREATE INDEX idx_incubator_reviews_published ON incubator_reviews (is_published) WHERE is_published = true;
CREATE INDEX idx_incubator_reviews_incubator_id ON incubator_reviews (incubator_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_incubators_updated_at BEFORE UPDATE ON incubators 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incubator_programs_updated_at BEFORE UPDATE ON incubator_programs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW incubators_with_stats AS
SELECT 
  i.*,
  COUNT(DISTINCT ib.id) as benefits_count,
  COUNT(DISTINCT im.id) as media_count,
  COUNT(DISTINCT ip.id) as programs_count,
  COUNT(DISTINCT ia.id) as alumni_count,
  AVG(ir.overall_rating) as average_rating,
  COUNT(DISTINCT ir.id) as reviews_count
FROM incubators i
LEFT JOIN incubator_benefits ib ON i.id = ib.incubator_id
LEFT JOIN incubator_media im ON i.id = im.incubator_id
LEFT JOIN incubator_programs ip ON i.id = ip.incubator_id AND ip.is_active = true
LEFT JOIN incubator_alumni ia ON i.id = ia.incubator_id
LEFT JOIN incubator_reviews ir ON i.id = ir.incubator_id AND ir.is_published = true
WHERE i.is_active = true
GROUP BY i.id;

-- Sample data for development
INSERT INTO incubators (
  name, slug, description, location, type, sectors, stage_focus,
  founded_year, portfolio_size, is_verified, application_status,
  website, email
) VALUES 
(
  'TechStars Bangalore',
  'techstars-bangalore',
  'TechStars Bangalore is a leading startup accelerator focusing on early-stage technology companies in India. We provide mentorship, funding, and access to a global network.',
  '{"city": "Bangalore", "state": "Karnataka", "country": "India", "lat": 12.9716, "lng": 77.5946}',
  ARRAY['physical', 'hybrid'],
  ARRAY['fintech', 'healthtech', 'enterprise', 'consumer'],
  ARRAY['mvp', 'growth'],
  2016,
  45,
  true,
  'open',
  'https://www.techstars.com/accelerators/bangalore',
  'bangalore@techstars.com'
),
(
  'Y Combinator',
  'y-combinator',
  'Y Combinator is the most successful startup accelerator in the world. Since 2005, YC has funded over 3,000 startups including Airbnb, Dropbox, Stripe, and Reddit.',
  '{"city": "Mountain View", "state": "California", "country": "USA", "lat": 37.4419, "lng": -122.1430}',
  ARRAY['physical', 'virtual'],
  ARRAY['fintech', 'healthtech', 'enterprise', 'consumer', 'deeptech'],
  ARRAY['idea', 'mvp'],
  2005,
  3000,
  true,
  'open',
  'https://www.ycombinator.com',
  'apply@ycombinator.com'
),
(
  'Rocket Internet',
  'rocket-internet',
  'Rocket Internet is a global startup incubator and venture capital firm. We build and scale digital companies with proven business models.',
  '{"city": "Berlin", "state": "Berlin", "country": "Germany", "lat": 52.5200, "lng": 13.4050}',
  ARRAY['physical'],
  ARRAY['consumer', 'enterprise', 'fintech'],
  ARRAY['idea', 'mvp'],
  2007,
  200,
  true,
  'rolling',
  'https://www.rocket-internet.com',
  'careers@rocket-internet.com'
);

-- Sample benefits
INSERT INTO incubator_benefits (incubator_id, type, title, description, value, is_highlighted) 
SELECT 
  i.id,
  'funding',
  'Seed Funding',
  'Initial investment to get your startup off the ground',
  '{"amount": 120000, "currency": "USD", "equity": 6}',
  true
FROM incubators i WHERE i.slug = 'y-combinator'
UNION ALL
SELECT 
  i.id,
  'mentorship',
  'Expert Mentorship',
  'Access to successful entrepreneurs and industry experts',
  '{"hours_per_week": 5, "mentor_count": 3}',
  true
FROM incubators i WHERE i.slug = 'y-combinator'
UNION ALL
SELECT 
  i.id,
  'network',
  'Alumni Network',
  'Connect with 3000+ successful YC companies',
  '{"companies": 3000, "access_level": "lifetime"}',
  false
FROM incubators i WHERE i.slug = 'y-combinator';

-- Sample programs
INSERT INTO incubator_programs (
  incubator_id, name, description, duration_months, batch_size,
  equity_percentage_min, equity_percentage_max,
  funding_amount_min, funding_amount_max,
  stage_requirements, application_deadline, is_rolling_admission
)
SELECT 
  i.id,
  'Standard Program',
  '3-month intensive accelerator program',
  3,
  200,
  6.0,
  7.0,
  12000000, -- $120k in cents
  12000000,
  ARRAY['idea', 'mvp'],
  '2025-10-15 23:59:59',
  false
FROM incubators i WHERE i.slug = 'y-combinator';

COMMENT ON TABLE incubators IS 'Core incubators/accelerators directory';
COMMENT ON TABLE incubator_benefits IS 'Benefits and offerings provided by incubators';
COMMENT ON TABLE incubator_media IS 'Media assets (images, videos, documents) for incubators';
COMMENT ON TABLE incubator_programs IS 'Detailed program information for each incubator';
COMMENT ON TABLE incubator_alumni IS 'Success stories and alumni companies';
COMMENT ON TABLE incubator_reviews IS 'Reviews and ratings from founders';