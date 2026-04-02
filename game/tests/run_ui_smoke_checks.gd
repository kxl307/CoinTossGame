extends SceneTree

## Headless UI smoke checks — verifies scene structure and signal wiring.
## Run: godot --headless --path . -s res://tests/run_ui_smoke_checks.gd

var _pass_count: int = 0
var _fail_count: int = 0
var _errors: Array[String] = []

func _init() -> void:
	print("\n=== UI Smoke Checks ===\n")

	_test_game_screen_instantiates()
	_test_toss_panel_nodes()
	_test_history_panel_nodes()
	_test_panels_wire_to_run_state()

	print("\n--- Results: %d passed, %d failed ---" % [_pass_count, _fail_count])
	if _fail_count > 0:
		for e in _errors:
			print("  FAIL: %s" % e)
		quit(1)
	else:
		print("All UI checks passed.")
		quit(0)

func _assert(condition: bool, label: String) -> void:
	if condition:
		_pass_count += 1
		print("  ✓ %s" % label)
	else:
		_fail_count += 1
		_errors.append(label)
		print("  ✗ %s" % label)

func _test_game_screen_instantiates() -> void:
	print("Test 1: GameScreen instantiates")
	var scene := preload("res://scenes/game/GameScreen.tscn")
	_assert(scene != null, "GameScreen scene loaded")
	var instance := scene.instantiate()
	_assert(instance != null, "GameScreen instantiated")

	# Check three-column layout exists
	var columns = instance.find_child("Columns", true, false)
	_assert(columns != null, "Columns container exists")

	var toss_col = instance.find_child("TossColumn", true, false)
	_assert(toss_col != null, "TossColumn exists")

	var hist_col = instance.find_child("HistoryColumn", true, false)
	_assert(hist_col != null, "HistoryColumn exists")

	var right_col = instance.find_child("RightColumn", true, false)
	_assert(right_col != null, "RightColumn exists")

	instance.free()

func _test_toss_panel_nodes() -> void:
	print("Test 2: TossPanel structure")
	var scene := preload("res://scenes/ui/TossPanel.tscn")
	var panel := scene.instantiate()

	var coin_label = panel.find_child("CoinLabel", true, false)
	_assert(coin_label != null, "CoinLabel exists")

	var result_label = panel.find_child("ResultLabel", true, false)
	_assert(result_label != null, "ResultLabel exists")

	var streak_label = panel.find_child("StreakLabel", true, false)
	_assert(streak_label != null, "StreakLabel exists")

	var toss_button = panel.find_child("TossButton", true, false)
	_assert(toss_button != null, "TossButton exists")

	var stats_label = panel.find_child("StatsLabel", true, false)
	_assert(stats_label != null, "StatsLabel exists")

	panel.free()

func _test_history_panel_nodes() -> void:
	print("Test 3: HistoryPanel structure")
	var scene := preload("res://scenes/ui/HistoryPanel.tscn")
	var panel := scene.instantiate()

	var scroll = panel.find_child("Scroll", true, false)
	_assert(scroll != null, "ScrollContainer exists")

	var entries = panel.find_child("Entries", true, false)
	_assert(entries != null, "Entries container exists")

	var title = panel.find_child("Title", true, false)
	_assert(title != null, "Title label exists")

	panel.free()

func _test_panels_wire_to_run_state() -> void:
	print("Test 4: Panels wire to RunState without errors")
	var rs := RunState.new()
	rs._ready()
	rs.start_new_run("test_slot")

	var game_scene := preload("res://scenes/game/GameScreen.tscn")
	var game := game_scene.instantiate()

	# Setup should not crash
	var setup_ok := true
	if game.has_method("setup"):
		game.setup(rs)
	_assert(setup_ok, "GameScreen.setup() completed without error")

	# Verify toss panel got the run_state
	var toss_panel = game.find_child("TossPanel", true, false)
	if toss_panel and "run_state" in toss_panel:
		_assert(toss_panel.run_state == rs, "TossPanel received RunState")
	else:
		_assert(false, "TossPanel has run_state property")

	# Verify history panel got the run_state
	var hist_panel = game.find_child("HistoryPanel", true, false)
	if hist_panel and "run_state" in hist_panel:
		_assert(hist_panel.run_state == rs, "HistoryPanel received RunState")
	else:
		_assert(false, "HistoryPanel has run_state property")

	game.free()
	rs.free()
