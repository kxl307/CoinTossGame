# Discussion Summary

## Project: Coin Toss Game
## Date: 2026-04-02
## Participants: advisor-researcher, user

## Decisions Made
1. **Engine**: The game should be built in **Godot 4** so it can grow into a deeper game over time.
2. **Tone and setting**: The game should use a bleak posthuman setting. The year is 50,002, humanity is gone, and masked faceless remnants repeat dead human systems in a world defined by suffering.
3. **Complexity direction**: The intended design should eventually include all four discussed layers of complexity: **multiple upgrade trees, active abilities, random events / risk-reward choices, and meta-progression between runs**.
4. **Reward presentation**: The coin flip should have visible animation, and one form of progression should make the animation faster.
5. **Ending**: Reaching the win condition should trigger a **profound narrative ending**, not a simple victory message.
6. **Save behavior**: Progress should be saved between sessions in v1.
7. **Post-win save lock**: After the player reaches the goal on a save file, that same save should no longer be playable.

## Requirements Clarified
- **Platform / UI direction**: This is not a terminal prototype; it should be a Godot-based game experience.
- **Narrative framing**: The story and presentation should reinforce ritual, decay, and suffering rather than lighthearted arcade tone.
- **Progression scope**: The user wants a foundation that supports deepening complexity, not a minimal one-note toss simulator.
- **Feedback loop**: Tosses should feel tangible through animation, and progression should affect that feel.
- **Completion state**: Winning is final for a save file and should feel narratively significant.

## Out of Scope (confirmed)
- **CLI / terminal implementation**: Rejected in favor of a Godot 4 game.
- **Simple arcade-only framing**: Rejected in favor of a narrative-heavy, atmospheric presentation.

## Open Items (no decision yet)
- **Exact v1 scope depth**: The user wants all four complexity pillars, but did not specify how fully each must be implemented in the first playable version versus scaffolded for later expansion.
- **Upgrade content**: Specific upgrade trees, costs, currencies, and ability designs are still undefined.
- **Random event design**: Event frequency, risk/reward structure, and whether events are deterministic or fully random are still open.
- **Meta-progression structure**: The game should save progress, but the exact long-term progression model is not yet defined.
- **Save model details**: It is clear that a completed save cannot continue, but whether players can create fresh save slots or restart in a separate profile was not explicitly discussed.
- **UI structure**: No final decision yet on screen layout for toss controls, history log, upgrades, abilities, and event presentation.
- **Balance**: Payout values, base odds tuning, animation timing, and expected run length are still open.

## Recommendation for Planner
Plan v1 as a **Godot 4 atmospheric progression game** built around the core toss loop, visible history, animated coin feedback, persistent save data, and a definitive narrative ending that locks the completed save. Since the user wants long-term depth, structure the architecture so upgrades, abilities, random events, and meta-progression are separate systems that can expand cleanly. For the first playable version, prioritize a polished vertical slice over full content breadth: one strong end-to-end loop with at least initial implementations of progression, history, saving, and ending flow.
