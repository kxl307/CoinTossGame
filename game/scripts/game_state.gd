extends Node

# Core game state — the single source of truth for the entire game.

signal state_changed
signal coin_tossed(result: bool, money_earned: int)
signal streak_updated(streak: int)
signal money_changed(amount: int)
signal upgrade_purchased(upgrade_id: String)
signal game_won
signal history_added(entry: String)

const WIN_STREAK := 10
const BASE_HEAD_CHANCE := 0.10
const BASE_REWARD := 10

var toss_count: int = 0
var current_streak: int = 0
var best_streak: int = 0
var money: int = 0
var total_money_earned: int = 0
var is_game_over: bool = false
var is_tossing: bool = false
var history: Array[String] = []

# Upgrades owned: { upgrade_id: level }
var owned_upgrades: Dictionary = {}

# Available upgrades definition
var upgrade_defs: Array[Dictionary] = [
	{
		"id": "lucky_edge",
		"name": "Lucky Edge",
		"description": "The coin remembers your touch.\n+1% head chance per level.",
		"base_cost": 50,
		"cost_scale": 1.8,
		"max_level": 15,
		"effect": "head_chance",
		"value": 0.01
	},
	{
		"id": "golden_weight",
		"name": "Golden Weight",
		"description": "Heavier coins fall face-up more often.\n+2% head chance per level.",
		"base_cost": 200,
		"cost_scale": 2.2,
		"max_level": 8,
		"effect": "head_chance",
		"value": 0.02
	},
	{
		"id": "ritual_offering",
		"name": "Ritual Offering",
		"description": "The dead gods notice your devotion.\n+5 coins per head.",
		"base_cost": 30,
		"cost_scale": 1.5,
		"max_level": 20,
		"effect": "reward_bonus",
		"value": 5
	},
	{
		"id": "streak_keeper",
		"name": "Streak Keeper",
		"description": "Echoes of past flips linger.\n10% chance to preserve streak on tails.",
		"base_cost": 150,
		"cost_scale": 2.5,
		"max_level": 5,
		"effect": "streak_save",
		"value": 0.10
	},
	{
		"id": "swift_hand",
		"name": "Swift Hand",
		"description": "Faster tosses, faster fate.\nReduces flip animation time.",
		"base_cost": 40,
		"cost_scale": 1.6,
		"max_level": 10,
		"effect": "speed",
		"value": 0.08
	},
	{
		"id": "double_or_nothing",
		"name": "Double or Nothing",
		"description": "Greed feeds the machine.\n+100% reward per level, but costs scale faster.",
		"base_cost": 300,
		"cost_scale": 3.0,
		"max_level": 5,
		"effect": "reward_mult",
		"value": 1.0
	},
]

func _ready() -> void:
	pass

func get_head_chance() -> float:
	var chance := BASE_HEAD_CHANCE
	for upgrade in upgrade_defs:
		if upgrade.effect == "head_chance":
			var level: int = owned_upgrades.get(upgrade.id, 0)
			chance += upgrade.value * level
	return minf(chance, 0.95)

func get_reward() -> int:
	var reward := BASE_REWARD
	var bonus := 0
	var mult := 1.0
	for upgrade in upgrade_defs:
		var level: int = owned_upgrades.get(upgrade.id, 0)
		if level == 0:
			continue
		if upgrade.effect == "reward_bonus":
			bonus += int(upgrade.value) * level
		elif upgrade.effect == "reward_mult":
			mult += upgrade.value * level
	return int((reward + bonus) * mult)

func get_streak_save_chance() -> float:
	var chance := 0.0
	for upgrade in upgrade_defs:
		if upgrade.effect == "streak_save":
			var level: int = owned_upgrades.get(upgrade.id, 0)
			chance += upgrade.value * level
	return minf(chance, 0.50)

func get_flip_speed_mult() -> float:
	var mult := 1.0
	for upgrade in upgrade_defs:
		if upgrade.effect == "speed":
			var level: int = owned_upgrades.get(upgrade.id, 0)
			mult -= upgrade.value * level
	return maxf(mult, 0.2)

func get_upgrade_cost(upgrade_id: String) -> int:
	for upgrade in upgrade_defs:
		if upgrade.id == upgrade_id:
			var level: int = owned_upgrades.get(upgrade_id, 0)
			return int(upgrade.base_cost * pow(upgrade.cost_scale, level))
	return 999999

func get_upgrade_level(upgrade_id: String) -> int:
	return owned_upgrades.get(upgrade_id, 0)

func get_upgrade_max(upgrade_id: String) -> int:
	for upgrade in upgrade_defs:
		if upgrade.id == upgrade_id:
			return upgrade.max_level
	return 0

func can_afford_upgrade(upgrade_id: String) -> bool:
	if is_game_over:
		return false
	var level := get_upgrade_level(upgrade_id)
	var max_level := get_upgrade_max(upgrade_id)
	if level >= max_level:
		return false
	return money >= get_upgrade_cost(upgrade_id)

func purchase_upgrade(upgrade_id: String) -> bool:
	if not can_afford_upgrade(upgrade_id):
		return false
	var cost := get_upgrade_cost(upgrade_id)
	money -= cost
	var old_level: int = owned_upgrades.get(upgrade_id, 0)
	owned_upgrades[upgrade_id] = old_level + 1
	var upgrade_name := ""
	for u in upgrade_defs:
		if u.id == upgrade_id:
			upgrade_name = u.name
			break
	add_history("☉ Acquired %s (Lv.%d) for %d coin%s" % [upgrade_name, old_level + 1, cost, "s" if cost != 1 else ""])
	money_changed.emit(money)
	upgrade_purchased.emit(upgrade_id)
	state_changed.emit()
	return true

func toss() -> bool:
	if is_game_over or is_tossing:
		return false
	is_tossing = true
	toss_count += 1
	var chance := get_head_chance()
	var result := randf() < chance

	if result:
		# Heads
		current_streak += 1
		if current_streak > best_streak:
			best_streak = current_streak
		var reward := get_reward()
		money += reward
		total_money_earned += reward
		add_history("▲ HEADS — Streak %d — Earned %d☉" % [current_streak, reward])
		coin_tossed.emit(true, reward)
		streak_updated.emit(current_streak)
		money_changed.emit(money)
		if current_streak >= WIN_STREAK:
			is_game_over = true
			add_history("✦ THE CYCLE ENDS — 10 consecutive heads achieved")
			game_won.emit()
	else:
		# Tails — check streak save
		var saved := false
		if current_streak > 0:
			var save_chance := get_streak_save_chance()
			if save_chance > 0.0 and randf() < save_chance:
				saved = true
				add_history("▽ TAILS — Streak preserved by Streak Keeper (%d)" % current_streak)
		if not saved:
			if current_streak > 0:
				add_history("▼ TAILS — Streak lost at %d" % current_streak)
			else:
				add_history("▼ TAILS")
			current_streak = 0
		coin_tossed.emit(false, 0)
		streak_updated.emit(current_streak)

	is_tossing = false
	state_changed.emit()
	return result

func add_history(entry: String) -> void:
	history.append(entry)
	history_added.emit(entry)

func reset() -> void:
	toss_count = 0
	current_streak = 0
	best_streak = 0
	money = 0
	total_money_earned = 0
	is_game_over = false
	is_tossing = false
	history.clear()
	owned_upgrades.clear()
	add_history("— A new ritual begins —")
	state_changed.emit()

func to_dict() -> Dictionary:
	return {
		"toss_count": toss_count,
		"current_streak": current_streak,
		"best_streak": best_streak,
		"money": money,
		"total_money_earned": total_money_earned,
		"is_game_over": is_game_over,
		"history": history,
		"owned_upgrades": owned_upgrades,
	}

func from_dict(data: Dictionary) -> void:
	toss_count = data.get("toss_count", 0)
	current_streak = data.get("current_streak", 0)
	best_streak = data.get("best_streak", 0)
	money = data.get("money", 0)
	total_money_earned = data.get("total_money_earned", 0)
	is_game_over = data.get("is_game_over", false)
	history.clear()
	var hist = data.get("history", [])
	for entry in hist:
		history.append(str(entry))
	owned_upgrades = data.get("owned_upgrades", {})
	state_changed.emit()
