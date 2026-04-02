extends SceneTree

## End-to-end slice verification.
## Run: godot --headless --path . -s res://tests/run_end_to_end_checks.gd

var _pass_count: int = 0
var _fail_count: int = 0
var _errors: Array[String] = []

func _init() -> void:
	print("\n=== End-to-End Slice Checks ===\n")

	_test_save_select_instantiates()
	_test_game_screen_has_all_panels()
	_test_ending_overlay_exists()
	_test_right_panel_wires_upgrades()
	_test_full_gameplay_loop()
	_test_save_and_lock_flow()
	_test_completed_slot_rejected()

	print("\n--- Results: %d passed, %d failed ---" % [_pass_count, _fail_count])
	if _fail_count > 0:
		for e in _errors:
			print("  FAIL: %s" % e)
		quit(1)
	else:
		print("All end-to-end checks passed.")
		quit(0)

func _assert(condition: bool, label: String) -> void:
	if condition:
		_pass_count += 1
		print("  ✓ %s" % label)
	else:
		_fail_count += 1
		_errors.append(label)
		print("  ✗ %s" % label)

func _make_run_state() -> RunState:
	var rs := RunState.new()
	rs._ready()
	return rs

# --- Test 1: Save select scene loads ---
func _test_save_select_instantiates() -> void:
	print("Test 1: SaveSelect instantiates")
	var scene := preload("res://scenes/ui/SaveSelect.tscn")
	_assert(scene != null, "SaveSelect scene loaded")
	var instance := scene.instantiate()
	_assert(instance != null, "SaveSelect instantiated")

	var slots_container = instance.find_child("SlotsContainer", true, false)
	_assert(slots_container != null, "SlotsContainer exists")

	var new_btn = instance.find_child("NewGameBtn", true, false)
	_assert(new_btn != null, "NewGameBtn exists")

	instance.free()

# --- Test 2: Game screen has all three panels + ending ---
func _test_game_screen_has_all_panels() -> void:
	print("Test 2: GameScreen has all panels")
	var scene := preload("res://scenes/game/GameScreen.tscn")
	var game := scene.instantiate()

	var tp = game.find_child("TossPanel", true, false)
	_assert(tp != null, "TossPanel exists")

	var hp = game.find_child("HistoryPanel", true, false)
	_assert(hp != null, "HistoryPanel exists")

	var rp = game.find_child("RightProgressionPanel", true, false)
	_assert(rp != null, "RightProgressionPanel exists")

	var eo = game.find_child("EndingOverlay", true, false)
	_assert(eo != null, "EndingOverlay exists")

	game.free()

# --- Test 3: Ending overlay has narrative text ---
func _test_ending_overlay_exists() -> void:
	print("Test 3: EndingOverlay structure")
	var scene := preload("res://scenes/ui/EndingOverlay.tscn")
	var overlay := scene.instantiate()

	var narrative = overlay.find_child("NarrativeText", true, false)
	_assert(narrative != null, "NarrativeText exists")

	var close_btn = overlay.find_child("CloseBtn", true, false)
	_assert(close_btn != null, "CloseBtn exists")

	var title = overlay.find_child("Title", true, false)
	_assert(title != null, "Title label exists")

	overlay.free()

# --- Test 4: Right panel wires to upgrades ---
func _test_right_panel_wires_upgrades() -> void:
	print("Test 4: RightPanel wires upgrades")
	var rs := _make_run_state()
	rs.start_new_run("test")
	rs.add_money(1000)

	var catalog := UpgradeCatalog.new()
	var ability_sys := AbilitySystem.new()

	var scene := preload("res://scenes/ui/RightProgressionPanel.tscn")
	var panel := scene.instantiate()

	if panel.has_method("setup"):
		panel.setup(rs, catalog, ability_sys)
	_assert("run_state" in panel and panel.run_state == rs, "panel received RunState")

	var upgrades_list = panel.find_child("UpgradesList", true, false)
	_assert(upgrades_list != null, "UpgradesList exists")
	_assert(upgrades_list.get_child_count() == catalog.get_all().size(), "all upgrade buttons created")

	panel.free()
	rs.free()

# --- Test 5: Full gameplay loop to win ---
func _test_full_gameplay_loop() -> void:
	print("Test 5: Full gameplay loop")
	var rs := _make_run_state()
	rs.start_new_run("e2e_test")

	# Play until win
	for i in range(10):
		var outcome := rs.apply_toss(0.0)  # Force heads
		_assert(outcome != null, "toss %d succeeded" % (i + 1))

	_assert(rs.is_completed, "run completed after 10 heads")
	_assert(rs.is_locked, "run is locked")
	_assert(rs.current_streak == 10, "final streak is 10")
	_assert(rs.money > 0, "player earned money")
	_assert(rs.ending_id == "default_ending", "ending_id assigned")
	rs.free()

# --- Test 6: Save, complete, and lock flow ---
func _test_save_and_lock_flow() -> void:
	print("Test 6: Save and lock flow")
	var repo := SaveRepository.new()
	var rs := _make_run_state()
	rs.start_new_run("e2e_lock_test")

	# Save mid-run
	repo.save_slot("e2e_lock_test", {
		"run_data": rs.to_dict(),
		"is_completed": false,
		"ending_id": "",
		"created_at": "test",
	})
	_assert(not repo.is_slot_completed("e2e_lock_test"), "slot not completed mid-run")

	# Win
	for i in range(10):
		rs.apply_toss(0.0)

	# Save completed state
	repo.save_slot("e2e_lock_test", {
		"run_data": rs.to_dict(),
		"is_completed": true,
		"ending_id": rs.ending_id,
		"created_at": "test",
	})
	repo.mark_slot_completed("e2e_lock_test", rs.ending_id)

	_assert(repo.is_slot_completed("e2e_lock_test"), "slot is completed after win")

	# Verify locked data persists
	var loaded := repo.load_slot("e2e_lock_test")
	_assert(loaded.get("is_completed", false) == true, "completion state persisted")
	_assert(loaded.get("ending_id", "") == "default_ending", "ending persisted")

	repo.delete_slot("e2e_lock_test")
	rs.free()

# --- Test 7: Completed slot cannot be played ---
func _test_completed_slot_rejected() -> void:
	print("Test 7: Completed slot rejected")
	var repo := SaveRepository.new()
	repo.delete_slot("e2e_reject")

	repo.save_slot("e2e_reject", {
		"run_data": {"toss_count": 100, "is_completed": true},
		"is_completed": true,
		"ending_id": "default_ending",
		"created_at": "test",
	})

	_assert(repo.is_slot_completed("e2e_reject"), "slot marked completed")

	# A RunState loaded from completed data should be locked
	var rs := _make_run_state()
	var data := repo.load_slot("e2e_reject")
	var run_data: Dictionary = data.get("run_data", {})
	run_data["is_completed"] = true
	run_data["is_locked"] = true
	rs.from_dict(run_data)

	_assert(not rs.can_accept_input(), "cannot accept input on completed run")
	var result := rs.apply_toss(0.0)
	_assert(result == null, "toss rejected on completed run")

	repo.delete_slot("e2e_reject")
	rs.free()
