# Naming Convention Enforcement Automation

**Last Updated**: 05-Jul-2025 (Saturday, 18:15 IST)  
**Purpose**: Automate file naming convention compliance across all teams  
**Priority**: High (Foundation for scalable development)

## 🎯 Overview

This document outlines the automation strategy for enforcing consistent file naming conventions across the SaSarjan App Store project, ensuring all three teams (🤖 Claude AI, 👥 Central Team, 🌍 Independent Developers) follow the same standards.

## 🔧 Automation Tools & Implementation

### 1. ESLint Rules for File Naming

#### Custom ESLint Plugin Configuration

```json
{
  "extends": [
    "@next/eslint-config-next",
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "plugins": ["file-naming", "folder-naming"],
  "rules": {
    "file-naming/kebab-case": [
      "error",
      {
        "patterns": [
          "**/utils/**/*.ts",
          "**/services/**/*.ts",
          "**/types/**/*.ts",
          "**/constants/**/*.ts",
          "**/hooks/use*.ts"
        ]
      }
    ],
    "file-naming/pascal-case": [
      "error",
      {
        "patterns": [
          "**/components/**/*.tsx",
          "**/app/**/page.tsx",
          "**/app/**/layout.tsx"
        ]
      }
    ],
    "folder-naming/kebab-case": [
      "error",
      {
        "patterns": [
          "src/**/*",
          "app/**/*",
          "components/**/*",
          "utils/**/*",
          "types/**/*"
        ],
        "exceptions": ["__tests__", "node_modules", ".next"]
      }
    ]
  }
}
```

#### Implementation Script

```typescript
// scripts/setup-naming-linter.ts
import { execSync } from 'child_process';

export async function setupNamingLinter() {
  // Install required packages
  const packages = [
    'eslint-plugin-file-naming',
    'eslint-plugin-folder-naming',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser'
  ];

  console.log('Installing naming convention linter packages...');
  execSync(`pnpm add -D ${packages.join(' ')}`, { stdio: 'inherit' });

  // Create ESLint rules file
  const eslintRules = {
    rules: {
      'file-naming/kebab-case': ['error', {
        patterns: [
          '**/utils/**/*.ts',
          '**/services/**/*.ts',
          '**/types/**/*.ts',
          '**/constants/**/*.ts'
        ]
      }],
      'file-naming/pascal-case': ['error', {
        patterns: [
          '**/components/**/*.tsx'
        ]
      }]
    }
  };

  console.log('✅ Naming convention linter setup complete');
}
```

### 2. Pre-commit Hooks

#### Husky Configuration

```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run naming convention checks
npm run lint:naming
npm run check:naming-conventions

# Format and lint
npm run format
npm run lint

# Run tests
npm run test
```

#### Naming Validation Script

```bash
#!/bin/bash
# scripts/check-naming-conventions.sh

echo "🔍 Checking file naming conventions..."

# Check for PascalCase components
INVALID_COMPONENTS=$(find src/components -name "*.tsx" ! -name "[A-Z]*.tsx" 2>/dev/null)
if [ -n "$INVALID_COMPONENTS" ]; then
  echo "❌ Invalid component names (should be PascalCase.tsx):"
  echo "$INVALID_COMPONENTS"
  exit 1
fi

# Check for kebab-case utilities
INVALID_UTILS=$(find src/utils -name "*.ts" | grep -E "[A-Z]|_" 2>/dev/null)
if [ -n "$INVALID_UTILS" ]; then
  echo "❌ Invalid utility names (should be kebab-case.ts):"
  echo "$INVALID_UTILS"
  exit 1
fi

# Check for kebab-case directories
INVALID_DIRS=$(find src -type d | grep -E "[A-Z]|_" | grep -v node_modules 2>/dev/null)
if [ -n "$INVALID_DIRS" ]; then
  echo "❌ Invalid directory names (should be kebab-case):"
  echo "$INVALID_DIRS"
  exit 1
fi

echo "✅ All naming conventions passed!"
```

### 3. Automated File Renaming

#### Migration Script

```typescript
// scripts/migrate-naming-conventions.ts
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface NamingRule {
  pattern: RegExp;
  transform: (name: string) => string;
  type: 'file' | 'directory';
}

const namingRules: NamingRule[] = [
  {
    pattern: /.*\/components\/.*\.tsx$/,
    transform: (name) => toPascalCase(path.basename(name, '.tsx')) + '.tsx',
    type: 'file'
  },
  {
    pattern: /.*\/utils\/.*\.ts$/,
    transform: (name) => toKebabCase(path.basename(name, '.ts')) + '.ts',
    type: 'file'
  },
  {
    pattern: /.*\/src\/[^/]*$/,
    transform: (name) => toKebabCase(path.basename(name)),
    type: 'directory'
  }
];

function toPascalCase(str: string): string {
  return str.replace(/(^|[-_])(.)/g, (_, __, char) => char.toUpperCase());
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export async function migrateNamingConventions(dryRun = true) {
  console.log('🔄 Starting naming convention migration...');

  const allFiles = execSync('find src -type f', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);

  const renames: { from: string; to: string }[] = [];

  for (const file of allFiles) {
    for (const rule of namingRules) {
      if (rule.pattern.test(file)) {
        const dir = path.dirname(file);
        const newName = rule.transform(file);
        const newPath = path.join(dir, newName);

        if (file !== newPath) {
          renames.push({ from: file, to: newPath });
        }
      }
    }
  }

  console.log(`📋 Found ${renames.length} files to rename`);

  if (!dryRun) {
    for (const { from, to } of renames) {
      fs.renameSync(from, to);
      console.log(`✅ Renamed: ${from} → ${to}`);
    }
  } else {
    console.log('🔍 Dry run - would rename:');
    renames.forEach(({ from, to }) => {
      console.log(`  ${from} → ${to}`);
    });
  }
}
```

### 4. Plop.js Template Generation

#### Component Generator

```javascript
// plopfile.js - Component generator with naming enforcement
module.exports = function (plop) {
  // Component generator
  plop.setGenerator('component', {
    description: 'Create a new React component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (will be converted to PascalCase):',
        validate: (input) => {
          if (!input) return 'Component name is required';
          return true;
        },
        transform: (input) => {
          // Convert to PascalCase
          return input.replace(/(^|[-_\s])(.)/g, (_, __, char) => char.toUpperCase());
        }
      },
      {
        type: 'list',
        name: 'type',
        message: 'Component type:',
        choices: ['ui', 'forms', 'layout', 'feature']
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'src/components/{{kebabCase type}}/{{pascalCase name}}.tsx',
        templateFile: 'templates/component.hbs'
      },
      {
        type: 'add',
        path: 'src/components/{{kebabCase type}}/{{pascalCase name}}.test.tsx',
        templateFile: 'templates/component.test.hbs'
      }
    ]
  });

  // Utility generator
  plop.setGenerator('util', {
    description: 'Create a new utility function',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Utility name (will be converted to kebab-case):',
        transform: (input) => {
          return input
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
        }
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'src/utils/{{kebabCase name}}.ts',
        templateFile: 'templates/utility.hbs'
      },
      {
        type: 'add',
        path: 'src/utils/{{kebabCase name}}.test.ts',
        templateFile: 'templates/utility.test.hbs'
      }
    ]
  });

  // Hook generator
  plop.setGenerator('hook', {
    description: 'Create a new custom hook',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Hook name (without "use" prefix):',
        transform: (input) => {
          const cleaned = input.replace(/^use/, '');
          return 'use' + cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'src/hooks/{{camelCase name}}.ts',
        templateFile: 'templates/hook.hbs'
      },
      {
        type: 'add',
        path: 'src/hooks/{{camelCase name}}.test.ts',
        templateFile: 'templates/hook.test.hbs'
      }
    ]
  });
};
```

### 5. CI/CD Integration

#### GitHub Actions Workflow

```yaml
# .github/workflows/naming-conventions.yml
name: Naming Convention Validation

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  naming-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Check naming conventions
        run: |
          echo "🔍 Validating file naming conventions..."
          ./scripts/check-naming-conventions.sh

      - name: Lint naming rules
        run: pnpm run lint:naming

      - name: Validate directory structure
        run: |
          echo "📁 Checking directory naming..."
          find src -type d | grep -E "[A-Z]|_" | grep -v node_modules && exit 1 || echo "✅ All directories follow kebab-case"

      - name: Check component naming
        run: |
          echo "🧩 Checking React component naming..."
          find src/components -name "*.tsx" ! -name "[A-Z]*.tsx" && exit 1 || echo "✅ All components follow PascalCase"
```

### 6. Development Environment Setup

#### VSCode Settings

```json
// .vscode/settings.json
{
  "files.watcherExclude": {
    "**/node_modules/**": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.paths": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.options": {
    "extensions": [".ts", ".tsx"]
  },
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.ts": "typescript"
  }
}
```

#### Package.json Scripts

```json
{
  "scripts": {
    "lint:naming": "eslint --ext .ts,.tsx --fix src/",
    "check:naming": "./scripts/check-naming-conventions.sh",
    "fix:naming": "node scripts/migrate-naming-conventions.js",
    "generate:component": "plop component",
    "generate:util": "plop util",
    "generate:hook": "plop hook",
    "dev:naming": "concurrently \"npm run dev\" \"npm run check:naming --watch\""
  }
}
```

## 📊 Monitoring & Metrics

### Naming Convention Compliance Dashboard

```typescript
// scripts/naming-metrics.ts
interface NamingMetrics {
  totalFiles: number;
  compliantFiles: number;
  violationsByType: Record<string, number>;
  compliancePercentage: number;
}

export async function generateNamingMetrics(): Promise<NamingMetrics> {
  const allFiles = await getAllProjectFiles();
  const violations = await checkNamingViolations(allFiles);

  return {
    totalFiles: allFiles.length,
    compliantFiles: allFiles.length - violations.length,
    violationsByType: groupViolationsByType(violations),
    compliancePercentage: ((allFiles.length - violations.length) / allFiles.length) * 100
  };
}
```

### Weekly Compliance Report

```bash
#!/bin/bash
# scripts/weekly-naming-report.sh

echo "📊 Weekly Naming Convention Compliance Report"
echo "================================================"

# Generate metrics
node scripts/naming-metrics.js > naming-report.json

# Extract key metrics
COMPLIANCE=$(jq '.compliancePercentage' naming-report.json)
VIOLATIONS=$(jq '.violationsByType | to_entries | length' naming-report.json)

echo "Overall Compliance: ${COMPLIANCE}%"
echo "Violation Types: $VIOLATIONS"

# Set goals
if (( $(echo "$COMPLIANCE >= 95" | bc -l) )); then
  echo "✅ EXCELLENT: Meeting compliance goals"
elif (( $(echo "$COMPLIANCE >= 85" | bc -l) )); then
  echo "⚠️  GOOD: Approaching compliance goals"
else
  echo "❌ NEEDS IMPROVEMENT: Below compliance threshold"
fi
```

## 🎯 Team-Specific Implementation

### 🤖 Claude AI Team Automation

- **Real-time Validation**: All generated code checked for naming compliance
- **Template Updates**: Plop.js templates automatically follow conventions
- **Documentation**: Auto-generate examples with correct naming
- **Error Prevention**: Refuse to generate non-compliant file names

### 👥 Central Team Responsibilities

- **Tool Maintenance**: Keep ESLint rules and scripts updated
- **Code Review**: Enforce naming in all code reviews
- **Migration**: Plan and execute naming convention migrations
- **Standards**: Define and update naming conventions

### 🌍 Independent Developer Support

- **Onboarding**: Provide naming convention training
- **Templates**: Pre-configured project templates
- **Tooling**: Access to all naming enforcement tools
- **Review**: Automated naming checks before module acceptance

## 🚀 Implementation Timeline

### Week 1: Foundation

- [ ] Create comprehensive naming convention document ✅
- [ ] Set up ESLint rules for basic naming validation
- [ ] Create pre-commit hooks
- [ ] Update Claude AI automation tasks

### Week 2: Automation

- [ ] Implement Plop.js generators with naming enforcement
- [ ] Create migration scripts for existing files
- [ ] Set up CI/CD naming validation
- [ ] Create VSCode settings and extensions

### Week 3: Monitoring

- [ ] Build naming compliance dashboard
- [ ] Create weekly reporting scripts
- [ ] Implement automated metrics collection
- [ ] Set up alerting for compliance drops

### Week 4: Team Integration

- [ ] Train all teams on naming conventions
- [ ] Update all documentation and templates
- [ ] Run full project naming migration
- [ ] Establish ongoing compliance monitoring

## 📈 Success Metrics

- **Compliance Rate**: >95% of files follow naming conventions
- **New File Compliance**: 100% of newly generated files compliant
- **Review Speed**: 50% faster code reviews due to consistency
- **Developer Satisfaction**: >4.5/5 rating for naming clarity
- **Onboarding Time**: 30% faster new developer productivity

---

**Related Documents**:

- [File Naming Conventions](../teams/developers/shared/file-naming-conventions.md)
- [Claude AI Automation Tasks](../teams/claude-ai/automation-tasks.md)
- [Development Workflow](../teams/developers/shared/daily-workflow.md)
- [Code Review Standards](../teams/central-team/code-review-standards.md)
