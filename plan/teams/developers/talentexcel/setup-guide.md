# TalentExcel Developer Setup Guide

**App**: TalentExcel - Career & Education Platform  
**Target**: Developer team (3 freshers)  
**Last Updated**: 05-Jul-2025, Saturday 17:40 IST  
**Version**: 1.0

## 🎯 TalentExcel Overview

### Mission

Empower careers through meaningful opportunities by connecting students and professionals with internships, fellowships, and learning paths that drive collective prosperity.

### Core Features

- **Internship Marketplace** - Browse and apply for internships
- **Fellowship Programs** - Structured mentorship and growth programs
- **Learning Paths** - Curated educational journeys
- **Mentor Network** - Connect with industry professionals
- **Skill Assessment** - Evaluate and track skill development
- **Certificate Generation** - Digital credentials for achievements

### Target Users

- **Students** - Seeking internships and learning opportunities
- **Companies** - Looking to hire interns and offer fellowships
- **Mentors** - Professionals sharing knowledge and experience
- **Institutions** - Educational organizations offering programs

## 🏗️ Technical Architecture

### Technology Stack

```typescript
// Core Technologies
Framework: Next.js 15 (App Router)
Language: TypeScript 5.5+
Styling: Tailwind CSS + shadcn/ui
Database: Supabase (PostgreSQL)
Authentication: @sasarjan/auth package
State Management: Zustand
Deployment: Vercel

// Development Tools
Package Manager: pnpm
Linting: ESLint
Formatting: Prettier
Testing: Playwright (E2E), Jest (Unit)
CI/CD: GitHub Actions
```

### App-Specific Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-label": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@sasarjan/auth": "workspace:*",
    "@sasarjan/database": "workspace:*",
    "@sasarjan/ui": "workspace:*",
    "next-intl": "^3.30.0",
    "framer-motion": "^11.15.0",
    "lucide-react": "^0.400.0"
  }
}
```

## 🚀 Environment Setup

### Prerequisites

```bash
# Required software versions
Node.js: 22.x.x or higher
pnpm: 9.x.x or higher
Git: Latest version
VS Code: Latest version (recommended)

# Check your versions
node --version    # Should show v22.x.x
pnpm --version    # Should show 9.x.x
git --version     # Any recent version
```

### Repository Setup

```bash
# 1. Clone TalentExcel repository
git clone https://github.com/sasarjan/talentexcel-app.git
cd talentexcel-app

# 2. Install dependencies
pnpm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Configure environment variables (Central Team provides values)
# Edit .env.local with provided credentials
```

### Environment Variables

```bash
# .env.local (Central Team provides actual values)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App-specific configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=TalentExcel
NEXT_PUBLIC_APP_ID=talentexcel

# Optional integrations
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
```

### Development Server

```bash
# Start development server (runs on port 3001)
pnpm dev

# Verify setup
# Open browser to: http://localhost:3001
# You should see TalentExcel homepage
```

## 📁 Project Structure

### TalentExcel-Specific Structure

```
talentexcel-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── internships/       # Internship listings and details
│   │   ├── fellowships/       # Fellowship programs
│   │   ├── learning/          # Learning paths
│   │   ├── mentors/           # Mentor directory
│   │   ├── dashboard/         # User dashboard
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/                # Shared UI components (from @sasarjan/ui)
│   │   ├── internships/       # Internship-specific components
│   │   ├── fellowships/       # Fellowship-specific components
│   │   ├── learning/          # Learning-specific components
│   │   ├── mentors/           # Mentor-specific components
│   │   └── dashboard/         # Dashboard components
│   ├── lib/                   # Utility functions
│   │   ├── supabase/          # Database client and queries
│   │   ├── auth/              # Authentication utilities
│   │   ├── validations/       # Zod schemas for validation
│   │   └── utils/             # Helper functions
│   ├── types/                 # TypeScript type definitions
│   │   ├── database.ts        # Database types
│   │   ├── auth.ts            # Authentication types
│   │   └── api.ts             # API response types
│   └── styles/                # Global styles
├── public/                    # Static assets
├── tests/                     # Test files
│   ├── e2e/                   # End-to-end tests
│   └── unit/                  # Unit tests
└── docs/                      # App-specific documentation
```

### Key Files to Understand

```typescript
// Core application files
src/app/layout.tsx              # Root layout with providers
src/app/page.tsx                # Homepage
src/app/providers.tsx           # Application providers
src/components/navigation.tsx   # Main navigation
src/components/footer.tsx       # Site footer
src/lib/supabase/client.ts     # Supabase client configuration
```

## 🎨 Design System

### TalentExcel Brand Colors

```css
/* Primary Colors */
--primary-blue: #2563eb;        /* Main brand color */
--primary-purple: #7c3aed;      /* Secondary brand color */

/* Gradients */
--brand-gradient: linear-gradient(to right, #2563eb, #7c3aed);

/* Semantic Colors */
--success: #059669;             /* Success states */
--warning: #d97706;             /* Warning states */
--error: #dc2626;               /* Error states */
--info: #0284c7;                /* Information states */
```

### Component Patterns

```typescript
// Example: Internship Card Component
interface InternshipCardProps {
  internship: {
    id: string
    title: string
    company: string
    location: string
    type: 'remote' | 'onsite' | 'hybrid'
    stipend_min?: number
    stipend_max?: number
  }
  onApply?: (internshipId: string) => void
}

export function InternshipCard({ internship, onApply }: InternshipCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-blue-600">{internship.title}</CardTitle>
        <p className="text-gray-600">{internship.company}</p>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  )
}
```

## 🗄️ Database Schema

### TalentExcel Tables

```sql
-- Core tables for TalentExcel functionality

-- Internships table
CREATE TABLE internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  location TEXT,
  type TEXT CHECK (type IN ('remote', 'onsite', 'hybrid')),
  stipend_min INTEGER,
  stipend_max INTEGER,
  duration_months INTEGER,
  requirements TEXT[],
  skills_required TEXT[],
  application_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fellowship programs table
CREATE TABLE fellowship_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  description TEXT,
  duration_months INTEGER,
  stipend_amount INTEGER,
  application_deadline TIMESTAMP WITH TIME ZONE,
  program_start_date TIMESTAMP WITH TIME ZONE,
  eligibility_criteria TEXT[],
  benefits TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning paths table
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_hours INTEGER,
  skills_covered TEXT[],
  prerequisites TEXT[],
  created_by UUID REFERENCES profiles(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  internship_id UUID REFERENCES internships(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;
ALTER TABLE fellowship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Example policies
CREATE POLICY "Anyone can view active internships" ON internships
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);
```

## 🧪 Testing Strategy

### Testing Tools

```bash
# E2E Testing with Playwright
pnpm test:e2e          # Run all E2E tests
pnpm test:e2e:ui       # Run with UI mode
pnpm test:e2e:headed   # Run in headed mode

# Unit Testing with Jest
pnpm test:unit         # Run unit tests
pnpm test:unit:watch   # Run in watch mode

# Accessibility Testing
pnpm test:a11y         # Run accessibility tests
```

### Test File Structure

```
tests/
├── e2e/
│   ├── internships.spec.ts    # Internship functionality tests
│   ├── fellowships.spec.ts    # Fellowship functionality tests
│   ├── auth.spec.ts           # Authentication flow tests
│   ├── navigation.spec.ts     # Navigation and routing tests
│   └── accessibility.spec.ts  # Accessibility compliance tests
├── unit/
│   ├── components/            # Component unit tests
│   ├── lib/                   # Utility function tests
│   └── api/                   # API route tests
└── fixtures/
    ├── internships.json       # Test data for internships
    ├── fellowships.json       # Test data for fellowships
    └── users.json             # Test user data
```

### Test Examples

```typescript
// E2E Test Example
test('should display internship listings', async ({ page }) => {
  await page.goto('/internships')
  await expect(page.locator('h1')).toContainText('Internship Opportunities')

  const cards = page.locator('[data-testid="internship-card"]')
  await expect(cards).toHaveCountGreaterThan(0)
})

// Unit Test Example
test('InternshipCard renders correctly', () => {
  const mockInternship = {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'TechCorp',
    location: 'Remote',
    type: 'remote' as const
  }

  render(<InternshipCard internship={mockInternship} />)
  expect(screen.getByText('Frontend Developer Intern')).toBeInTheDocument()
})
```

## 🚀 Development Workflow

### Branch Strategy

```bash
# Branch naming convention
feature/internship-search-filters
fix/application-form-validation
docs/api-documentation-update

# Example workflow
git checkout main
git pull origin main
git checkout -b feature/fellowship-application-form
# ... develop feature ...
git add .
git commit -m "feat: add fellowship application form with validation"
git push origin feature/fellowship-application-form
# Create PR on GitHub
```

### Code Quality Checks

```bash
# Run before committing
pnpm typecheck     # TypeScript compilation
pnpm lint          # ESLint code quality
pnpm format        # Prettier formatting
pnpm test:unit     # Unit tests
pnpm build         # Build verification

# Automated pre-commit hooks will run these automatically
```

### Development Commands

```bash
# Development
pnpm dev           # Start dev server (port 3001)
pnpm build         # Build for production
pnpm start         # Start production server

# Quality assurance
pnpm lint          # Run ESLint
pnpm lint:fix      # Auto-fix linting issues
pnpm typecheck     # TypeScript type checking
pnpm format        # Format code with Prettier

# Testing
pnpm test          # Run all tests
pnpm test:unit     # Unit tests only
pnpm test:e2e      # E2E tests only
pnpm test:watch    # Watch mode for unit tests

# Database
pnpm db:types      # Generate TypeScript types from Supabase
pnpm db:reset      # Reset local database (development)
```

## 📚 Learning Resources

### TalentExcel-Specific Documentation

- [Feature Requirements](./feature-requirements.md) - Detailed product requirements
- [Testing Procedures](./testing-procedures.md) - Quality assurance guidelines
- [Deployment Guide](./deployment-guide.md) - Staging and production deployment

### Shared Developer Resources

- [Onboarding Guide](../shared/onboarding-guide.md) - Complete developer setup
- [Daily Workflow](../shared/daily-workflow.md) - Structured workday guide
- [AI Assistant Templates](../shared/ai-assistant-templates.md) - Pre-written prompts
- [Code Standards](../shared/code-standards.md) - Coding conventions

### External Resources

- [Next.js Documentation](https://nextjs.org/docs) - Framework reference
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - Language guide
- [Tailwind CSS](https://tailwindcss.com/docs) - Styling framework
- [Supabase Docs](https://supabase.com/docs) - Database and auth
- [shadcn/ui](https://ui.shadcn.com/) - Component library

## 🆘 Common Issues & Solutions

### Environment Issues

```bash
# Port 3001 already in use
lsof -ti:3001 | xargs kill -9
pnpm dev

# Node modules corruption
rm -rf node_modules pnpm-lock.yaml
pnpm install

# TypeScript errors after updates
pnpm typecheck
# Fix reported errors
```

### Database Connection Issues

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test database connection
pnpm db:types
# If this fails, check credentials with Central Team
```

### Build Issues

```bash
# Clear Next.js cache
rm -rf .next
pnpm build

# Check for TypeScript errors
pnpm typecheck

# Verify all dependencies
pnpm audit
```

## 🎯 Success Metrics

### Developer Productivity

- **Setup Time**: <30 minutes from clone to running app
- **Build Success**: >95% successful builds on first try
- **Test Pass Rate**: >90% tests pass consistently
- **Code Review**: <2 iterations average for PR approval

### App Performance

- **Page Load Time**: <2 seconds for main pages
- **Lighthouse Score**: >90 for all categories
- **Bundle Size**: <500KB initial load
- **API Response**: <200ms average response time

### User Experience

- **Mobile Responsive**: All pages work on mobile devices
- **Accessibility**: WCAG 2.1 AA compliance
- **Error Handling**: Graceful error states for all scenarios
- **Loading States**: Appropriate loading indicators

## 📞 Support & Contact

### For Technical Issues

- **Team Slack**: #talentexcel-dev
- **GitHub Issues**: Label with `talentexcel` and `bug`
- **Central Team**: @central-team for infrastructure issues

### For Feature Questions

- **Product Manager**: @pm-talentexcel
- **Design Lead**: @design-lead for UI/UX questions
- **Tech Lead**: @tech-lead for architecture questions

### Emergency Contact

- **Production Issues**: #production-alerts
- **Security Concerns**: security@sasarjan.com

Remember: **TalentExcel is about empowering careers through technology**. Every feature should contribute to helping users find meaningful opportunities and grow professionally! 🚀
