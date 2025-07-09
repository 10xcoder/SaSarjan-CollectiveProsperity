# Claude Code File Exclusion Patterns for SaSarjan AppStore

## Overview
While Claude Code doesn't support a `.claudeignore` file, this document provides patterns and strategies to minimize token usage by avoiding unnecessary file exploration.

## Directories to Avoid (Unless Specifically Needed)

### Build & Dependencies
```
node_modules/          # NPM packages (massive token usage)
.next/                 # Next.js build output
out/                   # Static export files
build/                 # Build artifacts
dist/                  # Distribution files
.turbo/                # Turborepo cache
.parcel-cache/         # Parcel bundler cache
```

### Generated Files
```
*.tsbuildinfo          # TypeScript build info
next-env.d.ts          # Next.js environment types
coverage/              # Test coverage reports
.nyc_output/           # NYC coverage data
test-results/          # Test output
playwright-report/     # Playwright test reports
```

### Large Lock Files
```
pnpm-lock.yaml         # Only explore for dependency debugging
package-lock.json      # Avoid unless resolving conflicts
yarn.lock              # Package manager locks
```

### Logs & Debug
```
*.log                  # All log files
logs/                  # Log directories
npm-debug.log*         # NPM debug logs
yarn-debug.log*        # Yarn debug logs
.pnpm-debug.log*       # PNPM debug logs
```

### Environment & Secrets
```
.env                   # Environment variables
.env*.local            # Local environment files
.env.development       # Development environment
.env.production        # Production environment
*.pem                  # Certificate files
.sentryclirc           # Sentry configuration
```

## Smart Search Patterns

### Good Patterns (Specific & Targeted)
```bash
# Source code only
"apps/*/src/**/*.{ts,tsx}"
"packages/*/src/**/*.{ts,tsx}"

# Specific app
"apps/talentexcel/src/**/*.tsx"
"apps/admin/src/**/*.tsx"

# Configuration files
"*.config.{js,ts}"
"tsconfig*.json"

# Package files
"*/package.json"
```

### Avoid These Patterns
```bash
# Too broad
"**/*"
"**/*.js"

# Will include node_modules
"**/components/*"
```

## File Size Considerations

### Large Files to Handle Carefully
- `pnpm-lock.yaml` (~10MB+)
- Database dumps (`*.sql`)
- Media files (`*.png`, `*.jpg`, `*.pdf`)
- Minified files (`*.min.js`, `*.min.css`)

### When to Load Large Files
1. Debugging specific dependency issues
2. Analyzing security vulnerabilities
3. Resolving version conflicts
4. Explicit user request

## Recommended Workflow

### 1. Initial Exploration
```bash
# Start with package structure
Glob: "*/package.json"

# Then explore source directories
Glob: "apps/*/src/*"
Glob: "packages/*/src/*"
```

### 2. Targeted Search
```bash
# Search for specific functionality
Grep: "pattern" --include="*.tsx" --path="apps/talentexcel/src"

# Find type definitions
Grep: "export.*interface" --include="*.ts" --path="packages/*/src"
```

### 3. Avoid Recursive Searches in Root
```bash
# Bad: Searches everything including node_modules
Grep: "auth" --path="/"

# Good: Search specific areas
Grep: "auth" --path="packages/auth/src"
```

## Project-Specific Exclusions

### Supabase Generated Files
```
**/supabase/.branches/
**/supabase/.temp/
```

### PWA Generated Files
```
public/sw.js
public/workbox-*.js
```

### IDE Files
```
.vscode/*              # Except specific configs
.idea/                 # IntelliJ files
*.swp, *.swo          # Vim swap files
```

### Temporary Files
```
*~                     # Backup files
.DS_Store              # macOS files
Thumbs.db              # Windows files
.cache/                # Generic cache
```

## Quick Reference for Common Tasks

### Finding Components
```bash
# Instead of searching all files
Glob: "apps/*/src/components/*.tsx"
```

### Finding API Routes
```bash
# Next.js API routes
Glob: "apps/*/src/app/api/**/route.ts"
```

### Finding Configurations
```bash
# All config files
Glob: "{apps,packages}/*/tsconfig.json"
Glob: "*.config.{js,ts,mjs}"
```

### Finding Tests
```bash
# Test files only
Glob: "**/*.{test,spec}.{ts,tsx}"
Glob: "**/tests/**/*.{ts,tsx}"
```

## Token-Saving Tips

1. **Use file paths from error messages** - They're usually exact
2. **Read package.json first** - Understand structure before exploring
3. **Check imports in one file** - Find related files to explore
4. **Use Task tool for complex searches** - More efficient than manual
5. **Batch related file reads** - Single message, multiple files

## Summary

By following these exclusion patterns and search strategies, you can reduce token usage by approximately 60-80% in typical development sessions. Always start with specific paths and expand only when necessary.