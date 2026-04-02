---
plan_id: PLAN-01
milestone: M001
slice: S01
status: ready
executor: ctg-36-executor
depends_on: []
---

# Coin Toss Game implementation plan

## Objective

Deliver a complete playable browser game from the current empty workspace using a minimal static stack that matches the roadmap and ProjectGoal exactly:

- player wins only by reaching **10 consecutive heads**
- toss odds start at **10% heads / 90% tails**
- every head awards money
- money buys **multiple upgrades** that improve progress by increasing future head chance
- UI includes a **history section** for meaningful game events
- game enters a clear **game over** state on victory and blocks further play

## Chosen implementation shape

- **Stack:** vanilla HTML, CSS, and browser JavaScript modules
- **Testing:** native `node:test` so the executor can verify logic without adding third-party tooling
- **Entry point:** `index.html` loading `src/app.js`
- **Logic boundary:** keep gameplay rules in a pure module so odds, streak, money, upgrades, and history can be tested deterministically

## Current repo constraints

- The repo has roadmap/planning files only; there is no existing app code to integrate with.
- The fastest low-risk implementation is a single-page browser app with no framework dependency.
- Because the workspace is greenfield, the plan must define the initial file layout and gameplay constants explicitly.

## Required game constants

These values should be implemented exactly unless blocked by the codebase:

- starting money: `0`
- starting head chance: `0.10`
- target streak to win: `10`
- reward per head: `5`
- upgrade catalog:
  1. `weighted-coin-1` — cost `5`, adds `+0.01` head chance
  2. `weighted-coin-2` — cost `15`, adds `+0.02` head chance, requires `weighted-coin-1`
  3. `weighted-coin-3` — cost `30`, adds `+0.03` head chance, requires `weighted-coin-2`

This gives clear progression without inventing unrelated mechanics and keeps the roadmap's "better head chance" requirement front and center.

## Execution order

1. **T01** — create the app shell, pure gameplay logic contract, and automated tests
2. **T02** — wire the toss loop and win/game-over UI to the tested logic
3. **T03** — wire the store and history UI, finalize feedback states, and run full validation

All three tasks are sequential because they share the same files and state model.

## Files the executor is expected to create

- `package.json`
- `index.html`
- `styles.css`
- `src/app.js`
- `src/gameLogic.js`
- `tests/gameLogic.test.js`

## Validation baseline

- `npm test`
- `node --check src/app.js`
- `node --check src/gameLogic.js`

## Handoff files

- `.gsd/milestones/M001/slices/S01/S01-PLAN.md`
- `.gsd/milestones/M001/slices/S01/tasks/T01-PLAN.md`
- `.gsd/milestones/M001/slices/S01/tasks/T02-PLAN.md`
- `.gsd/milestones/M001/slices/S01/tasks/T03-PLAN.md`
