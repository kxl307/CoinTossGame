import { PER_HEAD_PAYOUT as DEFAULT_PAYOUT, TARGET_STREAK } from './config.js';

/**
 * Pure coin roll — returns 'heads' if randomValue < headChance, else 'tails'.
 * Inject randomValue so tests can force deterministic outcomes.
 */
export function rollCoin(randomValue, headChance) {
  return randomValue < headChance ? 'heads' : 'tails';
}

/**
 * Pure state transition for a single toss.
 * Returns a new state object (never mutates the input).
 * If the game is already over, returns the same state reference unchanged.
 */
export function resolveToss(state, randomValue) {
  if (state.isGameOver) return state;

  const outcome = rollCoin(randomValue, state.headChance);
  const history = [...state.history];
  const payout = state.perHeadPayout ?? DEFAULT_PAYOUT;
  let { currentStreak, bestStreak, money, totalTosses, totalHeads, isGameOver } = state;

  totalTosses += 1;

  if (outcome === 'heads') {
    totalHeads += 1;
    currentStreak += 1;
    money += payout;
    if (currentStreak > bestStreak) bestStreak = currentStreak;

    history.push(`Heads! Streak is now ${currentStreak}. Earned $${payout}.`);

    if (currentStreak >= TARGET_STREAK) {
      isGameOver = true;
      history.push(`🎉 You win! Reached ${TARGET_STREAK} consecutive heads!`);
    }
  } else {
    if (currentStreak > 0) {
      history.push(`Tails — streak reset from ${currentStreak} to 0.`);
    } else {
      history.push('Tails — streak stays at 0.');
    }
    currentStreak = 0;
  }

  return {
    ...state,
    currentStreak,
    bestStreak,
    money,
    totalTosses,
    totalHeads,
    isGameOver,
    history,
    lastOutcome: outcome,
  };
}
