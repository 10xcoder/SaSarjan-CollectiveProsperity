# Daily Morning Routine - SaSarjan App Store

**Purpose**: Structured daily kickoff routine for all teams  
**Time**: 9:00 AM IST (Every day)  
**Duration**: 30 minutes  
**Last Updated**: 06-Jul-2025, Sunday 11:35 IST

## 🌅 Daily Morning Checklist

### 1. Sprint Status Check (5 minutes)

- [ ] Review current sprint progress in `plan/strategic/sprints.md`
- [ ] Check sprint day number (e.g., Day 3/7 of Week X)
- [ ] Identify sprint goals for today
- [ ] Review yesterday's completions

### 2. Blocker Assessment (5 minutes)

- [ ] Check for unresolved blockers from yesterday
- [ ] Identify new blockers requiring escalation
- [ ] Review dependency status (credentials, reviews, deployments)
- [ ] Flag critical issues for immediate attention

### 3. Task Prioritization (10 minutes)

Use the following distribution:

#### 🤖 Claude AI Team (7-10 tasks)

- Code generation and implementation
- Documentation updates
- Test creation and automation
- Component development
- Bug fixes and optimizations
- Module template creation
- API endpoint development

#### 👥 Central Team (5 tasks)

- Architecture decisions
- Security reviews
- Code review and approval
- Production deployments
- Blocker resolution

#### 🌍 Developer Team (5 tasks per developer)

- Feature implementation
- Testing and QA
- Documentation
- Peer code reviews
- Integration work

### 4. Generate Task Lists (5 minutes)

Use Claude Code prompts from `daily-prompt-templates.md` to:

- Generate specific tasks for each team
- Align tasks with current sprint goals
- Ensure dependency order is maintained

### 5. Communication Setup (5 minutes)

- [ ] Post daily tasks in team channels
- [ ] Schedule any necessary sync meetings
- [ ] Update task tracker with assignments
- [ ] Notify teams of any critical dependencies

## 📊 Task Prioritization Framework

### Priority Levels

1. **🔴 Critical**: Blockers, production issues, sprint commitments
2. **🟡 High**: Core features, reviews, integrations
3. **🟢 Medium**: Enhancements, documentation, testing
4. **⚪ Low**: Nice-to-have, future planning, optimizations

### Task Selection Criteria

- **Sprint Alignment**: Does it support current sprint goals?
- **Dependencies**: Are there tasks waiting on this?
- **Impact**: How many users/features does it affect?
- **Effort**: Can it be completed today?
- **Team Balance**: Is work distributed effectively?

## 🎯 Daily Focus by Sprint Phase

### Week Start (Monday-Tuesday)

- Foundation work and setup
- Core module development
- Architecture decisions
- Environment configuration

### Mid-Week (Wednesday-Thursday)

- Feature implementation
- Integration work
- Testing begins
- Documentation updates

### Week End (Friday-Sunday)

- Testing and bug fixes
- Code reviews
- Documentation completion
- Sprint preparation

## 📋 Quick Reference Commands

### Check Sprint Status

```bash
# View current sprint progress
cat plan/strategic/sprints.md | grep -A 20 "Week [0-9]"

# Check today's date and sprint day
date +"%d-%b-%Y, %A"
```

### Generate Task Lists

```bash
# Use Claude Code with daily prompts
# Copy prompts from plan/teams/claude-ai/daily-prompt-templates.md
```

### Update Progress

```bash
# Navigate to sprint tracking
cd plan/strategic
# Edit sprints.md with today's progress
```

## 🔄 End of Day Routine

### Before 9 PM IST

1. Update task completion status
2. Document any blockers encountered
3. Prepare context for next day
4. Update sprint progress in `sprints.md`
5. Post EOD summary in team channels

## 💡 Tips for Effective Mornings

1. **Start Sharp**: Begin exactly at 9 AM IST
2. **Be Specific**: Create clear, actionable tasks
3. **Think Dependencies**: Order tasks by dependencies
4. **Communicate Early**: Flag blockers immediately
5. **Stay Flexible**: Adjust for urgent issues

## 🚨 Escalation Triggers

Immediately escalate if:

- Production system is down
- Security vulnerability discovered
- Sprint goals at risk
- Team member blocked > 4 hours
- Critical dependency unavailable

## 📝 Daily Task Tracker

Use the template in `daily-task-tracker-template.md` to track:

- Task assignments by team
- Progress throughout the day
- Blockers and resolutions
- End of day status

---

**Remember**: Consistency in morning routines leads to predictable delivery and better team coordination. Every successful day starts with a clear plan!
