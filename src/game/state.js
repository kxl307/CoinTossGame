import { BASE_HEADS_CHANCE } from './config.js';

export function createInitialState() {
  return {
    streak: 0,
    tossCount: 0,
    lastOutcome: null,
    win: false,
    gameOver: false,
    balance: 0,
    lifetimeEarnings: 0,
    lastReward: 0,
    currentHeadsChance: BASE_HEADS_CHANCE,
    headsReward: 0,
    purchasedUpgrades: [],
    history: [],
  };
}
