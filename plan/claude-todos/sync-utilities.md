# Multi-Terminal Sync Utilities

**Purpose**: Utilities for coordinating between multiple Claude terminals  
**Created**: 07-Jul-2025, Monday 22:50 IST

## 🔄 Sync Commands

### For Terminal Registration

When starting a new terminal session:

```bash
# 1. Check current status
cat plan/claude-todos/session-sync.md

# 2. Check task locks
grep -A 10 "taskLocks" plan/claude-todos/active-todos.json

# 3. Announce new terminal (add to activeTerminals in active-todos.json)
# Terminal should add itself to the activeTerminals array
```

### For Task Coordination

```bash
# Check available tasks (no locks, no dependencies)
grep -B 2 -A 5 '"status": "pending"' plan/claude-todos/active-todos.json | grep -v "dependencies.*\[.*\]"

# Check task locks
grep -A 5 "taskLocks" plan/claude-todos/active-todos.json

# Update terminal status
# Edit activeTerminals section in active-todos.json
```

## 🎯 Terminal Role Assignment

### Primary Terminal (terminal-1)

- **Focus**: Infrastructure and blocked tasks
- **Current**: Multi-terminal sync implementation
- **Next Priority**: Location system (when CEO decision received)
- **Backup Tasks**: Security infrastructure, automation setup

### Secondary Terminal (terminal-2)

- **Focus**: High-impact unblocked tasks
- **Recommended Start**: SaSarjan landing page
- **Alternative Tasks**: Setup guides, component library, documentation
- **Coordination**: Check sync every 30 minutes

## 🔒 Task Locking Protocol

### To Claim a Task

1. **Check Availability**: Ensure task has no locks and dependencies are met
2. **Add Lock**: Update `taskLocks` in active-todos.json:
   ```json
   "task-id": {
     "lockedBy": "terminal-X",
     "lockedAt": "DD-MMM-YYYY, Day HH:MM IST",
     "estimatedCompletion": "DD-MMM-YYYY, Day HH:MM IST"
   }
   ```
3. **Update Status**: Change terminal currentTask and lastActivity
4. **Mark In Progress**: Change task status to "in_progress"

### To Release a Task

1. **Complete Task**: Mark as "completed" in todos
2. **Remove Lock**: Delete from taskLocks
3. **Update Terminal**: Change currentTask to next task
4. **Update Sync**: Log progress in session-sync.md

## 🔄 Handoff Procedures

### Planned Handoff

When one terminal wants to transfer work to another:

1. **Complete Current Task**: Finish cleanly, no broken state
2. **Update Documentation**: Log progress and next steps
3. **Release Locks**: Remove from taskLocks
4. **Notify**: Update session-sync.md with handoff details
5. **Suggest Next**: Recommend specific task for other terminal

### Emergency Handoff

When a terminal needs to stop unexpectedly:

1. **Update Status**: Mark terminal as "paused" or "stopped"
2. **Release All Locks**: Free up any claimed tasks
3. **Document State**: Leave detailed notes about progress
4. **Flag Issues**: Mark any incomplete work clearly

## 📊 Sync Status Monitoring

### Every 30 Minutes

Both terminals should:

1. Read session-sync.md for updates
2. Check active-todos.json for changes
3. Update their own lastActivity timestamp
4. Look for coordination opportunities

### Status Updates

Update session-sync.md when:

- Starting a new major task
- Completing a significant milestone
- Encountering blockers
- Finishing a work session

## 🚨 Conflict Resolution

### Task Conflicts

If both terminals try to work on the same task:

- **Priority**: Primary terminal (terminal-1) gets preference
- **Alternative**: Secondary terminal switches to backup task
- **Communication**: Use session-sync.md to coordinate

### File Conflicts

If both terminals modify the same file:

- **Rule**: Last commit wins, but review changes
- **Prevention**: Use task locks for file-intensive work
- **Resolution**: Merge manually if needed

## 🎯 Optimization Tips

### For Terminal 1 (Infrastructure Focus)

- Work on dependencies that unblock other tasks
- Handle CEO decisions and external blockers
- Set up systems that Terminal 2 can use

### For Terminal 2 (Parallel Development)

- Focus on independent, high-impact tasks
- Create components and content
- Document progress for Terminal 1 integration

### Communication Patterns

- **Morning**: Coordinate daily priorities
- **Midday**: Sync progress and adjust plans
- **Evening**: Handoff and prepare for next session

---

**Usage**: Both terminals should bookmark this file and follow these protocols for efficient coordination.
