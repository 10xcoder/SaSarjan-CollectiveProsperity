# Incubator.in - AI Assistant Context

## Overview
Incubator.in is a next-generation discovery, matchmaking, and support platform for the startup ecosystem. It connects startups with incubators, accelerators, co-founders, investors, and government benefits through AI-powered matching.

## Quick Start Commands
```bash
# Development
cd apps/incubator
pnpm dev              # Start on port 3006
pnpm build           # Build for production
pnpm typecheck       # Check TypeScript
pnpm lint            # Lint code

# Database
pnpm db:migrate      # Run migrations
pnpm db:seed         # Seed sample data
```

## Project Structure
```
apps/incubator/
├── src/
│   ├── app/              # Next.js app router
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Startup dashboard
│   │   ├── incubators/  # Incubator profiles
│   │   ├── search/      # Search & discovery
│   │   └── virtual/     # Virtual incubation
│   ├── components/       # React components
│   │   ├── ai/         # AI-powered features
│   │   ├── discovery/   # Search & filters
│   │   ├── journey/     # Startup journey
│   │   └── shared/      # Reusable components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities & helpers
│   │   ├── ai/         # AI/ML functions
│   │   ├── db/         # Database queries
│   │   └── matching/    # Matching algorithms
│   └── types/           # TypeScript types
├── docs/                # Documentation
│   └── plan/           # Implementation plans
├── public/             # Static assets
└── CLAUDE.md          # This file
```

## Key Features & Implementation Status

### Phase 1: Foundation & Discovery ⏳
- [ ] Homepage with hero section
- [ ] Interactive map (Mapbox integration)
- [ ] Basic incubator search
- [ ] Filter sidebar
- [ ] Featured incubators

### Phase 2: Profiles & Core Features 🔜
- [ ] Incubator profile pages
- [ ] Startup registration flow
- [ ] Advanced search
- [ ] Saved searches & alerts
- [ ] Application tracking

### Phase 3: Startup Journey 🔜
- [ ] Startup dashboard
- [ ] Visual journey navigator
- [ ] Milestone tracking
- [ ] Credits & benefits hub
- [ ] Gamification elements

### Phase 4: AI Features 🔜
- [ ] AI-powered matchmaking
- [ ] Co-founder discovery
- [ ] Virtual incubation
- [ ] Investment readiness scoring
- [ ] AI assistant (StartupGPT)

## Tech Stack
- **Framework**: Next.js 15.2.1 (App Router)
- **Database**: Supabase (PostgreSQL + pgvector)
- **Auth**: @sasarjan/auth (shared auth)
- **UI**: @sasarjan/ui + Tailwind CSS
- **AI/ML**: OpenAI GPT-4, embeddings with pgvector
- **Maps**: Mapbox GL JS
- **State**: Zustand
- **Analytics**: Vercel Analytics

## Database Schema Overview
```sql
-- Core entities
incubators           # Incubator profiles
startups            # Startup profiles
incubator_programs  # Programs offered
startup_journey     # Journey tracking

-- AI/Matching
startup_embeddings     # Vector embeddings
incubator_embeddings   # Vector embeddings
ai_matches            # Match results

-- User engagement
saved_incubators    # User saves
search_alerts       # Email alerts
startup_credits     # Claimed benefits
```

## API Routes Pattern
```typescript
/api/incubators         # Incubator CRUD
/api/startups          # Startup CRUD
/api/search            # Search functionality
/api/ai/matches        # AI matching
/api/journey           # Journey tracking
/api/credits           # Credits/benefits
```

## Environment Variables
```bash
# Required for development
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
MAPBOX_ACCESS_TOKEN=
OPENAI_API_KEY=

# Optional
NEXT_PUBLIC_ENVIRONMENT=development
SENTRY_DSN=
VERCEL_ANALYTICS_ID=
```

## Common Development Tasks

### Adding a New Incubator Feature
1. Update database schema if needed
2. Create API route in `app/api/`
3. Add types in `types/`
4. Build UI component
5. Add to relevant page
6. Test with sample data

### Implementing AI Features
1. Generate embeddings using OpenAI
2. Store in pgvector columns
3. Use similarity search for matching
4. Add feedback loop for improvement
5. Cache results in Redis

### Performance Optimization
- Use Next.js Image for logos
- Implement infinite scroll for lists
- Cache API responses
- Lazy load heavy components
- Optimize database queries

## Testing Approach
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Component testing
pnpm test:components
```

## Deployment Checklist
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Mapbox token configured
- [ ] OpenAI API key set
- [ ] Analytics configured
- [ ] Error tracking enabled
- [ ] Performance monitoring

## Important Notes
1. Always use the shared auth system from @sasarjan/auth
2. Follow the monorepo's UI component patterns
3. Ensure mobile responsiveness
4. Implement proper error boundaries
5. Add loading states for all async operations
6. Use the shared wallet system for any payments

## Reference Documentation
- Phase 1 Plan: `/docs/plan/phase-1-homepage.md`
- Phase 2 Plan: `/docs/plan/phase-2-discovery.md`
- Phase 3 Plan: `/docs/plan/phase-3-journey.md`
- Phase 4 Plan: `/docs/plan/phase-4-ai-features.md`

## AI Assistant Instructions
When working on this app:
1. Prioritize user experience and performance
2. Follow the phased implementation approach
3. Reuse existing packages and patterns
4. Ensure all features work on mobile
5. Implement proper TypeScript types
6. Add comprehensive error handling
7. Follow the existing code style

Remember: This app is part of the SaSarjan ecosystem. Maintain consistency with other apps while building unique value for the startup community.