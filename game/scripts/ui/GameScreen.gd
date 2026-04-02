extends Control

## Main game screen — three-column layout: toss (left), history (center), progression (right).

var run_state: RunState
var _catalog: UpgradeCatalog
var _ability_sys: AbilitySystem
var _save_repo: SaveRepository

func setup(p_run_state: RunState, catalog: UpgradeCatalog = null, ability_sys: AbilitySystem = null, save_repo: SaveRepository = null) -> void:
	run_state = p_run_state
	_catalog = catalog if catalog else UpgradeCatalog.new()
	_ability_sys = ability_sys if ability_sys else AbilitySystem.new()
	_save_repo = save_repo
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
	var rp = find_child("RightProgressionPanel", true, false)
	if rp and rp.has_method("setup"):
		rp.setup(run_state, _catalog, _ability_sys)
	var eo = find_child("EndingOverlay", true, false)
	if eo:
		run_state.save_lock_changed.connect(_on_save_lock_changed)
		if eo.has_signal("ending_acknowledged"):
			eo.ending_acknowledged.connect(_on_ending_acknowledged)

func _on_save_lock_changed(is_locked: bool) -> void:
	if is_locked:
		# Auto-save before showing ending
		if _save_repo and run_state:
			_save_repo.save_slot(run_state.slot_id, {
				"run_data": run_state.to_dict(),
				"is_completed": true,
				"ending_id": run_state.ending_id,
				"created_at": "",
			})
			_save_repo.mark_slot_completed(run_state.slot_id, run_state.ending_id)
		var eo = find_child("EndingOverlay", true, false)
		if eo and eo.has_method("show_ending"):
			eo.show_ending(run_state.ending_id)

func _on_ending_acknowledged() -> void:
	# Return to save select (handled by Bootstrap)
	var parent = get_parent()
	if parent and parent.has_method("_return_to_save_select"):
		parent._return_to_save_select()
