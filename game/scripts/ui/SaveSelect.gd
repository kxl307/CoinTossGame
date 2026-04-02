extends Control

## Save slot selection screen — create, resume, or view completed saves.

signal slot_selected(slot_id: String)
signal new_game_requested

@onready var slots_container: VBoxContainer = $MarginContainer/VBox/SlotsContainer
@onready var title_label: Label = $MarginContainer/VBox/Title
@onready var new_btn: Button = $MarginContainer/VBox/NewGameBtn

var save_repo: SaveRepository

func _ready() -> void:
	if new_btn:
		new_btn.pressed.connect(_on_new_game)

func setup(p_save_repo: SaveRepository) -> void:
	save_repo = p_save_repo
	_refresh_slots()

func _refresh_slots() -> void:
	if slots_container == null or save_repo == null:
		return

	# Clear existing
	for child in slots_container.get_children():
		child.queue_free()

	var slot_ids := save_repo.list_slots()
	if slot_ids.is_empty():
		var empty_label := Label.new()
		empty_label.text = "No save files. Begin a new ritual."
		empty_label.add_theme_color_override("font_color", Color(0.45, 0.42, 0.38))
		empty_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		slots_container.add_child(empty_label)
		return

	for sid in slot_ids:
		var data := save_repo.load_slot(sid)
		var btn := Button.new()
		var completed: bool = data.get("is_completed", false)
		var run_data: Dictionary = data.get("run_data", {})
		var tosses: int = run_data.get("toss_count", 0)
		var streak: int = run_data.get("best_streak", 0)

		if completed:
			btn.text = "⛌ %s — COMPLETED (Locked)" % sid
			btn.disabled = true
			btn.add_theme_color_override("font_disabled_color", Color(0.4, 0.35, 0.3))
		else:
			btn.text = "► %s — Tosses: %d | Best Streak: %d" % [sid, tosses, streak]
			btn.pressed.connect(_on_slot_pressed.bind(sid))

		btn.custom_minimum_size = Vector2(0, 40)
		slots_container.add_child(btn)

func _on_slot_pressed(slot_id: String) -> void:
	slot_selected.emit(slot_id)

func _on_new_game() -> void:
	new_game_requested.emit()
