/**
 * Canonical game state shape. Every module reads/writes this structure.
 */
export function createInitialState() {
  return {
    streak: 0,
    maxStreak: 10,
    baseHeadChance: 0.10,
    effectiveHeadChance: 0.10,
    money: 0,
    moneyPerHead: 5,
    totalTosses: 0,
    upgrades: [],        // owned upgrade IDs
    history: [],         // structured event entries
    lastOutcome: null,   // 'heads' | 'tails' | null
    statusMessage: 'Toss the coin to begin!',
    gameOver: false,
    won: false,
  };
}
