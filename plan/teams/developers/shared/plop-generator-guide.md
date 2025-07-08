# Plop Generator Guide - SaSarjan App Store

**Last Updated**: 05-Jul-2025 (Saturday, 19:00 IST)  
**Purpose**: Speed up development with consistent code generation  
**Time Savings**: 5-10x faster than manual creation

## 🚀 Quick Start

### Available Generators

```bash
# Interactive mode - shows all options
npm run generate

# Direct generation commands
npm run generate:component   # React components
npm run generate:hook        # Custom hooks
npm run generate:util        # Utility functions
npm run generate:page        # Next.js pages
npm run generate:api         # API routes
npm run generate:type        # TypeScript types
npm run generate:module      # Shared packages
```

## 📖 When to Use Each Generator

### 🧩 Component Generator (`generate:component`)

**When to use:**

- Creating any new React component
- Building UI elements (buttons, cards, modals)
- Creating form components
- Building layout components

**Example:**

```bash
npm run generate:component

? Component name: UserProfile
? Component type: feature
? Which app: talentexcel

✅ Created: apps/talentexcel/src/components/feature/UserProfile.tsx
✅ Created: apps/talentexcel/src/components/feature/UserProfile.test.tsx
```

**Naming Rules:**

- ✅ Use PascalCase: `UserProfile`, `PaymentButton`, `NavigationMenu`
- ❌ Avoid: `userProfile`, `payment-button`, `navigation_menu`

### 🪝 Hook Generator (`generate:hook`)

**When to use:**

- Creating custom React hooks
- Building data fetching logic
- Managing complex state
- Creating reusable logic

**Example:**

```bash
npm run generate:hook

? Hook name: auth
? Which app: web

✅ Created: apps/web/src/hooks/useAuth.ts
✅ Created: apps/web/src/hooks/useAuth.test.ts
```

**Naming Rules:**

- ✅ Don't include "use" prefix (generator adds it)
- ✅ Input: `auth` → Output: `useAuth.ts`
- ❌ Avoid: `useAuth` as input (becomes `useUseAuth`)

### 🛠️ Utility Generator (`generate:util`)

**When to use:**

- Creating helper functions
- Building formatting utilities
- Creating validation functions
- Building calculation helpers

**Example:**

```bash
npm run generate:util

? Utility name: format-currency
? Which app: sevapremi

✅ Created: apps/sevapremi/src/utils/format-currency.ts
✅ Created: apps/sevapremi/src/utils/format-currency.test.ts
```

**Naming Rules:**

- ✅ Use kebab-case: `format-currency`, `validate-email`, `parse-date`
- ❌ Avoid: `formatCurrency`, `ValidateEmail`, `parse_date`

### 📄 Page Generator (`generate:page`)

**When to use:**

- Creating new routes in your app
- Building new pages
- Adding new sections to the app

**Example:**

```bash
npm run generate:page

? Page route: job-listings
? Which app: talentexcel

✅ Created: apps/talentexcel/src/app/job-listings/page.tsx
✅ Created: apps/talentexcel/src/app/job-listings/layout.tsx
```

**Naming Rules:**

- ✅ Use kebab-case: `user-profile`, `job-listings`, `mentor-network`
- ✅ Can include slashes for nested routes: `dashboard/settings`
- ❌ Avoid: `UserProfile`, `jobListings`, `mentor_network`

### 🌐 API Route Generator (`generate:api`)

**When to use:**

- Creating new API endpoints
- Building backend routes
- Adding data endpoints

**Example:**

```bash
npm run generate:api

? API route: user-profile
? Which app: web

✅ Created: apps/web/src/app/api/user-profile/route.ts
```

**Features Generated:**

- GET, POST, PUT, DELETE methods
- Zod validation schemas
- Error handling
- TypeScript types
- Proper response formatting

**Naming Rules:**

- ✅ Use kebab-case: `user-profile`, `payment-process`, `data-export`
- ❌ Avoid: `userProfile`, `PaymentProcess`, `data_export`

### 📝 Type Generator (`generate:type`)

**When to use:**

- Creating TypeScript interfaces
- Defining data structures
- Creating type definitions
- Building API contracts

**Example:**

```bash
npm run generate:type

? Type name: JobListing
? Which app: talentexcel

✅ Created: apps/talentexcel/src/types/job-listing.ts
```

**Features Generated:**

- Main interface
- Create/Update input types
- Filter types
- Enums
- Type guards

**Naming Rules:**

- ✅ Input can be PascalCase (file will be kebab-case)
- ✅ Input: `JobListing` → File: `job-listing.ts`

### 📦 Module Generator (`generate:module`)

**When to use:**

- Creating shared packages
- Building reusable modules
- Creating community modules
- Building NPM packages

**Example:**

```bash
npm run generate:module

? Module name: event-manager

✅ Created: packages/event-manager/package.json
✅ Created: packages/event-manager/index.ts
✅ Created: packages/event-manager/README.md
```

**Naming Rules:**

- ✅ Use kebab-case: `event-manager`, `payment-gateway`, `auth-system`
- ❌ Avoid: `EventManager`, `paymentGateway`, `auth_system`

## 🎯 Real-World Scenarios

### Scenario 1: Building a Job Board Feature

```bash
# 1. Create the main component
npm run generate:component
> JobBoard, feature, talentexcel

# 2. Create individual job card component
npm run generate:component
> JobCard, ui, talentexcel

# 3. Create data fetching hook
npm run generate:hook
> jobListings, talentexcel

# 4. Create the page
npm run generate:page
> jobs, talentexcel

# 5. Create API endpoint
npm run generate:api
> jobs, talentexcel

# 6. Create type definitions
npm run generate:type
> Job, talentexcel
```

### Scenario 2: Building a Payment Module

```bash
# 1. Create shared payment module
npm run generate:module
> payment-processor

# 2. Create payment utilities
npm run generate:util
> validate-payment, web

# 3. Create payment components
npm run generate:component
> PaymentForm, forms, web

# 4. Create payment hook
npm run generate:hook
> payment, web
```

## 💡 Pro Tips

### 1. **Batch Generation**

When starting a new feature, generate all needed files at once:

```bash
# Generate component, hook, and types together
npm run generate:component && npm run generate:hook && npm run generate:type
```

### 2. **App Selection**

Always double-check you're generating in the correct app:

- `web` - Main SaSarjan platform
- `talentexcel` - Career platform
- `sevapremi` - Community service
- `10xgrowth` - Business growth

### 3. **Component Types**

Choose the right component type:

- `ui` - Reusable UI elements (buttons, inputs)
- `forms` - Form-related components
- `layout` - Page layout components
- `feature` - Feature-specific components

### 4. **Test Files**

Every generator creates test files automatically:

- Components: `.test.tsx` with render tests
- Hooks: `.test.ts` with hook tests
- Utils: `.test.ts` with function tests

## 🚨 Common Mistakes to Avoid

### ❌ Wrong Naming Patterns

```bash
# WRONG - PascalCase for utilities
npm run generate:util
> FormatCurrency ❌

# CORRECT - kebab-case for utilities
npm run generate:util
> format-currency ✅
```

### ❌ Including "use" in Hook Names

```bash
# WRONG - "use" prefix included
npm run generate:hook
> useAuth ❌

# CORRECT - no "use" prefix
npm run generate:hook
> auth ✅
```

### ❌ Wrong App Selection

```bash
# WRONG - generating in wrong app
npm run generate:component
> UserProfile, feature, web ❌ (should be in talentexcel)

# CORRECT - right app for the feature
npm run generate:component
> UserProfile, feature, talentexcel ✅
```

## 🤖 For Claude AI Sessions

When working with Claude AI, use these exact commands:

```bash
# Claude should use these patterns:
"Generate a UserProfile component for TalentExcel"
→ npm run generate:component (UserProfile, feature, talentexcel)

"Create a payment processing utility"
→ npm run generate:util (process-payment, web)

"Build a volunteer matching hook"
→ npm run generate:hook (volunteerMatching, sevapremi)

"Create job listings API"
→ npm run generate:api (job-listings, talentexcel)
```

## 📊 Time Savings Calculation

### Manual Creation (Without Plop)

- Create component file: 5 minutes
- Add proper imports/structure: 5 minutes
- Create test file: 5 minutes
- Ensure naming conventions: 3 minutes
- **Total: 18 minutes**

### With Plop Generators

- Run generator: 30 seconds
- Answer prompts: 30 seconds
- **Total: 1 minute**

**Savings: 17 minutes per component (94% faster!)**

## 🔧 Customizing Templates

Templates are located in `/plop-templates/`:

- `component.hbs` - React component template
- `hook.hbs` - Custom hook template
- `utility.hbs` - Utility function template
- `page.hbs` - Next.js page template
- `api-route.hbs` - API route template
- `type.hbs` - TypeScript type template

To customize, edit these templates to match your team's patterns.

## 🆘 Troubleshooting

### Generator Not Found

```bash
npm install  # Ensure plop is installed
```

### Wrong File Location

Check you selected the correct app when prompted.

### Naming Convention Errors

Follow the naming rules for each generator type.

---

**Remember**: Plop generators ensure 100% consistency across all developers and eliminate naming convention debates. Use them for EVERY new file creation!
