# ROADMAP

## Project Summary
Build a coin toss progression game where the player wins by reaching 10 consecutive heads. The base coin odds are heavily unfavorable (10% heads, 90% tails), so the game loop must include an economy and upgrades that help the player improve their chances over time. The game also needs a visible history log of notable events.

## Phase 1: Define the playable core loop
- Choose the game format and project structure that best supports a simple playable build.
- Implement the base toss mechanic with 10% head chance and 90% tail chance.
- Track the current consecutive heads streak.
- End the game immediately when the player reaches 10 consecutive heads.

## Phase 2: Add progression and upgrade systems
- Award money when the player gets a head.
- Design at least one purchasable improvement that increases head probability (for example, from 10% to 11%).
- Ensure upgrades consume money and persist through the current play session.
- Keep the progression balanced enough that the win condition is achievable but still challenging.

## Phase 3: Add game state feedback and history
- Show the current streak, current head chance, and available money.
- Maintain a history section describing important events such as toss results, streak resets, money earned, purchases, and win/game-over events.
- Make the history readable and update it as the game progresses.

## Phase 4: Finish and validate the experience
- Verify all requirements from `ProjectGoal.md` are implemented.
- Refine UX copy and presentation so the gameplay loop is understandable.
- Run the project's existing validation commands and fix any issues found.

## Agent Plan
- `gsd-planner`: Break this roadmap into concrete implementation tasks and assign executable work.
- `gsd-executor`: Implement the project once task plans are ready.

## Notes
- The roadmap must preserve the exact win condition: 10 consecutive heads.
- The default odds must remain 10% heads / 90% tails until changed by earned upgrades.
- The history feature is a core requirement, not an optional enhancement.
