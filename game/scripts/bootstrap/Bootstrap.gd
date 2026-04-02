extends Node

## Bootstrap entry point — manages scene routing between save select and gameplay.

const GameScreenScene := preload("res://scenes/game/GameScreen.tscn")
const SaveSelectScene := preload("res://scenes/ui/SaveSelect.tscn")

var game_signals: Node
var run_state: RunState
var game_screen: Control
var save_select: Control
var save_repo: SaveRepository
var catalog: UpgradeCatalog
var ability_sys: AbilitySystem
var meta: MetaProgression
var _next_slot_id: int = 1

func _ready() -> void:
	# Create core singletons
	game_signals = preload("res://scripts/core/GameSignals.gd").new()
	game_signals.name = "GameSignals"
	add_child(game_signals)

	run_state = RunState.new()
	run_state.name = "RunState"
	add_child(run_state)

	# Systems
	save_repo = SaveRepository.new()
	catalog = UpgradeCatalog.new()
	ability_sys = AbilitySystem.new()
	meta = save_repo.load_meta()

	_show_save_select()

func _show_save_select() -> void:
	_remove_game_screen()
	save_select = SaveSelectScene.instantiate()
	add_child(save_select)
	if save_select.has_method("setup"):
		save_select.setup(save_repo)
	if save_select.has_signal("slot_selected"):
		save_select.slot_selected.connect(_on_slot_selected)
	if save_select.has_signal("new_game_requested"):
		save_select.new_game_requested.connect(_on_new_game)

func _on_slot_selected(slot_id: String) -> void:
	var data := save_repo.load_slot(slot_id)
	if data.get("is_completed", false):
		return  # Locked slot
	_remove_save_select()
	run_state.from_dict(data.get("run_data", {}))
	run_state.slot_id = slot_id
	_show_game_screen()

func _on_new_game() -> void:
	# Find next available slot ID
	var existing := save_repo.list_slots()
	var slot_id := "slot_%d" % _next_slot_id
	while slot_id in existing:
		_next_slot_id += 1
		slot_id = "slot_%d" % _next_slot_id
	_next_slot_id += 1

	_remove_save_select()
	run_state.start_new_run(slot_id)
	# Auto-save initial state
	save_repo.save_slot(slot_id, {
		"run_data": run_state.to_dict(),
		"is_completed": false,
		"ending_id": "",
		"created_at": Time.get_datetime_string_from_system(true),
	})
	_show_game_screen()

func _show_game_screen() -> void:
	game_screen = GameScreenScene.instantiate()
	add_child(game_screen)
	if game_screen.has_method("setup"):
		game_screen.setup(run_state, catalog, ability_sys, save_repo)

	# Auto-save periodically via run_changed
	run_state.run_changed.connect(_on_run_changed_autosave)

func _on_run_changed_autosave(_snapshot: Dictionary) -> void:
	if run_state.slot_id != "" and save_repo:
		save_repo.save_slot(run_state.slot_id, {
			"run_data": run_state.to_dict(),
			"is_completed": run_state.is_completed,
			"ending_id": run_state.ending_id,
			"created_at": "",
		})

func _return_to_save_select() -> void:
	# Update meta stats
	if run_state.is_completed:
		meta.record_run_end(run_state.current_snapshot(), true)
		save_repo.save_meta(meta)
	# Disconnect autosave
	if run_state.run_changed.is_connected(_on_run_changed_autosave):
		run_state.run_changed.disconnect(_on_run_changed_autosave)
	_show_save_select()

func _remove_game_screen() -> void:
	if game_screen and is_instance_valid(game_screen):
		game_screen.queue_free()
		game_screen = null

func _remove_save_select() -> void:
	if save_select and is_instance_valid(save_select):
		save_select.queue_free()
		save_select = null
