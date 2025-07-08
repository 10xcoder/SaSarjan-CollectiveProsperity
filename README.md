# SaSarjan AppStore 🚀

**The Collective Prosperity Platform**  
Democratizing access to digital prosperity through a network of interconnected micro-apps.

---

## 🌟 **Project Overview**

SaSarjan is building a comprehensive ecosystem of micro-applications that empower individuals, businesses, and communities to achieve sustainable growth and prosperity. Our platform consists of specialized apps, each serving a unique purpose while sharing common infrastructure and data.

## 🏗️ **App Ecosystem**

### **Core Applications**

- **🎯 TalentExcel** - Lifelong Learning & Earning Platform
- **📈 10xGrowth** - Business Growth Accelerator
- **🤝 SevaPremi** - Local Area Improvement Network
- **👥 Admin Panel** - Cross-platform administration
- **🌐 Web Portal** - Central discovery and authentication hub

### **Recently Added Features**

- ✅ **Multiple Landing Pages System** (10xGrowth) - Complete CMS for creating unlimited landing pages
- ✅ **Performance Monitoring** - Core Web Vitals tracking and analytics
- ✅ **SEO Optimization** - Automated sitemap, structured data, and meta tags
- ✅ **Business Templates** - Professional landing page templates ready for use

---

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+
- pnpm (recommended)
- Docker & Docker Compose
- Supabase CLI

### **Development Setup**

```bash
# Clone the repository
git clone <repository-url>
cd SaSarjan-AppStore

# Install dependencies
pnpm install

# Start local development environment
pnpm dev:all

# Or start individual apps
pnpm dev:talentexcel   # Port 3000
pnpm dev:10xgrowth     # Port 3001
pnpm dev:sevapremi     # Port 3002
pnpm dev:admin         # Port 3003
pnpm dev:web           # Port 3004
```

### **Database Setup**

```bash
# Start local Supabase instance
pnpm supabase start

# Apply database migrations
pnpm supabase db reset

# Load sample data
pnpm db:seed
```

---

## 📁 **Project Structure**

```
SaSarjan-AppStore/
├── apps/                          # Individual applications
│   ├── talentexcel/              # Learning platform
│   ├── 10x-growth/               # Business growth (with new landing pages!)
│   ├── sevapremi/                # Community platform
│   ├── admin/                    # Admin dashboard
│   └── web/                      # Main portal
├── packages/                     # Shared packages
│   ├── auth/                     # Authentication system
│   ├── database/                 # Database client & types
│   ├── cms/                      # Content management (NEW!)
│   ├── ui/                       # Shared UI components
│   └── profile-core/             # Profile management
├── docs/                         # Documentation
├── plan/                         # Project planning & logs
└── supabase/                     # Database & migrations
```

---

## 🎯 **Key Features**

### **Shared Infrastructure**

- 🔐 **Unified Authentication** - Single sign-on across all apps
- 🗄️ **Centralized Database** - Supabase with RLS policies
- 📊 **Analytics & Monitoring** - Real-time performance tracking
- 🎨 **Design System** - Consistent UI/UX across platforms
- 📱 **Responsive Design** - Mobile-first approach

### **Content Management (NEW!)**

- 📝 **Landing Pages** - Visual editor with block-based content
- 🎨 **Professional Templates** - Business-ready designs
- 🔍 **SEO Optimization** - Automated meta tags and structured data
- 📊 **Performance Analytics** - Core Web Vitals monitoring
- 🎯 **A/B Testing Ready** - Foundation for conversion optimization

### **Location Intelligence**

- 📍 **Hierarchical Locations** - Village to continent mapping
- 🗺️ **Geographic Services** - PostGIS-powered spatial queries
- 🏠 **Multi-location Profiles** - Home, work, and custom locations
- 🎯 **Location-based Filtering** - Relevant content by geography

---

## 📚 **Documentation**

### **Getting Started**

- [Quick Start Guide](./QUICK-START.md)
- [Development Workflow](./docs/Development_Workflow.md)
- [Environment Setup](./docs/development-startup-guide.md)

### **Feature Guides**

- [Landing Pages System](./LANDING_PAGES_IMPLEMENTATION_GUIDE.md) ⭐ **NEW!**
- [Testing Guide](./TESTING_GUIDE.md)
- [Authentication Setup](./docs/AUTHENTICATION_SETUP.md)
- [Database Management](./docs/database-supabase/README.md)

### **Architecture**

- [Technical Specifications](./docs/Technical_Specifications.md)
- [Database Architecture](./docs/database-supabase/README.md)
- [Multi-App Strategy](./docs/architecture/multi-team-microapp-strategy.md)

---

## 🛠️ **Development**

### **Tech Stack**

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Package Management**: pnpm Workspaces
- **Testing**: Playwright, Vitest
- **Deployment**: Vercel, Docker

### **Development Commands**

```bash
# Start all services
pnpm dev:all

# Database operations
pnpm db:reset               # Reset database
pnpm db:seed                # Load sample data
pnpm db:migrate             # Apply migrations

# Code quality
pnpm lint                   # ESLint check
pnpm typecheck              # TypeScript check
pnpm test                   # Run tests

# Build & deployment
pnpm build                  # Build all apps
pnpm build:10xgrowth        # Build specific app
```

---

## 🎨 **Recent Achievements**

### **Landing Pages System (07-Jul-2025)**

- ✅ Complete CMS implementation with visual editor
- ✅ 5 professional business templates ready
- ✅ SEO optimization with structured data
- ✅ Performance monitoring dashboard
- ✅ 67-page developer replication guide
- ✅ End-to-end testing framework

### **Multi-App Infrastructure**

- ✅ Unified authentication across 5 apps
- ✅ Shared component library
- ✅ Centralized database with RLS
- ✅ Development workflow automation

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Developer Contribution Guide](./docs/developer-contribution-guide.md) for detailed information on:

- Code standards and conventions
- Development workflow
- Testing requirements
- Pull request process

---

## 📞 **Support & Contact**

- **Documentation**: Check `/docs` folder for comprehensive guides
- **Issues**: Use GitHub issues for bug reports and features
- **Development**: See `/plan/teams/developers/` for team-specific guides

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**🌟 Building the future of collective prosperity, one app at a time.**

_Last Updated: 07-Jul-2025, Monday 23:15 IST_
