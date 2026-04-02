extends PanelContainer

## Right column — stats, upgrade purchases, ability activation.

var run_state: RunState
var _catalog: UpgradeCatalog
var _ability_sys: AbilitySystem
var _upgrade_buttons: Dictionary = {}

func setup(p_run_state: RunState, catalog: UpgradeCatalog, ability_sys: AbilitySystem) -> void:
	run_state = p_run_state
	_catalog = catalog
	_ability_sys = ability_sys
	run_state.run_changed.connect(_on_run_changed)
	_build_upgrade_buttons()
	_refresh(run_state.current_snapshot())

func _ready() -> void:
	var ab = find_child("AbilityBtn", true, false)
	if ab and ab is Button:
		ab.pressed.connect(_on_ability_pressed)

func _build_upgrade_buttons() -> void:
	var upgrades_list = find_child("UpgradesList", true, false)
	if upgrades_list == null or _catalog == null:
		return
	for child in upgrades_list.get_children():
		child.queue_free()
	_upgrade_buttons.clear()

	for u in _catalog.get_all():
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(0, 36)
		btn.pressed.connect(_on_upgrade_pressed.bind(u.id))
		upgrades_list.add_child(btn)
		_upgrade_buttons[u.id] = btn

func _on_run_changed(snapshot: Dictionary) -> void:
	_refresh(snapshot)

func _refresh(snap: Dictionary) -> void:
	if _catalog == null:
		return

	var stats_label = find_child("StatsLabel", true, false)
	var ability_btn = find_child("AbilityBtn", true, false)
	var ability_label = find_child("AbilityLabel", true, false)

	# Stats
	if stats_label:
		stats_label.text = "☉ %d  |  Streak: %d/%d  |  Chance: %.1f%%" % [
			snap.get("money", 0),
			snap.get("current_streak", 0),
			10,
			snap.get("effective_head_chance", 0.1) * 100.0
		]

	# Upgrades
	var owned: Dictionary = snap.get("owned_upgrades", {})
	for u in _catalog.get_all():
		var btn: Button = _upgrade_buttons.get(u.id)
		if btn == null:
			continue
		var level: int = owned.get(u.id, 0)
		var max_level: int = u.max_level
		var cost := _catalog.get_cost(u.id, level)
		var can_buy := _catalog.can_purchase(u.id, snap)

		if level >= max_level:
			btn.text = "%s (MAX)" % u.name
			btn.disabled = true
		else:
			btn.text = "%s  Lv.%d → %d  [%d☉]" % [u.name, level, level + 1, cost]
			btn.disabled = not can_buy
			if can_buy:
				btn.add_theme_color_override("font_color", Color(0.8, 0.9, 0.7))
			else:
				btn.add_theme_color_override("font_color", Color(0.5, 0.48, 0.44))

		btn.tooltip_text = u.description

	# Ability
	if ability_btn and _ability_sys:
		var abilities := _ability_sys.get_all()
		if abilities.size() > 0:
			var a := abilities[0]
			var uses: int = snap.get("owned_abilities", {}).get(a.id, 0)
			if uses > 0:
				ability_btn.text = "%s (%d uses)" % [a.name, uses]
				ability_btn.disabled = snap.get("is_completed", false)
				ability_btn.visible = true
			else:
				var unlock_cost := _ability_sys.get_unlock_cost(a.id)
				if snap.get("money", 0) >= unlock_cost:
					ability_btn.text = "Unlock %s [%d☉]" % [a.name, unlock_cost]
					ability_btn.disabled = false
					ability_btn.visible = true
				else:
					ability_btn.text = "Unlock %s [%d☉]" % [a.name, unlock_cost]
					ability_btn.disabled = true
					ability_btn.visible = true
			if ability_label:
				ability_label.text = a.description

func _on_upgrade_pressed(upgrade_id: String) -> void:
	if run_state == null or _catalog == null:
		return
	var snap := run_state.current_snapshot()
	if not _catalog.can_purchase(upgrade_id, snap):
		return
	var cost := _catalog.get_cost(upgrade_id, snap.owned_upgrades.get(upgrade_id, 0))
	if run_state.spend_money(cost):
		var new_level: int = snap.owned_upgrades.get(upgrade_id, 0) + 1
		run_state.set_upgrade_level(upgrade_id, new_level)
		var u := _catalog.get_upgrade(upgrade_id)
		var entry := HistoryEvent.new(
			HistoryEvent.Type.PURCHASE,
			"☉ Acquired %s (Lv.%d) for %d☉" % [u.get("name", upgrade_id), new_level, cost],
			{"upgrade_id": upgrade_id, "level": new_level, "cost": cost}
		)
		run_state._record_history(entry)

func _on_ability_pressed() -> void:
	if run_state == null or _ability_sys == null:
		return
	var abilities := _ability_sys.get_all()
	if abilities.is_empty():
		return
	var a := abilities[0]
	var snap := run_state.current_snapshot()
	var uses: int = snap.owned_abilities.get(a.id, 0)

	if uses > 0:
		var result := _ability_sys.activate(a.id, snap.owned_abilities)
		if result.activated:
			run_state.set_ability(a.id, result.uses_remaining)
			var entry := HistoryEvent.new(
				HistoryEvent.Type.ABILITY_USED,
				"⚡ %s activated (%d uses left)" % [a.name, result.uses_remaining],
				{"ability_id": a.id}
			)
			run_state._record_history(entry)
	else:
		# Unlock
		var cost := _ability_sys.get_unlock_cost(a.id)
		if run_state.spend_money(cost):
			var starting_uses := _ability_sys.unlock_ability(a.id)
			run_state.set_ability(a.id, starting_uses)
			var entry := HistoryEvent.new(
				HistoryEvent.Type.PURCHASE,
				"⚡ Unlocked %s (%d uses)" % [a.name, starting_uses],
				{"ability_id": a.id, "cost": cost}
			)
			run_state._record_history(entry)
