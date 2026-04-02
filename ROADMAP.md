# ROADMAP

## Project Summary
- Build a coin toss progression game where the player wins by reaching 10 consecutive heads.
- The coin is intentionally biased: 10% heads, 90% tails.
- Heads award money that can be spent on upgrades and abilities that improve the player's odds or progression.
- The game must include a history section showing what happened during play.

## Phase 1: Core Game Rules
- Define the main game state: current streak, best streak, money, toss count, game-over state, and owned upgrades.
- Implement biased coin toss logic with a default 10% chance of heads.
- End the game immediately when the player reaches 10 consecutive heads.

## Phase 2: Rewards and Progression
- Award money whenever a toss results in heads.
- Design an upgrade system that spends earned money on permanent improvements or abilities.
- Support at least one upgrade path that increases the head chance, such as 10% to 11%.

## Phase 3: History and Visibility
- Add a history log that records key events such as toss outcomes, streak changes, money earned, purchases, and win condition reached.
- Make the game state easy to understand during play, including current streak, available money, and active improvements.

## Phase 4: Balance and Quality
- Ensure upgrades integrate cleanly with toss resolution and win checking.
- Verify the history remains accurate after purchases, tails resetting the streak, and game completion.
- Validate that the overall loop feels playable despite the low initial head probability.

## Deliverables
- A playable coin toss game implementing all requirements from `ProjectGoal.md`.
- Upgrade/progression mechanics tied to money earned from heads.
- A visible history section covering major in-game events.
