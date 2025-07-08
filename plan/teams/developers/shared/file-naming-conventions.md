# File Naming Conventions - SaSarjan App Store

**Last Updated**: 05-Jul-2025 (Saturday, 18:00 IST)  
**Applies To**: All teams (🤖 Claude AI, 👥 Central Team, 🌍 Independent Developers)  
**Enforcement**: Automated via ESLint + Pre-commit hooks

## 🎯 Overview

Consistent file naming is critical for:

- **Multi-team collaboration** across 3 team types
- **Module sharing** between apps (TalentExcel, SevaPremi, 10xGrowth)
- **Automated tooling** and code generation
- **Developer onboarding** and navigation

## 📁 Directory Naming Conventions

### App Level

```
✅ Correct:
apps/talentexcel/          # kebab-case
apps/sevapremi/            # kebab-case
apps/10xgrowth/            # kebab-case with numbers
packages/ui/               # kebab-case
services/api/              # kebab-case

❌ Incorrect:
apps/TalentExcel/          # PascalCase
apps/seva_premi/           # snake_case
apps/SevaPremi/            # Mixed case
```

### Feature Directories

```
✅ Correct:
src/
├── components/ui/         # kebab-case
├── components/forms/      # kebab-case
├── hooks/                 # kebab-case
├── utils/                 # kebab-case
├── types/                 # kebab-case
├── api-routes/            # kebab-case
└── user-profile/          # kebab-case

❌ Incorrect:
src/
├── Components/            # PascalCase
├── userProfile/           # camelCase
├── API_Routes/            # snake_case + PascalCase
```

## 📄 File Naming Conventions

### 1. React Components

**Pattern**: `PascalCase.tsx`

```
✅ Correct:
UserProfile.tsx
PaymentButton.tsx
NavigationMenu.tsx
DashboardLayout.tsx
JobListingCard.tsx

❌ Incorrect:
userProfile.tsx            # camelCase
payment-button.tsx         # kebab-case
navigation_menu.tsx        # snake_case
```

### 2. Pages (Next.js App Router)

**Pattern**: `page.tsx` in `kebab-case` directories

```
✅ Correct:
app/
├── dashboard/page.tsx
├── user-profile/page.tsx
├── job-listings/page.tsx
├── mentor-network/page.tsx
└── (auth)/
    ├── login/page.tsx
    └── register/page.tsx

❌ Incorrect:
app/
├── Dashboard/page.tsx     # PascalCase directory
├── userProfile.tsx        # No page.tsx structure
├── job_listings/page.tsx  # snake_case directory
```

### 3. API Routes

**Pattern**: `route.ts` in `kebab-case` directories

```
✅ Correct:
app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── verify-email/route.ts
├── user-data/route.ts
├── job-listings/route.ts
└── payment-processing/route.ts

❌ Incorrect:
app/api/
├── Auth/route.ts          # PascalCase directory
├── userData.ts            # No route.ts structure
├── job_listings/route.ts  # snake_case directory
```

### 4. Utilities & Services

**Pattern**: `kebab-case.ts`

```
✅ Correct:
utils/
├── format-currency.ts
├── validate-email.ts
├── api-client.ts
├── date-helpers.ts
└── string-utils.ts

services/
├── auth-service.ts
├── payment-service.ts
├── user-service.ts
└── notification-service.ts

❌ Incorrect:
utils/
├── formatCurrency.ts      # camelCase
├── ValidateEmail.ts       # PascalCase
├── api_client.ts          # snake_case
```

### 5. Types & Interfaces

**Pattern**: `kebab-case.ts` files, `PascalCase` exports

```
✅ Correct:
types/
├── user.ts               # export type User, UserProfile
├── payment.ts            # export type Payment, PaymentMethod
├── job-listing.ts        # export type JobListing
├── api-response.ts       # export type ApiResponse<T>
└── database.ts           # export type Database, Tables

❌ Incorrect:
types/
├── User.ts               # PascalCase file
├── paymentTypes.ts       # camelCase file
├── job_listing.ts        # snake_case file
```

### 6. Custom Hooks

**Pattern**: `use` + `PascalCase.ts`

```
✅ Correct:
hooks/
├── useAuth.ts
├── useLocalStorage.ts
├── useApiData.ts
├── useJobListings.ts
└── usePaymentFlow.ts

❌ Incorrect:
hooks/
├── auth-hook.ts          # kebab-case
├── UseLocalStorage.ts    # Extra capital
├── use_api_data.ts       # snake_case
```

### 7. Constants & Configuration

**Pattern**: `kebab-case.ts` files, `SCREAMING_SNAKE_CASE` exports

```
✅ Correct:
constants/
├── api-endpoints.ts      # export const API_ENDPOINTS
├── app-config.ts         # export const APP_CONFIG
├── error-messages.ts     # export const ERROR_MESSAGES
└── validation-rules.ts   # export const VALIDATION_RULES

❌ Incorrect:
constants/
├── API_ENDPOINTS.ts      # snake_case file
├── appConfig.ts          # camelCase file
├── ErrorMessages.ts      # PascalCase file
```

### 8. Test Files

**Pattern**: `ComponentName.test.tsx` or `function-name.test.ts`

```
✅ Correct:
__tests__/
├── UserProfile.test.tsx
├── PaymentButton.test.tsx
├── auth-service.test.ts
├── format-currency.test.ts
└── useAuth.test.ts

❌ Incorrect:
__tests__/
├── userProfile.test.tsx  # camelCase component
├── payment-button.test.tsx # kebab-case component
├── AuthService.test.ts   # PascalCase utility
```

### 9. Shared Modules (Package Level)

**Pattern**: `kebab-case` for everything

```
✅ Correct:
packages/
├── ui/
│   ├── button.tsx
│   ├── input.tsx
│   └── modal.tsx
├── auth/
│   ├── session-manager.ts
│   ├── token-validator.ts
│   └── user-permissions.ts
└── database/
    ├── connection.ts
    ├── query-builder.ts
    └── migrations.ts

❌ Incorrect:
packages/
├── ui/
│   ├── Button.tsx        # PascalCase in package
│   ├── Input.tsx         # PascalCase in package
```

### 10. Assets & Static Files

**Pattern**: `kebab-case` with descriptive names

```
✅ Correct:
public/
├── images/
│   ├── logo-primary.svg
│   ├── hero-background.jpg
│   ├── user-avatar-placeholder.png
│   └── icons/
│       ├── search-icon.svg
│       └── notification-bell.svg
├── fonts/
│   ├── inter-regular.woff2
│   └── roboto-bold.woff2

❌ Incorrect:
public/
├── images/
│   ├── Logo.svg          # PascalCase
│   ├── hero_bg.jpg       # snake_case
│   ├── userAvatar.png    # camelCase
```

## 🏗️ Project Structure Patterns

### Multi-App Consistency

All apps should follow the same structure:

```
apps/[app-name]/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Shared components
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   ├── constants/       # App constants
│   └── styles/          # CSS/Tailwind
├── public/              # Static assets
├── __tests__/           # Test files
└── package.json
```

### Shared Packages Structure

```
packages/[package-name]/
├── src/
│   ├── index.ts         # Main export
│   ├── components/      # Package components (kebab-case)
│   ├── utils/          # Package utilities (kebab-case)
│   ├── types/          # Package types (kebab-case)
│   └── constants/      # Package constants (kebab-case)
├── __tests__/          # Package tests
└── package.json
```

## 🤖 Automation & Enforcement

### ESLint Rules (To be implemented)

```json
{
  "rules": {
    "file-naming/kebab-case": [
      "error",
      {
        "directories": true,
        "exceptions": ["page.tsx", "route.ts", "layout.tsx"]
      }
    ],
    "file-naming/pascal-case": [
      "error",
      {
        "patterns": ["**/*Components/*.tsx", "**/components/**/*.tsx"]
      }
    ]
  }
}
```

### Pre-commit Hooks

```bash
# Check file naming conventions
scripts/check-naming-conventions.sh

# Auto-fix common naming issues
scripts/fix-naming-conventions.sh
```

### CI/CD Integration

- **Pull Request Checks**: Validate naming before merge
- **Build Pipeline**: Fail builds on naming violations
- **Code Generation**: Templates follow conventions

## 👥 Team-Specific Guidelines

### 🤖 Claude AI Team

- **Generated Code**: Must follow all conventions
- **Templates**: Include naming convention examples
- **Documentation**: Auto-generate with proper naming

### 👥 Central Team

- **Code Reviews**: Enforce naming conventions
- **Architecture**: Design with naming consistency
- **Tooling**: Maintain naming enforcement tools

### 🌍 Independent Developers

- **Module Development**: Follow package naming rules
- **Contributions**: Must pass naming checks
- **Examples**: Reference approved naming patterns

## 🔧 Migration Strategy

### Existing Files

1. **Phase 1**: Document current patterns
2. **Phase 2**: Automated renaming scripts
3. **Phase 3**: Gradual migration during refactoring

### New Development

- **Immediate**: All new files follow conventions
- **Templates**: Updated with correct naming
- **Reviews**: Block non-compliant naming

## 📚 Quick Reference

### Cheat Sheet

```
Directories:      kebab-case
Components:       PascalCase.tsx
Pages:           page.tsx (in kebab-case dir)
API Routes:      route.ts (in kebab-case dir)
Utilities:       kebab-case.ts
Types:          kebab-case.ts (export PascalCase)
Hooks:          usePascalCase.ts
Constants:      kebab-case.ts (export SCREAMING_SNAKE)
Tests:          Original.test.ts
Assets:         kebab-case.ext
Packages:       all kebab-case
```

### Common Patterns

```
✅ UserProfile.tsx          (Component)
✅ user-profile/page.tsx    (Page)
✅ user-data/route.ts       (API)
✅ format-currency.ts       (Utility)
✅ user.ts                  (Types)
✅ useAuth.ts              (Hook)
✅ api-config.ts           (Constants)
✅ UserProfile.test.tsx    (Test)
```

## 🚀 Benefits

1. **Predictable Structure**: Developers can find files intuitively
2. **Tool Integration**: Automated tools work reliably
3. **Module Sharing**: Easy to move code between apps
4. **Team Scaling**: New developers onboard faster
5. **Reduced Conflicts**: Clear standards prevent debates

---

**Related Documents**:

- [Development Workflow](../shared/daily-workflow.md)
- [Code Review Guidelines](../../central-team/code-review-standards.md)
- [Module Development Guide](./module-development-guide.md)
- [Testing Standards](./testing-standards.md)
