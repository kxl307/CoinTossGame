class_name AbilitySystem
extends RefCounted

## Manages active abilities with cooldown/limited-use constraints.

var _abilities: Array[Dictionary] = []

func _init() -> void:
	_register_defaults()

func _register_defaults() -> void:
	_abilities = [
		{
			"id": "lucky_flip",
			"name": "Lucky Flip",
			"description": "Force the next toss to use double head chance. 3 uses per run.",
			"max_uses": 3,
			"effect": "double_chance_next",
			"unlock_cost": 100,
		},
	]

func get_all() -> Array[Dictionary]:
	return _abilities

func get_ability(ability_id: String) -> Dictionary:
	for a in _abilities:
		if a.id == ability_id:
			return a
	return {}

func can_activate(ability_id: String, owned_abilities: Dictionary) -> bool:
	var a := get_ability(ability_id)
	if a.is_empty():
		return false
	var uses_remaining: int = owned_abilities.get(ability_id, 0)
	return uses_remaining > 0

func activate(ability_id: String, owned_abilities: Dictionary) -> Dictionary:
	## Returns { "activated": bool, "uses_remaining": int, "effect": String }
	if not can_activate(ability_id, owned_abilities):
		return {"activated": false, "uses_remaining": owned_abilities.get(ability_id, 0), "effect": ""}
	var a := get_ability(ability_id)
	var remaining: int = owned_abilities.get(ability_id, 0) - 1
	return {"activated": true, "uses_remaining": remaining, "effect": a.get("effect", "")}

func unlock_ability(ability_id: String) -> int:
	## Returns the number of starting uses for a newly unlocked ability.
	var a := get_ability(ability_id)
	if a.is_empty():
		return 0
	return a.get("max_uses", 0)

func get_unlock_cost(ability_id: String) -> int:
	var a := get_ability(ability_id)
	return a.get("unlock_cost", 999999)
