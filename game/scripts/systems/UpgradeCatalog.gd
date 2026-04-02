class_name UpgradeCatalog
extends RefCounted

## Data-driven upgrade definitions and purchase validation.

var _upgrades: Array[Dictionary] = []

func _init() -> void:
	_register_defaults()

func _register_defaults() -> void:
	_upgrades = [
		{
			"id": "lucky_edge",
			"name": "Lucky Edge",
			"description": "The coin remembers your touch.\n+1% head chance per level.",
			"base_cost": 50,
			"cost_scale": 1.8,
			"max_level": 15,
			"effect": "head_chance",
			"value_per_level": 0.01
		},
		{
			"id": "golden_weight",
			"name": "Golden Weight",
			"description": "Heavier coins fall face-up more often.\n+2% head chance per level.",
			"base_cost": 200,
			"cost_scale": 2.2,
			"max_level": 8,
			"effect": "head_chance",
			"value_per_level": 0.02
		},
		{
			"id": "ritual_offering",
			"name": "Ritual Offering",
			"description": "The dead gods notice your devotion.\n+5☉ payout per level.",
			"base_cost": 30,
			"cost_scale": 1.5,
			"max_level": 20,
			"effect": "payout_bonus",
			"value_per_level": 5
		},
		{
			"id": "streak_keeper",
			"name": "Streak Keeper",
			"description": "Echoes of past flips linger.\n+10% chance to preserve streak on tails.",
			"base_cost": 150,
			"cost_scale": 2.5,
			"max_level": 5,
			"effect": "streak_save",
			"value_per_level": 0.10
		},
		{
			"id": "swift_hand",
			"name": "Swift Hand",
			"description": "Faster tosses, faster fate.\nReduces flip animation time by 8% per level.",
			"base_cost": 40,
			"cost_scale": 1.6,
			"max_level": 10,
			"effect": "animation_speed",
			"value_per_level": 0.08
		},
		{
			"id": "double_or_nothing",
			"name": "Double or Nothing",
			"description": "Greed feeds the machine.\n+100% payout per level.",
			"base_cost": 300,
			"cost_scale": 3.0,
			"max_level": 5,
			"effect": "payout_mult",
			"value_per_level": 1.0
		},
	]

func get_all() -> Array[Dictionary]:
	return _upgrades

func get_upgrade(upgrade_id: String) -> Dictionary:
	for u in _upgrades:
		if u.id == upgrade_id:
			return u
	return {}

func get_cost(upgrade_id: String, current_level: int) -> int:
	var u := get_upgrade(upgrade_id)
	if u.is_empty():
		return 999999
	return int(u.base_cost * pow(u.cost_scale, current_level))

func can_purchase(upgrade_id: String, snapshot: Dictionary) -> bool:
	var u := get_upgrade(upgrade_id)
	if u.is_empty():
		return false
	var level: int = snapshot.get("owned_upgrades", {}).get(upgrade_id, 0)
	if level >= u.max_level:
		return false
	var cost := get_cost(upgrade_id, level)
	return snapshot.get("money", 0) >= cost

func effective_head_chance(snapshot: Dictionary) -> float:
	var chance: float = TossResolver.BASE_HEAD_CHANCE
	var owned: Dictionary = snapshot.get("owned_upgrades", {})
	for u in _upgrades:
		if u.effect == "head_chance":
			chance += u.value_per_level * owned.get(u.id, 0)
	return minf(chance, 0.95)

func effective_payout(snapshot: Dictionary) -> int:
	var base: int = TossResolver.BASE_PAYOUT
	var owned: Dictionary = snapshot.get("owned_upgrades", {})
	var bonus: int = 0
	var mult: float = 1.0
	for u in _upgrades:
		var level: int = owned.get(u.id, 0)
		if level == 0:
			continue
		if u.effect == "payout_bonus":
			bonus += int(u.value_per_level) * level
		elif u.effect == "payout_mult":
			mult += u.value_per_level * level
	return int((base + bonus) * mult)

func effective_animation_speed(snapshot: Dictionary) -> float:
	var mult: float = 1.0
	var owned: Dictionary = snapshot.get("owned_upgrades", {})
	for u in _upgrades:
		if u.effect == "animation_speed":
			mult -= u.value_per_level * owned.get(u.id, 0)
	return maxf(mult, 0.2)
