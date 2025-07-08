# SaSarjan Web - Landing Page Prompts

## Quick Reference
- **Time Estimate**: 5-7 hours total
- **Dependencies**: None ✅
- **Apps Affected**: `/apps/web`
- **Priority**: HIGH - Sprint Week 1

---

## 🎯 **Core Landing Page Enhancement**

### **PROMPT 1: Hero & Visual Impact**
**Time**: 2-3 hours

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

## 🎨 **Interactive Components**

### **PROMPT 2: Engagement Features**
**Time**: 1-2 hours

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

## 🛒 **Bundle System Pages**

### **PROMPT 3: Bundle Landing Pages**
**Time**: 2 hours

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

## 📍 **Location Integration**

### **PROMPT 4: Location Features**
**Time**: 1 hour  
**Dependencies**: ⚠️ Location system implementation

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

## 🎯 **User Dashboard**

### **PROMPT 5: User Experience**
**Time**: 2-3 hours

```
Create a user dashboard for the SaSarjan platform:

1. **Dashboard Layout**:
   - Overview of user's apps and bundles
   - Quick access to most-used features
   - Location-based recommendations
   - Recent activity feed

2. **App Management**:
   - Install/uninstall apps
   - Manage app permissions
   - View usage statistics
   - Rate and review apps

3. **Bundle Management**:
   - View active bundles
   - Upgrade/downgrade options
   - Billing history
   - Renewal settings

4. **Profile Integration**:
   - Connect with existing profile system
   - Sync data across apps
   - Privacy settings
   - Location preferences

Ensure seamless integration with the existing authentication system.
```

---

## ⚡ **Performance & Polish**

### **PROMPT 6: Production Ready**
**Time**: 1 hour

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

## ✅ **Success Criteria Checklist**

### **After PROMPT 1**
- [ ] Hero has prosperity wheel animation
- [ ] Bundle deals section displays 3 packages
- [ ] Impact metrics animate on scroll
- [ ] Mobile responsive design verified
- [ ] Dark mode fully functional

### **After PROMPT 2**
- [ ] ProsperityWheel component interactive
- [ ] LocationMap shows India coverage
- [ ] BundleCalculator calculates savings
- [ ] All components accessible

### **After PROMPT 3**
- [ ] Bundle routes working: /bundles/career-starter
- [ ] Bundle pages display correctly
- [ ] SEO meta tags implemented

### **After PROMPT 4**
- [ ] Location detection works
- [ ] Hero message updates with city
- [ ] Location-based filtering functional

### **After PROMPT 5**
- [ ] User dashboard accessible
- [ ] App management working
- [ ] Bundle management functional
- [ ] Profile integration complete

### **After PROMPT 6**
- [ ] Page loads under 3 seconds
- [ ] Core Web Vitals pass
- [ ] SEO score above 90
- [ ] Accessibility compliant

---

## 🧪 **Testing Commands**

```bash
# Start development server
pnpm dev --filter=@sasarjan/web

# TypeScript check
pnpm typecheck

# Run tests
pnpm test

# Build for production
pnpm build --filter=@sasarjan/web
```

---

## 📁 **Related Files**

### **Core Files**
- `/apps/web/src/app/page.tsx` - Main landing page
- `/apps/web/src/app/layout.tsx` - Root layout
- `/apps/web/src/components/` - Shared components

### **New Files to Create**
- `/apps/web/src/components/prosperity-wheel.tsx`
- `/apps/web/src/components/location-map.tsx`
- `/apps/web/src/components/bundle-calculator.tsx`
- `/apps/web/src/app/bundles/[slug]/page.tsx`
- `/apps/web/src/types/bundles.ts`

### **Reference Files**
- `/apps/web/src/styles/globals.css` - Global styles
- `/apps/web/tailwind.config.js` - Tailwind configuration
- `/packages/ui/` - Shared UI components

---

## 💡 **Implementation Tips**

1. **Start with Visual Impact**: PROMPT 1 gives immediate results
2. **Use Existing Patterns**: Follow current component structure
3. **Test Incrementally**: Verify each section before moving on
4. **Mobile First**: Design for mobile, enhance for desktop
5. **Performance Matters**: Lazy load non-critical content

---

## 🔗 **Dependencies & Integration**

### **Required Packages**
- `framer-motion` - For animations
- `@radix-ui/*` - For accessible components
- `lucide-react` - For icons

### **Integration Points**
- Authentication: `@sasarjan/auth` package
- Database: `@sasarjan/database` package
- UI Components: `@sasarjan/ui` package

---

**🌟 Ready to create an amazing SaSarjan landing experience! 🚀**