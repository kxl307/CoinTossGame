# Coin Toss Game Roadmap

## Goal
Build a coin toss game where the player wins by reaching 10 consecutive heads. The coin starts at a 10% heads / 90% tails probability. Heads award money that can be spent on upgrades or abilities that improve the odds or otherwise help the player progress. The game also needs a history section showing what happened during play.

## Phase 1: Product framing and implementation plan
- Review the existing project structure and determine the target stack, entry points, and current constraints.
- Turn this roadmap into an execution plan with concrete tasks, dependencies, and validation steps.
- Confirm how the gameplay loop, progression, and history should map into the existing app structure.

## Phase 2: Core gameplay loop
- Implement the coin toss action as the primary player interaction.
- Enforce the base weighted odds of 10% heads and 90% tails.
- Track consecutive heads and end the game immediately when the player reaches 10 in a row.
- Reset or preserve streak state appropriately based on toss outcomes.

## Phase 3: Economy and progression systems
- Award money whenever a toss results in heads.
- Introduce upgrades or abilities that spend earned money to improve the player’s chances or otherwise support progress toward the 10-head objective.
- Persist and surface the current economy and progression state inside the game flow.
- Ensure upgrade effects are reflected in future toss calculations.

## Phase 4: Game history and player feedback
- Add a history section that records meaningful game events, including toss outcomes, streak changes, rewards, purchases, upgrade effects, and game-over state.
- Surface the current streak, win condition progress, money total, and active improvements clearly in the UI.
- Make the game-over state understandable and prevent invalid post-win interactions.

## Phase 5: Validation and polish
- Verify the full gameplay loop works from a fresh start through a win.
- Check edge cases around streak resets, upgrade purchases, insufficient funds, and history logging.
- Refine usability details so the progression and odds changes are easy to understand.

## Agent handoff plan
- `gsd-planner`: Convert this roadmap into a detailed implementation task plan, then hand executable work to the executor.
- `gsd-executor`: Implement the approved task plan in the shared workspace and report completion details back to the thread.
