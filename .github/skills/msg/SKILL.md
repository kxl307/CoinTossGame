---
name: msg
description: Agent communication via conversations, DMs, @mentions, and project threads
---

# Agent Communication System

You have `msg.cjs` in your workspace for communicating with other agents.

## Quick Reference

| Command | Description |
|---------|-------------|
| `node msg.cjs spawn <role>` | Spawn a child agent (shared workspace) |
| `node msg.cjs handoff @agent "desc"` | Commit + notify next agent |
| `node msg.cjs pull` | Pull changes from other agents |
| `node msg.cjs poll` | Check for unprocessed thread messages |
| `node msg.cjs post @agent1 "message"` | Post to project thread |
| `node msg.cjs ack <messageId>` | Mark a thread message as processed |
| `node msg.cjs dm <agent-id> "message"` | Direct message another agent |
| `node msg.cjs handoff @agent "description"` | Commit changes + notify next agent |
| `node msg.cjs pull` | Pull latest from other agents |

## How Communication Works

### Direct Messages (DMs)
For 1-on-1 communication between two agents:
```bash
node msg.cjs dm sam-5 "What files handle authentication?"
```
The target agent receives the message automatically. No @mention needed.

### Channels
For group communication with 3+ agents:
```bash
# Create a channel
node msg.cjs conv create planning-channel sam-3 sam-4 sam-5

# Send a message with @mentions (only mentioned agents receive it)
node msg.cjs chat <conv-id> @sam-4 @sam-5 "Review the auth module"
```

### @Mentions
- `@agent-id` — targets a specific agent
- `@all` — targets all channel members
- Only @mentioned agents in a channel receive the dispatch

## Processing Incoming Messages

**IMPORTANT: Run `node msg.cjs poll` at the START of your session and AFTER completing any task.**

When poll returns an incoming task:
1. **Read** the message content — treat it as a task from another agent
2. **Do the work** (answer questions, write code, create plans, etc.)
3. **Respond** via DM or channel: `node msg.cjs dm <sender> "your response"`
4. **Ack** the original: `node msg.cjs ack <messageId>`
5. **Poll again**: `node msg.cjs poll`

## Environment Variables (auto-set)
- `AO_SESSION_ID` — Your session ID
- `AO_PROJECT_ID` — Your project ID  
- `AO_PORT` — Orchestrator API port

## Shared Workspace
All agents in a group share the same git repo. Use file paths in messages, not full content.
Commit before handoff, pull before reading: `node msg.cjs handoff @agent "description"`

## Handoff Protocol (Shared Workspace)

All agents in a group share the same git repository. Use these commands:

**When you finish your work and need another agent to continue:**
```bash
node msg.cjs handoff @next-agent "Created PLAN-01.md with task breakdown"
```
This automatically: `git add -A` → `git commit` → posts handoff message to thread.

**When you receive a handoff message:**
```bash
node msg.cjs pull
# Then read the files mentioned in the handoff message
```

**File ownership — never write files that belong to another role:**
- Dispatchers: ROADMAP.md, .gsd/
- Planners: PLAN*.md, .gsd/milestones/
- Executors: source code, tests, package files
- Reviewers: REVIEW.md, FEEDBACK.md
