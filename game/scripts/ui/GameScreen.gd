extends Control

## Main game screen — three-column layout: toss (left), history (center), progression (right).

var run_state: RunState

func setup(p_run_state: RunState) -> void:
	run_state = p_run_state
	_wire_panels()

func _ready() -> void:
	if run_state:
		_wire_panels()

func _wire_panels() -> void:
	var tp = find_child("TossPanel", true, false)
	if tp and tp.has_method("setup"):
		tp.setup(run_state)
	var hp = find_child("HistoryPanel", true, false)
	if hp and hp.has_method("setup"):
		hp.setup(run_state)
