# Feature Request: Add Usage Metrics Transparency to Claude Code

## Summary
Claude Code should display real-time usage metrics to help users understand their current usage limits and which model (Opus 4 vs Sonnet 4) is actively being used.

## Current Behavior
- No visibility into current usage percentage
- No indication when model switches from Opus 4 to Sonnet 4
- Users cannot plan their work based on remaining capacity
- Model switches happen silently at 20% usage threshold

## Desired Behavior
Claude Code should provide:
1. **Usage Dashboard** showing:
   - Current usage percentage (e.g., "15% of daily limit used")
   - Active model indicator (e.g., "Currently using: Opus 4")
   - Remaining capacity before model switch

2. **Status Indicators**:
   - Visual indicator in the interface showing active model
   - Warning when approaching the 20% threshold
   - Notification when model switch occurs

3. **Usage Commands**:
   - `/usage` command to check current statistics
   - `/model` command enhancement to show why current model is active

## Benefits
- **Better Planning**: Users can prioritize complex tasks when Opus 4 is available
- **Transparency**: Users understand what's happening behind the scenes
- **User Control**: Ability to make informed decisions about task execution
- **Improved Experience**: No surprise model switches during critical work

## Proposed Implementation
- Add usage metrics to the session context
- Display metrics in the interface (status bar or dedicated panel)
- Include usage info in the `/model` command output
- Optional: Allow users to set custom threshold warnings

## Example Interface
```
Claude Code Status:
Model: Opus 4 (15% of 20% limit used)
Daily Usage: 2.5k/15k tokens
Next Model: Sonnet 4 (after 20%)
```

## User Story
As a Claude Code user, I want to see my current usage metrics so that I can plan my work effectively and understand which model is serving my requests.

---
*This feature would significantly improve the Claude Code user experience by providing transparency about usage limits and model selection.*