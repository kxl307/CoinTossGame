extends Node

## Bootstrap entry point — manages scene routing between save select and gameplay.

const GameScreenScene := preload("res://scenes/game/GameScreen.tscn")

var game_signals: Node
var run_state: RunState
var game_screen: Control

func _ready() -> void:
	# Create core singletons
	game_signals = preload("res://scripts/core/GameSignals.gd").new()
	game_signals.name = "GameSignals"
	add_child(game_signals)

	run_state = RunState.new()
	run_state.name = "RunState"
	add_child(run_state)

	# Launch directly into gameplay (save select added in PLAN-04)
	_start_game("slot_1")

func _start_game(slot_id: String) -> void:
	run_state.start_new_run(slot_id)
	game_screen = GameScreenScene.instantiate()
	add_child(game_screen)
	if game_screen.has_method("setup"):
		game_screen.setup(run_state)
