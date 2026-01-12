---
description: Stop the running Skyfom orchestration workflow
allowed-tools: Read, Write, Bash(ps:*), Bash(kill:*)
---

# Stop Skyfom Orchestration

Gracefully stop the running orchestration workflow.

## Current State

**Status**: !`cat .claude/state/orchestration.json 2>/dev/null | jq -r '.status' || echo "No active orchestration"`

**Active Agents**: !`cat .claude/state/agents.json 2>/dev/null | jq '[.[] | select(.status == "running")] | length' || echo "0"`

**Phase**: !`cat .claude/state/orchestration.json 2>/dev/null | jq -r '.phase' || echo "N/A"`

## Stop Procedure

1. **Update State**
   - Set status to "paused" in `.claude/state/orchestration.json`
   - Timestamp the stop event

2. **Notify Active Agents**
   - Active agents will complete current operation
   - No new agents will be spawned
   - Agents check state before next action

3. **Save Progress**
   - Commit current progress to state files
   - Log stop event to `.claude/state/events.jsonl`
   - Create stop report in `.claude/state/stop-report-<timestamp>.md`

4. **Cleanup**
   - Leave all branches intact
   - Keep PRs open for review
   - Preserve all work in progress

## Resume

To resume the stopped orchestration:
```bash
/skyfom-orchestrate <same-epic-id>
```

The orchestration will continue from where it stopped.

## Force Stop

If graceful stop doesn't work, check for running processes:
```bash
ps aux | grep claude
```

Note: Force stopping may leave work in inconsistent state.

## Post-Stop Report

After stopping, review:
- `.claude/state/orchestration.json` - Final state
- `.claude/state/agents.json` - Agent statuses
- `.claude/state/events.jsonl` - Event log
- `.claude/state/stop-report-*.md` - Stop summary
