# Phase 3: Startup Journey & Dashboard

## Objectives
- Build comprehensive startup dashboard
- Implement visual journey navigator
- Create credits and benefits hub
- Add milestone and progress tracking
- Gamification elements for engagement

## Database Schema Extensions

```sql
-- Startup milestones
CREATE TABLE startup_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id),
  milestone_type TEXT, -- 'product', 'funding', 'team', 'revenue', 'users'
  title TEXT NOT NULL,
  description TEXT,
  achieved_date DATE,
  evidence_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journey stages
CREATE TABLE journey_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'idea', 'validation', 'mvp', 'traction', 'growth', 'scale'
  order_index INTEGER,
  description TEXT,
  typical_duration_months INTEGER,
  key_milestones JSONB,
  resources JSONB,
  success_metrics JSONB
);

-- Startup journey progress
CREATE TABLE startup_journey (
  startup_id UUID REFERENCES startups(id),
  current_stage_id UUID REFERENCES journey_stages(id),
  stage_started_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  completed_tasks JSONB,
  next_milestones JSONB,
  ai_recommendations JSONB,
  PRIMARY KEY (startup_id)
);

-- Credits and benefits
CREATE TABLE available_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- 'AWS', 'Google Cloud', 'Government'
  name TEXT NOT NULL,
  description TEXT,
  value_amount INTEGER,
  value_currency TEXT DEFAULT 'INR',
  eligibility_criteria JSONB,
  application_process JSONB,
  valid_until DATE,
  category TEXT[], -- 'cloud', 'saas', 'legal', 'marketing'
  is_active BOOLEAN DEFAULT true
);

-- Startup claimed credits
CREATE TABLE startup_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id),
  credit_id UUID REFERENCES available_credits(id),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT, -- 'pending', 'approved', 'active', 'expired'
  activation_code TEXT,
  expiry_date DATE,
  usage_tracking JSONB
);

-- Government schemes
CREATE TABLE government_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT,
  description TEXT,
  benefits JSONB,
  eligibility JSONB,
  application_link TEXT,
  documents_required TEXT[],
  state TEXT, -- null for central schemes
  deadline DATE,
  is_active BOOLEAN DEFAULT true
);
```

## Dashboard Components

### 1. Startup Dashboard Overview
```tsx
// app/dashboard/page.tsx
Sections:
- Welcome header with progress ring
- Key metrics cards
  - Days since founding
  - Team size
  - Funding raised
  - Active applications
- Quick actions
  - Update pitch deck
  - Apply to programs
  - Find co-founder
- Recent activity feed
- Upcoming deadlines
```

### 2. Visual Journey Navigator
```tsx
// components/journey/JourneyNavigator.tsx
Features:
- Interactive timeline view
- Current stage indicator
- Progress within stage
- Completed milestones
- Upcoming milestones
- Suggested next steps
- Time estimates
```

### 3. Milestone Tracker
```tsx
// components/journey/MilestoneTracker.tsx
Categories:
- Product Milestones
  - First prototype
  - MVP launch
  - First customer
  - Product-market fit
  
- Funding Milestones
  - First revenue
  - Angel round
  - Seed funding
  - Series A prep
  
- Team Milestones
  - Co-founder joined
  - First hire
  - Advisory board
  - 10+ team size
  
- Growth Milestones
  - 100 users
  - 1000 users
  - First enterprise client
  - International expansion
```

### 4. Credits & Benefits Hub
```tsx
// app/dashboard/credits/page.tsx
Sections:
- Available Credits
  - Cloud credits (AWS, GCP, Azure)
  - SaaS tools (Notion, Slack, GitHub)
  - Professional services
  
- Government Schemes
  - Startup India benefits
  - State schemes
  - MSME benefits
  - Export incentives
  
- Claimed Benefits
  - Active credits
  - Usage tracking
  - Expiry alerts
  
- Eligibility Checker
  - AI-powered recommendations
  - Quick eligibility quiz
  - Document checklist
```

### 5. AI Recommendations Engine
```tsx
// components/ai/RecommendationCard.tsx
Recommendations for:
- Next milestone to focus on
- Relevant incubator programs
- Applicable credits/schemes
- Skill gaps to fill
- Potential co-founders
- Learning resources
```

## Gamification Elements

### 1. Achievement Badges
```typescript
Badges:
- "Early Bird" - Among first 100 startups
- "Go-Getter" - Complete profile in 24h
- "Networker" - Connect with 10 startups
- "Funded" - Raise first round
- "Mentor Magnet" - Get 5 mentor connections
- "Credit Master" - Claim 5+ credits
```

### 2. Startup Score
```typescript
Score Components:
- Profile completeness (20%)
- Milestone achievement (30%)
- Engagement level (20%)
- Application success (20%)
- Community contribution (10%)
```

### 3. Leaderboards
```typescript
Categories:
- Fastest growing (by stage)
- Most active this month
- Top rated by mentors
- Sector leaders
```

## Journey Stage Details

### Stage 1: Idea Validation
- Duration: 1-3 months
- Key Activities: Market research, customer interviews
- Resources: Validation frameworks, survey tools
- Success Metrics: Problem-solution fit confirmed

### Stage 2: MVP Development
- Duration: 3-6 months
- Key Activities: Build core features, early testing
- Resources: Development tools, beta testers
- Success Metrics: Working prototype, initial users

### Stage 3: Market Traction
- Duration: 6-12 months
- Key Activities: Customer acquisition, iterate
- Resources: Marketing tools, growth hacks
- Success Metrics: Paying customers, retention

### Stage 4: Growth
- Duration: 12-24 months
- Key Activities: Scale operations, team building
- Resources: Hiring guides, ops tools
- Success Metrics: Revenue growth, market share

## API Endpoints (Phase 3)

```typescript
// Journey APIs
GET /api/journey/stages - All journey stages
GET /api/journey/startup/[id] - Startup journey status
PUT /api/journey/progress - Update progress
POST /api/journey/milestone - Add milestone

// Credits APIs
GET /api/credits/available - List all credits
GET /api/credits/eligible/[startup-id] - Eligible credits
POST /api/credits/claim - Claim a credit
GET /api/credits/claimed - User's claimed credits

// Schemes APIs
GET /api/schemes - Government schemes
GET /api/schemes/check-eligibility - Eligibility checker
GET /api/schemes/[id]/apply - Apply to scheme

// Gamification APIs
GET /api/achievements/[user-id] - User achievements
GET /api/leaderboard/[category] - Leaderboard data
GET /api/startup-score/[id] - Startup score
```

## Dashboard Analytics
- Time spent on platform
- Feature usage patterns
- Milestone completion rates
- Credit claim success rates
- Journey progression analytics
- Drop-off points identification