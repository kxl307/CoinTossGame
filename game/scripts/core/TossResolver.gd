class_name TossResolver
extends RefCounted

## Pure coin-toss logic. No UI, no side effects beyond producing a TossOutcome.

const WIN_STREAK := 10
const BASE_HEAD_CHANCE := 0.10
const BASE_PAYOUT := 10

func resolve(snapshot: Dictionary, seed_override = null) -> TossOutcome:
	var outcome := TossOutcome.new()
	var head_chance: float = snapshot.get("effective_head_chance", BASE_HEAD_CHANCE)
	var streak: int = snapshot.get("current_streak", 0)
	var payout_base: int = snapshot.get("effective_payout", BASE_PAYOUT)
	var streak_save_chance: float = snapshot.get("streak_save_chance", 0.0)

	outcome.effective_head_chance = head_chance
	outcome.streak_before = streak

	# Determine roll
	var roll: float
	if seed_override != null:
		roll = float(seed_override)
	else:
		roll = randf()

	outcome.rolled_heads = roll < head_chance

	if outcome.rolled_heads:
		outcome.streak_after = streak + 1
		outcome.payout = payout_base
		outcome.triggered_win = outcome.streak_after >= WIN_STREAK

		var entry := HistoryEvent.new(
			HistoryEvent.Type.TOSS_HEADS,
			"▲ HEADS — Streak %d — Earned %d☉" % [outcome.streak_after, outcome.payout],
			{"streak": outcome.streak_after, "payout": outcome.payout}
		)
		outcome.history_entries.append(entry)

		if outcome.triggered_win:
			var win_entry := HistoryEvent.new(
				HistoryEvent.Type.RUN_WON,
				"✦ THE CYCLE ENDS — %d consecutive heads achieved" % WIN_STREAK,
				{"final_streak": outcome.streak_after}
			)
			outcome.history_entries.append(win_entry)
	else:
		# Tails — check streak save
		outcome.streak_saved = false
		if streak > 0 and streak_save_chance > 0.0:
			var save_roll := randf()
			if save_roll < streak_save_chance:
				outcome.streak_saved = true

		if outcome.streak_saved:
			outcome.streak_after = streak
			var entry := HistoryEvent.new(
				HistoryEvent.Type.TOSS_TAILS_SAVED,
				"▽ TAILS — Streak preserved (%d)" % streak,
				{"streak": streak}
			)
			outcome.history_entries.append(entry)
		else:
			outcome.streak_after = 0
			var msg: String
			if streak > 0:
				msg = "▼ TAILS — Streak lost at %d" % streak
			else:
				msg = "▼ TAILS"
			var entry := HistoryEvent.new(
				HistoryEvent.Type.TOSS_TAILS,
				msg,
				{"streak_lost": streak}
			)
			outcome.history_entries.append(entry)

		outcome.payout = 0
		outcome.triggered_win = false

	return outcome
