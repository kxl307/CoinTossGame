extends SceneTree

## Headless core verification runner.
## Run: godot --headless --path . -s res://tests/run_core_checks.gd

var _pass_count: int = 0
var _fail_count: int = 0
var _errors: Array[String] = []

func _init() -> void:
	print("\n=== Core Contract Checks ===\n")

	_test_fresh_run_defaults()
	_test_heads_increments()
	_test_tails_resets_streak()
	_test_win_at_ten_heads()
	_test_toss_blocked_after_win()
	_test_best_streak_preserved()
	_test_snapshot_contains_modifiers()
	_test_history_events_recorded()

	print("\n--- Results: %d passed, %d failed ---" % [_pass_count, _fail_count])
	if _fail_count > 0:
		for e in _errors:
			print("  FAIL: %s" % e)
		quit(1)
	else:
		print("All checks passed.")
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

# --- Test 1: Fresh run defaults ---
func _test_fresh_run_defaults() -> void:
	print("Test 1: Fresh run defaults")
	var rs := _make_run_state()
	rs.start_new_run("test_slot")

	_assert(rs.current_streak == 0, "streak starts at 0")
	_assert(rs.money == 0, "money starts at 0")
	_assert(rs.toss_count == 0, "toss count starts at 0")
	_assert(rs.is_completed == false, "not completed")
	_assert(rs.is_locked == false, "not locked")

	var snap := rs.current_snapshot()
	_assert(absf(snap.effective_head_chance - 0.10) < 0.001, "base head chance is 10%")
	rs.free()

# --- Test 2: Heads increments streak, money, history ---
func _test_heads_increments() -> void:
	print("Test 2: Heads outcome")
	var rs := _make_run_state()
	rs.start_new_run("test_slot")

	# Force heads with seed_override 0.0 (below 10% threshold)
	var outcome := rs.apply_toss(0.0)

	_assert(outcome != null, "outcome returned")
	_assert(outcome.rolled_heads == true, "rolled heads")
	_assert(rs.current_streak == 1, "streak incremented to 1")
	_assert(rs.toss_count == 1, "toss count is 1")
	_assert(rs.money == outcome.payout, "money equals payout")
	_assert(outcome.payout > 0, "payout is positive")
	_assert(outcome.history_entries.size() > 0, "history entry created")
	rs.free()

# --- Test 3: Tails resets streak, preserves best ---
func _test_tails_resets_streak() -> void:
	print("Test 3: Tails resets streak")
	var rs := _make_run_state()
	rs.start_new_run("test_slot")

	# Force 3 heads then 1 tails
	rs.apply_toss(0.0)
	rs.apply_toss(0.0)
	rs.apply_toss(0.0)
	_assert(rs.current_streak == 3, "streak is 3 after 3 heads")

	# Force tails with seed_override 0.99 (above 10% threshold)
	rs.apply_toss(0.99)
	_assert(rs.current_streak == 0, "streak reset to 0 on tails")
	_assert(rs.best_streak == 3, "best streak preserved at 3")
	rs.free()

# --- Test 4: Win condition at 10 consecutive heads ---
func _test_win_at_ten_heads() -> void:
	print("Test 4: Win at 10 consecutive heads")
	var rs := _make_run_state()
	rs.start_new_run("test_slot")

	for i in range(10):
		var outcome := rs.apply_toss(0.0)
		if i < 9:
			_assert(outcome.triggered_win == false, "not won at streak %d" % (i + 1))

	_assert(rs.is_completed == true, "run is completed")
	_assert(rs.is_locked == true, "run is locked")
	_assert(rs.current_streak == 10, "final streak is 10")
	rs.free()

# --- Test 5: Input blocked after win ---
func _test_toss_blocked_after_win() -> void:
	print("Test 5: Input blocked after win")
	var rs := _make_run_state()
	rs.start_new_run("test_slot")

	for i in range(10):
		rs.apply_toss(0.0)

	_assert(rs.can_accept_input() == false, "cannot accept input")
	var result := rs.apply_toss(0.0)
	_assert(result == null, "toss returns null when locked")
	rs.free()

# --- Test 6: Best streak survives tails ---
func _test_best_streak_preserved() -> void:
	print("Test 6: Best streak preserved through tails")
	var rs := _make_run_state()
	rs.start_new_run("test_slot")

	rs.apply_toss(0.0)
	rs.apply_toss(0.0)
	rs.apply_toss(0.0)
	rs.apply_toss(0.0)
	rs.apply_toss(0.0)  # streak = 5
	rs.apply_toss(0.99)  # tails
	_assert(rs.best_streak == 5, "best streak is 5")

	rs.apply_toss(0.0)
	rs.apply_toss(0.0)  # streak = 2
	_assert(rs.best_streak == 5, "best streak still 5 after shorter streak")
	rs.free()

# --- Test 7: Snapshot contains modifier fields ---
func _test_snapshot_contains_modifiers() -> void:
	print("Test 7: Snapshot has modifier fields")
	var rs := _make_run_state()
	rs.start_new_run("test_slot")

	var snap := rs.current_snapshot()
	_assert(snap.has("effective_head_chance"), "has effective_head_chance")
	_assert(snap.has("effective_payout"), "has effective_payout")
	_assert(snap.has("streak_save_chance"), "has streak_save_chance")
	_assert(snap.has("animation_speed"), "has animation_speed")
	_assert(snap.has("owned_upgrades"), "has owned_upgrades")
	rs.free()

# --- Test 8: History events are HistoryEvent instances ---
func _test_history_events_recorded() -> void:
	print("Test 8: History events recorded")
	var rs := _make_run_state()
	rs.start_new_run("test_slot")

	_assert(rs.history.size() == 1, "start event recorded")
	_assert(rs.history[0] is HistoryEvent, "entry is HistoryEvent")
	_assert(rs.history[0].type == HistoryEvent.Type.RUN_STARTED, "type is RUN_STARTED")

	rs.apply_toss(0.0)
	_assert(rs.history.size() == 2, "toss event appended")
	rs.free()
