# SaSarjan App Store - Claude Code Context

**Mode**: MINIMAL (for token optimization)  
**Full Documentation**: See CLAUDE-FULL.md if needed

## 🚨 CRITICAL: Time Zone Handling

- **System shows UTC time** - Do NOT use system time directly
- **ALWAYS add 5:30 hours for IST** (Indian Standard Time)
- **Use this command**: `TZ='Asia/Kolkata' date +'%d-%b-%Y, %A %H:%M IST'`

## 🚀 Standard Workflow (Minimal)

1. **Load Current State**: Read `/plan/claude-todos/minimal-context.md`
2. **Check Multi-Terminal Sync**: Read `/plan/claude-todos/session-sync.md`
3. **Check Todos**: Read `/plan/claude-todos/active-todos.json`
4. **Coordinate**: Announce terminal and claim task using sync protocol
5. **Verify Plan**: Check with user before starting work
6. **Execute**: Work on assigned tasks
7. **Update Progress**: Save to active-todos.json and session-sync.md
8. **Release Locks**: Free up tasks when completed

## 📁 Essential Paths

- **Current State**: `/plan/claude-todos/minimal-context.md`
- **Multi-Terminal Sync**: `/plan/claude-todos/session-sync.md`
- **Todos**: `/plan/claude-todos/active-todos.json`
- **Sync Utilities**: `/plan/claude-todos/sync-utilities.md`
- **Decisions**: `/plan/decisions/pending/`
- **Code**: `/apps/talentexcel/`, `/packages/`

## 🔧 Key Commands

```bash
pnpm dev           # Start development
pnpm typecheck     # Check types
pnpm lint          # Check code quality
```

## 📋 When to Load Full Context

- Architecture decisions needed → Load CLAUDE-FULL.md
- New developer onboarding → Load `/plan/teams/developers/`
- Complex debugging → Load specific documentation
- Sprint planning → Load `/plan/strategic/`

---

**Remember**: Start minimal, load progressively as needed. This saves 80% tokens while maintaining full functionality.
