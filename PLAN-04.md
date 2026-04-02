---
phase: 01-godot-vertical-slice
plan: 04
type: execute
wave: 3
depends_on: [02, 03]
files_modified:
  - scenes/bootstrap/Bootstrap.tscn
  - scripts/bootstrap/Bootstrap.gd
  - scenes/ui/RightProgressionPanel.tscn
  - scripts/ui/RightProgressionPanel.gd
  - scenes/ui/SaveSelect.tscn
  - scripts/ui/SaveSelect.gd
  - scenes/ui/EndingOverlay.tscn
  - scripts/ui/EndingOverlay.gd
  - scenes/game/GameScreen.tscn
  - scripts/ui/GameScreen.gd
  - tests/run_end_to_end_checks.gd
autonomous: true
requirements: [RG-03, RG-05, RG-06, RG-08]
must_haves:
  truths:
    - "The player can enter from a save-select flow, resume a live run, and see locked completed saves instead of accidentally continuing them."
    - "The right side of the main screen exposes stats, upgrades, abilities, and event hooks without leaving the single-screen layout."
    - "Winning the game triggers a narrative ending flow and leaves the save in a completed locked state."
  artifacts:
    - path: "scenes/ui/SaveSelect.tscn"
      provides: "Slot selection and locked-slot presentation"
    - path: "scenes/ui/RightProgressionPanel.tscn"
      provides: "Right-column stats/upgrades/progression controls"
    - path: "scenes/ui/EndingOverlay.tscn"
      provides: "Narrative ending presentation"
    - path: "tests/run_end_to_end_checks.gd"
      provides: "End-to-end slice verification"
  key_links:
    - from: "scripts/ui/SaveSelect.gd"
      to: "scripts/save/SaveRepository.gd"
      via: "load/create slot actions"
      pattern: "load_slot|save_slot"
    - from: "scripts/ui/GameScreen.gd"
      to: "scripts/ui/RightProgressionPanel.gd"
      via: "shared snapshot refresh and purchase actions"
      pattern: "run_changed"
    - from: "scripts/core/RunState.gd"
      to: "scripts/ui/EndingOverlay.gd"
      via: "victory/completion signal"
      pattern: "complete|ending"
---

<objective>
Finish the playable vertical slice by wiring saves, progression UI, and the ending flow into a coherent single-screen Godot experience.

Purpose: Deliver the first complete v1 loop the user asked for: toss, progress, persist, win, see the ending, and have the save become final.
Output: Save-select flow, right-side progression panel, narrative ending overlay, and end-to-end automated smoke coverage.
</objective>

<execution_context>
Integrate the earlier plans without moving core rules back into UI scripts. Preserve the single-screen presentation from D-08 and make the right-side panel dense but readable rather than sprawling into submenus.
</execution_context>

<context>
@ProjectGoal.md
@ROADMAP.md
@DISCUSSION-SUMMARY.md
@PLAN-02.md
@PLAN-03.md

<interfaces>
The final integration should rely on these entry points:

```gdscript
func start_new_run(slot_id: String) -> void
func current_snapshot() -> Dictionary
func save_slot(slot_id: String, payload: Dictionary) -> void
func load_slot(slot_id: String) -> Dictionary
func mark_slot_completed(slot_id: String, ending_id: String) -> void
signal run_changed(snapshot)
signal save_lock_changed(is_locked: bool)
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement save selection and bootstrap routing</name>
  <files>scenes/bootstrap/Bootstrap.tscn, scripts/bootstrap/Bootstrap.gd, scenes/ui/SaveSelect.tscn, scripts/ui/SaveSelect.gd</files>
  <action>Create a start flow that shows available save slots, allows creating or resuming unfinished saves, and visibly marks completed saves as locked per D-07. If a slot is completed, the player may inspect its status but must not be routed back into active gameplay on that slot.</action>
  <verify>
    <automated>godot --headless --path . -s res://tests/run_end_to_end_checks.gd</automated>
  </verify>
  <done>The bootstrap flow reaches live gameplay only from valid unfinished slots and presents completed slots as final/locked.</done>
</task>

<task type="auto">
  <name>Task 2: Wire the right-side progression panel into the main game screen</name>
  <files>scenes/ui/RightProgressionPanel.tscn, scripts/ui/RightProgressionPanel.gd, scenes/game/GameScreen.tscn, scripts/ui/GameScreen.gd</files>
  <action>Populate the right column with stats, starter upgrades, ability activation, and event affordances from PLAN-03 while preserving the left/center layout from PLAN-02. The panel should refresh from the shared snapshot, trigger purchases/abilities through system calls, and surface the animation-speed progression clearly so the player feels the reward loop.</action>
  <verify>
    <automated>godot --headless --path . -s res://tests/run_end_to_end_checks.gd</automated>
  </verify>
  <done>The entire main screen exposes toss, history, stats, upgrades, and starter progression controls in one readable scene.</done>
</task>

<task type="auto">
  <name>Task 3: Deliver the ending flow and end-to-end slice verification</name>
  <files>scenes/ui/EndingOverlay.tscn, scripts/ui/EndingOverlay.gd, tests/run_end_to_end_checks.gd, scripts/ui/GameScreen.gd</files>
  <action>When the tenth consecutive heads is reached, trigger a narrative ending overlay per D-05, save the completed state, and lock the slot from further play. Add an end-to-end headless runner that uses deterministic state setup or dependency injection to prove save selection, gameplay wiring, completion, and locked-save behavior work together.</action>
  <verify>
    <automated>godot --headless --path . -s res://tests/run_end_to_end_checks.gd</automated>
  </verify>
  <done>Winning the game produces a narrative ending, persists completion, and prevents continued play on the finished save while the automated slice runner passes.</done>
</task>

</tasks>

<verification>
Run the end-to-end script after wiring is complete. It should cover slot selection, gameplay scene startup, purchase visibility, victory handling, save persistence, and post-win lock enforcement.
</verification>

<success_criteria>
- The game boots through save selection into a single-screen playable run.
- The right column exposes progression without leaving the main scene.
- Victory ends with narrative weight and permanently locks the completed save.
</success_criteria>

<output>
After completion, summarize the shipped vertical slice and list any deliberately deferred content expansions for future phases.
</output>
