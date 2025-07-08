# Decision: Bundle Pricing Model

**ID**: DECISION-003  
**Status**: 🟡 PENDING  
**Type**: Business/Strategic  
**Owner**: CEO  
**Created**: 07-Jul-2025, Monday 08:25 IST  
**Deadline**: 11-Jul-2025, Thursday  
**Impact**: High - Affects revenue model and database schema

## Context

Apps can be sold individually or bundled together (e.g., TalentExcel = Internship + Fellowship apps). We need a pricing strategy that incentivizes bundles while maintaining flexibility.

## Problem Statement

How should we structure bundle pricing, discounts, and location-based data access pricing?

## Pricing Components to Decide

### 1. Bundle Discount Structure

How much discount for buying multiple apps together?

**Option A: Fixed Percentage**

- 2 apps: 15% off
- 3 apps: 25% off
- 4+ apps: 35% off

**Option B: Dynamic Pricing**

- Discount based on app categories
- Higher discount for complementary apps
- Seasonal promotional bundles

**Option C: Subscription Model**

- Monthly: ₹X per app
- Bundle: ₹Y for all apps
- Annual: Additional 20% off

### 2. Location-Based Data Pricing

Users can buy data access for specific geographic regions.

**Option A: Tiered Geographic Pricing**

```
- Village/Block: ₹100/month
- District: ₹500/month
- State: ₹2,000/month
- National: ₹5,000/month
- Global: ₹10,000/month
```

**Option B: Population-Based Pricing**

```
- <100K population: ₹200/month
- 100K-1M population: ₹1,000/month
- 1M-10M population: ₹3,000/month
- 10M+ population: ₹5,000/month
```

**Option C: Feature-Based Access**

```
- View-only: Free
- Contact access: ₹X
- Analytics access: ₹Y
- Export capability: ₹Z
```

### 3. Developer Revenue Share

How much do developers earn from bundle sales?

**Option A: Proportional Share**

- Developer gets same % regardless of bundle
- Example: 70% always goes to developer

**Option B: Incentivized Bundle Participation**

- Individual app: 70% to developer
- In bundle: 80% to developer (SaSarjan takes less)

**Option C: Tiered Revenue Share**

- <₹10K revenue: 80% to developer
- ₹10K-1L: 70% to developer
- ₹1L+: 60% to developer

## Example Scenarios

### Scenario 1: TalentExcel Bundle

- Internship App: ₹299/month individual
- Fellowship App: ₹399/month individual
- Bundle Price: ₹599/month (15% discount)
- Data Access (State): +₹2,000/month

### Scenario 2: Complete Prosperity Bundle

- All 20 apps: ₹2,999/month
- Individual total would be: ₹4,999/month
- Savings: 40%

### Scenario 3: NGO Special Pricing

- Verified NGOs: 50% off all prices
- Government: Custom enterprise pricing
- Educational institutions: 30% off

## Technical Implementation

### Database Schema Requirements

```sql
-- Bundle definition
bundles (
  id, name, slug, description,
  base_price, discount_percent,
  valid_from, valid_until
)

-- Bundle pricing rules
bundle_pricing_rules (
  id, bundle_id, rule_type,
  condition_json, discount_amount,
  priority
)

-- Location data pricing
location_data_pricing (
  id, geographic_level,
  population_range_min, population_range_max,
  monthly_price, annual_price
)
```

## Market Research

- Competing platforms charge ₹500-2000/month
- Indian users prefer bundles with 20-30% discounts
- B2B customers want location-based pricing

## Recommendation

Claude suggests Option A for simplicity in MVP phase, with ability to evolve to Option B/C based on user feedback.

## Decision Required

### 1. Bundle Discount Model:

- [ ] Fixed percentage discounts
- [ ] Dynamic pricing
- [ ] Subscription tiers
- [ ] Other: ******\_\_\_\_******

### 2. Location Data Pricing:

- [ ] Geographic tiers
- [ ] Population-based
- [ ] Feature-based
- [ ] Other: ******\_\_\_\_******

### 3. Developer Revenue:

- [ ] Proportional (same % always)
- [ ] Bundle incentives
- [ ] Tiered structure
- [ ] Other: ******\_\_\_\_******

### 4. Specific Percentages:

- Bundle discount (2 apps): **\_**%
- Bundle discount (3+ apps): **\_**%
- Developer revenue share: **\_**%
- NGO/Education discount: **\_**%

## CEO Decision

**Date**: ******\_\_\_******  
**Bundle Model Choice**: ******\_\_\_******  
**Location Pricing Choice**: ******\_\_\_******  
**Revenue Share Choice**: ******\_\_\_******  
**Specific Percentages**: ******\_\_\_******  
**Additional Notes**: ******\_\_\_******

---

_Once decided, move this file to completed/ folder with decision details_
