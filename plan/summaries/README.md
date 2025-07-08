# 📚 SaSarjan Summaries Hub

**Purpose**: Persistent storage for important prompts, decisions, and summaries across sessions  
**Last Updated**: 07-Jul-2025, Monday 08:40 IST

## 🎯 Quick Access

### 📅 Today's Summary

- [Week 1 Sprint Plan](sprint/week1-sprint-plan.md) - 3-team assignments and deliverables
- [Pending Decisions](decisions/pending-decisions-07-jul.md) - Location data, map provider, pricing

### 🏃 Active Sprint

- **Week**: 1 (07-Jul to 13-Jul)
- **Teams**: Claude AI, Junior Dev, CEO
- **Focus**: Location system, TalentExcel, sasarjan.com launch

---

## 📁 Directory Structure

### `/daily/` - Daily Summaries

Captures important discussions, decisions, and progress from each day

- Format: `YYYY-MM-DD-summary.md`
- Auto-created at end of each session
- Includes: Key prompts, decisions made, blockers, next steps

### `/sprint/` - Sprint Planning & Reviews

Sprint-level documentation that persists across sessions

- Current sprint plan
- Team assignments
- Deliverables tracking
- Sprint retrospectives

### `/decisions/` - Decision Archives

Permanent record of all decisions with context

- CEO decisions with rationale
- Technical choices
- Strategic directions
- Implementation details

---

## 🤖 Automatic Summary System

### How It Works

1. **Important Prompt Detection**: Claude identifies strategic/planning prompts
2. **Summary Generation**: Creates structured summaries with context
3. **Categorization**: Files summaries in appropriate folders
4. **Cross-Referencing**: Links to session logs and decision docs
5. **Quick Retrieval**: Easy access in future sessions

### What Gets Saved Automatically

- ✅ Sprint planning discussions
- ✅ Team assignments and responsibilities
- ✅ Architecture decisions
- ✅ CEO strategic decisions
- ✅ Daily progress summaries
- ✅ Blocker resolutions
- ✅ Important technical discussions

### Summary Templates

- [Daily Summary Template](templates/daily-summary-template.md)
- [Sprint Summary Template](templates/sprint-summary-template.md)
- [Decision Summary Template](templates/decision-summary-template.md)

---

## 🔍 Finding Information

### By Date

Check `/daily/` folder for specific date summaries

### By Sprint

Check `/sprint/` folder for sprint-level documentation

### By Topic

Use grep to search across all summaries:

```bash
grep -r "location system" /plan/summaries/
```

### Recent Summaries

- [07-Jul-2025 Morning](daily/2025-07-07-summary.md) - Sprint planning, decision system
- [Week 1 Sprint Plan](sprint/week1-sprint-plan.md) - Full sprint breakdown

---

## 🔗 Integration with Other Systems

### Session Logs

Full details in `/plan/logs/claude-sessions/`
Summaries link to relevant session logs

### Decision Tracking

Decisions archived here after completion
Links to `/plan/decisions/` for active decisions

### Sprint Management

Summaries feed into `/plan/strategic/sprints.md`
Used for sprint reviews and planning

---

## 📝 Manual Summary Creation

If you need to create a summary manually:

1. Use appropriate template from `/templates/`
2. Save in correct folder with proper naming
3. Update this README with link
4. Cross-reference in session logs
