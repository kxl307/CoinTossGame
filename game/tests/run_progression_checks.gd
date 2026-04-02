extends SceneTree

## Headless progression and save verification.
## Run: godot --headless --path . -s res://tests/run_progression_checks.gd

var _pass_count: int = 0
var _fail_count: int = 0
var _errors: Array[String] = []

func _init() -> void:
	print("\n=== Progression & Save Checks ===\n")

	_test_purchase_spends_money()
	_test_head_chance_upgrade()
	_test_animation_speed_upgrade()
	_test_ability_cooldown()
	_test_event_risk_reward()
	_test_meta_persistence()
	_test_save_and_reload()
	_test_completed_slot_locked()
	_test_slot_isolation()

	print("\n--- Results: %d passed, %d failed ---" % [_pass_count, _fail_count])
	if _fail_count > 0:
		for e in _errors:
			print("  FAIL: %s" % e)
		quit(1)
	else:
		print("All progression checks passed.")
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

# --- Test 1: Purchase spends money and updates progression ---
func _test_purchase_spends_money() -> void:
	print("Test 1: Purchase spends money")
	var catalog := UpgradeCatalog.new()
	var rs := _make_run_state()
	rs.start_new_run("test")
	rs.add_money(200)

	var snap := rs.current_snapshot()
	var cost := catalog.get_cost("lucky_edge", 0)
	_assert(catalog.can_purchase("lucky_edge", snap), "can afford lucky_edge")

	rs.spend_money(cost)
	rs.set_upgrade_level("lucky_edge", 1)
	snap = rs.current_snapshot()

	_assert(snap.money == 200 - cost, "money reduced by cost")
	_assert(snap.owned_upgrades.get("lucky_edge", 0) == 1, "upgrade level is 1")
	rs.free()

# --- Test 2: Head chance upgrade increases above 10% ---
func _test_head_chance_upgrade() -> void:
	print("Test 2: Head chance increases with upgrade")
	var catalog := UpgradeCatalog.new()
	var snap := {"owned_upgrades": {"lucky_edge": 5}, "money": 0}
	var chance := catalog.effective_head_chance(snap)
	_assert(chance > 0.10, "chance above base 10%")
	_assert(absf(chance - 0.15) < 0.001, "chance is 15% with 5 levels of lucky_edge")

# --- Test 3: Animation speed upgrade ---
func _test_animation_speed_upgrade() -> void:
	print("Test 3: Animation speed improves with upgrade")
	var catalog := UpgradeCatalog.new()
	var snap_base := {"owned_upgrades": {}, "money": 0}
	var snap_fast := {"owned_upgrades": {"swift_hand": 3}, "money": 0}

	var speed_base := catalog.effective_animation_speed(snap_base)
	var speed_fast := catalog.effective_animation_speed(snap_fast)

	_assert(absf(speed_base - 1.0) < 0.001, "base speed is 1.0")
	_assert(speed_fast < speed_base, "upgraded speed is faster (lower multiplier)")
	_assert(speed_fast > 0.0, "speed doesn't go negative")

# --- Test 4: Ability has limited uses ---
func _test_ability_cooldown() -> void:
	print("Test 4: Ability has limited uses")
	var ability_sys := AbilitySystem.new()
	var uses := ability_sys.unlock_ability("lucky_flip")
	_assert(uses == 3, "lucky_flip starts with 3 uses")

	var owned := {"lucky_flip": uses}
	_assert(ability_sys.can_activate("lucky_flip", owned), "can activate with uses left")

	var result := ability_sys.activate("lucky_flip", owned)
	_assert(result.activated == true, "activation succeeded")
	_assert(result.uses_remaining == 2, "2 uses remaining")

	# Use remaining
	owned["lucky_flip"] = 0
	_assert(not ability_sys.can_activate("lucky_flip", owned), "cannot activate with 0 uses")

# --- Test 5: Event offers risk/reward choice ---
func _test_event_risk_reward() -> void:
	print("Test 5: Event risk/reward choice")
	var event_sys := EventSystem.new()
	var events := event_sys.get_all()
	_assert(events.size() > 0, "at least one event exists")

	var evt := events[0]
	_assert(evt.has("choices"), "event has choices")
	_assert(evt.choices.size() >= 2, "event has at least 2 choices")

	var snap := {"money": 100, "toss_count": 20}
	var result := event_sys.resolve_choice(evt, 0, snap)
	_assert(result.has("effect"), "result has effect")
	_assert(result.cost_applied > 0, "accepting costs money")

	var refuse := event_sys.resolve_choice(evt, 1, snap)
	_assert(refuse.effect == "none", "refusing has no effect")

# --- Test 6: Meta-progression persists independently ---
func _test_meta_persistence() -> void:
	print("Test 6: Meta-progression data")
	var meta := MetaProgression.new()
	meta.record_run_end({"toss_count": 50, "total_money_earned": 200, "best_streak": 7}, false)
	_assert(meta.total_runs == 1, "run recorded")
	_assert(meta.total_wins == 0, "no win recorded")
	_assert(meta.total_tosses_all_time == 50, "tosses accumulated")

	meta.record_run_end({"toss_count": 30, "total_money_earned": 100, "best_streak": 10}, true)
	_assert(meta.total_runs == 2, "second run recorded")
	_assert(meta.total_wins == 1, "win recorded")
	_assert(meta.best_streak_all_time == 10, "best streak updated")

	# Serialization round-trip
	var data := meta.to_dict()
	var meta2 := MetaProgression.new()
	meta2.from_dict(data)
	_assert(meta2.total_runs == 2, "deserialized runs match")
	_assert(meta2.total_wins == 1, "deserialized wins match")

# --- Test 7: Save and reload slot ---
func _test_save_and_reload() -> void:
	print("Test 7: Save and reload slot")
	var repo := SaveRepository.new()

	# Clean up any previous test data
	repo.delete_slot("test_save_1")

	var payload := {
		"run_data": {"toss_count": 42, "money": 300, "current_streak": 5},
		"is_completed": false,
		"ending_id": "",
		"created_at": "2026-01-01T00:00:00",
	}
	repo.save_slot("test_save_1", payload)

	var loaded := repo.load_slot("test_save_1")
	_assert(not loaded.is_empty(), "slot loaded successfully")
	_assert(loaded.get("run_data", {}).get("toss_count", 0) == 42, "toss_count persisted")
	_assert(loaded.get("run_data", {}).get("money", 0) == 300, "money persisted")
	_assert(loaded.get("is_completed", true) == false, "not completed")

	# Cleanup
	repo.delete_slot("test_save_1")

# --- Test 8: Completed slot is locked ---
func _test_completed_slot_locked() -> void:
	print("Test 8: Completed slot locked")
	var repo := SaveRepository.new()
	repo.delete_slot("test_locked")

	repo.save_slot("test_locked", {
		"run_data": {"toss_count": 100},
		"is_completed": false,
		"ending_id": "",
		"created_at": "2026-01-01",
	})
	_assert(not repo.is_slot_completed("test_locked"), "slot not completed initially")

	repo.mark_slot_completed("test_locked", "default_ending")
	_assert(repo.is_slot_completed("test_locked"), "slot marked completed")

	var data := repo.load_slot("test_locked")
	_assert(data.get("is_completed", false) == true, "completion persisted")
	_assert(data.get("ending_id", "") == "default_ending", "ending_id persisted")

	repo.delete_slot("test_locked")

# --- Test 9: Slot isolation ---
func _test_slot_isolation() -> void:
	print("Test 9: Slots are isolated")
	var repo := SaveRepository.new()
	repo.delete_slot("iso_a")
	repo.delete_slot("iso_b")

	repo.save_slot("iso_a", {
		"run_data": {"money": 100},
		"is_completed": false,
	})
	repo.save_slot("iso_b", {
		"run_data": {"money": 999},
		"is_completed": false,
	})

	var a := repo.load_slot("iso_a")
	var b := repo.load_slot("iso_b")
	_assert(a.get("run_data", {}).get("money", 0) == 100, "slot A has 100 money")
	_assert(b.get("run_data", {}).get("money", 0) == 999, "slot B has 999 money")

	repo.mark_slot_completed("iso_a", "end_a")
	_assert(repo.is_slot_completed("iso_a"), "slot A completed")
	_assert(not repo.is_slot_completed("iso_b"), "slot B still active")

	repo.delete_slot("iso_a")
	repo.delete_slot("iso_b")
