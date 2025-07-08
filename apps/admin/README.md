# SaSarjan Admin Dashboard

Comprehensive admin dashboard for managing the SaSarjan App Store platform.

## Features Implemented

### 🔐 Authentication & Security

- Admin-only access with email/password authentication
- Protected routes using middleware
- Session management with Supabase Auth

### 📊 Dashboard Overview

- Real-time platform metrics:
  - Total users with breakdown (Admins, Developers, Multi-profile users)
  - Platform apps count with micro-apps
  - Total revenue and active installations
- Recent transactions view
- Platform status monitoring
- Quick action cards for navigation

### 👥 User Management

- Comprehensive user list with search and pagination
- Multi-profile support visualization:
  - Shows all profiles per user across different apps
  - Profile type and subtype display
  - Expandable user cards with full details
- User type identification (Admin, Developer, Multi-profile, Regular)
- Wallet balance and spending tracking
- Action buttons for user management

### 📦 App Management

- All platform apps with micro-apps display
- App metrics:
  - Downloads and ratings
  - Revenue potential
  - Status indicators
- Expandable cards showing:
  - Full descriptions
  - Developer information
  - Micro-apps/modules list with pricing
  - App metadata (ID, slug, brand)
- Search and filter capabilities
- Action buttons for app management

### 💰 Revenue Dashboard

- Revenue statistics:
  - Total lifetime revenue
  - Current vs previous month comparison
  - Growth indicators
  - Developer payouts (70% share)
  - Platform commission (30% share)
- Transaction metrics:
  - Total transactions count
  - Average transaction value
  - Top selling app identification
- Revenue by app breakdown:
  - App-wise revenue distribution
  - Percentage contribution
  - Transaction counts
- Transaction history:
  - Detailed transaction table
  - User and app information
  - Payment status tracking
  - Date range filtering
  - Status filtering
  - Export functionality

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Supabase
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React hooks
- **Data Fetching**: Custom Supabase queries

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication pages
│   │   └── auth/
│   │       └── login/
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── page.tsx      # Dashboard overview
│   │   ├── users/        # User management
│   │   ├── apps/         # App management
│   │   ├── revenue/      # Revenue dashboard
│   │   └── layout.tsx    # Dashboard layout with auth
│   └── layout.tsx        # Root layout
├── components/
│   ├── admin-layout.tsx  # Sidebar navigation
│   └── ui/              # Reusable UI components
└── lib/
    ├── supabase.ts      # Database queries
    └── utils.ts         # Utility functions
```

## Key Components

### AdminLayout

- Responsive sidebar navigation
- Mobile-friendly menu
- User profile display
- Quick navigation links

### Dashboard Pages

- **Overview**: Metrics cards, quick stats, recent activity
- **Users**: Search, filter, pagination, expandable details
- **Apps**: App cards with modules, status management
- **Revenue**: Financial analytics, transaction history

### Utility Functions

- `formatINR()`: Indian currency formatting
- `formatIndianNumber()`: Number formatting with commas
- `formatDate()`: Date formatting for Indian locale
- `cn()`: Class name utility for styling

## Running the Admin Dashboard

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev:admin

# Build for production
pnpm build:admin

# Run production server
pnpm start:admin
```

The admin dashboard runs on port 3004 by default.

## Environment Management

The admin panel supports multiple environments with easy switching:

### Available Environments

- **Local**: Local Supabase development instance
- **Staging**: Cloud Supabase staging environment
- **Production**: Cloud Supabase production environment

### Quick Environment Switching

```bash
# Check current environment
pnpm env:status

# Switch environments
pnpm env:local      # Switch to local development
pnpm env:staging    # Switch to staging
pnpm env:production # Switch to production
```

### Environment Files

```
.env.local.development  # Local development (default)
.env.local.staging      # Staging environment
.env.local.production   # Production environment
.env.local.example      # Template for new environments
.env.local              # Active environment (auto-generated)
```

### Setting Up Cloud Environments

1. **Create Supabase project** for staging/production
2. **Copy example file**: `cp .env.local.example .env.local.production`
3. **Fill in your values**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://admin.yourdomain.com
   DATABASE_URL=your_postgres_connection_string
   NEXT_PUBLIC_ENVIRONMENT=production
   ```
4. **Deploy schema**: `supabase db push`
5. **Create admin user** in the new environment

See [Environment Switching Guide](../../docs/admin-environment-switching.md) for detailed instructions.

## Access Control

- Only users in the `admin_users` table with `status: 'active'` can access the dashboard
- Default admin user: `superadmin@10xgrowth.com` (password: `admin123`)
- All routes under `/` are protected and require authentication
- Admin authentication checks both Supabase Auth and `admin_users` table

## Future Enhancements

- [ ] Data visualization with charts (Recharts integration)
- [ ] Reusable data table component
- [ ] Bulk user operations
- [ ] Email notifications
- [ ] Export functionality for all data
- [ ] Advanced analytics and reporting
- [ ] Real-time updates with subscriptions
- [ ] Audit logs
- [ ] Role-based permissions

## Notes

- All monetary values are displayed in INR (₹)
- Numbers use Indian formatting (lakhs, crores)
- Dates are formatted for Indian locale
- Revenue sharing: 70% to developers, 30% to platform
- Multi-profile support allows users to have multiple profiles of the same type
