# Claude Code Best Practices Checklist

## Daily Workflow Checklist

### Session Start
- [ ] Clear previous context with `/clear` if starting new work
- [ ] Read minimal context: `/plan/claude-todos/minimal-context.md`
- [ ] Check active todos: `/plan/claude-todos/active-todos.json`
- [ ] Check multi-terminal sync: `/plan/claude-todos/session-sync.md`
- [ ] Announce terminal and claim tasks

### During Development
- [ ] Use specific file paths when known
- [ ] Batch multiple file reads in single message
- [ ] Use Task tool for complex searches
- [ ] Run `pnpm build` after each major change
- [ ] Follow incremental development protocol
- [ ] Check token usage periodically with `/cost`

### Session End
- [ ] Update todos with completed tasks
- [ ] Release locks on tasks
- [ ] Document any decisions made
- [ ] Compact context if needed with `/compact`

## Search & Navigation Best Practices

### ✅ DO
```bash
# Specific file paths
/apps/talentexcel/src/app/page.tsx

# Targeted patterns
apps/*/src/**/*.tsx
packages/auth/src/**/*.ts

# Use @ references
@package.json @tsconfig.json

# Batch operations
Read multiple files in one message
```

### ❌ DON'T
```bash
# Broad searches
**/*
**/*.js

# Include build directories
grep "pattern" /

# Explore node_modules
ls node_modules/
```

## Token Optimization Checklist

### File Operations
- [ ] Avoid reading `pnpm-lock.yaml` unless debugging dependencies
- [ ] Skip generated files (`.next/`, `dist/`, `build/`)
- [ ] Don't explore `node_modules/`
- [ ] Read specific files instead of entire directories
- [ ] Use glob patterns to target file types

### Search Strategies
- [ ] Start with package.json to understand structure
- [ ] Use grep with specific include patterns
- [ ] Leverage Task tool for multi-step searches
- [ ] Check imports to find related files
- [ ] Use ripgrep (`rg`) instead of grep when available

### Context Management
- [ ] Clear between unrelated tasks
- [ ] Compact when approaching limits
- [ ] Start with minimal context
- [ ] Load additional context only when needed
- [ ] Monitor usage with `/cost` command

## Development Standards Checklist

### Before Writing Code
- [ ] Run `pnpm build` to check current state
- [ ] Verify all imports exist
- [ ] Check existing types before creating new ones
- [ ] Follow consistent file patterns
- [ ] Read similar components/modules first

### Code Quality
- [ ] Enable TypeScript strict mode
- [ ] Import types locally when used in same file
- [ ] Never create duplicate type names
- [ ] Follow existing code conventions
- [ ] Add proper error handling

### Testing & Validation
- [ ] Run `pnpm typecheck` after changes
- [ ] Run `pnpm lint` to check code quality
- [ ] Test imports work before adding logic
- [ ] Verify build succeeds after each file
- [ ] Run tests if modifying existing code

## Performance Tips Checklist

### Speed Optimizations
- [ ] Use parallel tool calls for multiple operations
- [ ] Reference files directly with @ syntax
- [ ] Use custom slash commands for common tasks
- [ ] Resume sessions with `--resume` flag
- [ ] Leverage extended thinking for complex problems

### Cost Management
- [ ] Monitor daily usage (target < $12/day)
- [ ] Use `/cost` to check session costs
- [ ] Clear context between major tasks
- [ ] Avoid unnecessary file exploration
- [ ] Be specific in queries

## Team Collaboration Checklist

### Multi-Terminal Work
- [ ] Check session-sync.md before starting
- [ ] Announce terminal identifier
- [ ] Claim specific tasks
- [ ] Update progress regularly
- [ ] Release locks when done

### Documentation
- [ ] Update todos for task tracking
- [ ] Document decisions in `/plan/decisions/`
- [ ] Add comments only when requested
- [ ] Keep CLAUDE.md updated
- [ ] Log important findings

## Quick Command Reference

```bash
# Session Management
/clear          # Clear conversation
/compact        # Compact context
/cost           # Check token usage
/resume         # Continue previous work

# Custom Commands (from settings)
/build          # Run pnpm build
/dev            # Start development
/typecheck      # Check types
/lint           # Lint code
/test           # Run tests
/ist            # Show IST time
/todos          # View todos
/context        # View minimal context
/sync           # Check sync status

# Development
pnpm dev        # Start all apps
pnpm build      # Build everything
pnpm typecheck  # Type checking
pnpm lint       # Code linting
```

## Emergency Procedures

### High Token Usage
1. Run `/cost` to check usage
2. Use `/compact` to reduce context
3. Clear with `/clear` if needed
4. Switch to minimal context mode
5. Use Task tool for searches

### Build Failures
1. Check error messages for file paths
2. Verify all imports exist
3. Run `pnpm typecheck` for details
4. Check tsconfig.json settings
5. Verify package dependencies

### Performance Issues
1. Batch related operations
2. Use specific file paths
3. Avoid recursive searches
4. Clear between tasks
5. Monitor with `/cost`

## Summary

Following this checklist will help you:
- Reduce token usage by 60-80%
- Increase development speed
- Maintain code quality
- Collaborate effectively
- Stay within budget ($6-12/day)

Remember: Start minimal, be specific, batch operations, and monitor usage!