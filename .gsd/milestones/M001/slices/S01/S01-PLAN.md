---
milestone: M001
slice: S01
title: Coin Toss Game MVP
status: ready
executor: ctg-36-executor
depends_on: []
task_order: [T01, T02, T03]
---

# Slice plan: Coin Toss Game MVP

## Goal

Ship a fully playable single-page coin toss game that starts at 10% heads odds, rewards money on heads, lets the player buy odds-improving upgrades, tracks all important events in history, and ends the run once the player reaches 10 consecutive heads.

## Scope

This slice covers the entire first playable version because the repo is greenfield and the feature set is tightly coupled around one shared state model.

## Implementation decisions

### 1. Stack

- Use `index.html` + `styles.css` + `src/app.js`
- Keep rules in `src/gameLogic.js`
- Use native Node tests in `tests/gameLogic.test.js`

### 2. State model

The executor should keep one authoritative game state object with at least:

- `currentStreak`
- `bestStreak`
- `money`
- `headChance`
- `gameOver`
- `tossCount`
- `purchasedUpgradeIds`
- `history`

### 3. Required behavior

- A toss uses the current `headChance` against `Math.random()`
- Heads increase streak and award `5`
- Tails reset the current streak to `0`
- Reaching `10` consecutive heads sets `gameOver = true`
- Toss and purchase controls are disabled once `gameOver` is true
- Every toss, purchase, and win event is added to history in human-readable form

### 4. Upgrade catalog

Implement exactly these three one-time upgrades:

| ID | Label | Cost | Effect | Requirement |
|---|---|---:|---:|---|
| `weighted-coin-1` | Weighted Coin I | 5 | +1% heads | none |
| `weighted-coin-2` | Weighted Coin II | 15 | +2% heads | `weighted-coin-1` |
| `weighted-coin-3` | Weighted Coin III | 30 | +3% heads | `weighted-coin-2` |

## Dependencies

- `T02` depends on `T01`
- `T03` depends on `T02`

## Done when

- The game is playable from a fresh load with no manual setup beyond opening `index.html`
- Tossing can lead to a win only after 10 consecutive heads
- Upgrades spend real earned money and affect future toss odds
- History clearly records tosses, streak changes, rewards, purchases, chance changes, and the win/game-over moment
- Automated logic tests pass
