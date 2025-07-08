# Claude AI Logging Requirements

**Purpose**: Detailed requirements for session documentation and logging  
**Owner**: Claude AI Team  
**Last Updated**: 05-Jul-2025, Saturday 17:25 IST  
**Version**: 1.0

## 🎯 Logging Objectives

### Why We Log Everything

1. **Context Continuity** - Enable seamless handoffs between sessions
2. **Knowledge Preservation** - Build institutional memory over time
3. **Process Improvement** - Identify patterns and optimize workflows
4. **Audit Trail** - Maintain complete record of decisions and changes
5. **Team Coordination** - Keep human teams informed of progress

### Success Metrics

- **100% Session Coverage** - Every session has a comprehensive log
- **Context Restoration** - New sessions can start effectively using logs
- **Pattern Recognition** - Monthly analysis reveals improvement opportunities
- **Team Satisfaction** - Human teams find logs useful and informative

## 📁 Log File Structure

### Directory Organization

```
logs/claude-sessions/
├── 2025-07/                    # Monthly folders (YYYY-MM)
│   ├── session-logs/           # Individual session logs
│   │   ├── 2025-07-05-17-15.md # Format: YYYY-MM-DD-HH-MM.md
│   │   └── 2025-07-06-09-30.md
│   ├── daily-summaries/        # Daily rollups
│   │   ├── 2025-07-05.md       # Format: YYYY-MM-DD.md
│   │   └── 2025-07-06.md
│   └── weekly-retrospectives/  # Weekly analysis
│       └── week-27-2025.md     # Format: week-WW-YYYY.md
├── templates/
│   ├── session-log-template.md
│   ├── daily-summary-template.md
│   └── weekly-retro-template.md
├── analysis/
│   ├── pattern-analysis.md
│   ├── performance-metrics.md
│   └── improvement-recommendations.md
└── metrics/
    ├── session-statistics.json
    ├── productivity-trends.json
    └── quality-metrics.json
```

### File Naming Convention

- **Session Logs**: `YYYY-MM-DD-HH-MM.md` (IST 24-hour format)
- **Daily Summaries**: `YYYY-MM-DD.md`
- **Weekly Retrospectives**: `week-WW-YYYY.md`

## 📋 Session Log Template Requirements

### Mandatory Header Section

```markdown
# Claude Session Log - [Brief Session Description]

**Session ID**: YYYY-MM-DD-HH-MM
**Date**: DD-MMM-YYYY, Day
**Start Time**: HH:MM IST
**End Time**: HH:MM IST
**Duration**: X hours Y minutes
**Context Source**: fresh/continued/user-request/scheduled

## Session Overview

**Sprint**: [Current sprint identifier]
**Primary Goal**: [Main objective of this session]
**Status**: [COMPLETED/IN_PROGRESS/BLOCKED/CANCELLED]
**Sprint Alignment**: [How this session supports sprint goals]
```

### Required Content Sections

#### 1. User Prompts Section

**Purpose**: Record all human input with context
**Format**:

```markdown
## User Prompts (Chronological Order)

### Prompt 1: HH:MM IST

**Category**: [planning/coding/debugging/documentation/review/support]
**Priority**: [high/medium/low]
**Context**: [Why this prompt was needed]
**Text**:
```

[Exact prompt text - preserve formatting]

```

**Analysis**: [Claude's understanding of the request]
**Approach**: [Planned response strategy]
```

#### 2. Claude Actions Section

**Purpose**: Document all tool usage and decisions
**Format**:

```markdown
## Claude Actions & Decisions

### Action Block 1: HH:MM IST

**Trigger**: Response to Prompt 1
**Type**: [tool_use/code_generation/analysis/planning/documentation]
**Sprint Impact**: [How this advances sprint goals]

**Tools Used**:

- [TOOL_NAME]: [Purpose and parameters]
- [TOOL_NAME]: [Purpose and parameters]

**Key Decisions Made**:

- [DECISION]: [Reasoning and alternatives considered]
- [DECISION]: [Reasoning and alternatives considered]

**Files Created/Modified**:

- [FILE_PATH]: [What changed and why]
- [FILE_PATH]: [What changed and why]

**Code Quality Measures**:

- TypeScript compilation: [✅/❌]
- Linting: [✅/❌]
- Testing: [Coverage percentage or N/A]
- Build success: [✅/❌]

**Blockers Encountered**:

- [BLOCKER_TYPE]: [Description and required resolution]
```

#### 3. Session Outcomes Section

**Purpose**: Summarize achievements and next steps
**Format**:

```markdown
## Session Outcomes

### ✅ Completed Tasks

- [TASK]: [Brief description and impact]
- [TASK]: [Brief description and impact]

### 🔄 In Progress

- [TASK]: [Current state and next steps]
- [TASK]: [Current state and next steps]

### 🚨 Blocked Tasks

- [TASK]: [Blocking dependency and owner]
- [TASK]: [Blocking dependency and owner]

### 📝 Todo List Changes

**Before Session**: [Count] tasks ([breakdown by status])
**After Session**: [Count] tasks ([breakdown by status])
**Net Change**: [+/-] tasks
**Completed This Session**: [Count]
**Added This Session**: [Count]

### 📊 Sprint Progress Impact

**Sprint Goal Progress**: [Percentage or milestone update]
**Critical Path Status**: [ON_TRACK/AT_RISK/BLOCKED]
**Team Dependencies**: [What other teams need from this work]
```

#### 4. Learning & Insights Section

**Purpose**: Capture knowledge for future sessions
**Format**:

```markdown
## Key Learnings & Patterns

### Technical Insights

- [INSIGHT]: [Impact on future development]
- [INSIGHT]: [Pattern discovered or confirmed]

### Process Improvements

- [IMPROVEMENT]: [Suggested workflow enhancement]
- [IMPROVEMENT]: [Tool usage optimization]

### Code Patterns Identified

- [PATTERN]: [Reusable approach or template]
- [PATTERN]: [Architecture or design insight]

### Problem-Solving Approaches

- [APPROACH]: [Effective method for similar issues]
- [APPROACH]: [Debugging or analysis technique]
```

#### 5. Context for Next Session

**Purpose**: Enable seamless session continuity
**Format**:

```markdown
## Next Session Preparation

### Context Summary

[2-3 sentences describing current state and what matters most]

### Priority Tasks

1. [HIGHEST_PRIORITY]: [Why this is most important]
2. [SECOND_PRIORITY]: [Context and dependencies]
3. [THIRD_PRIORITY]: [If time permits]

### Required Reading

- [FILE_PATH]: [Why this file is important to review]
- [FILE_PATH]: [Context needed from this document]

### State Information

- **Git Branch**: [Current working branch]
- **Development Server**: [Running/Stopped and port]
- **Environment**: [Any special configuration]
- **Dependencies**: [Pending human inputs or decisions]

### Questions for Human Teams

- [QUESTION]: [For Central Team/Specific person]
- [QUESTION]: [For Developer Team/Specific person]
```

## 📊 Performance Metrics Section

### Required Metrics

```markdown
## Session Performance Metrics

### Efficiency Indicators

- **Duration**: [Actual vs estimated time]
- **Tasks Completed**: [Count and percentage of planned work]
- **Lines of Code**: [Added/Modified/Deleted if applicable]
- **Files Modified**: [Count and types]
- **Documentation Created**: [Pages, sections, or updates]
- **Tests Written**: [Count and coverage impact]

### Quality Indicators

- **Build Success**: [First try/Required fixes]
- **Code Review Ready**: [Yes/No and why]
- **Rework Required**: [None/Minor/Major]
- **Human Intervention Needed**: [Count and types]

### Learning Indicators

- **New Patterns Applied**: [Count and description]
- **Tools Used Effectively**: [New tool usage or optimization]
- **Context Maintained**: [Successfully built on previous work]
- **Knowledge Gaps Identified**: [Areas needing improvement]
```

## 🔄 Daily Summary Requirements

### When to Create

- End of each day with Claude sessions
- Automatically aggregate from session logs
- Manual review and enhancement

### Content Requirements

```markdown
# Daily Summary - DD-MMM-YYYY, Day

## Sessions Overview

- **Total Sessions**: [Count]
- **Total Duration**: [Hours and minutes]
- **Session Types**: [Breakdown by type]

## Aggregate Achievements

### Tasks Completed

- [HIGH_IMPACT_TASK]: [Brief description]
- [MEDIUM_IMPACT_TASK]: [Brief description]

### Code Contributions

- **Files Modified**: [Count]
- **Features Implemented**: [Count and names]
- **Tests Added**: [Count and coverage]
- **Documentation Updated**: [Count and types]

### Sprint Progress

- **Sprint Goal**: [Current sprint objective]
- **Progress Made**: [Percentage or milestone]
- **Blockers Identified**: [Count and types]
- **Dependencies Created**: [For human teams]

## Key Insights

- [INSIGHT]: [Most important learning of the day]
- [PATTERN]: [Recurring theme or approach]

## Tomorrow's Priorities

1. [PRIORITY]: [Based on today's work]
2. [PRIORITY]: [Sprint alignment]
3. [PRIORITY]: [Team dependencies]
```

## 🔍 Weekly Retrospective Requirements

### Timing

- Every Sunday evening
- Review full week of sessions
- Prepare for upcoming sprint planning

### Analysis Requirements

```markdown
# Weekly Retrospective - Week WW, YYYY

## Week Summary

- **Sessions Conducted**: [Count]
- **Total Development Time**: [Hours]
- **Sprint Progress**: [Percentage of sprint goals achieved]

## What Went Well ✅

- [SUCCESS]: [Why this worked and how to repeat]
- [SUCCESS]: [Pattern worth continuing]

## What Could Improve 🔄

- [IMPROVEMENT]: [Specific change recommended]
- [IMPROVEMENT]: [Process optimization identified]

## Blockers & Dependencies 🚨

- [BLOCKER]: [Impact and resolution strategy]
- [DEPENDENCY]: [Team coordination needed]

## Metrics & Trends 📊

- **Productivity Trend**: [Increasing/Stable/Decreasing]
- **Quality Trend**: [First-time success rate]
- **Team Satisfaction**: [Based on feedback]

## Next Week Planning 🎯

- **Focus Areas**: [Key priorities]
- **Process Changes**: [Improvements to implement]
- **Team Coordination**: [Human team dependencies]
```

## 🚨 Special Logging Situations

### Emergency Sessions

For production issues or urgent requests:

```markdown
🚨 **EMERGENCY SESSION**
**Issue**: [Critical problem description]
**Business Impact**: [User/revenue impact]
**Resolution**: [Steps taken and outcome]
**Prevention**: [How to avoid similar issues]
```

### Blocked Sessions

When human dependencies prevent progress:

```markdown
🔒 **BLOCKED SESSION**
**Blocker Type**: [credentials/architecture/review/approval]
**Blocking Team**: [Who needs to resolve]
**Impact**: [How this affects sprint timeline]
**Workaround**: [Alternative tasks completed]
```

### Learning Sessions

When focused on skill development:

```markdown
🎓 **LEARNING SESSION**
**Learning Goal**: [Specific skill or knowledge area]
**Resources Used**: [Documentation, tutorials, examples]
**Knowledge Gained**: [Specific learnings]
**Application Plan**: [How to use this knowledge]
```

## 🔧 Automation Tools

### Log Analysis Scripts

Required scripts to maintain:

```bash
# Generate daily summary from session logs
./scripts/generate-daily-summary.sh YYYY-MM-DD

# Create weekly retrospective
./scripts/generate-weekly-retro.sh week-WW-YYYY

# Analyze productivity patterns
./scripts/analyze-productivity.sh YYYY-MM

# Validate log completeness
./scripts/validate-logs.sh YYYY-MM-DD
```

### Quality Checks

Automated validation for:

- All required sections present
- IST timestamps format correct
- Links and references valid
- Metrics data complete
- Context preservation adequate

## 📈 Success Indicators

### Log Quality Metrics

- **Completeness**: 100% of required sections filled
- **Accuracy**: Information matches actual work done
- **Usefulness**: Next sessions successfully use previous context
- **Clarity**: Human teams understand progress and blockers

### Business Impact

- **Faster Onboarding**: New sessions start more efficiently
- **Better Coordination**: Human teams stay informed
- **Process Improvement**: Monthly analysis drives optimization
- **Knowledge Retention**: Institutional memory grows over time

Remember: **Detailed logging is an investment in future productivity**. Every minute spent on quality documentation saves hours in future sessions.
