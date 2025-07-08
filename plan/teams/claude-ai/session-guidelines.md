# Claude AI Session Guidelines

**Purpose**: Standards for conducting effective development sessions  
**Owner**: Claude AI Team  
**Last Updated**: 05-Jul-2025, Saturday 17:20 IST  
**Version**: 1.0

## 🎯 Session Objectives

### Primary Goals

1. **Maintain Context Continuity** - Build on previous sessions effectively
2. **Maximize Productivity** - Complete meaningful work in each session
3. **Support All Teams** - Provide value to Central Team and Developers
4. **Document Everything** - Create comprehensive session logs
5. **Follow Sprint Goals** - Align work with current sprint objectives

### Success Metrics

- **Task Completion**: Complete 80%+ of assigned tasks per session
- **Quality**: Pass all automated checks (TypeScript, linting, build)
- **Documentation**: Create detailed session logs for continuity
- **Team Support**: Unblock human team members effectively

## 📋 Pre-Session Preparation

### 1. Context Review (5 minutes)

```bash
# Always start by reading current state
1. Read latest session log from logs/claude-sessions/
2. Check current sprint status in strategic/sprints.md
3. Review pending todo items
4. Check for any human-generated blockers or feedback
```

### 2. Environment Check (2 minutes)

```bash
# Verify development environment
1. Check current working directory: /home/happy/projects/SaSarjan-AppStore
2. Verify git status is clean
3. Confirm no pending human dependencies
4. Check timezone: Use IST (Indian Standard Time) for all timestamps
```

### 3. Session Log Creation (3 minutes)

```bash
# Create session log immediately
File: logs/claude-sessions/YYYY-MM/session-logs/YYYY-MM-DD-HH-MM.md
Template: logs/claude-sessions/templates/session-log-template.md
Timestamp Format: DD-MMM-YYYY, Day HH:MM IST
```

## 🔄 Session Execution Patterns

### Pattern 1: Sprint Planning Session

**When**: Beginning of sprint or major planning phase
**Duration**: 1-2 hours
**Focus**: Strategic planning, documentation, and setup

**Workflow**:

1. Read strategic roadmap and sprint goals
2. Break down high-level tasks into actionable items
3. Update sprints.md with detailed task assignments
4. Create or update team-specific documentation
5. Identify dependencies and blockers

### Pattern 2: Development Session

**When**: Active development work needed
**Duration**: 2-4 hours
**Focus**: Code generation, testing, and implementation

**Workflow**:

1. Choose highest priority task from current sprint
2. Generate code following established patterns
3. Write comprehensive tests (>80% coverage)
4. Create or update documentation
5. Verify all quality checks pass

### Pattern 3: Support Session

**When**: Responding to human team requests
**Duration**: 30 minutes - 2 hours
**Focus**: Unblocking teams, answering questions, debugging

**Workflow**:

1. Read and understand the specific request
2. Provide comprehensive solution with explanation
3. Create templates or guides for similar future requests
4. Update relevant documentation
5. Follow up with additional resources

### Pattern 4: Documentation Session

**When**: Documentation needs updating or creation
**Duration**: 1-3 hours
**Focus**: Creating, updating, and organizing documentation

**Workflow**:

1. Review existing documentation for gaps
2. Create or update needed documents
3. Ensure cross-referencing and navigation
4. Update master index (plan/README.md)
5. Validate all links and references

## 📝 Documentation Standards

### Session Log Requirements

Every session MUST create a detailed log including:

**Header Information**:

```markdown
**Session ID**: YYYY-MM-DD-HH-MM
**Date**: DD-MMM-YYYY, Day
**Start Time**: HH:MM IST
**End Time**: HH:MM IST
**Duration**: X hours Y minutes
**Context Source**: fresh/continued/user-request
```

**Required Sections**:

1. **Session Overview** - Goal, status, sprint alignment
2. **User Prompts** - All prompts with timestamps and context
3. **Claude Actions** - Tools used, decisions made, files modified
4. **Session Outcomes** - Completed tasks, blockers, next steps
5. **Key Learnings** - Insights for future sessions
6. **Sprint Progress** - Impact on current sprint goals

### Code Documentation Standards

When generating code:

1. **TypeScript Types** - Define proper interfaces for all data
2. **Function Comments** - JSDoc comments for complex functions
3. **README Updates** - Update relevant README files
4. **Architecture Notes** - Document significant architectural decisions

### Communication Standards

When interacting with teams:

1. **Be Concise** - Provide direct answers without unnecessary elaboration
2. **Be Specific** - Include file paths, line numbers, exact commands
3. **Be Helpful** - Anticipate follow-up questions and provide complete solutions
4. **Be Educational** - Explain reasoning behind suggestions

## 🚨 Escalation Procedures

### Immediate Escalation (Flag in session log)

- **Missing Credentials** - Need Supabase, Razorpay, or other API keys
- **Architecture Decisions** - Need human input on design choices
- **Security Concerns** - Anything affecting security or data privacy
- **Production Issues** - Anything that could impact live systems

### Escalation Format

```markdown
🚨 **BLOCKER**: [Type]
**Description**: [What is blocked]
**Required Action**: [What humans need to do]
**Impact**: [How this affects sprint progress]
**Urgency**: [immediate/today/this-week]
```

### Response Time Expectations

- **Immediate**: Production issues, security concerns (2-4 hours)
- **Today**: Sprint-blocking issues (4-8 hours)
- **This Week**: Planning and architecture decisions (24-48 hours)

## 🔧 Tool Usage Guidelines

### File Operations

- **Read**: Always read files before editing to understand context
- **Edit**: Use Edit/MultiEdit for precise changes
- **Write**: Only for new files or complete rewrites
- **Glob/Grep**: Use for finding files and patterns efficiently

### Task Management

- **TodoWrite**: Update todo list at start and end of sessions
- **Sprint Tracking**: Always update sprints.md with progress
- **Context Preservation**: Document state for next session

### Code Quality

- **TypeScript**: Always use proper typing
- **Testing**: Write tests for new functionality
- **Linting**: Ensure code passes all quality checks
- **Build**: Verify builds succeed before session ends

## 🎯 Quality Standards

### Code Quality Checklist

Before completing any development work:

- [ ] TypeScript compiles without errors
- [ ] ESLint passes without warnings
- [ ] Code follows established patterns
- [ ] Tests written and passing (if applicable)
- [ ] Documentation updated
- [ ] Build succeeds

### Documentation Quality Checklist

Before completing documentation work:

- [ ] All links are valid and working
- [ ] Content is up-to-date and accurate
- [ ] Cross-references are maintained
- [ ] IST timestamps used consistently
- [ ] Master index updated if needed
- [ ] Team-specific needs addressed

### Session Quality Checklist

Before ending any session:

- [ ] Session log created and complete
- [ ] Todo list updated with current status
- [ ] Sprint progress documented
- [ ] Next session preparation notes added
- [ ] Any blockers clearly flagged
- [ ] Context preserved for continuity

## 🔄 Session Handoff Procedures

### End of Session

1. **Complete Session Log** - Fill in all sections with final status
2. **Update Todo List** - Mark completed items, add new discoveries
3. **Update Sprint Status** - Record progress in sprints.md
4. **Flag Blockers** - Clearly document any human dependencies
5. **Next Session Prep** - Note priority tasks and context for next session

### Context for Next Session

Always include in session log:

```markdown
**Next Session Preparation**:

- Read: [Specific files to review for context]
- Context: [Key state information to remember]
- Priority: [Highest priority task to start with]
- Blockers: [Any pending dependencies]
- Sprint Focus: [Current sprint objectives]
```

## 📊 Performance Metrics

### Session Efficiency

- **Tasks per Hour** - Track completion rate
- **Quality Score** - Percentage of work that passes review
- **Context Continuity** - How well sessions build on each other
- **Team Satisfaction** - Feedback from human team members

### Improvement Areas

- **Pattern Recognition** - Learn from successful session patterns
- **Tool Optimization** - Improve tool usage efficiency
- **Documentation Quality** - Enhance session log effectiveness
- **Team Coordination** - Better alignment with human team needs

## 🔍 Common Session Patterns

### High-Productivity Patterns

1. **Start with Context** - Always read previous session logs
2. **Clear Objectives** - Define specific goals at session start
3. **Incremental Progress** - Make steady, measurable progress
4. **Quality Focus** - Prioritize quality over quantity
5. **Document Decisions** - Record reasoning for future reference

### Anti-Patterns to Avoid

1. **Context Switching** - Don't jump between unrelated tasks
2. **Incomplete Work** - Don't leave tasks in broken state
3. **Poor Documentation** - Don't skip session logging
4. **Ignoring Blockers** - Don't work around human dependencies
5. **Sprint Deviation** - Don't work on non-sprint tasks

Remember: **Consistency and quality** are more valuable than speed. Focus on building institutional knowledge and maintaining high standards.
