# Technical Specifications for SaSarjan App Store

**Created: 03-Jul-25**

## Table of Contents

1. [Database Schema](#database-schema)
2. [API Specifications](#api-specifications)
3. [Form Builder JSON Schema](#form-builder-json-schema)
4. [CTA Configuration Specifications](#cta-configuration-specifications)
5. [Security Requirements](#security-requirements)
6. [Performance Targets](#performance-targets)
7. [Integration Specifications](#integration-specifications)
8. [Data Models](#data-models)

## Database Schema

### Core Tables (Supabase/PostgreSQL)

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'developer', 'admin')),
  wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Developers table
CREATE TABLE public.developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT,
  company_website TEXT,
  tax_id TEXT,
  bank_details JSONB,
  commission_rate DECIMAL(5, 2) DEFAULT 30.00, -- Platform takes 30%
  payout_threshold DECIMAL(10, 2) DEFAULT 5000.00, -- Min ₹5000 for payout
  total_earnings DECIMAL(12, 2) DEFAULT 0.00,
  total_paid_out DECIMAL(12, 2) DEFAULT 0.00,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Apps table
CREATE TABLE public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES public.developers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT NOT NULL CHECK (category IN ('education', 'productivity', 'entertainment', 'utilities', 'business')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'suspended')),
  icon_url TEXT,
  screenshots JSONB DEFAULT '[]',

  -- Pricing
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('free', 'freemium', 'paid', 'subscription')),
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'INR',
  trial_days INTEGER DEFAULT 0,

  -- Content access rules
  free_content_rules JSONB DEFAULT '{}',
  paid_content_rules JSONB DEFAULT '{}',

  -- Metadata
  version TEXT NOT NULL DEFAULT '1.0.0',
  min_app_version TEXT,
  size_bytes BIGINT,

  -- Stats
  total_installs INTEGER DEFAULT 0,
  active_installs INTEGER DEFAULT 0,
  average_rating DECIMAL(2, 1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,

  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- App versions
CREATE TABLE public.app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  changelog TEXT,
  file_url TEXT NOT NULL,
  file_hash TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(app_id, version)
);

-- Extensions registry
CREATE TABLE public.extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ui', 'api', 'service', 'integration')),
  config_schema JSONB,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- App extensions (which extensions an app uses)
CREATE TABLE public.app_extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  extension_id UUID NOT NULL REFERENCES public.extensions(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(app_id, extension_id)
);

-- Wallet transactions
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund')),
  amount DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,

  -- Transaction details
  description TEXT,
  reference_type TEXT CHECK (reference_type IN ('purchase', 'subscription', 'topup', 'payout', 'refund')),
  reference_id UUID,

  -- Payment gateway details
  gateway TEXT CHECK (gateway IN ('razorpay', 'wallet', 'system')),
  gateway_transaction_id TEXT,
  gateway_response JSONB,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  app_id UUID NOT NULL REFERENCES public.apps(id),
  plan_id UUID,

  -- Subscription details
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE,

  -- Billing
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  interval TEXT NOT NULL CHECK (interval IN ('monthly', 'yearly')),

  -- Gateway subscription
  gateway_subscription_id TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, app_id)
);

-- Developer payouts
CREATE TABLE public.developer_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES public.developers(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',

  -- Payout details
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  transaction_count INTEGER NOT NULL,

  -- Payment details
  payout_method TEXT NOT NULL CHECK (payout_method IN ('bank_transfer', 'razorpay')),
  payout_reference TEXT,
  payout_details JSONB,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Forms configuration
CREATE TABLE public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,

  -- Form configuration
  schema JSONB NOT NULL,
  ui_schema JSONB,
  cta_config JSONB,

  -- Settings
  requires_auth BOOLEAN DEFAULT false,
  save_submissions BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(app_id, slug)
);

-- Form submissions
CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),

  -- Submission data
  data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',

  -- Processing
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- App reviews
CREATE TABLE public.app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  developer_response TEXT,
  developer_responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(app_id, user_id)
);

-- Analytics events
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  event_name TEXT NOT NULL,
  event_category TEXT,
  event_data JSONB DEFAULT '{}',

  -- Context
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User preferences (for personalization)
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Language & Locale
  language_code TEXT DEFAULT 'en',
  locale TEXT DEFAULT 'en-US',
  timezone TEXT DEFAULT 'UTC',

  -- Personalization preferences
  preferred_categories TEXT[] DEFAULT '{}',
  price_range JSONB DEFAULT '{"min": 0, "max": null}',
  content_preferences JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',

  -- Theme preferences
  theme_mode TEXT DEFAULT 'auto' CHECK (theme_mode IN ('light', 'dark', 'auto')),
  theme_id UUID REFERENCES public.themes(id),
  custom_theme_config JSONB DEFAULT '{}',

  -- Privacy settings
  personalization_enabled BOOLEAN DEFAULT true,
  location_tracking_enabled BOOLEAN DEFAULT false,
  analytics_enabled BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- User locations
CREATE TABLE public.user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Location data
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy INTEGER, -- in meters
  altitude DECIMAL(10, 2),

  -- Address components
  country_code TEXT,
  country_name TEXT,
  state_province TEXT,
  city TEXT,
  postal_code TEXT,
  address_line TEXT,

  -- Location metadata
  location_source TEXT CHECK (location_source IN ('gps', 'wifi', 'ip', 'manual', 'cellular')),
  is_primary BOOLEAN DEFAULT false,
  location_type TEXT CHECK (location_type IN ('home', 'work', 'current', 'saved')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Themes
CREATE TABLE public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,

  -- Theme configuration
  colors JSONB NOT NULL,
  typography JSONB DEFAULT '{}',
  spacing JSONB DEFAULT '{}',
  borders JSONB DEFAULT '{}',
  shadows JSONB DEFAULT '{}',

  -- Theme metadata
  mode TEXT NOT NULL CHECK (mode IN ('light', 'dark', 'auto')),
  is_system_theme BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  creator_id UUID REFERENCES public.developers(id),

  -- Usage stats
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0.0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- App themes (app-specific theme configurations)
CREATE TABLE public.app_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,

  -- Brand colors
  primary_color TEXT NOT NULL,
  secondary_color TEXT,
  accent_color TEXT,

  -- Theme overrides
  theme_config JSONB NOT NULL,
  component_overrides JSONB DEFAULT '{}',

  -- Restrictions
  allow_dark_mode BOOLEAN DEFAULT true,
  allow_user_customization BOOLEAN DEFAULT true,
  enforce_accessibility BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(app_id)
);

-- Localization data
CREATE TABLE public.localization_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('app', 'category', 'announcement', 'form')),
  entity_id UUID NOT NULL,
  locale TEXT NOT NULL,

  -- Localized fields
  fields JSONB NOT NULL,

  -- Metadata
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'published')),
  translator_id UUID REFERENCES public.users(id),
  reviewer_id UUID REFERENCES public.users(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  published_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(entity_type, entity_id, locale)
);

-- Personalization profiles (ML-generated user profiles)
CREATE TABLE public.personalization_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Computed interests and behaviors
  interests JSONB DEFAULT '[]',
  behavior_patterns JSONB DEFAULT '{}',
  engagement_metrics JSONB DEFAULT '{}',

  -- Recommendations cache
  recommended_apps UUID[] DEFAULT '{}',
  recommended_categories TEXT[] DEFAULT '{}',

  -- ML model data
  user_embedding FLOAT[] DEFAULT '{}',
  cluster_id INTEGER,

  -- Scores
  engagement_score DECIMAL(3, 2) DEFAULT 0.00,
  churn_risk_score DECIMAL(3, 2) DEFAULT 0.00,
  lifetime_value_prediction DECIMAL(10, 2),

  last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Location-based features
CREATE TABLE public.location_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location definition
  name TEXT NOT NULL,
  location_type TEXT CHECK (location_type IN ('point', 'region', 'country', 'state', 'city')),

  -- Geometry (PostGIS)
  -- Note: Requires PostGIS extension
  -- geometry GEOGRAPHY(GEOMETRY, 4326),

  -- Alternative: Simple bounds
  bounds JSONB, -- {"north": lat, "south": lat, "east": lng, "west": lng}
  center_latitude DECIMAL(10, 8),
  center_longitude DECIMAL(11, 8),
  radius_meters INTEGER,

  -- Associated data
  popular_apps UUID[] DEFAULT '{}',
  regional_offers JSONB DEFAULT '[]',
  local_events JSONB DEFAULT '[]',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User behavior tracking (for personalization)
CREATE TABLE public.user_behaviors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Behavior data
  behavior_type TEXT NOT NULL CHECK (behavior_type IN ('app_view', 'app_install', 'app_uninstall', 'search', 'purchase', 'rating', 'time_spent')),
  entity_id UUID, -- app_id or other entity
  entity_type TEXT,

  -- Context
  session_id TEXT,
  location_id UUID REFERENCES public.user_locations(id),
  device_info JSONB DEFAULT '{}',

  -- Metrics
  duration_seconds INTEGER,
  interaction_count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tags system
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'content-type', 'audience', 'platform', 'feature', 'genre', 'topic', 'other')),
  description TEXT,

  -- Tag metadata
  color TEXT, -- Hex color for UI
  icon TEXT, -- Icon identifier
  parent_tag_id UUID REFERENCES public.tags(id),

  -- Usage statistics
  usage_count INTEGER DEFAULT 0,
  app_count INTEGER DEFAULT 0,

  -- Moderation
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'deprecated', 'banned')),
  created_by UUID REFERENCES public.users(id),
  approved_by UUID REFERENCES public.users(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- App tags (many-to-many relationship)
CREATE TABLE public.app_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,

  -- Tag relevance
  relevance_score DECIMAL(3, 2) DEFAULT 1.00, -- 0.00 to 1.00
  is_primary BOOLEAN DEFAULT false,

  -- Source of tag
  added_by UUID REFERENCES public.users(id),
  source TEXT CHECK (source IN ('developer', 'auto', 'admin', 'user')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(app_id, tag_id)
);

-- Tag synonyms and relationships
CREATE TABLE public.tag_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  related_tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('synonym', 'related', 'broader', 'narrower')),
  strength DECIMAL(3, 2) DEFAULT 0.50, -- 0.00 to 1.00

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(tag_id, related_tag_id, relationship_type)
);

-- User tag preferences (for personalization)
CREATE TABLE public.user_tag_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,

  -- Preference metrics
  preference_score DECIMAL(3, 2) DEFAULT 0.50, -- -1.00 (dislike) to 1.00 (like)
  interaction_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, tag_id)
);

-- Modular apps architecture
CREATE TABLE public.app_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,

  -- Module identification
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('feature', 'content', 'service', 'integration', 'extension')),

  -- Module details
  description TEXT,
  icon_url TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',

  -- Module configuration
  config JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]', -- Other module IDs this depends on

  -- Access control
  is_core BOOLEAN DEFAULT false, -- Core modules cannot be disabled
  is_premium BOOLEAN DEFAULT false,
  requires_subscription BOOLEAN DEFAULT false,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'beta', 'deprecated', 'disabled')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(parent_app_id, slug)
);

-- User module installations
CREATE TABLE public.user_app_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  app_module_id UUID NOT NULL REFERENCES public.app_modules(id) ON DELETE CASCADE,

  -- Installation details
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  enabled BOOLEAN DEFAULT true,

  -- User configuration
  user_config JSONB DEFAULT '{}',

  -- Usage tracking
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,

  UNIQUE(user_id, app_module_id)
);

-- Module routes (for modular navigation)
CREATE TABLE public.module_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_module_id UUID NOT NULL REFERENCES public.app_modules(id) ON DELETE CASCADE,

  -- Route configuration
  path TEXT NOT NULL, -- e.g., /internships, /fellowships
  title TEXT NOT NULL,
  description TEXT,

  -- UI configuration
  icon TEXT,
  menu_order INTEGER DEFAULT 0,
  parent_route_id UUID REFERENCES public.module_routes(id),

  -- Access control
  requires_auth BOOLEAN DEFAULT false,
  required_permissions JSONB DEFAULT '[]',

  -- Route metadata
  meta_tags JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(app_module_id, path)
);

-- Indexes
CREATE INDEX idx_apps_developer_id ON public.apps(developer_id);
CREATE INDEX idx_apps_status ON public.apps(status);
CREATE INDEX idx_apps_category ON public.apps(category);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_status ON public.wallet_transactions(status);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_app_id ON public.subscriptions(app_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_analytics_events_app_id ON public.analytics_events(app_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- New indexes for personalization and features
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_language_code ON public.user_preferences(language_code);
CREATE INDEX idx_user_locations_user_id ON public.user_locations(user_id);
CREATE INDEX idx_user_locations_city_country ON public.user_locations(city, country_code);
CREATE INDEX idx_user_locations_coordinates ON public.user_locations(latitude, longitude);
CREATE INDEX idx_themes_mode ON public.themes(mode);
CREATE INDEX idx_themes_is_system ON public.themes(is_system_theme);
CREATE INDEX idx_app_themes_app_id ON public.app_themes(app_id);
CREATE INDEX idx_localization_data_entity ON public.localization_data(entity_type, entity_id);
CREATE INDEX idx_localization_data_locale ON public.localization_data(locale);
CREATE INDEX idx_localization_data_status ON public.localization_data(status);
CREATE INDEX idx_personalization_profiles_user_id ON public.personalization_profiles(user_id);
CREATE INDEX idx_personalization_profiles_cluster ON public.personalization_profiles(cluster_id);
CREATE INDEX idx_location_features_type ON public.location_features(location_type);
CREATE INDEX idx_user_behaviors_user_id ON public.user_behaviors(user_id);
CREATE INDEX idx_user_behaviors_type_created ON public.user_behaviors(behavior_type, created_at);

-- New indexes for tags and modular apps
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_tags_category ON public.tags(category);
CREATE INDEX idx_tags_status ON public.tags(status);
CREATE INDEX idx_app_tags_app_id ON public.app_tags(app_id);
CREATE INDEX idx_app_tags_tag_id ON public.app_tags(tag_id);
CREATE INDEX idx_app_tags_primary ON public.app_tags(app_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_tag_relationships_tag_id ON public.tag_relationships(tag_id);
CREATE INDEX idx_tag_relationships_related ON public.tag_relationships(related_tag_id);
CREATE INDEX idx_user_tag_preferences_user_id ON public.user_tag_preferences(user_id);
CREATE INDEX idx_user_tag_preferences_score ON public.user_tag_preferences(preference_score);
CREATE INDEX idx_app_modules_parent_app ON public.app_modules(parent_app_id);
CREATE INDEX idx_app_modules_slug ON public.app_modules(parent_app_id, slug);
CREATE INDEX idx_app_modules_type ON public.app_modules(module_type);
CREATE INDEX idx_user_app_modules_user ON public.user_app_modules(user_id);
CREATE INDEX idx_user_app_modules_module ON public.user_app_modules(app_module_id);
CREATE INDEX idx_module_routes_module ON public.module_routes(app_module_id);
CREATE INDEX idx_module_routes_parent ON public.module_routes(parent_route_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Example RLS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Developers can manage own apps" ON public.apps
  FOR ALL USING (
    developer_id IN (
      SELECT id FROM public.developers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own transactions" ON public.wallet_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Public can view approved apps" ON public.apps
  FOR SELECT USING (status = 'approved');
```

## API Specifications

### OpenAPI 3.0 Specification

```yaml
openapi: 3.0.0
info:
  title: SaSarjan App Store API
  version: 1.0.0
  description: API for app store platform with developer tools and payment integration

servers:
  - url: https://sasarjan-appstore.vercel.app/api
    description: Production server (Vercel)
  - url: http://localhost:3000/api
    description: Development server (Next.js)

security:
  - bearerAuth: []

paths:
  # Authentication (Next.js App Router paths)
  /auth/register:
    post:
      summary: Register new user
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password, full_name, role]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                full_name:
                  type: string
                role:
                  type: string
                  enum: [customer, developer]
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'

  # Apps
  /apps:
    get:
      summary: List apps
      tags: [Apps]
      parameters:
        - name: category
          in: query
          schema:
            type: string
            enum: [education, productivity, entertainment, utilities, business]
        - name: pricing_model
          in: query
          schema:
            type: string
            enum: [free, freemium, paid, subscription]
        - name: search
          in: query
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: List of apps
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/App'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

    post:
      summary: Create new app
      tags: [Apps]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [name, description, category, pricing_model, icon]
              properties:
                name:
                  type: string
                description:
                  type: string
                category:
                  type: string
                pricing_model:
                  type: string
                price:
                  type: number
                trial_days:
                  type: integer
                icon:
                  type: string
                  format: binary
                screenshots:
                  type: array
                  items:
                    type: string
                    format: binary
      responses:
        '201':
          description: App created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/App'

  /apps/{appId}:
    get:
      summary: Get app details
      tags: [Apps]
      parameters:
        - name: appId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: App details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AppDetail'

  # Wallet
  /wallet/balance:
    get:
      summary: Get wallet balance
      tags: [Wallet]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Wallet balance
          content:
            application/json:
              schema:
                type: object
                properties:
                  balance:
                    type: number
                  currency:
                    type: string
                  pending_transactions:
                    type: array
                    items:
                      $ref: '#/components/schemas/Transaction'

  /wallet/topup:
    post:
      summary: Add funds to wallet
      tags: [Wallet]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [amount]
              properties:
                amount:
                  type: number
                  minimum: 100
                  description: Amount in INR
      responses:
        '200':
          description: Razorpay payment order created
          content:
            application/json:
              schema:
                type: object
                properties:
                  order_id:
                    type: string
                  amount:
                    type: number
                  currency:
                    type: string
                  key_id:
                    type: string

  # Subscriptions
  /subscriptions:
    get:
      summary: List user subscriptions
      tags: [Subscriptions]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User subscriptions
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Subscription'

    post:
      summary: Create subscription
      tags: [Subscriptions]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [app_id, interval]
              properties:
                app_id:
                  type: string
                  format: uuid
                interval:
                  type: string
                  enum: [monthly, yearly]
      responses:
        '201':
          description: Subscription created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Subscription'

  # Forms
  /apps/{appId}/forms:
    get:
      summary: List app forms
      tags: [Forms]
      parameters:
        - name: appId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: List of forms
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Form'

    post:
      summary: Create form
      tags: [Forms]
      security:
        - bearerAuth: []
      parameters:
        - name: appId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/FormCreate'
      responses:
        '201':
          description: Form created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Form'

  # Developer
  /developer/apps:
    get:
      summary: List developer's apps
      tags: [Developer]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Developer's apps
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/App'

  /developer/analytics:
    get:
      summary: Get developer analytics
      tags: [Developer]
      security:
        - bearerAuth: []
      parameters:
        - name: app_id
          in: query
          schema:
            type: string
            format: uuid
        - name: start_date
          in: query
          schema:
            type: string
            format: date
        - name: end_date
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Analytics data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Analytics'

  /developer/payouts:
    get:
      summary: List developer payouts
      tags: [Developer]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Payout history
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Payout'

  # Personalization
  /user/preferences:
    get:
      summary: Get user preferences
      tags: [Personalization]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User preferences
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserPreferences'

    patch:
      summary: Update user preferences
      tags: [Personalization]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserPreferencesUpdate'
      responses:
        '200':
          description: Updated preferences
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserPreferences'

  /user/recommendations:
    get:
      summary: Get personalized app recommendations
      tags: [Personalization]
      security:
        - bearerAuth: []
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
        - name: category
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Recommended apps
          content:
            application/json:
              schema:
                type: object
                properties:
                  recommendations:
                    type: array
                    items:
                      $ref: '#/components/schemas/AppRecommendation'

  # Internationalization
  /localization/languages:
    get:
      summary: Get supported languages
      tags: [Internationalization]
      responses:
        '200':
          description: List of supported languages
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Language'

  /localization/{locale}/content/{entityType}/{entityId}:
    get:
      summary: Get localized content
      tags: [Internationalization]
      parameters:
        - name: locale
          in: path
          required: true
          schema:
            type: string
        - name: entityType
          in: path
          required: true
          schema:
            type: string
            enum: [app, category, announcement]
        - name: entityId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Localized content
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LocalizedContent'

  # Location Services
  /location/current:
    post:
      summary: Update user location
      tags: [Location]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LocationUpdate'
      responses:
        '200':
          description: Location updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Location'

  /location/nearby:
    get:
      summary: Get nearby apps and offers
      tags: [Location]
      security:
        - bearerAuth: []
      parameters:
        - name: latitude
          in: query
          required: true
          schema:
            type: number
        - name: longitude
          in: query
          required: true
          schema:
            type: number
        - name: radius
          in: query
          schema:
            type: integer
            default: 10000
      responses:
        '200':
          description: Nearby content
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NearbyContent'

  # Theme Management
  /themes:
    get:
      summary: List available themes
      tags: [Themes]
      parameters:
        - name: mode
          in: query
          schema:
            type: string
            enum: [light, dark, auto]
      responses:
        '200':
          description: Available themes
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Theme'

  /themes/current:
    get:
      summary: Get current user theme
      tags: [Themes]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Current theme settings
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserTheme'

    put:
      summary: Update user theme
      tags: [Themes]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserThemeUpdate'
      responses:
        '200':
          description: Theme updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserTheme'

  /apps/{appId}/theme:
    get:
      summary: Get app-specific theme
      tags: [Themes]
      parameters:
        - name: appId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: App theme configuration
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AppTheme'

  # Tag Management
  /tags:
    get:
      summary: List all tags
      tags: [Tags]
      parameters:
        - name: category
          in: query
          schema:
            type: string
            enum:
              [
                technical,
                content-type,
                audience,
                platform,
                feature,
                genre,
                topic,
                other,
              ]
        - name: search
          in: query
          schema:
            type: string
        - name: popular
          in: query
          schema:
            type: boolean
        - name: limit
          in: query
          schema:
            type: integer
            default: 50
      responses:
        '200':
          description: List of tags
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Tag'

    post:
      summary: Create new tag
      tags: [Tags]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TagCreate'
      responses:
        '201':
          description: Tag created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Tag'

  /tags/{tagId}:
    get:
      summary: Get tag details
      tags: [Tags]
      parameters:
        - name: tagId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Tag details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TagDetail'

  /apps/{appId}/tags:
    get:
      summary: Get app tags
      tags: [Tags]
      parameters:
        - name: appId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: App tags
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/AppTag'

    post:
      summary: Add tag to app
      tags: [Tags]
      security:
        - bearerAuth: []
      parameters:
        - name: appId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AppTagAdd'
      responses:
        '201':
          description: Tag added to app
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AppTag'

  /tags/suggestions:
    post:
      summary: Get tag suggestions for content
      tags: [Tags]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                description:
                  type: string
                category:
                  type: string
      responses:
        '200':
          description: Suggested tags
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/TagSuggestion'

  # Modular Apps
  /apps/{appId}/modules:
    get:
      summary: List app modules
      tags: [Modules]
      parameters:
        - name: appId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: List of app modules
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/AppModule'

    post:
      summary: Create app module
      tags: [Modules]
      security:
        - bearerAuth: []
      parameters:
        - name: appId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AppModuleCreate'
      responses:
        '201':
          description: Module created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AppModule'

  /modules/{moduleId}:
    get:
      summary: Get module details
      tags: [Modules]
      parameters:
        - name: moduleId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Module details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AppModuleDetail'

    patch:
      summary: Update module
      tags: [Modules]
      security:
        - bearerAuth: []
      parameters:
        - name: moduleId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AppModuleUpdate'
      responses:
        '200':
          description: Module updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AppModule'

  /user/modules:
    get:
      summary: Get user installed modules
      tags: [Modules]
      security:
        - bearerAuth: []
      responses:
        '200':
          description: User modules
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/UserModule'

  /user/modules/{moduleId}/install:
    post:
      summary: Install module for user
      tags: [Modules]
      security:
        - bearerAuth: []
      parameters:
        - name: moduleId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '201':
          description: Module installed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserModule'

  /modules/{moduleId}/routes:
    get:
      summary: Get module routes
      tags: [Modules]
      parameters:
        - name: moduleId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Module routes
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ModuleRoute'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    App:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        slug:
          type: string
        short_description:
          type: string
        category:
          type: string
        icon_url:
          type: string
        pricing_model:
          type: string
        price:
          type: number
        average_rating:
          type: number
        total_installs:
          type: integer

    AppDetail:
      allOf:
        - $ref: '#/components/schemas/App'
        - type: object
          properties:
            description:
              type: string
            screenshots:
              type: array
              items:
                type: string
            version:
              type: string
            size_bytes:
              type: integer
            developer:
              $ref: '#/components/schemas/Developer'
            reviews:
              type: array
              items:
                $ref: '#/components/schemas/Review'

    Transaction:
      type: object
      properties:
        id:
          type: string
          format: uuid
        type:
          type: string
          enum: [credit, debit, refund]
        amount:
          type: number
        description:
          type: string
        status:
          type: string
        created_at:
          type: string
          format: date-time

    Subscription:
      type: object
      properties:
        id:
          type: string
          format: uuid
        app:
          $ref: '#/components/schemas/App'
        status:
          type: string
        current_period_start:
          type: string
          format: date-time
        current_period_end:
          type: string
          format: date-time
        amount:
          type: number
        interval:
          type: string

    Form:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        slug:
          type: string
        description:
          type: string
        schema:
          type: object
        cta_config:
          type: object

    FormCreate:
      type: object
      required: [name, slug, schema]
      properties:
        name:
          type: string
        slug:
          type: string
        description:
          type: string
        schema:
          type: object
        ui_schema:
          type: object
        cta_config:
          type: object

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        pages:
          type: integer

    # Personalization Schemas
    UserPreferences:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        language_code:
          type: string
        locale:
          type: string
        timezone:
          type: string
        preferred_categories:
          type: array
          items:
            type: string
        price_range:
          type: object
          properties:
            min:
              type: number
            max:
              type: number
        theme_mode:
          type: string
          enum: [light, dark, auto]
        theme_id:
          type: string
          format: uuid
        personalization_enabled:
          type: boolean
        location_tracking_enabled:
          type: boolean

    UserPreferencesUpdate:
      type: object
      properties:
        language_code:
          type: string
        locale:
          type: string
        timezone:
          type: string
        preferred_categories:
          type: array
          items:
            type: string
        price_range:
          type: object
        theme_mode:
          type: string
          enum: [light, dark, auto]
        personalization_enabled:
          type: boolean
        location_tracking_enabled:
          type: boolean

    AppRecommendation:
      type: object
      properties:
        app:
          $ref: '#/components/schemas/App'
        score:
          type: number
          format: float
        reason:
          type: string
        personalized:
          type: boolean

    # Internationalization Schemas
    Language:
      type: object
      properties:
        code:
          type: string
        name:
          type: string
        native_name:
          type: string
        direction:
          type: string
          enum: [ltr, rtl]
        enabled:
          type: boolean

    LocalizedContent:
      type: object
      properties:
        entity_type:
          type: string
        entity_id:
          type: string
          format: uuid
        locale:
          type: string
        fields:
          type: object
          additionalProperties: true
        status:
          type: string
          enum: [draft, review, approved, published]

    # Location Schemas
    Location:
      type: object
      properties:
        id:
          type: string
          format: uuid
        latitude:
          type: number
          format: double
        longitude:
          type: number
          format: double
        accuracy:
          type: integer
        address:
          type: object
          properties:
            country_code:
              type: string
            country_name:
              type: string
            state_province:
              type: string
            city:
              type: string
            postal_code:
              type: string
        location_source:
          type: string
          enum: [gps, wifi, ip, manual, cellular]

    LocationUpdate:
      type: object
      required: [latitude, longitude]
      properties:
        latitude:
          type: number
          format: double
        longitude:
          type: number
          format: double
        accuracy:
          type: integer
        location_source:
          type: string
          enum: [gps, wifi, ip, manual, cellular]

    NearbyContent:
      type: object
      properties:
        apps:
          type: array
          items:
            allOf:
              - $ref: '#/components/schemas/App'
              - type: object
                properties:
                  distance:
                    type: number
                  distance_display:
                    type: string
        offers:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              title:
                type: string
              description:
                type: string
              discount:
                type: string
              valid_until:
                type: string
                format: date-time
        events:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              name:
                type: string
              date:
                type: string
                format: date-time
              location:
                type: string

    # Theme Schemas
    Theme:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        display_name:
          type: string
        mode:
          type: string
          enum: [light, dark, auto]
        colors:
          type: object
          properties:
            primary:
              type: object
            secondary:
              type: object
            accent:
              type: object
        is_system_theme:
          type: boolean
        is_premium:
          type: boolean
        preview_url:
          type: string

    UserTheme:
      type: object
      properties:
        theme_id:
          type: string
          format: uuid
        theme_mode:
          type: string
          enum: [light, dark, auto]
        custom_config:
          type: object
        applied_at:
          type: string
          format: date-time

    UserThemeUpdate:
      type: object
      properties:
        theme_id:
          type: string
          format: uuid
        theme_mode:
          type: string
          enum: [light, dark, auto]
        custom_config:
          type: object

    AppTheme:
      type: object
      properties:
        app_id:
          type: string
          format: uuid
        primary_color:
          type: string
        secondary_color:
          type: string
        accent_color:
          type: string
        theme_config:
          type: object
        allow_dark_mode:
          type: boolean
        allow_user_customization:
          type: boolean

    Tag:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        slug:
          type: string
        description:
          type: string
        usage_count:
          type: integer
        created_at:
          type: string
          format: date-time

    TagCreate:
      type: object
      required: [name]
      properties:
        name:
          type: string
        description:
          type: string

    TagDetail:
      allOf:
        - $ref: '#/components/schemas/Tag'
        - type: object
          properties:
            related_tags:
              type: array
              items:
                $ref: '#/components/schemas/Tag'
            apps:
              type: array
              items:
                $ref: '#/components/schemas/App'

    AppTag:
      type: object
      properties:
        app_id:
          type: string
          format: uuid
        tag_id:
          type: string
          format: uuid
        relevance_score:
          type: number
          minimum: 0
          maximum: 1
        created_at:
          type: string
          format: date-time

    AppTagAdd:
      type: object
      required: [tag_id]
      properties:
        tag_id:
          type: string
          format: uuid
        relevance_score:
          type: number
          minimum: 0
          maximum: 1

    TagSuggestion:
      type: object
      properties:
        tag:
          $ref: '#/components/schemas/Tag'
        confidence:
          type: number
          minimum: 0
          maximum: 1
        reason:
          type: string

    AppModule:
      type: object
      properties:
        id:
          type: string
          format: uuid
        app_id:
          type: string
          format: uuid
        name:
          type: string
        slug:
          type: string
        description:
          type: string
        version:
          type: string
        type:
          type: string
          enum: [plugin, extension, theme, component]
        status:
          type: string
          enum: [active, inactive, deprecated]
        dependencies:
          type: array
          items:
            type: object
            properties:
              module_id:
                type: string
                format: uuid
              version_constraint:
                type: string
        config_schema:
          type: object
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    AppModuleCreate:
      type: object
      required: [name, type]
      properties:
        name:
          type: string
        description:
          type: string
        version:
          type: string
          default: '1.0.0'
        type:
          type: string
          enum: [plugin, extension, theme, component]
        dependencies:
          type: array
          items:
            type: object
            properties:
              module_id:
                type: string
                format: uuid
              version_constraint:
                type: string
        config_schema:
          type: object

    AppModuleDetail:
      allOf:
        - $ref: '#/components/schemas/AppModule'
        - type: object
          properties:
            app:
              $ref: '#/components/schemas/App'
            installed_users:
              type: integer
            average_rating:
              type: number
            permissions_required:
              type: array
              items:
                type: string
            changelog:
              type: array
              items:
                type: object
                properties:
                  version:
                    type: string
                  date:
                    type: string
                    format: date-time
                  changes:
                    type: array
                    items:
                      type: string

    AppModuleUpdate:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
        version:
          type: string
        status:
          type: string
          enum: [active, inactive, deprecated]
        config_schema:
          type: object

    UserModule:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        module:
          $ref: '#/components/schemas/AppModule'
        enabled:
          type: boolean
        config:
          type: object
        installed_at:
          type: string
          format: date-time
        last_used_at:
          type: string
          format: date-time

    ModuleRoute:
      type: object
      properties:
        path:
          type: string
        method:
          type: string
          enum: [GET, POST, PUT, DELETE, PATCH]
        handler:
          type: string
        middleware:
          type: array
          items:
            type: string
        permissions:
          type: array
          items:
            type: string
```

## Form Builder JSON Schema

### Form Configuration Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Form Configuration",
  "type": "object",
  "required": ["id", "name", "fields"],
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique form identifier"
    },
    "name": {
      "type": "string",
      "description": "Form display name"
    },
    "description": {
      "type": "string",
      "description": "Form description"
    },
    "fields": {
      "type": "array",
      "description": "Form fields configuration",
      "items": {
        "$ref": "#/definitions/FormField"
      }
    },
    "layout": {
      "$ref": "#/definitions/LayoutConfig"
    },
    "validation": {
      "$ref": "#/definitions/ValidationConfig"
    },
    "callToAction": {
      "$ref": "#/definitions/CTAConfig"
    },
    "settings": {
      "$ref": "#/definitions/FormSettings"
    }
  },
  "definitions": {
    "FormField": {
      "type": "object",
      "required": ["name", "type"],
      "properties": {
        "name": {
          "type": "string",
          "description": "Field name (used as key in data)"
        },
        "label": {
          "type": "string",
          "description": "Field label"
        },
        "type": {
          "type": "string",
          "enum": [
            "text",
            "email",
            "password",
            "number",
            "tel",
            "url",
            "textarea",
            "select",
            "multiselect",
            "checkbox",
            "radio",
            "date",
            "time",
            "datetime",
            "file",
            "image",
            "range",
            "color",
            "rating",
            "switch",
            "json",
            "markdown"
          ]
        },
        "placeholder": {
          "type": "string"
        },
        "defaultValue": {
          "description": "Default field value"
        },
        "required": {
          "type": "boolean",
          "default": false
        },
        "disabled": {
          "type": "boolean",
          "default": false
        },
        "readonly": {
          "type": "boolean",
          "default": false
        },
        "hidden": {
          "type": "boolean",
          "default": false
        },
        "options": {
          "type": "array",
          "description": "Options for select, multiselect, radio",
          "items": {
            "type": "object",
            "properties": {
              "value": {
                "type": "string"
              },
              "label": {
                "type": "string"
              },
              "disabled": {
                "type": "boolean"
              }
            }
          }
        },
        "validation": {
          "type": "object",
          "properties": {
            "min": {
              "type": "number"
            },
            "max": {
              "type": "number"
            },
            "minLength": {
              "type": "integer"
            },
            "maxLength": {
              "type": "integer"
            },
            "pattern": {
              "type": "string",
              "description": "Regex pattern"
            },
            "custom": {
              "type": "string",
              "description": "Custom validation function name"
            }
          }
        },
        "conditions": {
          "type": "array",
          "description": "Conditional display rules",
          "items": {
            "$ref": "#/definitions/FieldCondition"
          }
        },
        "ui": {
          "type": "object",
          "description": "UI customization",
          "properties": {
            "className": {
              "type": "string"
            },
            "width": {
              "type": "string",
              "enum": ["full", "half", "third", "quarter"]
            },
            "helpText": {
              "type": "string"
            },
            "icon": {
              "type": "string"
            }
          }
        }
      }
    },
    "FieldCondition": {
      "type": "object",
      "required": ["field", "operator", "value"],
      "properties": {
        "field": {
          "type": "string",
          "description": "Field name to check"
        },
        "operator": {
          "type": "string",
          "enum": [
            "equals",
            "notEquals",
            "contains",
            "greaterThan",
            "lessThan",
            "in",
            "notIn",
            "empty",
            "notEmpty"
          ]
        },
        "value": {
          "description": "Value to compare"
        },
        "action": {
          "type": "string",
          "enum": ["show", "hide", "enable", "disable", "require"],
          "default": "show"
        }
      }
    },
    "LayoutConfig": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["single", "multi-column", "wizard", "tabs"],
          "default": "single"
        },
        "columns": {
          "type": "integer",
          "minimum": 1,
          "maximum": 4,
          "default": 1
        },
        "sections": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "fields": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "collapsible": {
                "type": "boolean"
              },
              "collapsed": {
                "type": "boolean"
              }
            }
          }
        }
      }
    },
    "ValidationConfig": {
      "type": "object",
      "properties": {
        "mode": {
          "type": "string",
          "enum": ["onChange", "onBlur", "onSubmit"],
          "default": "onBlur"
        },
        "showErrors": {
          "type": "boolean",
          "default": true
        },
        "scrollToError": {
          "type": "boolean",
          "default": true
        }
      }
    },
    "FormSettings": {
      "type": "object",
      "properties": {
        "submitUrl": {
          "type": "string",
          "format": "uri"
        },
        "method": {
          "type": "string",
          "enum": ["POST", "PUT", "PATCH"],
          "default": "POST"
        },
        "headers": {
          "type": "object"
        },
        "successMessage": {
          "type": "string"
        },
        "errorMessage": {
          "type": "string"
        },
        "redirectUrl": {
          "type": "string"
        },
        "saveProgress": {
          "type": "boolean",
          "default": false
        },
        "requireAuth": {
          "type": "boolean",
          "default": false
        }
      }
    }
  }
}
```

## CTA Configuration Specifications

### CTA Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CTA Configuration",
  "type": "object",
  "properties": {
    "primary": {
      "$ref": "#/definitions/CTAButton"
    },
    "secondary": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/CTAButton"
      }
    },
    "layout": {
      "type": "object",
      "properties": {
        "alignment": {
          "type": "string",
          "enum": ["left", "center", "right", "space-between"],
          "default": "right"
        },
        "spacing": {
          "type": "string",
          "enum": ["compact", "normal", "spacious"],
          "default": "normal"
        }
      }
    }
  },
  "definitions": {
    "CTAButton": {
      "type": "object",
      "required": ["label", "action"],
      "properties": {
        "label": {
          "type": "string",
          "description": "Button text"
        },
        "action": {
          "type": "string",
          "enum": [
            "submit",
            "navigate",
            "modal",
            "download",
            "external",
            "custom"
          ],
          "description": "Action type"
        },
        "target": {
          "type": "string",
          "description": "Target URL or modal ID"
        },
        "handler": {
          "type": "string",
          "description": "Custom handler function name"
        },
        "conditions": {
          "$ref": "#/definitions/CTAConditions"
        },
        "validation": {
          "type": "object",
          "properties": {
            "requireAllFields": {
              "type": "boolean",
              "default": true
            },
            "customValidation": {
              "type": "string"
            }
          }
        },
        "analytics": {
          "type": "object",
          "properties": {
            "event": {
              "type": "string"
            },
            "category": {
              "type": "string"
            },
            "data": {
              "type": "object"
            }
          }
        },
        "styling": {
          "$ref": "#/definitions/CTAStyling"
        },
        "behavior": {
          "$ref": "#/definitions/CTABehavior"
        }
      }
    },
    "CTAConditions": {
      "type": "object",
      "properties": {
        "if": {
          "type": "string",
          "description": "JavaScript expression to evaluate"
        },
        "then": {
          "$ref": "#/definitions/CTAAction"
        },
        "else": {
          "$ref": "#/definitions/CTAAction"
        }
      }
    },
    "CTAAction": {
      "type": "object",
      "properties": {
        "endpoint": {
          "type": "string",
          "description": "API endpoint to call"
        },
        "method": {
          "type": "string",
          "enum": ["GET", "POST", "PUT", "PATCH", "DELETE"],
          "default": "POST"
        },
        "redirect": {
          "type": "string",
          "description": "URL to redirect after action"
        },
        "modal": {
          "type": "string",
          "description": "Modal to show"
        },
        "message": {
          "type": "string",
          "description": "Message to display"
        },
        "tracking": {
          "type": "string",
          "description": "Analytics event to track"
        }
      }
    },
    "CTAStyling": {
      "type": "object",
      "properties": {
        "variant": {
          "type": "string",
          "enum": [
            "primary",
            "secondary",
            "outline",
            "ghost",
            "danger",
            "success"
          ],
          "default": "primary"
        },
        "size": {
          "type": "string",
          "enum": ["small", "medium", "large"],
          "default": "medium"
        },
        "fullWidth": {
          "type": "boolean",
          "default": false
        },
        "icon": {
          "type": "string",
          "description": "Icon name"
        },
        "iconPosition": {
          "type": "string",
          "enum": ["left", "right"],
          "default": "left"
        },
        "animation": {
          "type": "string",
          "enum": ["none", "pulse", "shake", "bounce"],
          "default": "none"
        },
        "className": {
          "type": "string",
          "description": "Additional CSS classes"
        }
      }
    },
    "CTABehavior": {
      "type": "object",
      "properties": {
        "loading": {
          "type": "object",
          "properties": {
            "show": {
              "type": "boolean",
              "default": true
            },
            "text": {
              "type": "string",
              "default": "Processing..."
            },
            "timeout": {
              "type": "integer",
              "description": "Timeout in milliseconds",
              "default": 30000
            }
          }
        },
        "confirmation": {
          "type": "object",
          "properties": {
            "required": {
              "type": "boolean",
              "default": false
            },
            "title": {
              "type": "string"
            },
            "message": {
              "type": "string"
            },
            "confirmText": {
              "type": "string",
              "default": "Confirm"
            },
            "cancelText": {
              "type": "string",
              "default": "Cancel"
            }
          }
        },
        "disabled": {
          "type": "object",
          "properties": {
            "condition": {
              "type": "string",
              "description": "JavaScript expression"
            },
            "message": {
              "type": "string",
              "description": "Tooltip message when disabled"
            }
          }
        }
      }
    }
  }
}
```

### Example CTA Configurations

```json
// Trial Signup CTA
{
  "primary": {
    "label": "Start 14-Day Free Trial",
    "action": "submit",
    "conditions": {
      "if": "formData.plan === 'trial' && !user.hasTrialed",
      "then": {
        "endpoint": "/api/subscriptions/trial",
        "method": "POST",
        "redirect": "/app/onboarding",
        "tracking": "trial_started"
      },
      "else": {
        "modal": "trial-expired-modal",
        "tracking": "trial_already_used"
      }
    },
    "styling": {
      "variant": "primary",
      "size": "large",
      "animation": "pulse",
      "icon": "rocket"
    },
    "behavior": {
      "loading": {
        "text": "Creating your trial account..."
      },
      "confirmation": {
        "required": true,
        "title": "Start Free Trial?",
        "message": "You'll have 14 days to explore all features. No credit card required."
      }
    }
  },
  "secondary": [
    {
      "label": "View Pricing",
      "action": "navigate",
      "target": "/pricing",
      "styling": {
        "variant": "outline"
      }
    }
  ]
}

// Purchase CTA
{
  "primary": {
    "label": "Purchase for ₹${formData.price}",
    "action": "custom",
    "handler": "handlePurchase",
    "validation": {
      "requireAllFields": true,
      "customValidation": "validatePaymentMethod"
    },
    "conditions": {
      "if": "user.walletBalance >= formData.price",
      "then": {
        "endpoint": "/api/purchases/wallet",
        "redirect": "/app/${appId}/success",
        "tracking": "purchase_wallet"
      },
      "else": {
        "handler": "initiateRazorpayPayment",
        "tracking": "purchase_razorpay"
      }
    },
    "styling": {
      "variant": "success",
      "size": "large",
      "fullWidth": true
    },
    "behavior": {
      "loading": {
        "text": "Processing payment..."
      },
      "disabled": {
        "condition": "!formData.acceptTerms",
        "message": "Please accept terms to continue"
      }
    }
  }
}
```

## Security Requirements

### Security Standards

```typescript
interface SecurityRequirements {
  authentication: {
    method: 'JWT';
    expiryTime: '15m';
    refreshTokenExpiry: '7d';
    passwordPolicy: {
      minLength: 8;
      requireUppercase: true;
      requireLowercase: true;
      requireNumbers: true;
      requireSpecialChars: true;
      preventCommonPasswords: true;
    };
    mfa: {
      supported: true;
      methods: ['totp', 'sms'];
    };
  };

  authorization: {
    model: 'RBAC';
    roles: ['admin', 'developer', 'customer'];
    permissions: string[];
    resourceLevelSecurity: true;
  };

  dataProtection: {
    encryption: {
      atRest: 'AES-256';
      inTransit: 'TLS 1.3';
      keyManagement: 'AWS KMS';
    };
    pii: {
      masking: true;
      retention: '90 days';
      rightToDelete: true;
    };
  };

  apiSecurity: {
    rateLimit: {
      authenticated: '1000/hour';
      unauthenticated: '100/hour';
      burstLimit: '50/minute';
    };
    cors: {
      enabled: true;
      allowedOrigins: string[];
      credentials: true;
    };
    headers: {
      helmet: true;
      csp: true;
      hsts: true;
    };
  };

  inputValidation: {
    framework: 'zod';
    sanitization: true;
    sqlInjectionPrevention: true;
    xssPrevention: true;
    fileUpload: {
      maxSize: '50MB';
      allowedTypes: string[];
      virusScan: true;
    };
  };

  auditLogging: {
    enabled: true;
    events: [
      'authentication',
      'authorization',
      'dataAccess',
      'dataModification',
      'configChange',
      'securityEvent'
    ];
    retention: '1 year';
    tamperProof: true;
  };

  vulnerability: {
    scanning: {
      frequency: 'daily';
      tools: ['OWASP ZAP', 'npm audit'];
    };
    dependencyCheck: true;
    codeAnalysis: 'SonarQube';
  };
}
```

### Security Implementation Examples

```typescript
// Next.js Authentication with NextAuth
import { NextAuthOptions } from 'next-auth';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Rate limiting check
        await checkRateLimit(credentials.email);

        // Get user from Supabase
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (!user) {
          // Prevent timing attacks
          await bcrypt.hash('dummy', 10);
          return null;
        }

        // Verify password
        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) {
          await logFailedAttempt(credentials.email);
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
};

// Middleware for protected routes
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // API routes
      if (req.nextUrl.pathname.startsWith('/api/admin')) {
        return token?.role === 'admin';
      }
      if (req.nextUrl.pathname.startsWith('/api/developer')) {
        return token?.role === 'developer' || token?.role === 'admin';
      }
      return !!token;
    },
  },
});
// Input Validation with Next.js API Routes
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

const appCreateSchema = z.object({
  name: z.string()
    .min(3, 'Name too short')
    .max(50, 'Name too long')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Invalid characters in name'),

  description: z.string()
    .max(1000, 'Description too long')
    .transform(val => DOMPurify.sanitize(val)),

  category: z.enum(['education', 'productivity', 'entertainment', 'utilities', 'business']),

  pricing: z.object({
    model: z.enum(['free', 'freemium', 'paid', 'subscription']),
    price: z.number().min(0).max(99999).optional(),
    currency: z.literal('INR')
  })
});

// File Upload Security
import multer from 'multer';
import { scanFile } from './antivirus';

const uploadConfig = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10
  },
  fileFilter: async (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }

    // Validate file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.png', '.jpg', '.jpeg', '.webp'];
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Invalid file extension'));
    }

    cb(null, true);
  },
  storage: multer.memoryStorage()
});

app.post('/upload', uploadConfig.single('file'), async (req, res) => {
  try {
    // Scan for viruses
    const scanResult = await scanFile(req.file.buffer);
    if (!scanResult.clean) {
      throw new Error('File failed security scan');
    }

    // Process and store file
    const fileUrl = await storageService.upload(req.file);

    res.json({ url: fileUrl });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

## Performance Targets

### Performance SLAs

```typescript
interface PerformanceSLAs {
  api: {
    p50: 100,  // 50th percentile response time in ms
    p95: 500,  // 95th percentile
    p99: 1000, // 99th percentile
    availability: 99.9, // percentage
  };

  database: {
    queryTime: {
      simple: 10,    // ms
      complex: 100,  // ms
      reporting: 1000 // ms
    };
    connectionPool: {
      min: 10,
      max: 100,
      idleTimeout: 10000
    };
  };

  frontend: {
    fcp: 1.8,  // First Contentful Paint in seconds
    lcp: 2.5,  // Largest Contentful Paint
    fid: 100,  // First Input Delay in ms
    cls: 0.1,  // Cumulative Layout Shift
    tti: 3.8   // Time to Interactive
  };

  scalability: {
    concurrentUsers: 10000,
    requestsPerSecond: 1000,
    dataGrowthRate: '1TB/year',
    horizontalScaling: true
  };
}
```

### Performance Optimization Strategies

```typescript
// 1. Database Optimization
class DatabaseOptimization {
  // Connection pooling
  private pool = new Pool({
    min: 10,
    max: 100,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000
  });

  // Query optimization with indexes
  async createIndexes() {
    await db.$executeRaw`
      CREATE INDEX CONCURRENTLY idx_apps_status_category
      ON apps(status, category)
      WHERE status = 'approved';

      CREATE INDEX CONCURRENTLY idx_transactions_user_created
      ON wallet_transactions(user_id, created_at DESC);

      CREATE INDEX CONCURRENTLY idx_subscriptions_status_end
      ON subscriptions(status, current_period_end)
      WHERE status IN ('active', 'trial');
    `;
  }

  // Materialized views for analytics
  async createMaterializedViews() {
    await db.$executeRaw`
      CREATE MATERIALIZED VIEW app_analytics_daily AS
      SELECT
        app_id,
        DATE(created_at) as date,
        COUNT(*) as installs,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(rating) as avg_rating
      FROM analytics_events
      WHERE event_name = 'app_install'
      GROUP BY app_id, DATE(created_at);

      CREATE INDEX ON app_analytics_daily(app_id, date);
    `;
  }
}

// 2. Caching Strategy
import { Redis } from 'ioredis';
import { LRUCache } from 'lru-cache';

class CacheService {
  private redis = new Redis({
    host: process.env.REDIS_HOST,
    port: 6379,
    maxRetriesPerRequest: 3
  });

  private localCache = new LRUCache<string, any>({
    max: 1000,
    ttl: 1000 * 60 * 5 // 5 minutes
  });

  async get<T>(key: string): Promise<T | null> {
    // Check local cache first
    const local = this.localCache.get(key);
    if (local) return local;

    // Check Redis
    const cached = await this.redis.get(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      this.localCache.set(key, parsed);
      return parsed;
    }

    return null;
  }

  async set(key: string, value: any, ttl: number = 3600) {
    const serialized = JSON.stringify(value);

    // Set in both caches
    this.localCache.set(key, value);
    await this.redis.setex(key, ttl, serialized);
  }

  async invalidate(pattern: string) {
    // Clear from Redis
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      await this.redis.del(...keys);
    }

    // Clear from local cache
    for (const key of this.localCache.keys()) {
      if (key.match(pattern)) {
        this.localCache.delete(key);
      }
    }
  }
}

// 3. API Response Optimization
class APIOptimization {
  // Response compression
  setupCompression(app: Express) {
    app.use(compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      }
    }));
  }

  // Pagination with cursor
  async paginateWithCursor(query: any, cursor?: string, limit: number = 20) {
    const where = cursor ? {
      ...query,
      id: { gt: cursor }
    } : query;

    const items = await db.app.findMany({
      where,
      take: limit + 1,
      orderBy: { id: 'asc' }
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, nextCursor, hasMore };
  }

  // Field selection
  async getAppWithFields(id: string, fields: string[]) {
    const select = fields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as any);

    return db.app.findUnique({
      where: { id },
      select
    });
  }
}

// 4. Frontend Optimization
class FrontendOptimization {
  // Image optimization
  getOptimizedImageUrl(url: string, width: number, quality: number = 80) {
    return `${process.env.CDN_URL}/image/${url}?w=${width}&q=${quality}&format=webp`;
  }

  // Bundle splitting configuration
  getWebpackConfig() {
    return {
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10
            },
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true
            }
          }
        }
      }
    };
  }

  // Service worker for caching
  getServiceWorkerConfig() {
    return {
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.sasarjan-appstore\.com\/v1\/apps$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 300 // 5 minutes
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
            }
          }
        }
      ]
    };
  }
}
```

## Integration Specifications

### Razorpay Integration

```typescript
interface RazorpayIntegration {
  config: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
  };

  payments: {
    createOrder(amount: number, currency: string): Promise<RazorpayOrder>;
    verifyPayment(orderId: string, paymentId: string, signature: string): boolean;
    refund(paymentId: string, amount?: number): Promise<RazorpayRefund>;
  };

  subscriptions: {
    createPlan(plan: SubscriptionPlan): Promise<RazorpayPlan>;
    createSubscription(customerId: string, planId: string): Promise<RazorpaySubscription>;
    cancelSubscription(subscriptionId: string): Promise<void>;
  };

  payouts: {
    createContact(developer: Developer): Promise<RazorpayContact>;
    createFundAccount(contactId: string, bankDetails: BankDetails): Promise<RazorpayFundAccount>;
    createPayout(amount: number, fundAccountId: string): Promise<RazorpayPayout>;
  };

  webhooks: {
    verify(body: string, signature: string): boolean;
    handleEvent(event: RazorpayEvent): Promise<void>;
  };
}

// Implementation
import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  async createPaymentOrder(amount: number, userId: string): Promise<PaymentOrder> {
    const order = await this.razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `wallet_${userId}_${Date.now()}`,
      notes: {
        userId,
        type: 'wallet_topup'
      }
    });

    // Store order in database
    await db.paymentOrder.create({
      data: {
        orderId: order.id,
        userId,
        amount,
        status: 'created'
      }
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    };
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return expectedSignature === signature;
  }

  async handleWebhook(body: string, signature: string): Promise<void> {
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Invalid webhook signature');
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'payment.captured':
        await this.handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'subscription.activated':
        await this.handleSubscriptionActivated(event.payload.subscription.entity);
        break;

      case 'payout.processed':
        await this.handlePayoutProcessed(event.payload.payout.entity);
        break;

      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }
  }
}
```

### Supabase Integration

```typescript
// Supabase Client Setup with TypeScript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Type-safe queries with Supabase
export async function getApprovedApps() {
  const { data, error } = await supabase
    .from('apps')
    .select(`
      *,
      developer:developers!inner(
        id,
        company_name,
        user:users!inner(
          full_name,
          avatar_url
        )
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Realtime subscription example
export function subscribeToAppUpdates(appId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`app:${appId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'apps',
        filter: `id=eq.${appId}`
      },
      callback
    )
    .subscribe();
}

// File upload with progress
export async function uploadAppIcon(file: File, appId: string) {
  const fileName = `${appId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from('app-icons')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('app-icons')
    .getPublicUrl(fileName);

  return publicUrl;
}

// Row Level Security Policies
const RLSPolicies = `
-- Apps: Public read for approved, write for developers
CREATE POLICY "Public can view approved apps" ON apps
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Developers can manage own apps" ON apps
  FOR ALL USING (
    developer_id IN (
      SELECT id FROM developers WHERE user_id = auth.uid()
    )
  );

-- Wallet: Users can only see own transactions
CREATE POLICY "Users can view own wallet" ON wallet_transactions
  FOR SELECT USING (user_id = auth.uid());

-- Subscriptions: Users can manage own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Forms: Public read, developer write
CREATE POLICY "Public can view forms" ON forms
  FOR SELECT USING (
    app_id IN (SELECT id FROM apps WHERE status = 'approved')
  );

CREATE POLICY "Developers can manage forms" ON forms
  FOR ALL USING (
    app_id IN (
      SELECT a.id FROM apps a
      JOIN developers d ON a.developer_id = d.id
      WHERE d.user_id = auth.uid()
    )
  );
`;

// Storage bucket policies
const StoragePolicies = {
  'app-icons': {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },
  'app-screenshots': {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  },
  'app-files': {
    public: false,
    fileSizeLimit: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: ['application/zip', 'application/x-tar']
  }
};

// Advanced Supabase Queries
export const AppQueries = {
  // Get apps with pagination
  async getAppsPaginated(page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('apps')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .range(from, to)
      .order('average_rating', { ascending: false });

    return { data, error, total: count, page, limit };
  },

  // Complex join query
  async getAppWithDetails(appId: string) {
    const { data, error } = await supabase
      .from('apps')
      .select(`
        *,
        developer:developers!inner(*),
        reviews:app_reviews(
          rating,
          comment,
          user:users(full_name, avatar_url)
        ),
        current_version:app_versions!inner(
          version,
          changelog,
          created_at
        )
      `)
      .eq('id', appId)
      .single();

    return { data, error };
  },

  // Transaction with RPC
  async purchaseApp(userId: string, appId: string, amount: number) {
    const { data, error } = await supabase
      .rpc('purchase_app', {
        p_user_id: userId,
        p_app_id: appId,
        p_amount: amount
      });

    return { data, error };
  }
};

// Generate TypeScript types from database
// Run: npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

## Data Models

### TypeScript Type Definitions

```typescript
// User types
interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'developer' | 'admin';
  walletBalance: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

interface Developer extends User {
  developerId: string;
  companyName?: string;
  companyWebsite?: string;
  taxId?: string;
  bankDetails?: BankDetails;
  commissionRate: number;
  payoutThreshold: number;
  totalEarnings: number;
  totalPaidOut: number;
  verifiedAt?: Date;
}

interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  accountType: 'savings' | 'current';
}

// App types
interface App {
  id: string;
  developerId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: AppCategory;
  status: AppStatus;
  iconUrl: string;
  screenshots: string[];
  pricingModel: PricingModel;
  price?: number;
  currency: string;
  trialDays: number;
  freeContentRules: ContentRules;
  paidContentRules: ContentRules;
  version: string;
  minAppVersion?: string;
  sizeBytes: number;
  totalInstalls: number;
  activeInstalls: number;
  averageRating: number;
  totalReviews: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

type AppCategory = 'education' | 'productivity' | 'entertainment' | 'utilities' | 'business';
type AppStatus = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'suspended';
type PricingModel = 'free' | 'freemium' | 'paid' | 'subscription';

interface ContentRules {
  pages?: number | 'unlimited';
  features?: string[];
  dataLimit?: number;
  apiCalls?: number;
  customRules?: Record<string, any>;
}

// Transaction types
interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType?: 'purchase' | 'subscription' | 'topup' | 'payout' | 'refund';
  referenceId?: string;
  gateway?: 'razorpay' | 'wallet' | 'system';
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  status: TransactionStatus;
  createdAt: Date;
  completedAt?: Date;
}

type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Subscription types
interface Subscription {
  id: string;
  userId: string;
  appId: string;
  planId?: string;
  status: SubscriptionStatus;
  trialEndsAt?: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  gatewaySubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';

// Form types
interface Form {
  id: string;
  appId: string;
  name: string;
  slug: string;
  description?: string;
  schema: FormSchema;
  uiSchema?: any;
  ctaConfig?: CTAConfig;
  requiresAuth: boolean;
  saveSubmissions: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FormSubmission {
  id: string;
  formId: string;
  userId?: string;
  data: Record<string, any>;
  metadata: Record<string, any>;
  status: 'submitted' | 'processing' | 'completed' | 'failed';
  processedAt?: Date;
  createdAt: Date;
}

// Analytics types
interface AnalyticsEvent {
  id: string;
  appId?: string;
  userId?: string;
  eventName: string;
  eventCategory?: string;
  eventData: Record<string, any>;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: Date;
}

interface AppAnalytics {
  appId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    installs: number;
    activeUsers: number;
    revenue: number;
    avgSessionDuration: number;
    retentionRate: number;
    conversionRate: number;
  };
  topEvents: Array<{
    name: string;
    count: number;
  }>;
  userSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
}
```

---

**Document Version**: 1.4  
**Last Updated**: 03-Jul-25  
**Related Documents**:

- [Architecture Plan](./AppStore_Architecture_Plan_03-Jul-25.md)
- [Claude Integration](./Claude_MCP_Integration_Strategy.md)
- [Project Management](./Project_Management_Guide.md)
- [Development Workflow](./Development_Workflow.md)
