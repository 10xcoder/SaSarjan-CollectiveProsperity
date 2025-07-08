# Developer Contribution Guide - SaSarjan App Store

**Created**: 05-Jul-2025  
**Version**: 1.0  
**Audience**: External developers, contributors, and partners

## Welcome to SaSarjan Developer Community! 🚀

Thank you for your interest in contributing to the SaSarjan App Store platform. We're building a collective prosperity ecosystem where your contributions can create real-world impact while earning you recognition and revenue.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Contribution Types](#contribution-types)
3. [Development Environment](#development-environment)
4. [Module Development](#module-development)
5. [App Development](#app-development)
6. [Testing Guidelines](#testing-guidelines)
7. [Submission Process](#submission-process)
8. [Revenue Sharing](#revenue-sharing)
9. [Community Guidelines](#community-guidelines)
10. [Resources & Support](#resources--support)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm 8+
- Git and GitHub account
- TypeScript knowledge
- React 18+ experience
- Basic understanding of modular architecture

### Quick Start

```bash
# Clone the starter template
git clone https://github.com/sasarjan/module-starter
cd module-starter

# Install dependencies
pnpm install

# Set up your developer account
pnpm run dev:setup

# Start development
pnpm dev
```

### Developer Account Setup

1. Register at [developers.sasarjan.com](https://developers.sasarjan.com)
2. Complete KYC verification
3. Get your API keys
4. Join our Discord community

## Contribution Types

### 1. Core Module Contributions

Enhance existing shared modules that all apps use:

- Authentication improvements
- Profile enhancements
- Search optimizations
- Performance improvements

### 2. New Module Development

Create new modules that can be used across apps:

- Payment integrations
- Analytics tools
- Communication features
- AI/ML capabilities

### 3. App-Specific Features

Build features for specific apps:

- TalentExcel: Career tools
- SevaPremi: Volunteer features
- 10xGrowth: Business tools

### 4. Template Creation

Design reusable app templates:

- Industry-specific templates
- Use-case templates
- Starter kits

### 5. Integration Development

Connect external services:

- Social media integrations
- Payment gateways
- Cloud services
- Analytics platforms

## Development Environment

### Local Setup

```bash
# Clone the main repository
git clone https://github.com/sasarjan/appstore
cd appstore

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run development server
pnpm dev

# Access at
# Platform: http://localhost:3000
# TalentExcel: http://localhost:3001
# SevaPremi: http://localhost:3002
# 10xGrowth: http://localhost:3003
```

### Environment Variables

```env
# Developer credentials
SASARJAN_API_KEY=your_api_key
SASARJAN_API_SECRET=your_api_secret

# Database (local development)
DATABASE_URL=postgresql://localhost:5432/sasarjan_dev

# Services
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### Docker Development

```bash
# Start all services
docker-compose up

# Run specific app
docker-compose up talentexcel

# Access database
docker-compose exec db psql -U postgres
```

## Module Development

### Module Structure

```
my-awesome-module/
├── src/
│   ├── index.ts           # Module entry point
│   ├── components/        # React components
│   ├── hooks/            # React hooks
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   └── utils/            # Utilities
├── tests/                # Test files
├── docs/                 # Documentation
├── examples/             # Usage examples
├── package.json          # Module metadata
├── README.md            # Module documentation
└── LICENSE              # License file
```

### Module Manifest

```json
{
  "name": "@yourusername/module-name",
  "version": "1.0.0",
  "description": "Brief description of what your module does",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "sasarjan": {
    "type": "feature",
    "category": "productivity",
    "platforms": ["talentexcel", "10xgrowth"],
    "dependencies": {
      "core": ["auth", "profile"],
      "external": ["stripe", "twilio"]
    },
    "permissions": ["user.profile.read", "notifications.send"],
    "config": {
      "customizable": true,
      "multiTenant": true
    }
  },
  "peerDependencies": {
    "@sasarjan/sdk": "^1.0.0",
    "react": "^18.0.0"
  }
}
```

### Module Implementation

```typescript
// src/index.ts
import { ModuleDefinition } from '@sasarjan/sdk';

export default {
  id: 'my-awesome-module',
  name: 'My Awesome Module',
  version: '1.0.0',

  // Module lifecycle
  async onInstall(context) {
    // Initialize module
    await context.db.createTables();
    await context.registerWebhooks();
  },

  async onEnable(context) {
    // Module enabled for user
    const userConfig = await context.getUserConfig();
    return this.initialize(userConfig);
  },

  async onDisable(context) {
    // Cleanup when disabled
    await this.cleanup();
  },

  // Module API
  api: {
    async getData(params) {
      // Your API methods
    }
  },

  // Module components
  components: {
    MainView: () => import('./components/MainView'),
    Settings: () => import('./components/Settings')
  },

  // Module routes
  routes: [
    {
      path: '/my-module',
      component: 'MainView',
      permissions: ['authenticated']
    }
  ]
} as ModuleDefinition;
```

### Best Practices

1. **Keep it focused** - One module, one purpose
2. **Make it configurable** - Allow customization
3. **Think reusability** - Design for multiple apps
4. **Document everything** - Clear docs = more adoption
5. **Test thoroughly** - Aim for >80% coverage
6. **Handle errors gracefully** - Never crash the app
7. **Optimize performance** - Lazy load, code split
8. **Follow conventions** - Use our coding standards

## App Development

### Creating a New App

```bash
# Use our CLI tool
npx @sasarjan/create-app my-app

# Choose a template
? Select app template:
  > E-commerce
    Education
    Community
    Healthcare
    Custom

# Configure your app
? App name: My Awesome App
? Primary color: #2563eb
? Enable payments? Yes
? Multi-language? Yes
```

### App Configuration

```typescript
// app.config.ts
export const appConfig = {
  id: 'my-app',
  name: 'My Awesome App',
  domain: 'myapp.com',

  // Modules to include
  modules: {
    core: [
      '@sasarjan/auth',
      '@sasarjan/profile',
      '@sasarjan/payments'
    ],
    custom: [
      '@myusername/custom-feature'
    ]
  },

  // Theme configuration
  theme: {
    primary: '#2563eb',
    secondary: '#7c3aed',
    mode: 'light'
  },

  // Features
  features: {
    payments: true,
    multilingual: true,
    offline: true,
    pwa: true
  }
};
```

## Testing Guidelines

### Test Structure

```typescript
// tests/my-module.test.ts
import { renderModule, mockContext } from '@sasarjan/test-utils';
import MyModule from '../src';

describe('MyModule', () => {
  it('should initialize correctly', async () => {
    const context = mockContext();
    await MyModule.onInstall(context);

    expect(context.db.createTables).toHaveBeenCalled();
  });

  it('should handle user data', async () => {
    const { api } = MyModule;
    const data = await api.getData({ userId: '123' });

    expect(data).toBeDefined();
  });
});
```

### Testing Requirements

- Unit tests for all functions
- Integration tests for APIs
- Component tests for UI
- E2E tests for critical flows
- Performance tests for scale

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test my-module

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

## Submission Process

### 1. Pre-submission Checklist

- [ ] Code follows our style guide
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] License file included

### 2. Submit via CLI

```bash
# Login to your account
sasarjan login

# Validate your module
sasarjan validate

# Submit for review
sasarjan submit

# Track status
sasarjan status
```

### 3. Review Process

1. **Automated Review** (1 hour)
   - Code quality checks
   - Security scanning
   - Performance testing
   - License validation

2. **Manual Review** (24-48 hours)
   - Code review by core team
   - UI/UX review
   - Documentation review
   - Business logic validation

3. **Feedback & Iteration**
   - Address review comments
   - Resubmit if needed
   - Final approval

### 4. Publishing

Once approved:

- Module published to registry
- Available in module marketplace
- Documentation goes live
- Revenue sharing activated

## Revenue Sharing

### How It Works

1. **Module Usage** - Track installations and usage
2. **Revenue Generation** - From subscriptions and purchases
3. **Monthly Calculation** - Based on usage metrics
4. **Automatic Payout** - Via Razorpay

### Revenue Split

- **Free Modules**:
  - Platform: 0%
  - Developer: 100% of donations
- **Paid Modules**:
  - Developer: 70%
  - Platform: 30%
- **Premium Features**:
  - Developer: 60%
  - Platform: 40%

### Payment Setup

```bash
# Configure payment details
sasarjan payment setup

# View earnings
sasarjan earnings

# Request payout
sasarjan payout request
```

## Community Guidelines

### Code of Conduct

1. **Be Respectful** - Treat everyone with respect
2. **Be Inclusive** - Welcome all contributors
3. **Be Helpful** - Share knowledge freely
4. **Be Professional** - Maintain high standards
5. **Be Honest** - Give credit where due

### Communication Channels

- **Discord**: [discord.sasarjan.com](https://discord.sasarjan.com)
- **Forum**: [forum.sasarjan.com](https://forum.sasarjan.com)
- **GitHub**: [github.com/sasarjan](https://github.com/sasarjan)
- **Twitter**: [@sasarjan_dev](https://twitter.com/sasarjan_dev)

### Getting Help

- **Documentation**: [docs.sasarjan.com](https://docs.sasarjan.com)
- **API Reference**: [api.sasarjan.com](https://api.sasarjan.com)
- **Video Tutorials**: [youtube.com/sasarjan](https://youtube.com/sasarjan)
- **Office Hours**: Thursdays 3-5 PM IST

## Resources & Support

### Learning Resources

1. **Starter Course** - Free 5-hour course
2. **Module Workshop** - Weekly live sessions
3. **Architecture Deep Dive** - Monthly webinars
4. **Best Practices Guide** - Comprehensive PDF

### Developer Tools

- **VS Code Extension** - IntelliSense for SDK
- **Chrome DevTools** - Module debugging
- **Performance Profiler** - Optimization help
- **Security Scanner** - Vulnerability checks

### Certification Program

Become a certified SaSarjan developer:

1. **Basic Certification** - Module development
2. **Advanced Certification** - App architecture
3. **Expert Certification** - Platform contribution

### Support Tiers

1. **Community Support** - Free via Discord/Forum
2. **Priority Support** - For active contributors
3. **Enterprise Support** - For large teams

## Success Stories

### Featured Developers

- **Priya Sharma** - Created education modules, 50K+ users
- **Amit Patel** - Built payment integration, ₹5L revenue
- **Team InnovateTech** - Launched 3 apps, 100K+ downloads

### Popular Modules

1. **Advanced Analytics** - 10K+ installs
2. **Video Calling** - 8K+ installs
3. **AI Content Generator** - 5K+ installs

## Next Steps

1. **Join our Discord** - Connect with other developers
2. **Complete the starter tutorial** - Build your first module
3. **Explore existing modules** - Learn from examples
4. **Start building** - Create something amazing!

---

**Questions?** Reach out at developers@sasarjan.com

**Ready to contribute?** Let's build collective prosperity together! 🌟
