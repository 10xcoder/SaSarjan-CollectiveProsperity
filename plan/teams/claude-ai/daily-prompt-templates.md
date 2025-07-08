# Claude Code Daily Prompt Templates

**Purpose**: Pre-written prompts for daily morning routine with Claude Code  
**Usage**: Copy and paste these prompts each morning at 9 AM IST  
**Last Updated**: 06-Jul-2025, Sunday 11:35 IST

## 🌅 Morning Routine Prompts

### 1. Daily Sprint Status & Task Generation

```
Today is [Day X] of Week [Y] sprint ([DATE]). Please:

1. Review the current sprint status from plan/strategic/sprints.md
2. Check yesterday's progress and any incomplete tasks
3. Generate today's top tasks for all 3 teams:
   - Claude AI Team: 7-10 tasks
   - Central Team: 5 tasks
   - Developer Team: 5 tasks per developer

Focus on [CURRENT_SPRINT_GOAL] and ensure tasks align with our sprint objectives.
```

### 2. Blocker Resolution Check

```
Please check for blockers from yesterday and today:

1. Review sprint management for any 🚨 BLOCKER tags
2. Check which tasks are waiting on:
   - Credentials from Central Team
   - Architecture decisions
   - Code reviews
   - Production deployments
3. Propose resolution strategies for each blocker
4. Identify tasks that can proceed despite blockers
```

### 3. Week Start Planning (Monday)

```
It's Monday, start of Week [X] sprint. Please:

1. Review the sprint goals for this week
2. Break down the week's objectives into daily milestones
3. Generate comprehensive task lists for Day 1:
   - Claude AI: Focus on foundation/setup tasks (7-10 tasks)
   - Central Team: Architecture and environment setup (5 tasks)
   - Developers: Initial feature scaffolding (5 tasks each)
4. Identify all dependencies and potential blockers
5. Create a week-long task progression plan
```

### 4. Mid-Week Integration Check (Wednesday)

```
It's Wednesday, Day 3 of Week [X] sprint. Please:

1. Assess integration readiness across all apps
2. Generate integration-focused tasks:
   - Claude AI: Cross-app module testing, API integration (8 tasks)
   - Central Team: Integration reviews, deployment prep (5 tasks)
   - Developers: Feature integration, testing (5 tasks each)
3. Check for any integration blockers
4. Prepare for Saturday's full integration testing
```

### 5. End of Week Push (Friday-Sunday)

```
It's [Friday/Saturday/Sunday], final days of Week [X] sprint. Please:

1. List all incomplete sprint commitments
2. Generate completion-focused tasks:
   - Claude AI: Bug fixes, test automation, documentation (10 tasks)
   - Central Team: Final reviews, deployment preparation (5 tasks)
   - Developers: Testing, documentation, cleanup (5 tasks each)
3. Identify must-complete vs nice-to-have items
4. Plan for sprint review preparation
```

## 🎯 Feature-Specific Prompts

### 6. Multi-App Development Tasks

```
For [TalentExcel/SevaPremi/10xGrowth] development today, please:

1. Review app-specific requirements in teams/developers/[app-name]/
2. Generate app-focused tasks:
   - Core features needed today
   - Integration points with shared modules
   - App-specific testing requirements
3. Ensure consistency across all 3 apps
4. Identify shared components to develop
```

### 7. Module Development Tasks

```
For module development today, please:

1. Review module requirements and dependencies
2. Generate module tasks for Claude AI:
   - New module creation from templates
   - Module testing and documentation
   - NPM package preparation
3. Central Team tasks:
   - Module architecture review
   - Security audit preparation
   - NPM publishing setup
```

### 8. Testing & Quality Tasks

```
For testing and quality assurance today, please:

1. Review current test coverage metrics
2. Generate testing tasks:
   - Claude AI: Unit test creation, E2E scenarios (8 tasks)
   - Central Team: Security testing, performance review (3 tasks)
   - Developers: Feature testing, bug fixes (5 tasks each)
3. Prioritize based on:
   - Critical user paths
   - Recent changes
   - Production readiness
```

## 🚀 Advanced Prompts

### 9. Performance Optimization

```
Please analyze performance bottlenecks and generate optimization tasks:

1. Review performance metrics and lighthouse scores
2. Generate optimization tasks:
   - Bundle size reduction
   - Database query optimization
   - Caching implementation
   - Lazy loading setup
3. Prioritize by impact on user experience
```

### 10. Documentation Sprint

```
For documentation focus today, please:

1. Identify undocumented features and APIs
2. Generate documentation tasks:
   - Claude AI: API docs, component docs, guides (7 tasks)
   - Central Team: Architecture docs, security guides (3 tasks)
   - Developers: Feature docs, user guides (4 tasks each)
3. Ensure consistency with existing documentation
```

## 🔄 Progress Tracking Prompts

### 11. Midday Progress Check

```
It's 2 PM IST. Please:

1. Review morning task assignments
2. Check task completion status
3. Identify any new blockers
4. Adjust afternoon priorities
5. Generate updated task list for remaining hours
```

### 12. End of Day Summary

```
It's 9 PM IST, end of Day [X] of Week [Y] sprint. Please:

1. Summarize today's achievements by team
2. List incomplete tasks and reasons
3. Update sprint progress percentage
4. Generate context for tomorrow's morning routine
5. Create brief status update for sprint log
```

## 📋 Quick Copy Templates

### Task Assignment Format

```
## Today's Tasks - [DATE]

### 🤖 Claude AI Team (10 tasks)
1. [ ] [Task description] - Priority: [High/Medium/Low]
2. [ ] [Task description] - Priority: [High/Medium/Low]
...

### 👥 Central Team (5 tasks)
1. [ ] [Task description] - Priority: [High/Medium/Low]
...

### 🌍 Developer Team
**TalentExcel Team (5 tasks)**
1. [ ] [Task description] - Priority: [High/Medium/Low]
...

**SevaPremi Team (5 tasks)**
1. [ ] [Task description] - Priority: [High/Medium/Low]
...

**10xGrowth Team (5 tasks)**
1. [ ] [Task description] - Priority: [High/Medium/Low]
...
```

### Blocker Report Format

```
## Blockers - [DATE]

### 🚨 Critical Blockers
1. **[Blocker]**: [Description]
   - Impact: [What's blocked]
   - Owner: [Who can resolve]
   - ETA: [Expected resolution]

### ⚠️ Warnings
1. **[Risk]**: [Description]
   - Mitigation: [Action plan]
```

## 💡 Usage Tips

1. **Customize Dates**: Replace [DATE], [Day X], [Week Y] with actual values
2. **Add Context**: Include specific sprint goals or focus areas
3. **Be Specific**: Add file paths or component names when relevant
4. **Track Patterns**: Note which prompts work best for different scenarios
5. **Iterate**: Refine prompts based on what generates best results

## 🎯 Special Scenarios

### New Sprint Kickoff

```
New sprint Week [X] starting. Please:
1. Set up sprint structure in sprints.md
2. Define week goals and deliverables
3. Create initial task breakdown
4. Set up tracking mechanisms
```

### Production Issue

```
Production issue reported: [DESCRIPTION]. Please:
1. Assess impact and severity
2. Generate immediate action items
3. Assign to appropriate teams
4. Create incident tracking
```

### Sprint Review Prep

```
Sprint review tomorrow. Please:
1. Compile week's achievements
2. Calculate velocity metrics
3. Prepare demo list
4. Document learnings
```

---

**Remember**: These prompts are starting points. Adapt them based on your specific needs and the current sprint context. The key is consistency and clarity in daily task management.
