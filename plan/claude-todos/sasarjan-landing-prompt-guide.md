# SaSarjan Landing Page - Prompt Guide & Execution Plan

**Created**: 07-Jul-2025, Monday 23:30 IST  
**Purpose**: Structured prompts for implementing SaSarjan landing page  
**Estimated Total Time**: 8-10 hours

## 📋 Prompt Strategy

Based on Claude best practices:

- **Combine related UI components** in single prompts (better context)
- **Separate backend/data tasks** from frontend tasks
- **Group by feature area** not by file type
- **Include clear success criteria** in each prompt

## 🎯 Master Prompts for SaSarjan Landing Page

---

### **PROMPT 1: Core Landing Page Enhancement**

**Time Estimate**: 2-3 hours  
**Dependencies**: None  
**Can be combined with**: PROMPT 2

```
Please enhance the SaSarjan landing page at /apps/web/src/app/page.tsx with the following:

1. **Hero Section Upgrade**:
   - Add an animated "Prosperity Wheel" component showing 8 prosperity categories
   - Include location-aware messaging: "Discover X apps near [City Name]"
   - Add a banner announcing bundle deals: "Save 30% with our Career Starter Bundle"
   - Make the hero more compelling with gradient backgrounds using prosperity colors

2. **Enhanced Micro-Apps Showcase**:
   - Add bundle pricing badges (e.g., "Part of Career Bundle - Save 30%")
   - Show location availability: "Available in Mumbai, Delhi, Bangalore"
   - Add countdown timers for "Launching Soon" status
   - Implement smooth hover effects showing 3 key features per app

3. **New Bundle Deals Section**:
   - Create a section showcasing 3 bundles:
     * Career Starter: TalentExcel + 10xGrowth (₹99/month, save 30%)
     * Community Hero: SevaPremi + Impact Tracker (₹79/month, save 25%)
     * Complete Prosperity: All 3 apps (₹149/month, save 40%)
   - Show what's included in each bundle
   - Add "Most Popular" badge to Complete Prosperity

4. **Impact Metrics Section**:
   - Create animated counters for:
     * Total Users: 50,000+
     * Active Apps: 24
     * Cities Covered: 127
     * Lives Impacted: 2.5M+
   - Use Framer Motion for number animations

Create reusable components where appropriate. Ensure mobile responsiveness and dark mode support.
```

---

### **PROMPT 2: Interactive Components**

**Time Estimate**: 1-2 hours  
**Dependencies**: None  
**Can run parallel to**: PROMPT 3

```
Create these interactive components for the SaSarjan landing page:

1. **ProsperityWheel Component** (/components/prosperity-wheel.tsx):
   - Interactive circular visualization with 8 prosperity categories
   - Each segment clickable, showing category description on hover
   - Smooth rotation animation on load
   - Colors matching the prosperity theme from existing code
   - Props: size, interactive (boolean), selectedCategory

2. **LocationMap Component** (/components/location-map.tsx):
   - India map showing coverage with colored dots
   - Hover to see city names and available apps count
   - Use SVG for performance
   - Mobile-friendly with pinch-zoom

3. **BundleCalculator Component** (/components/bundle-calculator.tsx):
   - Interactive calculator showing savings
   - Checkbox list of apps
   - Real-time price calculation
   - "You save X%" badge
   - Smooth animations on selection changes

Use TypeScript, follow existing component patterns, and ensure accessibility.
```

---

### **PROMPT 3: Bundle System Implementation**

**Time Estimate**: 2 hours  
**Dependencies**: None  
**Can run parallel to**: PROMPT 2

```
Implement the bundle landing page system:

1. **Dynamic Bundle Routes**:
   - Create /app/bundles/[slug]/page.tsx
   - Support slugs: career-starter, community-hero, complete-prosperity
   - Fetch bundle data based on slug

2. **Bundle Page Template**:
   - Hero with bundle name and savings percentage
   - Apps included with feature comparison table
   - Location availability checker
   - "Get This Bundle" CTA with pricing
   - Customer testimonials specific to bundle
   - FAQ section

3. **Bundle Data Structure**:
   - Create types/bundles.ts with Bundle interface
   - Include: id, slug, name, description, apps[], pricing, savings
   - Create mock data for now (will connect to Supabase later)

4. **Shared Components**:
   - BundleCard component for listing page
   - AppComparisonTable component
   - LocationChecker component

Ensure SEO optimization with proper meta tags for each bundle page.
```

---

### **PROMPT 4: Location Features**

**Time Estimate**: 1 hour  
**Dependencies**: Location system implementation  
**Can be combined with**: PROMPT 5

```
Integrate location awareness into the SaSarjan landing page:

1. **Auto-detect user location** using browser geolocation API
2. **Update hero message** with detected city
3. **Filter apps/bundles** by location availability
4. **Create location landing pages** at /locations/[country]/[state]/[city]
5. **Add location selector** dropdown in header

Handle errors gracefully and provide fallback to manual selection.
```

---

### **PROMPT 5: Performance & Polish**

**Time Estimate**: 1 hour  
**Dependencies**: PROMPTS 1-3 completed  
**Final step**: Yes

```
Optimize the SaSarjan landing page for production:

1. **Performance**:
   - Implement lazy loading for below-fold sections
   - Optimize images with next/image
   - Add loading skeletons for dynamic content
   - Ensure Core Web Vitals compliance

2. **SEO & Meta**:
   - Add comprehensive meta tags
   - Implement structured data for app listings
   - Create dynamic OG images for social sharing

3. **Analytics Integration**:
   - Add event tracking for key interactions
   - Track bundle interest and app activations
   - Implement A/B testing framework

4. **Accessibility**:
   - Ensure WCAG 2.1 AA compliance
   - Add proper ARIA labels
   - Test with screen readers
```

---

## 🔄 Execution Order & Grouping

### **Optimal Execution Strategy**:

1. **Start with PROMPT 1** - Gets core landing page enhanced quickly (2-3 hours)
2. **Then PROMPT 2** - Adds interactivity and engagement (1-2 hours)
3. **Parallel: PROMPT 3** - Can be done by Terminal 2 simultaneously (2 hours)
4. **Hold PROMPT 4** - Until location system is ready
5. **End with PROMPT 5** - Final polish before launch (1 hour)

### **Combination Options**:

- **Option A**: Combine PROMPTS 1 & 2 for comprehensive frontend work
- **Option B**: Combine PROMPTS 4 & 5 for final integration and optimization
- **Option C**: Execute each prompt separately for maximum control

### **Multi-Terminal Strategy**:

- **Terminal 1**: Execute PROMPTS 1 & 2
- **Terminal 2**: Execute PROMPT 3 (bundle system)
- **Either Terminal**: Execute PROMPTS 4 & 5

## 📊 Success Criteria Checklist

After all prompts completed:

- [ ] Prosperity wheel animates smoothly
- [ ] Bundle savings clearly displayed
- [ ] Location detection works (when ready)
- [ ] All 3 micro-apps showcased
- [ ] Bundle landing pages functional
- [ ] Mobile responsive design verified
- [ ] Page loads under 2 seconds
- [ ] Dark mode fully supported
- [ ] Accessibility compliant
- [ ] SEO optimized

## 💡 Tips for Execution

1. **Before Starting**: Ensure you're in Terminal 1 and have latest code
2. **Use Existing Patterns**: Reference existing components for consistency
3. **Test Incrementally**: Verify each section works before moving on
4. **Commit Often**: Make small, focused commits for easy rollback
5. **Document Decisions**: Note any design choices in comments

## 🚀 Quick Start Commands

```bash
# Start development server
cd /home/happy/projects/SaSarjan-AppStore
pnpm dev

# Run only web app
pnpm dev --filter=@sasarjan/web

# Check TypeScript
pnpm typecheck

# Format code
pnpm format
```

---

**Next Steps**: When ready to execute, start with PROMPT 1 or combine PROMPTS 1 & 2 for faster implementation.
