class_name MetaProgression
extends RefCounted

## Cross-run persistent stats and unlocks — independent from individual run snapshots.

var total_runs: int = 0
var total_wins: int = 0
var total_tosses_all_time: int = 0
var total_money_all_time: int = 0
var best_streak_all_time: int = 0
var unlocks: Dictionary = {}  # { unlock_id: true }

func record_run_end(snapshot: Dictionary, won: bool) -> void:
	total_runs += 1
	if won:
		total_wins += 1
	total_tosses_all_time += snapshot.get("toss_count", 0)
	total_money_all_time += snapshot.get("total_money_earned", 0)
	var best: int = snapshot.get("best_streak", 0)
	if best > best_streak_all_time:
		best_streak_all_time = best

func grant_unlock(unlock_id: String) -> void:
	unlocks[unlock_id] = true

func has_unlock(unlock_id: String) -> bool:
	return unlocks.get(unlock_id, false)

func to_dict() -> Dictionary:
	return {
		"total_runs": total_runs,
		"total_wins": total_wins,
		"total_tosses_all_time": total_tosses_all_time,
		"total_money_all_time": total_money_all_time,
		"best_streak_all_time": best_streak_all_time,
		"unlocks": unlocks,
	}

func from_dict(data: Dictionary) -> void:
	total_runs = data.get("total_runs", 0)
	total_wins = data.get("total_wins", 0)
	total_tosses_all_time = data.get("total_tosses_all_time", 0)
	total_money_all_time = data.get("total_money_all_time", 0)
	best_streak_all_time = data.get("best_streak_all_time", 0)
	unlocks = data.get("unlocks", {})
