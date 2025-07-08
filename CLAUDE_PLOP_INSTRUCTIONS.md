# Claude AI - Plop Generator Instructions

**CRITICAL**: Claude MUST use Plop generators for ALL file creation. No manual file creation allowed.

## 🚨 Mandatory Rules for Claude

### 1. **NEVER Create Files Manually**

```bash
# ❌ WRONG - Manual file creation
Write component to src/components/UserProfile.tsx

# ✅ CORRECT - Use Plop generator
npm run generate:component
> UserProfile, feature, web
```

### 2. **Always Use Correct Generator**

- **Components** → `npm run generate:component`
- **Hooks** → `npm run generate:hook`
- **Utilities** → `npm run generate:util`
- **Pages** → `npm run generate:page`
- **APIs** → `npm run generate:api`
- **Types** → `npm run generate:type`
- **Modules** → `npm run generate:module`

### 3. **Generator Answer Patterns**

#### Component Generation

```bash
npm run generate:component
? Component name: UserProfile        # PascalCase
? Component type: feature            # ui/forms/layout/feature
? Which app: talentexcel            # web/talentexcel/sevapremi/10xgrowth
```

#### Hook Generation

```bash
npm run generate:hook
? Hook name: auth                   # NO 'use' prefix
? Which app: web
# Creates: useAuth.ts
```

#### Utility Generation

```bash
npm run generate:util
? Utility name: format-currency     # kebab-case
? Which app: web
```

#### Page Generation

```bash
npm run generate:page
? Page route: job-listings          # kebab-case
? Which app: talentexcel
```

#### API Generation

```bash
npm run generate:api
? API route: user-profile           # kebab-case
? Which app: web
```

## 📋 Claude's Workflow Examples

### Example 1: User asks for "UserProfile component"

```bash
# Claude's steps:
1. Run: npm run generate:component
2. Answer prompts:
   - Component name: UserProfile
   - Component type: feature
   - Which app: [determine from context]
3. Report: "Created UserProfile component with tests"
```

### Example 2: User asks for "payment processing functionality"

```bash
# Claude's steps:
1. Run: npm run generate:util
2. Answer prompts:
   - Utility name: process-payment
   - Which app: web
3. Then run: npm run generate:type
4. Answer prompts:
   - Type name: Payment
   - Which app: web
```

### Example 3: User asks for "job listings page with API"

```bash
# Claude's steps:
1. Run: npm run generate:page
   - Page route: job-listings
   - Which app: talentexcel
2. Run: npm run generate:api
   - API route: job-listings
   - Which app: talentexcel
3. Run: npm run generate:component
   - Component name: JobListingCard
   - Component type: ui
   - Which app: talentexcel
4. Run: npm run generate:hook
   - Hook name: jobListings
   - Which app: talentexcel
```

## 🎯 Decision Tree for Claude

```
User requests code creation
├── Is it a React component?
│   └── npm run generate:component
├── Is it a hook/state logic?
│   └── npm run generate:hook
├── Is it a helper/utility function?
│   └── npm run generate:util
├── Is it a new page/route?
│   └── npm run generate:page
├── Is it an API endpoint?
│   └── npm run generate:api
├── Is it a type definition?
│   └── npm run generate:type
└── Is it a shared module?
    └── npm run generate:module
```

## ⚠️ Common Claude Mistakes to Avoid

### ❌ Creating files with Write tool

```typescript
// NEVER DO THIS
Write file to src/components/Button.tsx
```

### ❌ Wrong naming for generators

```bash
# WRONG - Including 'use' in hook name
npm run generate:hook
> useAuth ❌

# CORRECT
npm run generate:hook
> auth ✅
```

### ❌ PascalCase for utilities

```bash
# WRONG
npm run generate:util
> FormatCurrency ❌

# CORRECT
npm run generate:util
> format-currency ✅
```

## 🚀 Benefits for Claude

1. **100% Naming Compliance** - No manual naming decisions
2. **Faster Generation** - 30 seconds vs 5 minutes
3. **Complete Files** - Tests included automatically
4. **No Human Review Issues** - Always correct structure
5. **Consistent Patterns** - Same structure every time

## 📝 Claude's Daily Checklist

- [ ] Use Plop for EVERY file creation
- [ ] Never use Write tool for code files
- [ ] Always pick correct generator type
- [ ] Use correct naming for each generator
- [ ] Verify correct app selection
- [ ] Report what was generated to user

**Remember**: Plop generators are Claude's primary tool for code generation. Manual file creation is forbidden.
