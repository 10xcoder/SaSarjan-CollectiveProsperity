# Today's Prompts - July 8, 2025 🚀

**Focus**: SaSarjan Landing Page Enhancement + Critical Security  
**Total Time**: 8-10 hours  
**Sprint**: Week 1, Day 2  
**Priority**: HIGH - Market Launch Preparation

---

## 🎯 **Execution Priority & Schedule**

### **Session 1: Morning (9 AM - 12 PM)**
**PROMPT 1A + 1B Combined** - *Primary Focus*

### **Session 2: Afternoon (1 PM - 3 PM)** 
**PROMPT 2** - *Security Critical*

### **Session 3: Late Afternoon (3 PM - 5 PM)**
**PROMPT 3** - *Infrastructure*

### **Session 4: Evening (Optional)**
**PROMPT 4A or 4B** - *App Fixes*

---

## 🚀 **PROMPT 1A: Core Landing Page Enhancement**

**Time**: 2-3 hours  
**App**: SaSarjan Web (`/apps/web`)  
**Dependencies**: None ✅  
**Can Combine With**: PROMPT 1B

### **Copy-Paste Ready Prompt**
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

### **Success Criteria**
- [ ] Prosperity Wheel animates smoothly on load
- [ ] Bundle deals section displays all 3 packages
- [ ] Impact metrics animate on scroll
- [ ] Mobile responsive (test 320px, 768px, 1024px)
- [ ] Dark mode fully functional
- [ ] No TypeScript errors (`pnpm typecheck`)

---

## 🎨 **PROMPT 1B: Interactive Components**

**Time**: 1-2 hours  
**App**: SaSarjan Web (`/apps/web`)  
**Dependencies**: None ✅  
**Can Combine With**: PROMPT 1A

### **Copy-Paste Ready Prompt**
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

### **Success Criteria**
- [ ] ProsperityWheel component interactive and clickable
- [ ] LocationMap shows India coverage with hover effects
- [ ] BundleCalculator calculates savings in real-time
- [ ] All components accessible (ARIA labels)
- [ ] Smooth animations without performance issues

---

## 🔒 **PROMPT 2: Security Infrastructure**

**Time**: 1-2 hours  
**App**: Admin + All Apps  
**Dependencies**: None ✅  
**Priority**: CRITICAL ⚠️

### **Copy-Paste Ready Prompt**
```
Implement critical security features across the SaSarjan platform:

1. **2FA for Admin Authentication**:
   - Add 2FA setup to admin login flow in /apps/admin
   - Use TOTP (Google Authenticator compatible)
   - Create QR code generation for setup
   - Add backup codes functionality

2. **Security Headers**:
   - Add comprehensive security headers to all Next.js apps
   - Implement CORS policies
   - Add Content Security Policy (CSP)
   - Set up HSTS headers

3. **Rate Limiting**:
   - Implement rate limiting for all API endpoints
   - Use different limits for auth vs general endpoints
   - Add Redis-based rate limiting if available
   - Create rate limit exceeded error pages

4. **Audit Logging**:
   - Create audit log table in Supabase
   - Log all admin actions
   - Track user authentication events
   - Create audit log viewer in admin panel

Focus on the admin app first as it has the most sensitive operations.
```

### **Success Criteria**
- [ ] 2FA working for admin login
- [ ] Security headers visible in browser dev tools
- [ ] Rate limiting prevents abuse (test with repeated requests)
- [ ] Audit logs capture admin actions
- [ ] No new security vulnerabilities introduced

---

## 🔧 **PROMPT 3: Monitoring & Backups**

**Time**: 1-2 hours  
**App**: All Apps + Infrastructure  
**Dependencies**: None ✅  
**Priority**: HIGH

### **Copy-Paste Ready Prompt**
```
Set up essential infrastructure for the SaSarjan platform:

1. **Automated Database Backups**:
   - Create daily backup script for Supabase
   - Set up backup retention policy (30 days)
   - Add backup verification system
   - Create restore procedure documentation

2. **Sentry Error Tracking**:
   - Configure Sentry in all Next.js apps
   - Set up error boundaries in React components
   - Add performance monitoring
   - Create alert rules for critical errors

3. **Health Check Endpoints**:
   - Add /api/health to all apps
   - Check database connectivity
   - Verify external service availability
   - Return status in JSON format

4. **Basic Monitoring Dashboard**:
   - Create simple monitoring page in admin app
   - Show app status, database health, error rates
   - Add basic metrics visualization

Focus on getting basic monitoring in place quickly.
```

### **Success Criteria**
- [ ] Daily backups configured and running
- [ ] Sentry capturing errors from all apps
- [ ] Health check endpoints return 200 OK
- [ ] Monitoring dashboard shows real data
- [ ] Alert system notifies of critical issues

---

## 🔧 **PROMPT 4A: Fix 10xGrowth Landing Pages**

**Time**: 2-3 hours  
**App**: 10xGrowth (`/apps/10x-growth`)  
**Dependencies**: None ✅  
**Priority**: MEDIUM (if time permits)

### **Copy-Paste Ready Prompt**
```
Debug and fix the 10xGrowth landing pages system:

1. **Investigate 404 Errors**:
   - Check routing in /apps/10x-growth/src/app/[slug]/page.tsx
   - Verify CMS integration
   - Test template rendering

2. **Fix Database Connections**:
   - Ensure Supabase client is properly configured
   - Test landing page data fetching
   - Verify environment variables

3. **Complete CMS Integration**:
   - Test the landing page editor
   - Verify template system works
   - Add error handling for missing pages

4. **Deploy Sample Pages**:
   - Create 3 sample landing pages
   - Test all business templates
   - Verify SEO meta tags work

Focus on getting the basic functionality working first.
```

### **Success Criteria**
- [ ] No more 404 errors on landing page routes
- [ ] CMS editor creates and saves pages
- [ ] Sample pages render correctly
- [ ] SEO meta tags populate correctly

---

## 🎓 **PROMPT 4B: TalentExcel Internship Finder**

**Time**: 2-3 hours  
**App**: TalentExcel (`/apps/talentexcel`)  
**Dependencies**: Location system decision ⚠️  
**Priority**: MEDIUM (if time permits)

### **Copy-Paste Ready Prompt**
```
Implement the Local Internship Finder MVP for TalentExcel:

1. **Create Basic Structure**:
   - Set up /apps/talentexcel/src/app/internships page
   - Create internship listing component
   - Add search and filter interface

2. **Location-Based Search**:
   - Integrate with location system (when ready)
   - Add city/state filtering
   - Implement radius-based search

3. **Internship Listings**:
   - Create mock internship data
   - Build internship card component
   - Add application tracking basics

4. **Student Dashboard**:
   - Create simple profile creation
   - Add application status tracking
   - Basic resume upload functionality

Follow the detailed guide in /plan/teams/developers/talentexcel/starter-app-guide.md
```

### **Success Criteria**
- [ ] Internship listing page functional
- [ ] Search and filters work
- [ ] Students can view internship details
- [ ] Basic application flow working
- [ ] Mobile responsive design

---

## 📊 **Daily Success Metrics**

### **Must Complete Today**
- [ ] SaSarjan landing page visually transformed
- [ ] Interactive components working
- [ ] Basic 2FA implemented for admin
- [ ] Security headers added to all apps

### **Nice to Have**
- [ ] Rate limiting implemented
- [ ] Sentry monitoring configured
- [ ] 10xGrowth landing pages fixed
- [ ] Automated backups running

### **Quality Gates**
- [ ] All code passes TypeScript check
- [ ] No lint errors
- [ ] Mobile responsive (tested on 3 screen sizes)
- [ ] Dark mode works correctly

---

## 🔧 **Development Setup**

### **Before Starting**
```bash
cd /home/happy/projects/SaSarjan-AppStore

# Start development server
pnpm dev --filter=@sasarjan/web

# Optional: Start all apps
pnpm dev
```

### **Quality Checks**
```bash
# Run after each prompt
pnpm typecheck
pnpm lint

# Test specific app
pnpm dev --filter=@sasarjan/admin
```

### **Commit Strategy**
```bash
# After each major component
git add .
git commit -m "feat: add prosperity wheel component to landing page"

# After prompt completion
git commit -m "feat: complete landing page enhancement - PROMPT 1A"
```

---

## 🚨 **Important Notes**

1. **Security First**: If time is limited, prioritize PROMPT 2 over visual features
2. **Commit Frequently**: Small commits make debugging easier
3. **Test Mobile**: Use browser dev tools responsive mode
4. **Document Decisions**: Add comments for complex logic
5. **Update Todos**: Mark tasks as `in_progress` → `completed`

---

## 🔗 **Quick Reference**

### **Key Files**
- Landing Page: `/apps/web/src/app/page.tsx`
- New Components: `/apps/web/src/components/`
- Admin Security: `/apps/admin/src/app/auth/`
- Health Checks: `/apps/*/src/app/api/health/`

### **Useful Commands**
- Check todos: `cat plan/claude-todos/active-todos.json`
- Session sync: `cat plan/claude-todos/session-sync.md`
- Terminal ID: `cat .current-terminal-id`

---

**🌟 Ready to transform SaSarjan into a market-ready platform! 🚀**

*Estimated completion: 8-10 hours of focused development*