---
phase: 01-godot-vertical-slice
plan: 03
type: execute
wave: 2
depends_on: [01]
files_modified:
  - scripts/systems/UpgradeCatalog.gd
  - scripts/systems/AbilitySystem.gd
  - scripts/systems/EventSystem.gd
  - scripts/systems/MetaProgression.gd
  - scripts/save/SaveRepository.gd
  - scripts/save/SaveSlot.gd
  - data/upgrades/base_upgrade_catalog.tres
  - tests/run_progression_checks.gd
autonomous: true
requirements: [RG-03, RG-06, RG-07, RG-08]
must_haves:
  truths:
    - "The run has at least one concrete upgrade path that improves odds and one progression effect that speeds coin animation."
    - "Starter ability, event, and meta-progression systems exist as separate seams instead of being hard-coded into RunState."
    - "Save data persists between sessions and records whether a slot is completed and therefore locked from further play."
  artifacts:
    - path: "scripts/systems/UpgradeCatalog.gd"
      provides: "Upgrade definitions and purchase rules"
    - path: "scripts/systems/AbilitySystem.gd"
      provides: "Active ability seam for v1 abilities"
    - path: "scripts/save/SaveRepository.gd"
      provides: "Persistent slot save/load and completion lock handling"
    - path: "tests/run_progression_checks.gd"
      provides: "Headless progression and save verification"
  key_links:
    - from: "scripts/systems/UpgradeCatalog.gd"
      to: "scripts/core/RunState.gd"
      via: "effective odds and animation modifier application"
      pattern: "head_chance|animation"
    - from: "scripts/save/SaveRepository.gd"
      to: "scripts/save/SaveSlot.gd"
      via: "serialize and restore slot payloads"
      pattern: "save|load"
---

<objective>
Create the expandable progression and persistence systems that turn the coin toss loop into a progression game instead of a one-note prototype.

Purpose: Meet the user's request for long-term depth while scoping v1 to a polished vertical slice with starter content and hard save-lock rules.
Output: Upgrade, ability, event, meta-progression, and save systems plus headless checks for progression and locked-save behavior.
</objective>

<execution_context>
Keep each progression pillar in its own script boundary per D-03. Implement only starter content for v1, but build data structures so more trees, abilities, events, and meta rewards can be added without editing the core toss resolver.
</execution_context>

<context>
@ProjectGoal.md
@ROADMAP.md
@DISCUSSION-SUMMARY.md
@PLAN-01.md

<interfaces>
Extend, but do not replace, the PLAN-01 contracts:

```gdscript
func effective_head_chance(snapshot: Dictionary) -> float
func effective_animation_speed(snapshot: Dictionary) -> float
func can_purchase(upgrade_id: String, snapshot: Dictionary) -> bool
func save_slot(slot_id: String, payload: Dictionary) -> void
func load_slot(slot_id: String) -> Dictionary
func mark_slot_completed(slot_id: String, ending_id: String) -> void
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Build the starter upgrade and ability systems</name>
  <files>scripts/systems/UpgradeCatalog.gd, scripts/systems/AbilitySystem.gd, data/upgrades/base_upgrade_catalog.tres, tests/run_progression_checks.gd</files>
  <behavior>
    - Test 1: A valid purchase spends money and permanently updates the run's owned progression.
    - Test 2: One upgrade path increases effective head chance above the 10% base.
    - Test 3: One progression effect increases coin animation speed per D-04.
    - Test 4: The starter active ability has a cooldown/limited-use model rather than free infinite activation.
  </behavior>
  <action>Implement one concrete starter tree and one active ability for v1 while leaving room for more trees later per D-03. Use data-driven definitions where practical, and keep purchase validation, pricing, and modifier application outside UI code.</action>
  <verify>
    <automated>godot --headless --path . -s res://tests/run_progression_checks.gd</automated>
  </verify>
  <done>Purchases and the starter ability are fully represented in code, affect run modifiers correctly, and are testable without the main scene.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Create starter event and meta-progression seams</name>
  <files>scripts/systems/EventSystem.gd, scripts/systems/MetaProgression.gd, tests/run_progression_checks.gd</files>
  <behavior>
    - Test 1: At least one random event can offer a risk/reward choice and log the resulting outcome.
    - Test 2: Meta-progression data persists independently from an individual run snapshot.
    - Test 3: Event and meta systems can be queried from other scripts without importing UI scenes.
  </behavior>
  <action>Implement a minimal but real event system and meta-progression store so v1 includes all four complexity pillars in starter form. Keep the content footprint small: one event path and one meta unlock/stat is enough, but the seams must be explicit and reusable.</action>
  <verify>
    <automated>godot --headless --path . -s res://tests/run_progression_checks.gd</automated>
  </verify>
  <done>The codebase contains separate event and meta systems with starter content and no hard dependency on scene scripts.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Implement persistent save slots and post-win lock rules</name>
  <files>scripts/save/SaveRepository.gd, scripts/save/SaveSlot.gd, tests/run_progression_checks.gd</files>
  <behavior>
    - Test 1: A run snapshot saves and reloads across sessions.
    - Test 2: A completed slot records its ending state and rejects further play input.
    - Test 3: Loading one slot does not overwrite another slot's run/meta data.
  </behavior>
  <action>Create file-backed save slot storage for v1 per D-06 and D-07. Support multiple save slots even though the exact UX is still open, because that is the safest way to honor the completed-save lock without trapping the player in a dead profile.</action>
  <verify>
    <automated>godot --headless --path . -s res://tests/run_progression_checks.gd</automated>
  </verify>
  <done>Save/load works, completion state is persisted, and completed slots are marked locked rather than silently overwritten.</done>
</task>

</tasks>

<verification>
Run the progression check script and confirm it covers purchases, modifiers, starter events, meta state, save persistence, and completed-slot locking.
</verification>

<success_criteria>
- The vertical slice has real starter progression beyond raw tosses.
- All four long-term complexity pillars exist as separate systems.
- Save files persist and completed runs are locked from continued play.
</success_criteria>

<output>
After completion, document the concrete starter content shipped for upgrades, ability, event, and meta progression so future plans can expand from it.
</output>
