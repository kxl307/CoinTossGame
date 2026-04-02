extends Node

## Bootstrap entry point — manages scene routing between save select and gameplay.

var game_signals: Node
var run_state: RunState

func _ready() -> void:
	# Create core singletons
	game_signals = preload("res://scripts/core/GameSignals.gd").new()
	game_signals.name = "GameSignals"
	add_child(game_signals)

	run_state = RunState.new()
	run_state.name = "RunState"
	add_child(run_state)

	# Start with a new run for now (save select added in PLAN-04)
	run_state.start_new_run("slot_1")
