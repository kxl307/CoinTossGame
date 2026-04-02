class_name RunState
extends Node

## Authoritative runtime state for a single game run.
## All mutations go through this class; UI reads snapshots.

signal run_changed(snapshot: Dictionary)
signal history_recorded(entry)  # HistoryEvent
signal save_lock_changed(is_locked: bool)

const WIN_STREAK := 10

var slot_id: String = ""
var toss_count: int = 0
var current_streak: int = 0
var best_streak: int = 0
var money: int = 0
var total_money_earned: int = 0
var is_completed: bool = false
var is_locked: bool = false
var history: Array = []  # Array of HistoryEvent
var owned_upgrades: Dictionary = {}  # { upgrade_id: level }
var owned_abilities: Dictionary = {}  # { ability_id: uses_remaining }
var ending_id: String = ""
var meta_stats: Dictionary = {}

var _resolver: TossResolver

func _ready() -> void:
	_resolver = TossResolver.new()

func start_new_run(p_slot_id: String) -> void:
	slot_id = p_slot_id
	toss_count = 0
	current_streak = 0
	best_streak = 0
	money = 0
	total_money_earned = 0
	is_completed = false
	is_locked = false
	history.clear()
	owned_upgrades.clear()
	owned_abilities.clear()
	ending_id = ""
	meta_stats = {}
	var entry := HistoryEvent.new(
		HistoryEvent.Type.RUN_STARTED,
		"— A new ritual begins —",
		{"slot_id": p_slot_id}
	)
	_record_history(entry)
	run_changed.emit(current_snapshot())

func apply_toss(seed_override = null) -> TossOutcome:
	if not can_accept_input():
		return null
	var snapshot := current_snapshot()
	var outcome := _resolver.resolve(snapshot, seed_override)

	toss_count += 1
	current_streak = outcome.streak_after
	if current_streak > best_streak:
		best_streak = current_streak
	money += outcome.payout
	total_money_earned += outcome.payout

	for entry in outcome.history_entries:
		_record_history(entry)

	if outcome.triggered_win:
		is_completed = true
		is_locked = true
		ending_id = "default_ending"
		save_lock_changed.emit(true)

	run_changed.emit(current_snapshot())
	return outcome

func can_accept_input() -> bool:
	return not is_completed and not is_locked

func current_snapshot() -> Dictionary:
	return {
		"slot_id": slot_id,
		"toss_count": toss_count,
		"current_streak": current_streak,
		"best_streak": best_streak,
		"money": money,
		"total_money_earned": total_money_earned,
		"is_completed": is_completed,
		"is_locked": is_locked,
		"owned_upgrades": owned_upgrades.duplicate(),
		"owned_abilities": owned_abilities.duplicate(),
		"ending_id": ending_id,
		"effective_head_chance": _calc_effective_head_chance(),
		"effective_payout": _calc_effective_payout(),
		"streak_save_chance": _calc_streak_save_chance(),
		"animation_speed": _calc_animation_speed(),
	}

func spend_money(amount: int) -> bool:
	if amount <= 0 or amount > money:
		return false
	money -= amount
	run_changed.emit(current_snapshot())
	return true

func add_money(amount: int) -> void:
	money += amount
	total_money_earned += amount
	run_changed.emit(current_snapshot())

func set_upgrade_level(upgrade_id: String, level: int) -> void:
	owned_upgrades[upgrade_id] = level
	run_changed.emit(current_snapshot())

func set_ability(ability_id: String, uses: int) -> void:
	owned_abilities[ability_id] = uses
	run_changed.emit(current_snapshot())

func to_dict() -> Dictionary:
	var hist_dicts: Array = []
	for entry in history:
		if entry is HistoryEvent:
			hist_dicts.append(entry.to_dict())
	return {
		"slot_id": slot_id,
		"toss_count": toss_count,
		"current_streak": current_streak,
		"best_streak": best_streak,
		"money": money,
		"total_money_earned": total_money_earned,
		"is_completed": is_completed,
		"is_locked": is_locked,
		"owned_upgrades": owned_upgrades,
		"owned_abilities": owned_abilities,
		"ending_id": ending_id,
		"meta_stats": meta_stats,
		"history": hist_dicts,
	}

func from_dict(data: Dictionary) -> void:
	slot_id = data.get("slot_id", "")
	toss_count = data.get("toss_count", 0)
	current_streak = data.get("current_streak", 0)
	best_streak = data.get("best_streak", 0)
	money = data.get("money", 0)
	total_money_earned = data.get("total_money_earned", 0)
	is_completed = data.get("is_completed", false)
	is_locked = data.get("is_locked", false)
	owned_upgrades = data.get("owned_upgrades", {})
	owned_abilities = data.get("owned_abilities", {})
	ending_id = data.get("ending_id", "")
	meta_stats = data.get("meta_stats", {})
	history.clear()
	var hist_data = data.get("history", [])
	for h in hist_data:
		if h is Dictionary:
			history.append(HistoryEvent.from_dict(h))
	run_changed.emit(current_snapshot())

# --- Private modifier calculations ---

func _calc_effective_head_chance() -> float:
	var chance: float = TossResolver.BASE_HEAD_CHANCE
	# Lucky Edge: +1% per level
	chance += 0.01 * owned_upgrades.get("lucky_edge", 0)
	# Golden Weight: +2% per level
	chance += 0.02 * owned_upgrades.get("golden_weight", 0)
	return minf(chance, 0.95)

func _calc_effective_payout() -> int:
	var base: int = TossResolver.BASE_PAYOUT
	# Ritual Offering: +5 per level
	var bonus: int = 5 * int(owned_upgrades.get("ritual_offering", 0))
	# Double or Nothing: +100% per level
	var mult: float = 1.0 + 1.0 * owned_upgrades.get("double_or_nothing", 0)
	return int((base + bonus) * mult)

func _calc_streak_save_chance() -> float:
	# Streak Keeper: +10% per level, max 50%
	var chance: float = 0.10 * owned_upgrades.get("streak_keeper", 0)
	return minf(chance, 0.50)

func _calc_animation_speed() -> float:
	# Swift Hand: each level reduces anim time by 8%, min 20% of original
	var mult: float = 1.0 - 0.08 * owned_upgrades.get("swift_hand", 0)
	return maxf(mult, 0.2)

func _record_history(entry: HistoryEvent) -> void:
	history.append(entry)
	history_recorded.emit(entry)
