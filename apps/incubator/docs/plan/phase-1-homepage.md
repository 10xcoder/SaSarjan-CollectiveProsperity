# Phase 1: Foundation & Homepage Launch

## Objectives
- Set up the Incubator app within the monorepo
- Create an engaging homepage with core discovery features
- Implement basic incubator search and filtering
- Establish the visual design language

## Technical Setup

### 1. App Initialization
```bash
# Create app structure
apps/incubator/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   ├── api/
│   │   └── globals.css
│   ├── components/
│   │   ├── homepage/
│   │   ├── discovery/
│   │   └── shared/
│   ├── hooks/
│   ├── lib/
│   └── types/
├── public/
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── CLAUDE.md
```

### 2. Database Schema
```sql
-- Core tables for Phase 1
CREATE TABLE incubators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  location JSONB, -- {city, state, country, lat, lng}
  type TEXT[], -- ['physical', 'virtual', 'hybrid']
  sectors TEXT[], -- ['healthtech', 'fintech', 'edtech', etc.]
  stage_focus TEXT[], -- ['idea', 'mvp', 'growth', 'scale']
  founded_year INTEGER,
  portfolio_size INTEGER,
  notable_alumni TEXT[],
  facilities JSONB,
  programs JSONB,
  application_process JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE incubator_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incubator_id UUID REFERENCES incubators(id),
  type TEXT, -- 'mentorship', 'funding', 'infrastructure', 'network'
  title TEXT,
  description TEXT,
  value JSONB
);

CREATE TABLE incubator_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incubator_id UUID REFERENCES incubators(id),
  type TEXT, -- 'image', 'video'
  url TEXT,
  caption TEXT,
  order_index INTEGER
);
```

## Homepage Components

### 1. Hero Section
```tsx
// components/homepage/HeroSection.tsx
- Compelling headline: "Find Your Perfect Incubator Match"
- Subheadline: "AI-powered discovery platform connecting startups with incubators"
- Primary CTA: "Find Incubators" / "List Your Incubator"
- Background: Animated gradient or subtle particle effect
```

### 2. Interactive Map Discovery
```tsx
// components/discovery/IncubatorMap.tsx
- Mapbox integration showing incubator locations
- Cluster markers for dense areas
- Popup cards with basic info
- Filter controls overlay
- List/Map view toggle
```

### 3. Smart Filter Sidebar
```tsx
// components/discovery/FilterSidebar.tsx
Filters:
- Location (Country/State/City)
- Type (Physical/Virtual/Hybrid)
- Sector Focus (Multi-select)
- Stage Focus (Idea to Scale)
- Program Duration
- Equity Requirements
- Application Status (Open/Closed)
```

### 4. Featured Incubators
```tsx
// components/homepage/FeaturedIncubators.tsx
- Carousel of top incubators
- Card design with:
  - Logo and name
  - Location
  - Sector badges
  - "X startups incubated"
  - Quick apply button
```

### 5. Value Propositions
```tsx
// components/homepage/ValueProps.tsx
For Startups:
- "Discover 500+ incubators"
- "AI-matched recommendations"
- "Track your applications"

For Incubators:
- "Reach quality startups"
- "Streamline applications"
- "Showcase your success"
```

### 6. How It Works
```tsx
// components/homepage/HowItWorks.tsx
Step 1: Create your profile
Step 2: Get AI-matched suggestions
Step 3: Apply with one click
Step 4: Track your journey
```

## API Endpoints (Phase 1)

```typescript
// /api/incubators
GET /api/incubators - List with filters
GET /api/incubators/[id] - Single incubator
GET /api/incubators/featured - Featured list
GET /api/incubators/map - Map data with clusters

// /api/search
GET /api/search/incubators - Full-text search
GET /api/search/suggestions - Autocomplete

// /api/filters
GET /api/filters/sectors - Available sectors
GET /api/filters/locations - Location hierarchy
```

## Design System Extensions

### Colors
```css
/* Extend existing theme */
--incubator-primary: #4F46E5; /* Indigo */
--incubator-secondary: #10B981; /* Emerald */
--startup-badge: #F59E0B; /* Amber */
--investor-badge: #8B5CF6; /* Violet */
```

### Components
- IncubatorCard
- FilterChip
- StageProgress
- MapMarker
- StatBadge

## Performance Targets
- Homepage Load: < 2s
- Map Interaction: 60fps
- Search Results: < 500ms
- Mobile Responsive: 100%

## Launch Checklist
- [ ] App structure created
- [ ] Database tables migrated
- [ ] Homepage components built
- [ ] Map integration working
- [ ] Search functionality
- [ ] Mobile responsive
- [ ] SEO metadata
- [ ] Analytics tracking
- [ ] Error handling
- [ ] Loading states