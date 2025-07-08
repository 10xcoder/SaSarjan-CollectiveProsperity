# SaSarjan App Store - Claude Code Context

## 🚀 TOKEN OPTIMIZATION: Use CLAUDE-MINIMAL.md

**For faster, cheaper sessions**: Start with CLAUDE-MINIMAL.md instead of this file.
Only load this full context when you need complete documentation.

## 🚨 CRITICAL: Time Zone Handling

- **System shows UTC time** - Do NOT use system time directly
- **ALWAYS add 5:30 hours for IST** (Indian Standard Time)
- **Use this command**: `TZ='Asia/Kolkata' date +'%d-%b-%Y, %A %H:%M IST'`
- **All timestamps in documentation MUST be in IST**
- **Never use raw `date` command** - Always specify timezone

## Standard Workflow

1. **Start with Documentation Navigation**: Use plan/README.md as your master index to understand current state and find relevant documentation
2. **Check Current Sprint**: Read strategic/sprints.md to align work with sprint goals
3. **Load Todo List**: Read plan/claude-todos/active-todos.json to understand pending tasks and blockers
4. **Read Context**: Review latest session log from logs/claude-sessions/ for continuity
5. **Check Summaries**: Review plan/summaries/ for important context and decisions
6. **Plan Your Work**: Think through the problem, read the codebase for relevant files, and write a plan
7. **Create Session Log**: Start session log in logs/claude-sessions/YYYY-MM/session-logs/YYYY-MM-DD-HH-MM.md using template
8. **Verify Plan**: Before beginning work, check in with user to verify the plan
9. **Execute with Logging**: Work on todo items, marking complete as you go, and document all actions in session log
10. **Update Todo List**: Save progress to plan/claude-todos/active-todos.json throughout session
11. **Keep It Simple**: Make every task and code change as simple as possible. Avoid massive or complex changes. Everything is about simplicity
12. **Document Decisions**: Record key decisions, patterns, and learnings in session log
13. **Save Important Summaries**: Create summaries in plan/summaries/ for strategic discussions
14. **Update Context**: Add context for next session and flag any blockers
15. **Complete Session Log**: Finalize session log with outcomes, metrics, and next steps
16. **Update Sprint Log**: Add session summary to strategic/sprints.md in descending order (newest first)

## Project Overview

SaSarjan App Store is a **Collective Prosperity Platform** designed to host and discover applications that contribute to holistic growth across eight prosperity categories: Personal Transformation, Organizational Excellence, Community Resilience, Ecological Regeneration, Economic Empowerment, Knowledge Commons, Social Innovation, and Cultural Expression.

## Key Features

- **Shared Wallet System**: Single payment account across all apps
- **Revenue Sharing**: Automated developer payouts via Razorpay
- **Hyper-Personalization**: ML-driven content and app recommendations
- **Multi-lingual Support**: 20+ languages with RTL support
- **Location Awareness**: Geo-based features for all content
- **Dynamic Theming**: Configurable color palettes
- **Tag-Based Discovery**: Flexible categorization
- **Modular Apps**: Apps with pluggable modules
- **Discovery Platform**: Curates external apps aligned with collective prosperity
- **Impact Measurement**: Real-world outcome tracking

## Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5.5+
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 3.4+ with shadcn/ui
- **State**: Zustand + React Query
- **Build**: Turbo 2.0+ with pnpm workspaces
- **Deployment**: Vercel
- **Payments**: Razorpay
- **Maps**: Mapbox GL JS
- **i18n**: next-intl
- **Animation**: Framer Motion

## Project Structure

```
/
├── apps/
│   ├── web/              # Main SaSarjan App Store
│   ├── talentexcel/      # Career opportunities platform
│   ├── sevapremi/        # Community service platform
│   ├── 10xgrowth/        # Business growth platform
│   └── admin/            # Admin dashboard
├── packages/
│   ├── ui/              # Shared UI components
│   ├── database/        # Database types and utilities
│   ├── auth/            # Authentication & SSO
│   └── shared/          # Shared utilities
├── services/
│   ├── api/             # API services
│   └── workers/         # Background workers
├── plan/                # Master documentation hub
│   ├── README.md        # 📋 Master index - navigation to all docs
│   ├── strategic/       # 📊 Strategic planning documents
│   ├── teams/           # 👥 Team-specific documentation
│   │   ├── central-team/     # Central Team governance docs
│   │   ├── claude-ai/        # Claude AI session & automation docs
│   │   └── developers/       # Developer guides and app-specific docs
│   ├── automation/      # ⚙️ CI/CD, testing, and automation
│   ├── architecture/    # 🏗️ Technical architecture and patterns
│   └── logs/           # 📝 Session logs, retrospectives, metrics
├── docs/                # Project documentation
└── turbo.json          # Turbo configuration
```

## Documentation Hierarchy & Navigation

### 🎯 Quick Start: Always Use plan/README.md

**Master Index**: plan/README.md contains navigation to ALL project documentation organized by role and purpose. Start here for any session.

### 📊 Strategic Planning (plan/strategic/)

- **roadmap.md**: 6-month strategic vision and epic tracking
- **sprints.md**: Weekly sprint planning and execution tracking
- **multi-app-development-plan.md**: Strategy for 3 interconnected apps

### 👥 Team Documentation (plan/teams/)

#### Claude AI Team (plan/teams/claude-ai/)

- **session-guidelines.md**: How to conduct effective development sessions
- **logging-requirements.md**: Detailed session documentation standards
- **automation-tasks.md**: Claude's role and responsibilities
- **context-management.md**: Maintaining context across sessions

#### Central Team (plan/teams/central-team/)

- **setup-checklist.md**: Infrastructure and environment setup
- **infrastructure-guide.md**: Detailed technical configuration
- **security-procedures.md**: Security protocols and compliance
- **deployment-workflows.md**: Production deployment procedures

#### Developer Teams (plan/teams/developers/)

- **shared/**: Common resources for all developers
  - onboarding-guide.md, daily-workflow.md, ai-assistant-templates.md
- **talentexcel/**: TalentExcel-specific setup and requirements
- **sevapremi/**: SevaPremi-specific setup and requirements
- **10xgrowth/**: 10xGrowth-specific setup and requirements

### ⚙️ Automation & Quality (plan/automation/)

- **testing-deployment-pipeline.md**: Automated quality assurance
- **ci-cd-setup.md**: GitHub Actions configuration
- **monitoring-alerts.md**: System health monitoring

### 📝 Session Logging (plan/logs/)

- **claude-sessions/**: All Claude AI session logs with context
- **sprint-retrospectives/**: Weekly sprint reviews and analysis
- **metrics/**: Performance and productivity tracking

## Key Commands

```bash
# Development - Individual Apps
pnpm dev              # Start all development servers
pnpm dev:web          # Main SaSarjan App Store (port 3000)
pnpm dev:talentexcel  # TalentExcel app (port 3001)
pnpm dev:sevapremi    # SevaPremi app (port 3002)
pnpm dev:10xgrowth    # 10xGrowth app (port 3003)
pnpm dev:admin        # Admin dashboard (port 3004)
pnpm dev:all          # Run all apps in parallel

# Build Commands
pnpm build            # Build all packages
pnpm build:web        # Build main app
pnpm build:talentexcel # Build TalentExcel
pnpm build:sevapremi  # Build SevaPremi
pnpm build:10xgrowth  # Build 10xGrowth
pnpm build:admin      # Build admin

# Testing & Quality
pnpm lint            # Run linting
pnpm typecheck       # Run type checking
pnpm test            # Run tests

# Database
pnpm db:migrate      # Run migrations
pnpm db:seed         # Seed database
pnpm db:types        # Generate TypeScript types
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

- Supabase credentials
- Razorpay API keys
- Mapbox access token
- Sentry DSN
- PostHog keys

## Development Workflow

1. Always run `pnpm install` after pulling changes
2. Use feature branches: `feature/description`
3. Run `pnpm lint` and `pnpm typecheck` before commits
4. Write tests for new features
5. Update documentation as needed

## API Conventions

- RESTful endpoints under `/api/v1/`
- Use Zod for validation
- Return consistent error responses
- Implement proper rate limiting
- Document with OpenAPI

## Database Conventions

- Use UUID for all IDs
- Add `created_at` and `updated_at` timestamps
- Implement Row Level Security (RLS)
- Use proper indexes for performance
- Document all schemas

## UI/UX Guidelines

- Mobile-first responsive design
- Follow accessibility standards (WCAG 2.1)
- Use semantic HTML
- Implement proper loading states
- Provide clear error messages
- Support dark mode

## Security Best Practices

- Never commit secrets
- Use environment variables
- Implement proper authentication
- Validate all inputs
- Sanitize user content
- Regular security audits

## Testing Strategy

- Unit tests for utilities
- Integration tests for API
- E2E tests for critical flows
- Performance testing
- Accessibility testing

## Documentation Standards

- Keep README files updated
- Document all APIs
- Add JSDoc comments
- Create user guides
- Maintain changelog

## Performance Goals

- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Lighthouse score > 90
- Bundle size < 200KB (initial)
- API response time < 200ms

## Collective Prosperity Values

1. **Ubuntu**: I am because we are
2. **Regeneration**: Leave things better
3. **Inclusion**: Everyone has a place
4. **Wisdom**: Honor all knowledge
5. **Joy**: Prosperity includes happiness
6. **Courage**: Bold action for change

## Current Sprint Focus (Week 0 - Planning)

- Initialize project structure ✓
- Set up multi-app architecture ✓
- Enhanced session security ✓
- Review Developer Ecosystem
- Create Week 1 detailed tasks
- Finalize sprint planning agenda

## Sprint Tracking & Session Logging

### Mandatory Session Documentation

**CRITICAL**: Every Claude session must create detailed documentation for continuity and project tracking.

#### Session Log Requirements (MUST DO)

1. **Start with Master Index**: Read plan/README.md to understand current state
2. **Check Context**: Review latest session log from logs/claude-sessions/
3. **Create Session Log**: logs/claude-sessions/YYYY-MM/session-logs/YYYY-MM-DD-HH-MM.md
4. **Use Template**: logs/claude-sessions/templates/session-log-template.md
5. **Update Throughout**: Document all actions and decisions as you work
6. **Use IST Timestamps**: All times in Indian Standard Time (DD-MMM-YYYY, Day HH:MM IST)
7. **Finalize at End**: Complete summary with context for next session

#### What Must Be Logged

- **All user prompts**: Exact text with timestamps (IST)
- **All Claude actions**: Tool usage, decisions, code changes
- **Context continuity**: How this builds on previous work
- **Sprint alignment**: How work supports current sprint goals
- **Blockers encountered**: Human dependencies with escalation details
- **Outcomes achieved**: Tasks completed, files modified, quality metrics
- **Key learnings**: Patterns, optimizations, architectural insights
- **Next session prep**: Context, priorities, blockers for handoff

#### Sprint Progress Updates

- **Update strategic/sprints.md**: Add session summary in descending order
- **Reference Session Log**: Link to detailed session log
- **Track Sprint Health**: Update progress toward sprint goals

#### Documentation Standards

- **IST Timezone**: All timestamps must be in Indian Standard Time
- **Comprehensive Logging**: Follow teams/claude-ai/logging-requirements.md
- **Context Management**: Follow teams/claude-ai/context-management.md
- **Session Guidelines**: Follow teams/claude-ai/session-guidelines.md

## Team Collaboration Workflow

### 🤖 Claude AI Team Role

- **Capabilities**: Code generation, testing, documentation, routine automation
- **Limitations**: No architecture decisions, credentials access, or production deployments
- **Work Pattern**: 24/7 availability, task-based execution
- **Responsibilities**: Generate code, write tests, create docs, support all teams

### 👥 Central Team Coordination

- **When to escalate to humans**:
  - Architecture decisions needed
  - Credentials or secrets required
  - Production deployment needed
  - Security review required
  - Code review and approval
- **Response time expectations**: 4-24 hours based on issue type
- **Communication**: Flag blockers in sprints.md with 🚨 BLOCKER tags

### 🌍 Independent Developer Support

- **Claude AI provides**: Module templates, documentation, code examples
- **Central Team provides**: Code review, security audit, NPM publishing
- **Repository access**: Public module repos only, no core monorepo access

### Workflow Dependencies

1. **Credentials**: Central Team must provide before Claude AI can integrate
2. **Architecture**: Central Team designs, Claude AI implements
3. **Security**: Central Team reviews, Claude AI generates secure code
4. **Deployment**: Central Team only, Claude AI prepares deployment scripts

## Contact & Support

- Documentation: /docs
- Issues: GitHub Issues
- Team Chat: [TBD]
- Emergency: [TBD]

---

Remember: We're building technology for collective prosperity. Every decision should align with our mission of empowering individuals, organizations, and communities while regenerating our planet.
