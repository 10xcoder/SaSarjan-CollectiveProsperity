# Claude Code Optimization Guide for SaSarjan AppStore

## Token Usage Optimization Strategies

### 1. Session Management
- **Clear between tasks**: Use `/clear` command when switching to unrelated work
- **Compact when needed**: Use `/compact` when context approaches limits
- **Monitor usage**: Check token consumption with `/cost` command regularly

### 2. Search Strategies
- **Use Task tool**: For complex searches, use the Task tool instead of manual exploration
- **Be specific**: Provide exact file paths when known (e.g., `/apps/talentexcel/src/app/page.tsx`)
- **Use glob patterns**: Target specific file types (`**/*.tsx` instead of exploring all files)
- **Batch operations**: Request multiple file reads in a single message

### 3. Development Workflow
```bash
# Good: Specific, targeted approach
"Show me the auth implementation in /packages/auth/src/core/auth-service.ts"

# Avoid: Broad, exploratory approach
"Find all authentication code in the project"
```

### 4. File Reference Techniques
- Use `@filename` syntax to quickly reference files
- Reference specific line numbers: `file.ts:42-58`
- Group related file operations together

### 5. Context Management
- Start with minimal context (as per CLAUDE.md)
- Load additional context only when needed
- Use incremental development protocol from CLAUDE.md

## Performance Features

### 1. Parallel Operations
```bash
# Run multiple commands simultaneously
- git status
- git diff
- pnpm typecheck
```

### 2. Resume Sessions
```bash
claude --resume  # Continue previous work without reloading context
```

### 3. Extended Thinking
For complex architectural decisions, let Claude think through the problem before implementation.

### 4. Custom Commands
Create project-specific slash commands for repetitive tasks.

## File Exclusion Patterns (Manual)

Since .claudeignore isn't available, use these strategies:

### Large/Generated Files to Avoid
```
# Don't explore these unless necessary:
- node_modules/
- .next/
- dist/
- build/
- coverage/
- *.log
- package-lock.json
- pnpm-lock.yaml (unless debugging dependencies)
```

### Focused Directory Exploration
```bash
# Good: Targeted exploration
Glob: "apps/talentexcel/src/**/*.tsx"

# Avoid: Broad exploration
Glob: "**/*"
```

## Quick Reference Commands

```bash
# Session Management
/clear          # Clear conversation
/compact        # Compact context
/cost           # Check token usage

# Development
pnpm dev        # Start development
pnpm typecheck  # Check types
pnpm lint       # Lint code
pnpm build      # Build all packages

# Time Zone (from CLAUDE.md)
TZ='Asia/Kolkata' date +'%d-%b-%Y, %A %H:%M IST'
```

## Best Practices Checklist

- [ ] Read minimal context first (`/plan/claude-todos/minimal-context.md`)
- [ ] Check active todos before starting work
- [ ] Use specific file paths when possible
- [ ] Batch related operations together
- [ ] Clear context between unrelated tasks
- [ ] Monitor token usage with `/cost`
- [ ] Follow incremental development protocol
- [ ] Run `pnpm build` after each major change
- [ ] Announce terminal and claim tasks in multi-terminal setup

## Cost Management

- Average: $6 per developer per day
- Stay under $12/day for 90% efficiency
- Monitor with `/cost` command
- Set workspace spend limits in Anthropic Console

## Advanced Tips

1. **Git Worktrees**: Use for parallel development sessions
2. **Streaming JSON**: For large data processing
3. **Auto-compact**: Triggers at 95% context capacity
4. **Haiku Generation**: Background process (~1 cent/day)

Remember: Start minimal, load progressively. This approach saves 80% tokens while maintaining full functionality.