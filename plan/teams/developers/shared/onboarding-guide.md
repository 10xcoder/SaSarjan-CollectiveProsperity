# Fresher Developer Onboarding Guide - TalentExcel Team

**Target**: Junior Developers (1-2 years experience)  
**Timeline**: Week 1 Onboarding + Week 2-3 Feature Development  
**Platform**: TalentExcel (Career & Education Platform)  
**Created**: July 5, 2025  
**Updated**: July 7, 2025 - Added location awareness, journey-based UX, complete lifecycle

## 🎯 Quick Start Recommendation

**Start with TalentExcel Local Internship Finder** - A simple location-aware micro-app that demonstrates all core concepts: location awareness, tag systems, user journeys, and outcome tracking.

## Prerequisites (Before Day 1)

### Technical Setup Required

```bash
# 1. Install Node.js 22+ (Required)
node --version  # Must show 22.x.x or higher

# 2. Install pnpm package manager
npm install -g pnpm
pnpm --version

# 3. Install Git
git --version

# 4. Install VS Code (Recommended)
# Download from: https://code.visualstudio.com/

# 5. Install VS Code Extensions
# - TypeScript and JavaScript Language Features
# - Tailwind CSS IntelliSense
# - Prettier - Code formatter
# - ESLint
```

### Account Setup Required

- GitHub account (provide username to Central Team)
- Access to team Slack workspace
- Vercel account (for preview deployments)

## Day 1: Environment Setup

### Step 1: Clone Repository

```bash
# 1. Navigate to your projects folder
cd ~/projects

# 2. Clone TalentExcel repository (URL provided by Central Team)
git clone https://github.com/sasarjan/talentexcel-app.git
cd talentexcel-app

# 3. Verify you're in the right directory
ls -la
# Should see: package.json, src/, README.md, etc.
```

### Step 2: Install Dependencies

```bash
# 1. Install all project dependencies
pnpm install

# 2. This will take 2-3 minutes - you should see:
# ✓ Dependencies installed successfully
```

### Step 3: Environment Configuration

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Central Team will provide actual values for:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - Other required environment variables
```

### Step 4: Start Development Server

```bash
# 1. Start the development server
pnpm dev

# 2. Open browser and go to: http://localhost:3001
# You should see the TalentExcel homepage

# 3. Keep this terminal open while developing
```

### Step 5: Verify Setup

- [ ] App loads at http://localhost:3001
- [ ] No console errors in browser
- [ ] You can navigate between pages
- [ ] TypeScript checking works: `pnpm typecheck`
- [ ] Linting works: `pnpm lint`

## AI Assistant Setup

### For Gemini Users

**Initial Setup Prompt**:

```
I'm a fresher developer working on TalentExcel, a career platform built with:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS for styling
- Supabase for database
- Radix UI for components

The app helps users find internships, fellowships, and learning opportunities.

Help me understand:
1. The project structure and key folders
2. How to create new pages and components
3. Coding standards and best practices for this stack
4. How to work with the database and API routes

Please be specific to this tech stack and explain concepts clearly for a beginner.
```

### For Claude Code Users

**Initial Setup Prompt**:

```
I'm contributing to TalentExcel app as a fresher developer. This is a career platform with the following tech stack:

- Framework: Next.js 15 with App Router
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui components
- Database: Supabase (PostgreSQL)
- State Management: Zustand
- Authentication: Custom auth package

Please help me:
1. Understand the codebase structure
2. Learn the established patterns and conventions
3. Guide me through creating new features step-by-step
4. Ensure I follow best practices for this stack

Focus on practical, beginner-friendly guidance.
```

## Daily Development Workflow

### Morning Routine (9:00 AM)

```bash
# 1. Start your day - pull latest changes
git pull origin main

# 2. Check for any conflicts or updates
pnpm install  # Only if package.json changed

# 3. Start development server
pnpm dev

# 4. Check your assigned tasks
# - Go to GitHub Issues
# - Review your assigned tickets
# - Read any comments from reviewers
```

### Feature Development Process

#### Step 1: Understand Your Task

1. **Read the GitHub Issue carefully**
   - Understand the feature requirements
   - Look at any provided designs or mockups
   - Note the acceptance criteria

2. **Ask Questions** (if anything is unclear)
   - Post in team Slack channel
   - Tag the Central Team member who assigned the task
   - Don't code if you're confused - ask first!

#### Step 2: Plan with AI Assistant

**Example: Building an Internship Listing Page**

**Prompt for AI**:

```
I need to create an internship listing page for TalentExcel. Based on the existing codebase patterns, help me:

1. Create a new page at /internships
2. Design the component structure
3. Add API route to fetch internship data from Supabase
4. Make it responsive and match the existing design
5. Include loading and error states

Please provide step-by-step code with explanations for a beginner.
```

#### Step 3: Create Feature Branch

```bash
# Always create a new branch for each feature
git checkout -b feature/internship-listing

# Branch naming convention:
# feature/description-of-feature
# fix/description-of-bug
# docs/description-of-documentation
```

#### Step 4: Implement the Feature

Follow AI guidance but remember these key points:

**File Structure Patterns**:

```
src/
├── app/
│   ├── internships/          # New page goes here
│   │   ├── page.tsx         # Main page component
│   │   └── loading.tsx      # Loading UI
├── components/
│   ├── ui/                  # Reuse existing UI components
│   └── internships/         # Feature-specific components
├── lib/
│   ├── supabase/           # Database queries
│   └── types/              # TypeScript types
```

**Key Principles**:

- **Reuse components**: Always check `/src/components/ui/` first
- **Follow TypeScript**: Define proper types for all data
- **Add loading states**: Every page should show loading spinners
- **Handle errors**: Show user-friendly error messages
- **Mobile-first**: Test on mobile screen sizes
- **Accessibility**: Use semantic HTML and proper ARIA labels

#### Step 5: Test Your Changes

```bash
# 1. Type checking (must pass)
pnpm typecheck

# 2. Linting (must pass)
pnpm lint

# 3. Build test (must pass)
pnpm build

# 4. Manual testing checklist:
# - Feature works on desktop (Chrome, Firefox)
# - Feature works on mobile (Chrome DevTools mobile view)
# - Loading states display correctly
# - Error handling works (try with network disconnected)
# - Forms validate input correctly
# - Navigation works properly
```

### Evening Submission (8:00 PM)

#### Step 1: Commit Your Changes

```bash
# 1. Stage all changes
git add .

# 2. Commit with descriptive message
git commit -m "feat: add internship listing page

- Created responsive internship listing component
- Added API route for fetching internship data from Supabase
- Implemented loading and error states
- Added filters for location and type
- Includes mobile-responsive design

Fixes #123"

# Commit message format:
# type: brief description
#
# - Detailed bullet points of what you did
# - Include any important technical decisions
# - Reference the GitHub issue number
```

#### Step 2: Push and Create Pull Request

```bash
# 1. Push your branch
git push origin feature/internship-listing

# 2. Go to GitHub and create Pull Request
# - Use the provided PR template
# - Add screenshots of your feature
# - Describe what you built and why
# - Request review from Central Team
```

#### Step 3: PR Template (Fill This Out)

```markdown
## 🎯 What does this PR do?

Brief description of the feature/fix

## 📷 Screenshots

[Add screenshots showing your feature on desktop and mobile]

## ✅ Testing Checklist

- [ ] Tested on desktop Chrome
- [ ] Tested on mobile (responsive)
- [ ] Loading states work
- [ ] Error handling works
- [ ] TypeScript compiles
- [ ] Linting passes

## 🔗 Related Issue

Fixes #[issue-number]

## 💭 Notes for Reviewers

Any special instructions or areas to focus on during review
```

## Code Review Process

### What Happens After You Submit PR

1. **Automated Checks** (5 minutes)
   - TypeScript compilation
   - Linting
   - Build test
   - Must all pass ✅

2. **Central Team Review** (within 8 hours)
   - Code quality check
   - Security review
   - Functionality testing
   - Design compliance

3. **Feedback & Iteration**
   - Reviewer leaves comments
   - You address feedback
   - Push new commits to same branch
   - Process repeats until approved

### How to Handle Review Feedback

```bash
# 1. Pull any changes from main
git checkout main
git pull origin main
git checkout feature/internship-listing
git merge main

# 2. Make requested changes
# Edit files as requested by reviewers

# 3. Commit and push updates
git add .
git commit -m "fix: address review feedback

- Updated error handling as requested
- Fixed mobile responsive issue
- Added missing TypeScript types"

git push origin feature/internship-listing

# 4. Reply to review comments explaining your changes
```

## Common Development Patterns

### 1. Creating a New Page

```typescript
// src/app/internships/page.tsx
import { InternshipList } from '@/components/internships/internship-list'
import { PageHeader } from '@/components/ui/page-header'

export default function InternshipsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Internship Opportunities"
        description="Discover amazing internship opportunities to kickstart your career"
      />
      <InternshipList />
    </div>
  )
}
```

### 2. Creating API Routes

```typescript
// src/app/api/internships/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { data: internships, error } = await supabase
      .from('internships')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(internships)
  } catch (error) {
    console.error('Error fetching internships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch internships' },
      { status: 500 }
    )
  }
}
```

### 3. Creating Components

```typescript
// src/components/internships/internship-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface InternshipCardProps {
  internship: {
    id: string
    title: string
    company: string
    location: string
    type: 'remote' | 'onsite' | 'hybrid'
  }
}

export function InternshipCard({ internship }: InternshipCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{internship.title}</CardTitle>
        <p className="text-gray-600">{internship.company}</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">{internship.location}</span>
          <Badge variant={internship.type === 'remote' ? 'secondary' : 'default'}>
            {internship.type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Troubleshooting Common Issues

### "pnpm install" fails

```bash
# Try clearing cache
pnpm store prune
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### TypeScript errors

```bash
# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Check for missing types
pnpm install @types/node @types/react @types/react-dom
```

### Development server won't start

```bash
# Check if port 3001 is already in use
lsof -ti:3001 | xargs kill -9

# Start server again
pnpm dev
```

### Git push fails

```bash
# Pull latest changes first
git pull origin main

# Resolve conflicts if any
# Then push again
git push origin your-branch-name
```

## 🌍 Location-Aware Development

### Every Feature Must Be Location-Aware

All micro-apps in the SaSarjan ecosystem must support:

- **User location preferences** (home, work, interest areas)
- **Content filtering by location** and radius
- **Hierarchical location display** (Village → District → State)
- **Distance calculations** from user location
- **Remote/hybrid options** where applicable

See: [Location-Aware Development Guide](./location-aware-development.md)

## 🏷️ Tag & Category System

### Consistent Tagging Across Apps

- **Skills tags**: Technical and soft skills
- **Industry tags**: Sectors and domains
- **Type tags**: Full-time, part-time, contract
- **Prosperity categories**: 8 core categories
- **Custom tags**: App-specific taxonomies

Tags enable discovery, filtering, and personalization across all apps.

## 🛤️ Journey-Based User Experience

### Design for User Journeys

Every feature should support a complete user journey:

1. **Discovery**: Browse and search with location/tags
2. **Evaluation**: Detailed information and comparisons
3. **Action**: Apply, register, or connect
4. **Tracking**: Monitor progress and status
5. **Outcome**: Measure success and impact

Track outcomes to demonstrate real-world impact.

## 🔄 Complete Development Lifecycle

### Your Role in the Process

1. **Planning**: Understand requirements and user journey
2. **Development**: Build with location/tags in mind
3. **Testing**: Unit, integration, and location-specific tests
4. **Integration**: Submit PR and respond to reviews
5. **Deployment**: Preview → Staging → Production

See: [Developer Role Definition](./developer-role.md)
See: [Integration & Deployment Guide](./integration-deployment.md)

## 🚀 Your First Feature: Local Internship Finder

Start with this simple app that demonstrates all concepts:

- Location-based search with radius
- Tag filtering for skills and industries
- Complete application journey
- Outcome tracking dashboard

See: [Starter App Guide](../talentexcel/starter-app-guide.md)

## Success Metrics & Goals

### Week 1 (Learning Week)

- [ ] Complete environment setup
- [ ] Understand location system architecture
- [ ] Submit first PR (location-aware feature)
- [ ] Successfully implement tag filtering
- [ ] Create one complete user journey

### Week 2-3 (Feature Development)

- [ ] Build Local Internship Finder MVP
- [ ] Implement all location features
- [ ] Pass security and performance reviews
- [ ] Deploy to staging environment
- [ ] Document your implementation

### Month 1 Target

- [ ] Master location-aware development
- [ ] Contribute 3+ production features
- [ ] Mentor next developer on location features
- [ ] Suggest improvements to location system
- [ ] Ready to lead micro-app development

## Emergency Contacts

### For Technical Issues

- **Slack**: #talentexcel-dev channel
- **GitHub**: Create issue in repository
- **Central Team Lead**: [Name] - Direct message for urgent blockers

### For Process Questions

- **Daily Standup**: 9:00 AM in #talentexcel-dev
- **Central Team Review**: Tag @central-team in PR
- **Deployment Issues**: #devops-alerts channel

Remember: **It's better to ask questions than to code the wrong thing!** The Central Team is here to help you succeed. 🚀
