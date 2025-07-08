# SaSarjan Prompt Library 🚀

**The Complete Claude Code Prompt Collection**  
*Organized for Maximum Developer Velocity*

---

## 📚 **Quick Navigation**

### **🔥 Today's Prompts**
- [July 8, 2025 - SaSarjan Landing](./daily/2025-07-08-sasarjan-landing.md) - *5-7 hours of work*
- [Morning Routine Template](./daily/morning-routine-template.md)
- [Daily Execution Guide](./daily/task-execution-guide.md)

### **📱 App-Specific Prompts**
- [**SaSarjan Web**](./apps/sasarjan-web/) - Main portal & landing pages
- [**Admin Dashboard**](./apps/admin/) - Security, analytics, user management  
- [**10xGrowth**](./apps/10xgrowth/) - Marketplace & landing pages
- [**TalentExcel**](./apps/talentexcel/) - Internships & career platform
- [**SevaPremi**](./apps/sevapremi/) - Community service platform

### **🏗️ Infrastructure Prompts**
- [**Security**](./infrastructure/security.md) - 2FA, headers, rate limiting
- [**Monitoring**](./infrastructure/monitoring.md) - Sentry, health checks
- [**Deployment**](./infrastructure/deployment.md) - CI/CD, production setup
- [**Database**](./infrastructure/database.md) - Backups, migrations

### **🎯 Feature Prompts**
- [**Location System**](./features/location-system.md) - PostGIS & 9-level hierarchy
- [**Bundle Pricing**](./features/bundle-pricing.md) - Cross-app bundle system
- [**Authentication**](./features/authentication.md) - Unified auth system
- [**Testing**](./features/testing.md) - E2E, unit, integration tests

### **📝 Templates**
- [**Component Creation**](./templates/component-creation.md)
- [**API Endpoint**](./templates/api-endpoint.md)
- [**Page Creation**](./templates/page-creation.md)
- [**Bug Fix**](./templates/bug-fix.md)

---

## 🚀 **Quick Start Guide**

### **1. Morning Routine (5 minutes)**
```bash
# Check today's priorities
cat docs/prompts/daily/$(date +'%Y-%m-%d')-*.md

# Review sprint todos
cat plan/claude-todos/active-todos.json

# Start development environment
pnpm dev
```

### **2. Choose Your Prompt**
- **High Impact**: Start with `apps/sasarjan-web/landing-page.md`
- **Security Focus**: Use `infrastructure/security.md`
- **Bug Fixing**: Reference `templates/bug-fix.md`

### **3. Execute & Track**
```bash
# Copy prompt → Paste to Claude Code → Execute
# Update todos: mark in_progress → completed
# Commit frequently with clear messages
```

---

## 📊 **Prompt Categories**

### **🔴 Critical Priority (Do Today)**
| Prompt | Time | App | Status |
|--------|------|-----|--------|
| [SaSarjan Landing](./apps/sasarjan-web/landing-page.md) | 3h | Web | ✅ Ready |
| [Admin Security](./infrastructure/security.md) | 2h | Admin | ✅ Ready |
| [Monitoring Setup](./infrastructure/monitoring.md) | 1h | All | ✅ Ready |

### **🟡 High Priority (This Week)**
| Prompt | Time | App | Dependencies |
|--------|------|-----|--------------|
| [10xGrowth Fix](./apps/10xgrowth/landing-pages-fix.md) | 2h | 10xGrowth | None |
| [TalentExcel MVP](./apps/talentexcel/internship-finder.md) | 3h | TalentExcel | Location decision |
| [Bundle System](./features/bundle-pricing.md) | 2h | All | Pricing decision |

### **🟢 Medium Priority (Next Sprint)**
| Prompt | Time | App | Dependencies |
|--------|------|-----|--------------|
| [SevaPremi Foundation](./apps/sevapremi/foundation.md) | 4h | SevaPremi | Team bandwidth |
| [Testing Coverage](./features/testing.md) | 3h | All | Core features complete |

---

## 🎯 **Best Practices**

### **Before Executing Any Prompt**
1. ✅ **Check Dependencies** - Ensure prerequisites are met
2. ✅ **Review Time Estimate** - Plan your session accordingly
3. ✅ **Start Dev Server** - Have the right environment running
4. ✅ **Update Todos** - Mark task as `in_progress`

### **During Execution**
1. 🔄 **Commit Frequently** - Small, focused commits
2. 🧪 **Test Incrementally** - Verify each step works
3. 📱 **Check Mobile** - Use responsive design mode
4. 🌙 **Verify Dark Mode** - Ensure theme consistency

### **After Completion**
1. ✅ **Mark Todo Complete** - Update status to `completed`
2. 🔍 **Run Quality Checks** - `pnpm typecheck && pnpm lint`
3. 📝 **Document Changes** - Add comments for complex logic
4. 🚀 **Test User Flow** - End-to-end verification

---

## 🔧 **Development Commands**

### **Start Development**
```bash
# All apps
pnpm dev

# Specific app
pnpm dev --filter=@sasarjan/web
pnpm dev --filter=@sasarjan/admin
pnpm dev --filter=@sasarjan/10xgrowth
pnpm dev --filter=@sasarjan/talentexcel
```

### **Quality Checks**
```bash
# TypeScript check
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test
```

### **Database Operations**
```bash
# Reset database
pnpm db:reset

# Apply migrations
pnpm db:migrate

# Load sample data
pnpm db:seed
```

---

## 📈 **Metrics & Tracking**

### **Velocity Tracking**
- **Target**: 8-10 prompts completed per day
- **Average Time**: 1-3 hours per prompt
- **Success Rate**: 95% completion (measured daily)

### **Quality Metrics**
- **Zero TypeScript Errors**: Must pass `pnpm typecheck`
- **Zero Lint Issues**: Must pass `pnpm lint`
- **Mobile Responsive**: Test on 320px, 768px, 1024px
- **Dark Mode Support**: All components work in both themes

---

## 🤝 **Team Collaboration**

### **Multi-Terminal Coordination**
- **Check Sync File**: `cat plan/claude-todos/session-sync.md`
- **Update Terminal Status**: Mark active tasks
- **Avoid Conflicts**: Coordinate on shared files

### **Prompt Sharing**
- **Create New Prompts**: Use templates as starting point
- **Share Successful Patterns**: Document what works well
- **Update Time Estimates**: Based on actual execution time

---

## 🔄 **System Integration**

### **Links to Other Systems**
- **Todo Management**: `/plan/claude-todos/active-todos.json`
- **Sprint Planning**: `/plan/strategic/sprints.md`
- **Daily Summaries**: `/plan/summaries/daily/`
- **Technical Decisions**: `/plan/decisions/pending/`

### **Automation Opportunities**
- **Auto-generate** daily prompt files from sprint plans
- **Track completion rates** across different prompt types
- **Suggest optimal execution order** based on dependencies

---

## 📞 **Support & Feedback**

### **If You Get Stuck**
1. **Check Dependencies**: Review prompt prerequisites
2. **Consult Templates**: Use general patterns from `/templates`
3. **Review Similar Prompts**: Look at completed examples
4. **Update Prompt**: Document any changes needed

### **Improving This Library**
- **Add New Prompts**: Follow the template structure
- **Update Time Estimates**: Based on real execution time
- **Share Success Stories**: What worked particularly well
- **Report Issues**: Prompts that need improvement

---

**🌟 Ready to ship amazing features with structured, tested prompts! 🚀**

*Last Updated: July 8, 2025 - Morning Sprint Planning*