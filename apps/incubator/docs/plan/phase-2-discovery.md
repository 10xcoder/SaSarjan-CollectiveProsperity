# Phase 2: Profiles & Core Discovery Features

## Objectives
- Build comprehensive incubator profile pages
- Implement startup registration and profile creation
- Enhance search with advanced filtering
- Add user engagement features (saves, alerts)

## Database Schema Extensions

```sql
-- Startup profiles
CREATE TABLE startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  stage TEXT, -- 'idea', 'prototype', 'mvp', 'revenue', 'growth'
  sector TEXT[],
  founded_date DATE,
  team_size INTEGER,
  location JSONB,
  pitch_deck_url TEXT,
  video_pitch_url TEXT,
  looking_for TEXT[], -- ['incubation', 'funding', 'mentorship', 'co-founder']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Startup team members
CREATE TABLE startup_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id),
  user_id UUID REFERENCES users(id),
  role TEXT, -- 'founder', 'co-founder', 'cto', 'advisor'
  equity_percentage DECIMAL,
  joined_date DATE,
  bio TEXT
);

-- Incubator programs
CREATE TABLE incubator_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incubator_id UUID REFERENCES incubators(id),
  name TEXT NOT NULL,
  description TEXT,
  duration_months INTEGER,
  start_date DATE,
  application_deadline DATE,
  cohort_size INTEGER,
  equity_ask DECIMAL,
  funding_amount INTEGER,
  program_type TEXT, -- 'accelerator', 'incubator', 'pre-incubator'
  is_virtual BOOLEAN DEFAULT false,
  benefits JSONB,
  eligibility_criteria JSONB,
  application_process JSONB,
  status TEXT DEFAULT 'upcoming' -- 'upcoming', 'open', 'closed', 'ongoing'
);

-- User interactions
CREATE TABLE saved_incubators (
  user_id UUID REFERENCES users(id),
  incubator_id UUID REFERENCES incubators(id),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  PRIMARY KEY (user_id, incubator_id)
);

CREATE TABLE search_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT,
  filters JSONB,
  frequency TEXT, -- 'daily', 'weekly', 'instant'
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Feature Components

### 1. Incubator Profile Page
```tsx
// app/incubators/[slug]/page.tsx
Sections:
- Hero with logo, name, location
- Overview & About
- Programs (current & upcoming)
- Portfolio companies showcase
- Success metrics
- Facilities & Benefits
- Application process
- Reviews & Ratings
- Contact information
```

### 2. Startup Registration Flow
```tsx
// app/startup/register/page.tsx
Multi-step wizard:
1. Basic Information
   - Startup name, tagline
   - Stage selection
   - Sector (multi-select)
   
2. Team Details
   - Founder profiles
   - Team members
   - Advisors
   
3. Business Details
   - Problem & Solution
   - Target market
   - Business model
   - Traction metrics
   
4. Documents
   - Pitch deck upload
   - Video pitch (optional)
   - Incorporation docs
   
5. Preferences
   - Looking for (incubation/funding/mentorship)
   - Preferred locations
   - Program duration preference
```

### 3. Startup Profile Builder
```tsx
// components/startup/ProfileBuilder.tsx
Features:
- Progress indicator
- Auto-save functionality
- Preview mode
- Completeness score
- AI suggestions for improvement
```

### 4. Advanced Search
```tsx
// app/search/page.tsx
Features:
- Full-text search across all fields
- Filter combinations
- Search history
- Saved searches
- Export results
- Sort options (relevance, newest, popularity)
```

### 5. Application Tracker
```tsx
// components/startup/ApplicationTracker.tsx
Track:
- Applied programs
- Application status
- Deadlines
- Required documents
- Interview schedules
- Decision timelines
```

## User Flows

### Startup Onboarding Flow
```
Landing → Sign Up → Email Verification → 
Profile Creation → Sector Selection → 
Team Setup → Document Upload → 
Dashboard Access
```

### Incubator Discovery Flow
```
Homepage → Search/Filter → 
Results List → Incubator Profile → 
Save/Apply → Track Application
```

### Saved Searches Flow
```
Search → Apply Filters → 
Save Search → Name & Frequency → 
Receive Alerts → Click to Results
```

## API Endpoints (Phase 2)

```typescript
// Startup APIs
POST /api/startups - Create startup profile
GET /api/startups/[id] - Get startup details
PUT /api/startups/[id] - Update profile
POST /api/startups/team - Add team member

// Program APIs
GET /api/programs - List all programs
GET /api/programs/upcoming - Upcoming programs
GET /api/programs/[id] - Program details
POST /api/programs/apply - Apply to program

// User Interaction APIs
POST /api/saved-incubators - Save incubator
DELETE /api/saved-incubators/[id] - Unsave
GET /api/saved-incubators - Get saved list

POST /api/search-alerts - Create alert
GET /api/search-alerts - Get user alerts
PUT /api/search-alerts/[id] - Update alert
```

## UI/UX Enhancements

### 1. Micro-interactions
- Smooth hover effects on cards
- Progress animations
- Success confirmations
- Loading skeletons

### 2. Empty States
- Helpful messages
- Action suggestions
- Illustration/icons

### 3. Profile Completeness
- Visual progress bars
- Checklist items
- Rewards/badges for completion

### 4. Social Proof
- Success stories
- Testimonials
- Alumni showcases
- Stats and numbers

## Performance Optimizations
- Image optimization with next/image
- Lazy loading for lists
- Pagination for search results
- Caching strategies
- Database indexing on search fields

## Analytics Events
- Profile creation completed
- Search performed
- Incubator saved
- Application started
- Filter usage patterns
- Page view duration