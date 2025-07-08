# Test Data Guide - SaSarjan App Store

**Last Updated**: 06-Jul-2025, Sunday 11:50 IST

## Overview

This guide explains how to populate your local database with realistic test data for the SaSarjan App Store. The test data includes users, developers, apps, transactions, and success stories that reflect real-world usage patterns in the Indian market.

## Quick Start

```bash
# Start Supabase locally
pnpm db:start

# Run all seed scripts
pnpm db:seed

# Or run individual seed scripts
pnpm db:seed:users    # Users and developers
pnpm db:seed:apps     # Apps and brands
pnpm db:seed:usage    # Installations and reviews
pnpm db:seed:revenue  # Transactions and revenue
pnpm db:seed:external # External apps and stories
```

## Test Data Structure

### 1. Users (25+ accounts)

- **Regular Users**: 12 users with varied profiles
- **Power Users**: 2 users with high engagement
- **Developers**: 5 developer accounts (3 companies, 2 individuals)
- **Admin Users**: 2 admin accounts
- **Test Scenarios**: New user, low balance user, regional language users

### 2. Apps (16 internal + 16 external)

- **Categories**: 2 apps per prosperity category
- **Pricing Models**: Free, Freemium, Paid, Subscription
- **Languages**: Hindi, Tamil, Telugu translations
- **Statuses**: Approved, Draft, Pending, Suspended

### 3. Realistic Data Patterns

- **Indian Names**: Rajesh Kumar, Priya Sharma, etc.
- **Indian Cities**: Mumbai, Delhi, Bangalore, etc.
- **Payment Methods**: UPI, Cards, Net Banking
- **Pricing**: ₹99 to ₹1,999 (realistic for Indian market)
- **Languages**: 20+ Indian languages

## Test Accounts

### 🔐 Common Password for All Test Users

```
Password: SaSarjan20@
```

All test users are pre-verified and can login immediately with this password.

### Admin Access

```
Email: admin@sasarjan.com
Password: SaSarjan20@
Role: Full admin access
```

### Developer Accounts

```
Email: techsolutions@example.com
Password: SaSarjan20@
Company: Tech Solutions India Pvt Ltd
Revenue: ₹1,50,000

Email: amit.developer@example.com
Password: SaSarjan20@
Type: Individual developer
Revenue: ₹45,000
```

### Power Users

```
Email: vikram.malhotra@example.com
Password: SaSarjan20@
Wallet: ₹15,000
Spent: ₹12,000
Apps: Multiple premium apps
```

### Multi-Profile Users

```
Email: priya.multitalent@example.com
Password: SaSarjan20@
Profiles: Design Student + Marketing Student + Mentor

Email: rajesh.changemaker@example.com
Password: SaSarjan20@
Profiles: Environment + Education + Health Volunteer
```

### Regular Users

```
Email: rajesh.kumar@example.com
Password: SaSarjan20@
Location: Mumbai
Language: English
Wallet: ₹2,500

Email: priya.sharma@example.com
Password: SaSarjan20@
Location: Delhi
Language: Hindi
Wallet: ₹5,000
```

### Test Scenarios

```
Email: newuser@example.com
Password: SaSarjan20@
Status: Just joined, no purchases

Email: lowbalance@example.com
Password: SaSarjan20@
Wallet: ₹50 (test insufficient balance)

Email: demo@sasarjan.com
Password: SaSarjan20@
Status: Demo account for presentations
```

## Data Categories

### Apps by Category

1. **Personal Transformation**: MindfulMe, YogaGuru
2. **Organizational Excellence**: TeamSync Pro, HRBuddy
3. **Community Resilience**: LocalConnect, DisasterReady
4. **Ecological Regeneration**: GreenKarma, TreeWarrior
5. **Economic Empowerment**: KisanMitra, MicroBiz
6. **Knowledge Commons**: BhashaGyan, SkillBazaar
7. **Social Innovation**: ChangeMakers, CrowdSolve
8. **Cultural Expression**: RaagTaal, KalaKriti

### Transaction Types

- Wallet top-ups (UPI, Card, Net Banking)
- App purchases (one-time)
- Subscription renewals
- Module purchases
- Refunds (2% rate)
- Failed transactions

### Review Patterns

- Ratings: 1-5 stars with realistic distribution
- Hindi and English reviews
- Verified purchase badges
- Helpful counts

## Testing Scenarios

### 1. New User Journey

```bash
# Use account: newuser@example.com
- No wallet balance
- No app installations
- Fresh onboarding experience
```

### 2. Payment Testing

```bash
# Use account: lowbalance@example.com
- Test insufficient balance scenarios
- Test top-up flows
- Test payment failures
```

### 3. Developer Dashboard

```bash
# Use account: techsolutions@example.com
- View revenue analytics
- Check payout history
- Manage multiple apps
```

### 4. Multi-lingual Testing

```bash
# Regional language users:
- marathi@example.com (Marathi)
- kannada@example.com (Kannada)
- Test language switching
```

### 5. Community Features

```bash
# Use LocalConnect app
- Test user interactions
- Community events
- Resource sharing
```

## Customizing Test Data

### Add More Users

Edit `supabase/seed/01-users-and-developers.sql`:

```sql
INSERT INTO users (id, email, phone, full_name, location, wallet_balance)
VALUES ('custom-user-001', 'custom@example.com', '+919999999999', 'Custom User', 'City, State', 1000.00);
```

### Add More Apps

Edit `supabase/seed/02-brands-and-apps.sql`:

```sql
INSERT INTO apps (id, developer_id, name, category, price, status)
VALUES ('custom-app-001', 'dev-profile-001', 'Custom App', 'category_name', 299.00, 'approved');
```

### Modify Transaction Patterns

Edit `supabase/seed/04-transactions-and-revenue.sql` to adjust:

- Transaction frequency
- Amount ranges
- Payment method distribution
- Refund rates

## Reset and Refresh

```bash
# Reset database to clean state
pnpm db:reset

# Re-run seeds
pnpm db:seed

# Update TypeScript types
pnpm db:types
```

## Performance Considerations

The seed scripts create:

- ~25 users
- ~32 apps (16 internal + 16 external)
- ~100 installations
- ~200 transactions
- ~50 reviews

This provides enough data for testing without slowing down local development.

## Troubleshooting

### Connection Issues

```bash
# Ensure Supabase is running
pnpm db:start

# Check connection
psql -h localhost -p 54322 -U postgres -d postgres
```

### Duplicate Key Errors

```bash
# Reset database before re-seeding
pnpm db:reset
```

### Missing Dependencies

```bash
# Install PostgreSQL client
# Ubuntu/Debian: sudo apt-get install postgresql-client
# Mac: brew install postgresql
```

## Security Notes

- All test accounts use example.com emails
- No real payment credentials are stored
- Test data is for local development only
- Never use these seeds in production

## Next Steps

1. Run `pnpm db:seed` to populate your database
2. Start the dev server: `pnpm dev`
3. Login with test accounts
4. Explore different user journeys
5. Test payment flows
6. Verify multi-lingual content

Happy testing! 🚀
