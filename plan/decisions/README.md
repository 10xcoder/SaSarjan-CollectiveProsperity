# 🎯 SaSarjan Decision Hub

**Last Updated**: 07-Jul-2025, Monday 08:20 IST  
**Decision Response Time**: Same day for blockers, 24-48 hours for strategic decisions

## 🚨 Critical Decisions for Week 1 (Immediate Response Needed)

### 1. Location Data Strategy

**Status**: 🔴 PENDING - Blocking Day 1 Development  
**Owner**: CEO  
**Deadline**: Today (07-Jul-2025) by 12:00 PM IST  
**Impact**: Database design and seed data approach

**Options**:

- **Option A**: Import all 600k Indian villages (2GB data, complete coverage)
- **Option B**: Import 50k+ population areas only (200MB, gradual growth)

**Decision File**: [pending/DECISION-001-location-data.md](pending/DECISION-001-location-data.md)

### 2. Map Provider Selection

**Status**: 🔴 PENDING - Blocking Day 3 Development  
**Owner**: CEO  
**Deadline**: 09-Jul-2025 by EOD  
**Impact**: Frontend implementation and monthly costs

**Options**:

- **Option A**: Mapbox (easier, $200/month at scale)
- **Option B**: OpenStreetMap + MapLibre (free, more setup)

**Decision File**: [pending/DECISION-002-map-provider.md](pending/DECISION-002-map-provider.md)

### 3. Bundle Pricing Model

**Status**: 🟡 PENDING - Needed by Day 4  
**Owner**: CEO  
**Deadline**: 11-Jul-2025  
**Impact**: Revenue model and database schema

**Decision File**: [pending/DECISION-003-bundle-pricing.md](pending/DECISION-003-bundle-pricing.md)

---

## 📋 How to Communicate Decisions

### Quick Decision Process (for CEO)

1. **Review**: Read the decision file in `pending/` folder
2. **Decide**: Choose an option or propose alternative
3. **Communicate**: Use one of these methods:
   - **Fastest**: Tell Claude directly in chat
   - **Documented**: Edit the decision file and change status
   - **Batch**: Update multiple decisions in dashboard.md

### Decision Communication Template

```
DECISION: Location Data Strategy
CHOICE: Option B (50k+ cities only)
RATIONALE: Start lean, grow with user contributions
ADDITIONAL NOTES: Prepare import scripts for future village data
```

### When to Make Decisions

| Decision Type  | When to Decide       | Communication Method     |
| -------------- | -------------------- | ------------------------ |
| 🔴 Blocker     | Same day             | Direct chat with Claude  |
| 🟡 Strategic   | 24-48 hours          | Update decision file     |
| 🟢 Operational | Within sprint        | Batch update in planning |
| ⚪ Future      | Next sprint planning | Document in roadmap      |

---

## 📊 Decision Dashboard

### Pending Decisions (3)

1. [Location Data Strategy](pending/DECISION-001-location-data.md) - 🔴 Due TODAY
2. [Map Provider](pending/DECISION-002-map-provider.md) - 🔴 Due Tomorrow
3. [Bundle Pricing](pending/DECISION-003-bundle-pricing.md) - 🟡 Due Thursday

### Recently Completed (0)

- No decisions completed yet in Week 1

### Upcoming Decision Points

- **Week 2**: Payment gateway selection (Razorpay vs Stripe)
- **Week 3**: Deployment strategy (Vercel vs self-hosted)
- **Week 4**: Launch sequence (soft launch vs public)

---

## 📁 Decision Categories

### 🏗️ [Architectural Decisions](../../docs/architecture/decision-log.md)

Technical design decisions using ADR format

### 📈 Strategic Decisions

Business and product decisions affecting roadmap

### ⚙️ Operational Decisions

Process, workflow, and tooling decisions

### 👥 Team Decisions

Organizational structure and responsibilities

---

## 🔄 Integration with Workflow

### Daily Morning Routine

1. Check pending decisions in this hub
2. Review blockers needing immediate attention
3. Communicate decisions before development starts

### Sprint Planning

- Review all pending decisions
- Identify upcoming decision points
- Assign decision owners and deadlines

### Session Logs

- Claude will note when blocked by decisions
- Decisions made during sessions are logged
- End-of-session summary includes pending decisions

---

## 📝 Quick Links

- [Decision Templates](templates/) - Use these for new decisions
- [Completed Decisions](completed/) - Historical record
- [Architecture Decision Log](../../docs/architecture/decision-log.md) - Technical ADRs
- [Sprint Management](../strategic/sprints.md) - Current blockers
