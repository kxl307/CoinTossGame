import {
  BASE_HEAD_CHANCE,
  BASE_TAIL_CHANCE,
  STARTING_MONEY,
  TARGET_STREAK,
  PER_HEAD_PAYOUT,
} from './config.js';

/**
 * Returns a fresh initial game state with all roadmap-required fields.
 * Pure and deterministic — no DOM or side effects.
 */
export function createInitialGameState() {
  return {
    currentStreak: 0,
    bestStreak: 0,
    money: STARTING_MONEY,
    headChance: BASE_HEAD_CHANCE,
    tailChance: BASE_TAIL_CHANCE,
    isGameOver: false,
    ownedUpgrades: [],
    history: [],
    lastOutcome: null,
    totalTosses: 0,
    totalHeads: 0,
    targetStreak: TARGET_STREAK,
    perHeadPayout: PER_HEAD_PAYOUT,
  };
}
