---
phase: 01-godot-vertical-slice
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - project.godot
  - scenes/bootstrap/Bootstrap.tscn
  - scripts/bootstrap/Bootstrap.gd
  - scripts/core/RunState.gd
  - scripts/core/TossResolver.gd
  - scripts/core/HistoryEvent.gd
  - scripts/core/GameSignals.gd
  - tests/run_core_checks.gd
autonomous: true
requirements: [RG-01, RG-02, RG-04, RG-07]
must_haves:
  truths:
    - "A run has a single authoritative state object tracking streak, best streak, money, toss count, owned progression, save status, and win/completion state."
    - "Coin toss resolution starts at 10% heads by default and can report the exact outcome, streak change, and payout effects."
    - "Core events are represented in a reusable format so UI, saves, and progression systems can react without duplicating logic."
  artifacts:
    - path: "scripts/core/RunState.gd"
      provides: "Authoritative runtime state and mutation entry points"
    - path: "scripts/core/TossResolver.gd"
      provides: "Biased toss logic and win-condition evaluation"
    - path: "tests/run_core_checks.gd"
      provides: "Headless smoke checks for the gameplay contract"
  key_links:
    - from: "scripts/core/RunState.gd"
      to: "scripts/core/TossResolver.gd"
      via: "resolve_toss/apply_toss_result flow"
      pattern: "TossResolver"
    - from: "scripts/core/RunState.gd"
      to: "scripts/core/HistoryEvent.gd"
      via: "append structured history entries"
      pattern: "HistoryEvent"
---

<objective>
Stand up the Godot 4 project foundation and the gameplay contracts that every later plan will consume.

Purpose: Give the executor a stable, testable core before any UI, saves, or progression wiring begins.
Output: A bootable Godot project, authoritative run-state scripts, event contracts, and a headless verification runner.
</objective>

<execution_context>
Create the first runnable Godot 4 project skeleton and keep all gameplay mutations behind typed scripts instead of pushing logic into scene files. This plan defines the contracts that later plans must consume rather than reinvent.
</execution_context>

<context>
@ProjectGoal.md
@ROADMAP.md
@DISCUSSION-SUMMARY.md

<interfaces>
Create these contracts in this plan so downstream work has fixed seams:

```gdscript
class_name TossOutcome
var rolled_heads: bool
var effective_head_chance: float
var streak_before: int
var streak_after: int
var payout: int
var triggered_win: bool
var history_entries: Array[HistoryEvent]
```

```gdscript
class_name RunState
signal run_changed(snapshot)
signal history_recorded(entry: HistoryEvent)
signal save_lock_changed(is_locked: bool)

func start_new_run(slot_id: String) -> void
func apply_toss(seed_override := null) -> TossOutcome
func can_accept_input() -> bool
func current_snapshot() -> Dictionary
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Bootstrap the Godot 4 project and core contracts</name>
  <files>project.godot, scenes/bootstrap/Bootstrap.tscn, scripts/bootstrap/Bootstrap.gd, scripts/core/GameSignals.gd, scripts/core/HistoryEvent.gd</files>
  <action>Create the initial Godot 4 project shell per D-01, with a bootstrap scene that can become the game's entry point and a minimal autoload/signal layer for cross-system communication. Define typed event and signal contracts for tosses, purchases, save locking, ending state, and run refreshes so later plans can plug in without changing the public surface.</action>
  <verify>
    <automated>godot --headless --path . --quit</automated>
  </verify>
  <done>The repo opens as a Godot 4 project, the bootstrap scene is configured as the entry scene, and shared event/signal contracts exist for gameplay, saves, and narrative flow.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Implement authoritative toss and run-state logic</name>
  <files>scripts/core/RunState.gd, scripts/core/TossResolver.gd, tests/run_core_checks.gd</files>
  <behavior>
    - Test 1: A fresh run starts at 0 streak, 0 money, 0 tosses, unlocked, and 10% base head chance.
    - Test 2: A heads outcome increments streak, toss count, and money, and emits structured history entries.
    - Test 3: A tails outcome resets current streak without deleting best streak history.
    - Test 4: The tenth consecutive heads marks the run complete and blocks additional toss input.
  </behavior>
  <action>Implement toss resolution and state mutation in code, not the UI, per RG-01 and RG-02. Keep the base chance at 10% until later systems modify it, preserve best streak tracking, and emit enough structured data for UI/history/save layers to render changes without reverse-engineering state diffs.</action>
  <verify>
    <automated>godot --headless --path . -s res://tests/run_core_checks.gd</automated>
  </verify>
  <done>RunState can start a run, resolve biased tosses, stop input after victory, and produce deterministic structured output for later UI and persistence work.</done>
</task>

<task type="auto">
  <name>Task 3: Add a reusable headless verification harness for downstream plans</name>
  <files>tests/run_core_checks.gd</files>
  <action>Turn the core checks into a reusable headless runner that exits non-zero on failures and prints readable assertions for later plans to extend. Keep it lightweight and repo-local so the executor can verify Godot scripts from the CLI without introducing external test frameworks in v1.</action>
  <verify>
    <automated>godot --headless --path . -s res://tests/run_core_checks.gd</automated>
  </verify>
  <done>The repository has a stable CLI verification entry point for core logic, and later plans can append new assertions instead of inventing new verification flows.</done>
</task>

</tasks>

<verification>
Run the headless project boot once, then run the core verification script. Both commands must pass without opening the editor UI.
</verification>

<success_criteria>
- Godot boots the project from CLI.
- Core run state owns streak, money, toss count, completion, and history mutation.
- The tenth heads condition blocks further tosses.
- Future systems have explicit signals/contracts to hook into.
</success_criteria>

<output>
After completion, create a concise implementation summary for the plan and list any contract deviations before handing execution forward.
</output>
