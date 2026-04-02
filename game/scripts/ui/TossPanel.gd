extends PanelContainer

## Left column — coin toss interaction, streak display, stats.

@onready var coin_label: Label = $VBox/CoinArea/CoinLabel
@onready var result_label: Label = $VBox/ResultLabel
@onready var streak_label: Label = $VBox/StreakLabel
@onready var stats_label: Label = $VBox/StatsLabel
@onready var chance_label: Label = $VBox/ChanceLabel
@onready var toss_button: Button = $VBox/TossButton

var run_state: RunState
var _anim_timer: float = 0.0
var _is_animating: bool = false
var _pending_outcome: TossOutcome = null
const BASE_ANIM_DURATION := 0.6
const COIN_FACES := ["☉", "◎", "●", "◉", "○", "◐", "◑"]

func setup(p_run_state: RunState) -> void:
	run_state = p_run_state
	run_state.run_changed.connect(_on_run_changed)
	_refresh_display(run_state.current_snapshot())

func _ready() -> void:
	if toss_button:
		toss_button.pressed.connect(_on_toss_pressed)

func _process(delta: float) -> void:
	if not _is_animating:
		return
	_anim_timer -= delta
	if _anim_timer > 0:
		# Spin the coin face
		var idx := randi() % COIN_FACES.size()
		coin_label.text = COIN_FACES[idx]
	else:
		_finish_animation()

func _on_toss_pressed() -> void:
	if run_state == null or not run_state.can_accept_input() or _is_animating:
		return
	var outcome := run_state.apply_toss()
	if outcome == null:
		return
	_pending_outcome = outcome
	_start_animation()

func _start_animation() -> void:
	_is_animating = true
	var speed_mult: float = 1.0
	if run_state:
		speed_mult = run_state.current_snapshot().get("animation_speed", 1.0)
	_anim_timer = BASE_ANIM_DURATION * speed_mult
	toss_button.disabled = true
	result_label.text = "..."

func _finish_animation() -> void:
	_is_animating = false
	if _pending_outcome:
		if _pending_outcome.rolled_heads:
			coin_label.text = "☉"
			result_label.text = "HEADS  +%d☉" % _pending_outcome.payout
			result_label.add_theme_color_override("font_color", Color(1.0, 0.85, 0.3))
		else:
			coin_label.text = "◌"
			if _pending_outcome.streak_saved:
				result_label.text = "TAILS  (streak saved)"
				result_label.add_theme_color_override("font_color", Color(0.6, 0.7, 0.8))
			else:
				result_label.text = "TAILS"
				result_label.add_theme_color_override("font_color", Color(0.5, 0.4, 0.4))
		_pending_outcome = null
	if run_state and run_state.can_accept_input():
		toss_button.disabled = false

func _on_run_changed(snapshot: Dictionary) -> void:
	_refresh_display(snapshot)

func _refresh_display(snap: Dictionary) -> void:
	if streak_label:
		streak_label.text = "Streak: %d / 10" % snap.get("current_streak", 0)
	if stats_label:
		stats_label.text = "Tosses: %d  |  Best: %d  |  ☉ %d" % [
			snap.get("toss_count", 0),
			snap.get("best_streak", 0),
			snap.get("money", 0)
		]
	if chance_label:
		chance_label.text = "Head chance: %.1f%%" % (snap.get("effective_head_chance", 0.1) * 100.0)
	if toss_button:
		toss_button.disabled = snap.get("is_completed", false) or _is_animating
	if snap.get("is_completed", false) and result_label:
		result_label.text = "THE CYCLE HAS ENDED"
		result_label.add_theme_color_override("font_color", Color(1.0, 0.9, 0.4))
