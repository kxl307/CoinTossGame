---
task_id: T03
slice: S01
title: Add upgrades, history UI, and final gameplay safeguards
depends_on: [T02]
files:
  - index.html
  - styles.css
  - src/app.js
  - src/gameLogic.js
  - tests/gameLogic.test.js
---

# T03 - Add upgrades, history UI, and final gameplay safeguards

## Objective

Finish the progression loop and player feedback so the game feels complete and all roadmap requirements are visible in the UI.

## Action

1. Render the upgrade catalog as purchase buttons showing:
   - name
   - cost
   - effect on head chance
   - locked / purchased / affordable state
2. On upgrade click:
   - call `purchaseUpgrade`
   - re-render the full state
   - reflect the increased head chance in subsequent tosses and in the displayed percentage
3. Render a history section with newest event first. It must include meaningful messages for:
   - head tosses
   - tail tosses
   - streak resets
   - money rewards
   - upgrade purchases
   - rejected purchases
   - final win/game-over
4. Prevent invalid post-win interactions:
   - disable all upgrade buttons after `gameOver`
   - do not allow hidden handler execution after buttons are disabled
5. Tighten player feedback:
   - show when an upgrade is locked behind a prerequisite
   - show when the player lacks money
   - keep the history section readable with a fixed-height scroll area if needed
6. Expand tests only where logic changed so verification still proves:
   - purchased upgrades affect future chance values
   - failed purchases do not spend money
   - game-over blocks additional tosses or purchases at the logic boundary

## Verify

- `npm test`
- `node --check src/app.js`
- `node --check src/gameLogic.js`

## Done

- The player can buy upgrades with earned money and see their odds improve
- History explains what happened throughout the run
- The UI exposes streak, money, current odds, upgrades, and game-over state clearly
- The implementation fully covers the roadmap and ProjectGoal requirements without extra mechanics
