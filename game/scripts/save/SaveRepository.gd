class_name SaveRepository
extends RefCounted

## File-backed save slot storage. Supports multiple slots, completion locking.

const SAVE_DIR := "user://saves/"
const META_FILE := "user://meta_progression.json"

func _ensure_dir() -> void:
	var dir := DirAccess.open("user://")
	if dir and not dir.dir_exists("saves"):
		dir.make_dir("saves")

func _slot_path(slot_id: String) -> String:
	return SAVE_DIR + slot_id + ".json"

func save_slot(slot_id: String, payload: Dictionary) -> void:
	_ensure_dir()
	var slot := SaveSlot.new()
	slot.slot_id = slot_id
	slot.run_data = payload.get("run_data", {})
	slot.meta_data = payload.get("meta_data", {})
	slot.is_completed = payload.get("is_completed", false)
	slot.ending_id = payload.get("ending_id", "")
	slot.created_at = payload.get("created_at", "")
	slot.updated_at = Time.get_datetime_string_from_system(true)

	var json_string := JSON.stringify(slot.to_dict(), "\t")
	var file := FileAccess.open(_slot_path(slot_id), FileAccess.WRITE)
	if file:
		file.store_string(json_string)
		file.close()

func load_slot(slot_id: String) -> Dictionary:
	var path := _slot_path(slot_id)
	if not FileAccess.file_exists(path):
		return {}
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return {}
	var json_string := file.get_as_text()
	file.close()
	var json := JSON.new()
	if json.parse(json_string) != OK:
		return {}
	return json.data if json.data is Dictionary else {}

func mark_slot_completed(slot_id: String, ending_id: String) -> void:
	var data := load_slot(slot_id)
	if data.is_empty():
		return
	data["is_completed"] = true
	data["ending_id"] = ending_id
	data["updated_at"] = Time.get_datetime_string_from_system(true)
	var json_string := JSON.stringify(data, "\t")
	var file := FileAccess.open(_slot_path(slot_id), FileAccess.WRITE)
	if file:
		file.store_string(json_string)
		file.close()

func is_slot_completed(slot_id: String) -> bool:
	var data := load_slot(slot_id)
	return data.get("is_completed", false)

func list_slots() -> Array[String]:
	_ensure_dir()
	var slots: Array[String] = []
	var dir := DirAccess.open(SAVE_DIR)
	if dir == null:
		return slots
	dir.list_dir_begin()
	var file_name := dir.get_next()
	while file_name != "":
		if file_name.ends_with(".json"):
			slots.append(file_name.replace(".json", ""))
		file_name = dir.get_next()
	dir.list_dir_end()
	return slots

func delete_slot(slot_id: String) -> void:
	var path := _slot_path(slot_id)
	if FileAccess.file_exists(path):
		DirAccess.remove_absolute(path)

func save_meta(meta: MetaProgression) -> void:
	var json_string := JSON.stringify(meta.to_dict(), "\t")
	var file := FileAccess.open(META_FILE, FileAccess.WRITE)
	if file:
		file.store_string(json_string)
		file.close()

func load_meta() -> MetaProgression:
	var meta := MetaProgression.new()
	if not FileAccess.file_exists(META_FILE):
		return meta
	var file := FileAccess.open(META_FILE, FileAccess.READ)
	if file == null:
		return meta
	var json_string := file.get_as_text()
	file.close()
	var json := JSON.new()
	if json.parse(json_string) == OK and json.data is Dictionary:
		meta.from_dict(json.data)
	return meta
