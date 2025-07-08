# Decision: Map Provider Selection

**ID**: DECISION-002  
**Status**: 🔴 PENDING  
**Type**: Technical/Financial  
**Owner**: CEO  
**Created**: 07-Jul-2025, Monday 08:25 IST  
**Deadline**: 09-Jul-2025, Tuesday EOD  
**Impact**: Medium - Affects frontend implementation and monthly costs

## Context

We need maps for location selection, visualization, and potentially delivery tracking across all apps. This decision affects both development complexity and ongoing operational costs.

## Problem Statement

Should we use a commercial map provider (Mapbox) or open-source solution (OpenStreetMap + MapLibre)?

## Options Analysis

### Option A: Mapbox

**Approach**: Use Mapbox GL JS with their hosted tile services

**Pros**:

- Excellent documentation and support
- Beautiful default styles
- Integrated geocoding API
- Easy setup (1 day)
- Mobile SDKs available
- Reliable global infrastructure

**Cons**:

- Monthly costs ($200+ at scale)
- Vendor lock-in
- Usage limits on free tier
- Data stored in US

**Costs**:

- Free: 50,000 map loads/month
- Scale: ~$200-500/month for 500k users
- Enterprise: Custom pricing

**Implementation**:

```javascript
// Simple one-line setup
mapboxgl.accessToken = 'your-token';
const map = new mapboxgl.Map({...});
```

### Option B: OpenStreetMap + MapLibre (Recommended by Claude)

**Approach**: Self-host or use free OSM tiles with MapLibre GL JS

**Pros**:

- Completely free
- No usage limits
- Full data control
- Active open-source community
- Can use multiple tile providers
- Better for privacy-conscious users

**Cons**:

- More setup effort (3-4 days)
- Need separate geocoding solution
- Less polished default styles
- Self-manage infrastructure or CDN

**Implementation Options**:

1. **Protomaps**: One-time $119 for India tiles
2. **MapTiler**: Free tier with 100k requests/month
3. **Self-host**: Own tile server (complex)

**Code Example**:

```javascript
// MapLibre with free tiles
const map = new maplibregl.Map({
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [77.5946, 12.9716], // Bangalore
});
```

## Hybrid Approach (Additional Option)

Start with Mapbox for rapid development, plan migration to OSM after launch:

- Week 1-4: Use Mapbox (fast development)
- Week 5-8: Build OSM infrastructure
- Week 9+: Gradual migration

## Feature Comparison

| Feature      | Mapbox        | OpenStreetMap + MapLibre |
| ------------ | ------------- | ------------------------ |
| Setup Time   | 1 day         | 3-4 days                 |
| Monthly Cost | $200-500      | $0-50 (CDN only)         |
| Geocoding    | Included      | Separate (Pelias)        |
| Styles       | 10+ beautiful | 3-5 basic                |
| Support      | Professional  | Community                |
| Offline Maps | Limited       | Full support             |
| Data Control | Limited       | Complete                 |

## Recommendation

Claude recommends Option B (OpenStreetMap) for long-term cost savings and data sovereignty, but acknowledges Option A (Mapbox) enables faster initial development.

## Decision Required

Please choose:

- [ ] Option A: Mapbox (commercial, faster)
- [ ] Option B: OpenStreetMap + MapLibre (free, more setup)
- [ ] Hybrid: Start with Mapbox, migrate later
- [ ] Alternative: ******\_\_\_\_******

## CEO Decision

**Date**: ******\_\_\_******  
**Choice**: ******\_\_\_******  
**Rationale**: ******\_\_\_******  
**Budget Approval**: ******\_\_\_******  
**Additional Instructions**: ******\_\_\_******

---

_Once decided, move this file to completed/ folder with decision details_
