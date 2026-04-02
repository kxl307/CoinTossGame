extends PanelContainer

## Center column — scrolling history/event feed.

@onready var scroll: ScrollContainer = $VBox/Scroll
@onready var entries_container: VBoxContainer = $VBox/Scroll/Entries
@onready var title_label: Label = $VBox/Title

var run_state: RunState
const MAX_VISIBLE_ENTRIES := 200

func setup(p_run_state: RunState) -> void:
	run_state = p_run_state
	run_state.history_recorded.connect(_on_history_recorded)
	# Replay existing history
	for entry in run_state.history:
		if entry is HistoryEvent:
			_add_entry_label(entry)

func _ready() -> void:
	pass

func _on_history_recorded(entry: HistoryEvent) -> void:
	_add_entry_label(entry)

func _add_entry_label(entry: HistoryEvent) -> void:
	if entries_container == null:
		return
	var label := Label.new()
	label.text = entry.message
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.add_theme_font_size_override("font_size", 13)

	match entry.type:
		HistoryEvent.Type.TOSS_HEADS:
			label.add_theme_color_override("font_color", Color(0.9, 0.82, 0.4))
		HistoryEvent.Type.TOSS_TAILS:
			label.add_theme_color_override("font_color", Color(0.5, 0.45, 0.4))
		HistoryEvent.Type.TOSS_TAILS_SAVED:
			label.add_theme_color_override("font_color", Color(0.55, 0.65, 0.75))
		HistoryEvent.Type.RUN_WON:
			label.add_theme_color_override("font_color", Color(1.0, 0.95, 0.6))
		HistoryEvent.Type.PURCHASE:
			label.add_theme_color_override("font_color", Color(0.6, 0.8, 0.6))
		HistoryEvent.Type.RUN_STARTED:
			label.add_theme_color_override("font_color", Color(0.6, 0.55, 0.5))
		_:
			label.add_theme_color_override("font_color", Color(0.6, 0.58, 0.52))

	entries_container.add_child(label)

	# Trim old entries
	while entries_container.get_child_count() > MAX_VISIBLE_ENTRIES:
		var oldest := entries_container.get_child(0)
		entries_container.remove_child(oldest)
		oldest.queue_free()

	# Auto-scroll to bottom
	await get_tree().process_frame
	if scroll:
		scroll.scroll_vertical = int(scroll.get_v_scroll_bar().max_value)
