class_name TossOutcome
extends RefCounted

## Result of a single coin toss, produced by TossResolver and consumed by RunState.

var rolled_heads: bool
var effective_head_chance: float
var streak_before: int
var streak_after: int
var payout: int
var triggered_win: bool
var streak_saved: bool
var history_entries: Array  # Array of HistoryEvent

func _init() -> void:
	rolled_heads = false
	effective_head_chance = 0.1
	streak_before = 0
	streak_after = 0
	payout = 0
	triggered_win = false
	streak_saved = false
	history_entries = []
