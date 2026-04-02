class_name EventSystem
extends RefCounted

## Random event system — offers risk/reward choices during a run.

var _events: Array[Dictionary] = []
var _rng: RandomNumberGenerator

func _init() -> void:
	_rng = RandomNumberGenerator.new()
	_rng.randomize()
	_register_defaults()

func _register_defaults() -> void:
	_events = [
		{
			"id": "wandering_spirit",
			"name": "Wandering Spirit",
			"description": "A faint presence offers a bargain: sacrifice half your money for +5% head chance this run.",
			"trigger_chance": 0.05,
			"trigger_after_tosses": 10,
			"choices": [
				{
					"label": "Accept the bargain",
					"effect": "head_chance_boost",
					"value": 0.05,
					"cost_type": "money_percent",
					"cost_value": 0.5
				},
				{
					"label": "Refuse",
					"effect": "none",
					"value": 0,
					"cost_type": "none",
					"cost_value": 0
				}
			]
		},
	]

func get_all() -> Array[Dictionary]:
	return _events

func check_for_event(snapshot: Dictionary) -> Dictionary:
	## Returns an event dictionary if one triggers, or empty dict if none.
	var tosses: int = snapshot.get("toss_count", 0)
	for evt in _events:
		if tosses < evt.get("trigger_after_tosses", 0):
			continue
		if _rng.randf() < evt.get("trigger_chance", 0.0):
			return evt
	return {}

func resolve_choice(event: Dictionary, choice_index: int, snapshot: Dictionary) -> Dictionary:
	## Applies a chosen effect, returning { "effect": ..., "value": ..., "cost_applied": ... }
	var choices: Array = event.get("choices", [])
	if choice_index < 0 or choice_index >= choices.size():
		return {"effect": "none", "value": 0, "cost_applied": 0}
	var choice: Dictionary = choices[choice_index]
	var cost_applied: int = 0
	if choice.get("cost_type", "none") == "money_percent":
		cost_applied = int(snapshot.get("money", 0) * choice.get("cost_value", 0))
	return {
		"effect": choice.get("effect", "none"),
		"value": choice.get("value", 0),
		"cost_applied": cost_applied,
		"label": choice.get("label", ""),
	}
