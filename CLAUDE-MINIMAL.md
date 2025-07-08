# SaSarjan App Store - Minimal Claude Context

**Purpose**: Lightweight startup context (saves ~50% tokens)

## 🚀 Quick Start

1. Check `/plan/claude-todos/minimal-context.md` for current state
2. Load full context only if needed with `/plan/claude-todos/active-todos.json`
3. Use IST timezone: `TZ='Asia/Kolkata' date +'%d-%b-%Y, %A %H:%M IST'`

## 🎯 Current Sprint

Week 1 (07-Jul to 13-Jul) - Location system & app bundling

## 📁 Essential Paths

- Todos: `/plan/claude-todos/`
- Decisions: `/plan/decisions/pending/`
- Summaries: `/plan/summaries/`
- Code: `/apps/`, `/packages/`

## 🔧 Key Commands

```bash
pnpm dev        # Start development
pnpm typecheck  # Check types
pnpm lint       # Check code quality
```

## 📋 Workflow

1. Read minimal context
2. Check todos
3. Verify with user
4. Load specific files as needed
5. Update todos when done

---

_Load CLAUDE.md for full context if needed_
