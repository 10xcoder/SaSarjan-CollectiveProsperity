# Token Optimization Guide

**Created**: 07-Jul-2025, Monday 09:50 IST  
**Purpose**: Maximize efficiency, minimize token usage

## 🎯 Token-Saving Strategies

### 1. Use Minimal Context First

```bash
# Instead of loading everything:
Start with: CLAUDE-MINIMAL.md (500 tokens)
Not: CLAUDE.md (3,000 tokens)

# Load more only when needed
"I need to see the full architecture documentation"
```

### 2. Reference, Don't Repeat

```markdown
# Bad (wastes tokens):

"As documented in the previous session, we implemented..."

# Good (saves tokens):

"See session log 2025-07-07-08-16.md for implementation details"
```

### 3. Summarize Aggressively

After complex discussions:

- Create a 200-word summary
- Archive detailed logs
- Reference summary in next session

### 4. Use File Paths Instead of Content

```markdown
# Bad:

"The location schema includes these 50 fields: [lists all]"

# Good:

"Location schema defined in /plan/teams/developers/shared/location-aware-development.md#L50"
```

### 5. Prune Completed Todos

Move completed items to archive regularly:

- Active todos: Only pending items
- Archived: Historical record

## 📊 Token Budget Guidelines

### Per Session Budget

- **Context Loading**: 2,000 tokens max
- **Active Work**: 8,000 tokens
- **Reserve**: 2,000 tokens
- **Total**: ~12,000 tokens/session

### What to Load When

| Starting Task   | Load These Files                         | Token Cost |
| --------------- | ---------------------------------------- | ---------- |
| Continue coding | minimal-context.md + specific code files | ~2,000     |
| New feature     | minimal-context.md + architecture docs   | ~3,000     |
| Bug fixing      | Session logs + error details             | ~2,500     |
| Planning        | Full todos + summaries                   | ~4,000     |

## 🚀 Optimization Commands

### Start Lightweight

```
"Start with minimal context from CLAUDE-MINIMAL.md"
```

### Load Specific Context

```
"Load only the location system documentation"
"Show me just today's pending todos"
"What was the last completed task?"
```

### Progressive Loading

```
"I need more context about the bundle architecture"
"Show me the full decision details for location data"
```

## 💡 Best Practices

### DO ✅

- Start minimal, load as needed
- Use summaries over full logs
- Reference files by path
- Archive completed work
- Create focused summaries

### DON'T ❌

- Load entire session history
- Repeat long explanations
- Keep completed todos active
- Load unnecessary code files
- Use verbose descriptions

## 📈 Token Tracking

### How to Monitor

1. Note tokens at session start
2. Check after loading context
3. Monitor during work
4. Review at session end

### Warning Signs

- Context over 10k tokens
- Slow responses
- Hitting limits mid-task
- Repeated information

## 🔧 Cleanup Tasks

### Weekly

- Archive completed todos
- Consolidate summaries
- Prune old session logs
- Update minimal context

### Monthly

- Review CLAUDE.md size
- Optimize frequently used docs
- Archive old decisions
- Compress historical data

---

**Remember**: Less context = Faster responses + Lower costs + More working tokens
