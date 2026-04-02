import { createInitialState } from './gameState.js';

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

  return {
    ...state,
    lastOutcome: isHeads ? 'heads' : 'tails',
    streak: newStreak,
    totalTosses: state.totalTosses + 1,
    gameOver: won,
    won,
    statusMessage: won
      ? `🎉 ${state.maxStreak} consecutive heads reached — you win!`
      : isHeads
        ? `Heads! Streak: ${newStreak}`
        : 'Tails — streak reset to 0.',
  };
}

/**
 * Whether the player can still toss.
 */
export function canToss(state) {
  return !state.gameOver;
}
