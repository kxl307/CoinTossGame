extends Node

## Global signal bus so systems can communicate without direct references.

# Toss lifecycle
signal toss_requested
signal toss_resolved(outcome)  # TossOutcome

# Run lifecycle
signal run_started(slot_id: String)
signal run_changed(snapshot: Dictionary)
signal run_won(ending_id: String)

# History
signal history_recorded(entry)  # HistoryEvent

# Progression
signal upgrade_purchased(upgrade_id: String, new_level: int)
signal ability_activated(ability_id: String)
signal event_triggered(event_id: String)

# Save / lock
signal save_requested(slot_id: String)
signal save_completed(slot_id: String)
signal save_lock_changed(is_locked: bool)

# UI
signal money_changed(amount: int)
signal streak_changed(current: int, best: int)
