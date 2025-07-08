# AI Assistant Templates for Fresher Developers

**Purpose**: Pre-written prompts to help fresher developers get better guidance from Gemini, Claude, or other AI assistants  
**Target**: TalentExcel development team  
**Created**: July 5, 2025

## 🎯 How to Use These Templates

1. **Copy the template** that matches your task
2. **Replace [PLACEHOLDER]** with your specific details
3. **Paste into your AI assistant** (Gemini, Claude, etc.)
4. **Follow the step-by-step guidance** provided

## 📋 Initial Setup Templates

### Template 1: Project Onboarding

```
I'm a fresher developer joining the TalentExcel project. This is a career platform built with:

- Framework: Next.js 15 with App Router
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui components
- Database: Supabase (PostgreSQL)
- State Management: Zustand
- Authentication: Custom auth package (@sasarjan/auth)

I need help understanding:
1. The project structure and key directories
2. How pages and components are organized
3. The coding patterns and conventions used
4. How to work with the database through Supabase
5. The component library and design system

Please provide a beginner-friendly overview with specific examples from this tech stack.
```

### Template 2: Development Environment Issues

```
I'm having trouble setting up my TalentExcel development environment. Here's my current situation:

**Issue**: [Describe the specific problem - e.g., "pnpm install fails", "dev server won't start", "TypeScript errors"]

**Error Message** (if any):
```

[Paste the exact error message here]

```

**My Setup**:
- Operating System: [Windows/Mac/Linux]
- Node.js Version: [Check with: node --version]
- pnpm Version: [Check with: pnpm --version]

**What I've tried**:
- [List steps you've already attempted]

Please help me troubleshoot this step-by-step for a TalentExcel project using Next.js 15, TypeScript, and pnpm.
```

## 🏗️ Feature Development Templates

### Template 3: Creating a New Page

```
I need to create a new page for TalentExcel called "[PAGE_NAME]" (e.g., "Internship Listings").

**Requirements**:
- [Describe what the page should do]
- [List any specific features needed]
- [Mention any data it should display]

**Design Requirements**:
- Should match the existing TalentExcel design
- Must be mobile responsive
- Include loading and error states

Please help me:
1. Create the page component using Next.js 15 App Router
2. Set up the proper file structure
3. Add TypeScript types for the data
4. Include proper error handling and loading states
5. Make it responsive following the existing patterns

Guide me step-by-step with code examples that follow TalentExcel conventions.
```

### Template 4: Creating API Routes

```
I need to create an API route for TalentExcel to handle "[FUNCTIONALITY]" (e.g., "fetching internship listings").

**Requirements**:
- HTTP Method: [GET/POST/PUT/DELETE]
- Data source: Supabase database
- Table name: [TABLE_NAME]
- Expected response format: [JSON structure]

**Security Requirements**:
- [Any authentication needed]
- [Data filtering requirements]
- [Validation rules]

Please help me:
1. Create the API route file in the correct location
2. Set up Supabase client properly
3. Add input validation using Zod
4. Include proper error handling
5. Add TypeScript types for request/response
6. Follow RESTful API conventions

Provide complete code with explanations for each part.
```

### Template 5: Creating Reusable Components

````
I need to create a reusable component for TalentExcel called "[COMPONENT_NAME]" (e.g., "InternshipCard").

**Component Purpose**:
- [What the component displays]
- [How it will be used]
- [What props it should accept]

**Design Requirements**:
- Must use existing shadcn/ui components where possible
- Should follow TalentExcel design system
- Needs to be accessible (ARIA labels, keyboard navigation)
- Must be mobile responsive

**Props Needed**:
```typescript
interface [ComponentName]Props {
  // List the props you think you'll need
}
````

Please help me:

1. Create the component with proper TypeScript interfaces
2. Use appropriate shadcn/ui components
3. Add proper styling with Tailwind CSS
4. Include accessibility features
5. Make it responsive
6. Add error boundaries if needed

Show me the complete component code with explanations.

```

## 🐛 Debugging Templates

### Template 6: TypeScript Errors
```

I'm getting TypeScript errors in my TalentExcel project. Here's the specific error:

**Error Message**:

```
[Paste the exact TypeScript error here]
```

**File**: [Path to the file with the error]
**Line**: [Line number if shown]

**Code Context**:

```typescript
[Paste the relevant code around the error]
```

**What I was trying to do**:
[Explain what you were trying to implement]

Please help me:

1. Understand what this TypeScript error means
2. Fix the error with proper typing
3. Explain why this error occurred
4. Show me the corrected code
5. Suggest how to avoid similar errors in the future

Keep the solution simple and explain each change.

```

### Template 7: React/Next.js Issues
```

I'm having a React/Next.js issue in my TalentExcel component. Here's what's happening:

**Problem**: [Describe the unexpected behavior]
**Expected**: [What should happen instead]

**Component Code**:

```typescript
[Paste your component code here]
```

**Error Message** (if any):

```
[Paste any console errors]
```

**Browser Console**: [Any warnings or errors in browser console]

Please help me:

1. Identify what's causing this issue
2. Fix the component code
3. Explain why this happened
4. Show me the corrected version
5. Suggest best practices to avoid this

Focus on Next.js 15 App Router patterns and React best practices.

```

### Template 8: Styling Issues
```

I'm having trouble with styling in my TalentExcel component. Here's the issue:

**Problem**: [Describe the styling issue - e.g., "not responsive", "doesn't match design", "layout broken"]

**Current Code**:

```typescript
[Paste the component code with className attributes]
```

**Expected Design**: [Describe how it should look]
**Actual Result**: [Describe how it currently looks]

**Breakpoints Tested**:

- Desktop (1024px+): [Working/Broken]
- Tablet (768px): [Working/Broken]
- Mobile (375px): [Working/Broken]

Please help me:

1. Fix the Tailwind CSS classes
2. Make it properly responsive
3. Match the TalentExcel design system
4. Use appropriate shadcn/ui components
5. Follow accessibility guidelines

Show me the corrected CSS classes with explanations.

```

## 🚀 Advanced Feature Templates

### Template 9: Database Integration
```

I need to integrate a database feature for TalentExcel using Supabase.

**Feature**: [Describe what you're building]
**Database Table**: [Table name]
**Operations Needed**: [CREATE/READ/UPDATE/DELETE]

**Current Schema** (if known):

```sql
[Paste table schema if you have it]
```

**User Story**:
As a [user type], I want to [action] so that [benefit].

Please help me:

1. Create the proper Supabase queries
2. Set up TypeScript types for the data
3. Add proper error handling
4. Implement loading states
5. Add form validation if needed
6. Handle edge cases

Guide me through both the frontend and API route implementation.

```

### Template 10: Authentication & Authorization
```

I need to implement authentication/authorization for a TalentExcel feature.

**Feature**: [What you're protecting]
**User Types**: [Who should have access]
**Restrictions**: [What should be restricted]

**Current Auth Setup**: TalentExcel uses @sasarjan/auth package

**Requirements**:

- [List specific auth requirements]
- [Any role-based permissions]
- [Redirect behavior needed]

Please help me:

1. Use the existing auth package properly
2. Add authentication checks to my component
3. Handle unauthorized access gracefully
4. Add proper loading states during auth checks
5. Implement any role-based restrictions

Show me how to integrate with the existing TalentExcel auth system.

```

## 🔧 Code Review Templates

### Template 11: Pre-Submission Review
```

I'm about to submit my TalentExcel feature for code review. Can you help me review this code first?

**Feature**: [Brief description]
**Files Changed**: [List the main files]

**Code**:

```typescript
[Paste your main component/API code here]
```

Please review for:

1. TypeScript best practices
2. React/Next.js patterns
3. Code organization and structure
4. Error handling completeness
5. Accessibility considerations
6. Performance implications
7. Security issues

**Specific Concerns**:

- [Any areas you're unsure about]
- [Specific questions about your implementation]

Give me actionable feedback to improve this code before submitting for review.

```

### Template 12: Addressing Review Feedback
```

I received code review feedback on my TalentExcel PR and need help addressing it.

**Reviewer Feedback**:

```
[Paste the specific review comments here]
```

**My Current Code**:

```typescript
[Paste the code that was commented on]
```

**My Understanding**: [Explain how you interpret the feedback]

Please help me:

1. Understand exactly what the reviewer wants
2. Implement the requested changes properly
3. Explain why these changes are better
4. Make sure I don't break anything else
5. Follow TalentExcel conventions

Show me the revised code with explanations of what changed and why.

```

## 🎨 Design & UX Templates

### Template 13: Component Design
```

I need to design a component for TalentExcel that fits the existing design system.

**Component**: [Component name and purpose]
**Context**: [Where it will be used]
**Content**: [What information it displays]

**TalentExcel Design System**:

- Primary Colors: Blue (#2563eb) and Purple (#7c3aed)
- Uses shadcn/ui components
- Tailwind CSS for styling
- Mobile-first responsive design

**Requirements**:

- [List specific design requirements]
- [Any interaction states needed]
- [Accessibility requirements]

Please help me:

1. Choose appropriate shadcn/ui components
2. Create a responsive layout
3. Apply consistent styling with TalentExcel theme
4. Add proper hover/focus states
5. Ensure accessibility compliance

Show me the component code with design rationale.

```

## 📱 Testing Templates

### Template 14: Feature Testing
```

I've built a feature for TalentExcel and need help creating a comprehensive testing plan.

**Feature**: [Description of what you built]
**User Flow**: [Step-by-step user journey]

**Code Files**:

- Component: [File path]
- API Route: [File path if applicable]
- Types: [File path if applicable]

Please help me create:

1. Manual testing checklist
2. Edge cases to test
3. Error scenarios to verify
4. Accessibility testing steps
5. Mobile responsiveness checks
6. Performance considerations

Structure this as a step-by-step testing guide I can follow before submitting my PR.

```

## 💡 Usage Tips

### For Best Results:
1. **Be Specific**: Replace all [PLACEHOLDERS] with your actual details
2. **Provide Context**: Include relevant code snippets and error messages
3. **Ask Follow-ups**: Don't hesitate to ask for clarification
4. **Test Suggestions**: Always test the AI's suggestions in your development environment

### Template Selection Guide:
- **New to project**: Use templates 1-2
- **Building features**: Use templates 3-5
- **Having problems**: Use templates 6-8
- **Advanced work**: Use templates 9-10
- **Code review**: Use templates 11-12
- **Design questions**: Use template 13
- **Testing**: Use template 14

### Remember:
- AI assistants are tools to help you learn, not replace understanding
- Always review and test the code suggestions
- Ask your Central Team if AI suggestions don't work
- These templates work with any AI assistant (Gemini, Claude, ChatGPT, etc.)
```
