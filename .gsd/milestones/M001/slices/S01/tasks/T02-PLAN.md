---
task_id: T02
slice: S01
title: Wire toss interaction, state rendering, and victory handling
depends_on: [T01]
files:
  - index.html
  - styles.css
  - src/app.js
  - src/gameLogic.js
---

# T02 - Wire toss interaction, state rendering, and victory handling

## Objective

Turn the tested rules into a playable loop where the player can toss the coin, watch the streak progress, and hit a locked game-over state after 10 consecutive heads.

## Action

1. Create `src/app.js` as the browser entry point and connect it from `index.html`.
2. Query the UI elements for stats, toss button, upgrade list container, history list container, and game-over banner.
3. Render the full state to the page after every change:
   - current streak
   - best streak
   - progress toward 10 heads
   - money total
   - current head chance shown as a percentage
   - toss count
4. On toss button click:
   - call `resolveToss` with the current state and a real `Math.random()` roll
   - re-render the page from the returned state
5. Ensure victory handling is explicit:
   - when the 10-head streak is reached, show a prominent win/game-over message
   - disable the toss button
   - block any future state mutation through the toss handler
6. Keep the layout simple and readable; prioritize clarity over visual polish.

## Verify

- `npm test`
- `node --check src/app.js`
- `node --check src/gameLogic.js`

## Done

- A fresh page load shows the starting game state
- Tossing updates the streak and money using the tested rules
- The player can win only at 10 consecutive heads
- The game clearly enters a no-more-actions game-over state after the win
