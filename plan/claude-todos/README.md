# Claude Code Todo Management System

**Purpose**: Persistent todo tracking across Claude Code sessions  
**Created**: 07-Jul-2025, Monday 09:35 IST

## 🎯 How It Works

### For Claude Code

1. **Start of Session**: Read `active-todos.json` to understand current state
2. **During Session**: Update the file when tasks are completed or added
3. **End of Session**: Ensure all progress is saved to the file

### For Users

- Your todos persist between PC restarts
- Progress is never lost
- Can review what was done in previous sessions
- Clear view of blockers and dependencies

## 📁 File Structure

### active-todos.json

The main todo file containing:

- **todos**: Current pending tasks with priority and dependencies
- **completedTodos**: Historical record of completed tasks
- **blockedBy**: External dependencies (usually CEO decisions)
- **lastUpdated**: When the file was last modified
- **sessionId**: Which session last updated it

### archived/

Completed sprint todos moved here for historical reference:

- `week1-todos.json`
- `week2-todos.json`
- etc.

## 🔄 Todo Lifecycle

```
Created → Pending → In Progress → Completed → Archived
                 ↓
              Blocked (waiting for decision/dependency)
```

## 🔄 Multi-Terminal Sync System

### How It Works

- **Terminal Registration**: Each terminal announces itself in `activeTerminals`
- **Task Locking**: Prevents conflicts by reserving tasks in `taskLocks`
- **Real-time Updates**: Both terminals check sync status every 30 minutes
- **Handoff Protocol**: Seamless task transfer between terminals

### Files

- `active-todos.json`: Enhanced with terminal tracking and task locks
- `session-sync.md`: Inter-terminal communication and status
- Sync utilities for coordination

### Coordination Commands

```bash
# Check what other terminal is doing
cat plan/claude-todos/session-sync.md

# See task locks and active terminals
grep -A 20 "activeTerminals\|taskLocks" plan/claude-todos/active-todos.json
```

## 📊 Priority Levels

- **high**: Must be done ASAP, blocks other work
- **medium**: Important but not blocking
- **low**: Nice to have, can be deferred

## 🔗 Integration with CLAUDE.md

Add this to the standard workflow:

1. Check `/plan/claude-todos/active-todos.json` at session start
2. Update todos throughout the session
3. Save progress before session ends

## 💡 Benefits

- **Continuity**: Next session picks up exactly where you left off
- **Visibility**: You can check progress anytime
- **Planning**: See dependencies and blockers clearly
- **History**: Track what was accomplished over time

## 🚀 Usage Example

### Starting a new session:

```
"I see from the todo list that we need to implement the location schema.
The location data decision is still pending from the CEO (due by noon today).
Should I work on something else while we wait?"
```

### Updating progress:

```
"I've completed the location schema task. Updating the todo list and
moving on to the location migration task."
```

### Checking blockers:

```
"The bundle schema task is blocked by the pricing decision due Thursday.
I'll work on the sasarjan landing page which has no dependencies."
```

---

This system ensures your Claude Code assistant maintains context and progress across any number of sessions!
