---
phase: 01-godot-vertical-slice
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - scenes/game/GameScreen.tscn
  - scripts/ui/GameScreen.gd
  - scenes/ui/TossPanel.tscn
  - scripts/ui/TossPanel.gd
  - scenes/ui/HistoryPanel.tscn
  - scripts/ui/HistoryPanel.gd
  - assets/theme/GameTheme.tres
  - tests/run_ui_smoke_checks.gd
autonomous: true
requirements: [RG-02, RG-04, RG-05]
must_haves:
  truths:
    - "The main play screen is a single dense but readable scene with toss interaction on the left, history in the center, and room for progression controls on the right."
    - "The coin toss is visibly animated and the player can read the latest result, streak, money, and toss count without changing screens."
    - "The history column continuously records toss outcomes and major run changes as they happen."
  artifacts:
    - path: "scenes/game/GameScreen.tscn"
      provides: "Single-screen play layout"
    - path: "scenes/ui/TossPanel.tscn"
      provides: "Left-column toss interaction and feedback"
    - path: "scenes/ui/HistoryPanel.tscn"
      provides: "Center-column event/history feed"
    - path: "assets/theme/GameTheme.tres"
      provides: "Dark pixel-art inspired UI theme"
  key_links:
    - from: "scripts/ui/TossPanel.gd"
      to: "scripts/core/RunState.gd"
      via: "button press triggers apply_toss"
      pattern: "apply_toss"
    - from: "scripts/ui/HistoryPanel.gd"
      to: "scripts/core/HistoryEvent.gd"
      via: "render structured event feed"
      pattern: "HistoryEvent"
---

<objective>
Build the left and center parts of the reference-inspired game screen so the core toss loop feels tangible and readable.

Purpose: Deliver the visible gameplay loop early, using the dark pixel-art single-screen direction from D-08 without waiting for all progression systems to exist.
Output: A themed game screen, a toss panel with animation hooks, a history feed, and a smoke test that instantiates the scene headlessly.
</objective>

<execution_context>
Use the contracts from PLAN-01 rather than duplicating state logic in UI scripts. Favor Godot theme resources, ColorRect/Panel styling, and readable pixel-inspired spacing over bespoke art production in this phase.
</execution_context>

<context>
@ProjectGoal.md
@ROADMAP.md
@DISCUSSION-SUMMARY.md
@PLAN-01.md

<interfaces>
Consume the PLAN-01 gameplay contract:

```gdscript
signal run_changed(snapshot)
signal history_recorded(entry: HistoryEvent)
func apply_toss(seed_override := null) -> TossOutcome
func current_snapshot() -> Dictionary
func can_accept_input() -> bool
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build the single-screen scene shell and atmospheric theme</name>
  <files>scenes/game/GameScreen.tscn, scripts/ui/GameScreen.gd, assets/theme/GameTheme.tres</files>
  <action>Create the main in-run screen as a single scene with a left interaction column, center history column, and reserved right progression column per D-08. Apply a dark retro-pixel visual language using theme resources and layout primitives so the executor does not need external art packs to achieve the intended tone.</action>
  <verify>
    <automated>godot --headless --path . -s res://tests/run_ui_smoke_checks.gd</automated>
  </verify>
  <done>The main scene loads headlessly and exposes the intended three-column layout with readable, atmospheric styling.</done>
</task>

<task type="auto">
  <name>Task 2: Implement the toss panel and center history feed wiring</name>
  <files>scenes/ui/TossPanel.tscn, scripts/ui/TossPanel.gd, scenes/ui/HistoryPanel.tscn, scripts/ui/HistoryPanel.gd, scripts/ui/GameScreen.gd</files>
  <action>Wire the toss button, coin animation state, current result text, streak/money/toss stats, and vertical history feed to RunState. The toss panel should feel animated per D-04, and the center feed must append toss outcomes, streak resets, and notable changes in display order without storing duplicate state in the UI layer.</action>
  <verify>
    <automated>godot --headless --path . -s res://tests/run_ui_smoke_checks.gd</automated>
  </verify>
  <done>Pressing toss updates the animated left panel and the center history feed using shared state signals, and the screen exposes current run information without extra navigation.</done>
</task>

<task type="auto">
  <name>Task 3: Add a headless UI smoke runner for layout and node wiring</name>
  <files>tests/run_ui_smoke_checks.gd</files>
  <action>Create a smoke script that instantiates GameScreen, confirms the required panel nodes exist, and verifies the left toss panel and center history panel can subscribe to RunState without null-node failures. Keep the smoke runner cheap enough to re-run after every UI change.</action>
  <verify>
    <automated>godot --headless --path . -s res://tests/run_ui_smoke_checks.gd</automated>
  </verify>
  <done>The executor can verify the main screen structure and signal wiring from the CLI before manual playtesting.</done>
</task>

</tasks>

<verification>
Instantiate the game screen headlessly and confirm the layout nodes, theme resource, and RunState bindings are all present.
</verification>

<success_criteria>
- The game has a dark, readable single-screen layout.
- The player can toss from the left panel and read results/history immediately.
- History stays visible in the center column as the run evolves.
</success_criteria>

<output>
After completion, capture any UI contract assumptions that later progression wiring must preserve.
</output>
