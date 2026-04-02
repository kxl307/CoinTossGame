import { createInitialState } from './gameState.js';
import { createHistoryEntry, appendHistory } from './history.js';

/**
 * Resolve a single coin toss against the current state.
 * Pure function — no side effects, no randomness.
 * @param {object} state - current game state
 * @param {number} roll  - a number in [0, 1) (caller supplies Math.random())
 * @returns {object} next state
 */
export function resolveToss(state, roll) {
  if (!canToss(state)) return state;

  const isHeads = roll < state.effectiveHeadChance;
  const newStreak = isHeads ? state.streak + 1 : 0;
  const won = newStreak >= state.maxStreak;
  const moneyEarned = isHeads ? (state.moneyPerHead || 5) : 0;

  const statusMessage = won
    ? `🎉 ${state.maxStreak} consecutive heads reached — you win!`
    : isHeads
      ? `Heads! Streak: ${newStreak} | +$${moneyEarned}`
      : 'Tails — streak reset to 0.';

  let next = {
    ...state,
    lastOutcome: isHeads ? 'heads' : 'tails',
    streak: newStreak,
    totalTosses: state.totalTosses + 1,
    money: state.money + moneyEarned,
    gameOver: won,
    won,
    statusMessage,
  };

  // Emit toss history entry
  next = appendHistory(next, createHistoryEntry('toss', {
    outcome: isHeads ? 'heads' : 'tails',
    moneyDelta: moneyEarned,
    streak: newStreak,
  }));

  // Emit win entry if game just ended
  if (won) {
    next = appendHistory(next, createHistoryEntry('win', {
      streak: newStreak,
      message: statusMessage,
    }));
  }

  return next;
}

/**
 * Whether the player can still toss.
 */
export function canToss(state) {
  return !state.gameOver;
}
