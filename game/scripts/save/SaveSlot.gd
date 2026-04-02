class_name SaveSlot
extends RefCounted

## Represents a single save slot payload.

var slot_id: String = ""
var run_data: Dictionary = {}
var meta_data: Dictionary = {}
var is_completed: bool = false
var ending_id: String = ""
var created_at: String = ""
var updated_at: String = ""

func to_dict() -> Dictionary:
	return {
		"slot_id": slot_id,
		"run_data": run_data,
		"meta_data": meta_data,
		"is_completed": is_completed,
		"ending_id": ending_id,
		"created_at": created_at,
		"updated_at": updated_at,
	}

static func from_dict(data: Dictionary) -> SaveSlot:
	var slot := SaveSlot.new()
	slot.slot_id = data.get("slot_id", "")
	slot.run_data = data.get("run_data", {})
	slot.meta_data = data.get("meta_data", {})
	slot.is_completed = data.get("is_completed", false)
	slot.ending_id = data.get("ending_id", "")
	slot.created_at = data.get("created_at", "")
	slot.updated_at = data.get("updated_at", "")
	return slot
