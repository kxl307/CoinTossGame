class_name HistoryEvent
extends RefCounted

## Structured event record used by UI, saves, and progression systems.

enum Type {
	TOSS_HEADS,
	TOSS_TAILS,
	TOSS_TAILS_SAVED,
	STREAK_RESET,
	PURCHASE,
	ABILITY_USED,
	EVENT_TRIGGERED,
	RUN_STARTED,
	RUN_WON,
}

var type: Type
var message: String
var details: Dictionary

func _init(p_type: Type, p_message: String, p_details: Dictionary = {}) -> void:
	type = p_type
	message = p_message
	details = p_details

func to_dict() -> Dictionary:
	return {"type": type, "message": message, "details": details}

static func from_dict(data: Dictionary) -> HistoryEvent:
	return HistoryEvent.new(data.get("type", 0) as Type, data.get("message", ""), data.get("details", {}))
