---
task_id: T01
slice: S01
title: Build app shell and deterministic gameplay logic
depends_on: []
files:
  - package.json
  - index.html
  - styles.css
  - src/gameLogic.js
  - tests/gameLogic.test.js
---

# T01 - Build app shell and deterministic gameplay logic

## Objective

Create the initial browser app structure and a pure gameplay logic module that captures the game rules in a testable way before the UI is wired.

## Action

1. Create `package.json` with a test script that uses native Node test tooling.
2. Create a minimal `index.html` shell and `styles.css` layout with placeholders for:
   - title/header
   - current streak / best streak / money / head chance / toss count
   - toss button
   - upgrades area
   - history area
   - win/game-over message area
3. In `src/gameLogic.js`, export pure functions that the UI can call directly:
   - `createInitialState()`
   - `getUpgradeCatalog()`
   - `resolveToss(state, roll)` where `roll` is an injected random number for deterministic tests
   - `purchaseUpgrade(state, upgradeId)`
4. Implement the rules in the pure logic module:
   - initial head chance is `0.10`
   - heads award `5`
   - heads increment streak and update best streak
   - tails reset only the current streak
   - reaching streak `10` marks the game as over
   - upgrades spend money, can only be bought once, and change future head chance
5. Make history part of the state shape from the beginning. Every logic mutation should return the next state with a new history entry describing what happened.
6. In `tests/gameLogic.test.js`, add automated coverage for:
   - 10% head threshold behavior using injected `roll`
   - streak increment on heads
   - streak reset on tails
   - money reward on heads
   - winning at 10 consecutive heads
   - successful purchase updates money and head chance
   - rejected purchase leaves state unchanged except for a failure history entry

## Verify

- `npm test`
- `node --check src/gameLogic.js`

## Done

- The repo has a runnable app shell and a tested logic module
- The core gameplay constants are encoded exactly once in the logic layer
- The UI can be wired without redefining any rules
