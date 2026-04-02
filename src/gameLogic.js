// Coin Toss Game - Pure gameplay logic module

const INITIAL_HEAD_CHANCE = 0.10;
const TARGET_STREAK = 10;
const REWARD_PER_HEAD = 5;

const UPGRADE_CATALOG = [
  { id: 'weighted-coin-1', label: 'Weighted Coin I', cost: 5, effect: 0.01, requires: null },
  { id: 'weighted-coin-2', label: 'Weighted Coin II', cost: 15, effect: 0.02, requires: 'weighted-coin-1' },
  { id: 'weighted-coin-3', label: 'Weighted Coin III', cost: 30, effect: 0.03, requires: 'weighted-coin-2' },
];

function createInitialState() {
  return {
    currentStreak: 0,
    bestStreak: 0,
    money: 0,
    headChance: INITIAL_HEAD_CHANCE,
    gameOver: false,
    tossCount: 0,
    purchasedUpgradeIds: [],
    history: [],
  };
}

function getUpgradeCatalog() {
  return UPGRADE_CATALOG.map(u => ({ ...u }));
}

function resolveToss(state, roll) {
  if (state.gameOver) {
    return { ...state, history: [...state.history, 'Game is already over — no more tosses allowed.'] };
  }

  const isHeads = roll < state.headChance;
  const tossCount = state.tossCount + 1;
  const historyEntries = [];

  if (isHeads) {
    const currentStreak = state.currentStreak + 1;
    const bestStreak = Math.max(state.bestStreak, currentStreak);
    const money = state.money + REWARD_PER_HEAD;
    historyEntries.push(`Toss #${tossCount}: Heads! Streak is now ${currentStreak}. Earned $${REWARD_PER_HEAD}.`);

    if (currentStreak >= TARGET_STREAK) {
      historyEntries.push(`🎉 Victory! Reached ${TARGET_STREAK} consecutive heads! Game over.`);
      return {
        ...state,
        currentStreak,
        bestStreak,
        money,
        tossCount,
        gameOver: true,
        history: [...state.history, ...historyEntries],
      };
    }

    return {
      ...state,
      currentStreak,
      bestStreak,
      money,
      tossCount,
      history: [...state.history, ...historyEntries],
    };
  } else {
    const hadStreak = state.currentStreak > 0;
    historyEntries.push(`Toss #${tossCount}: Tails.${hadStreak ? ` Streak reset from ${state.currentStreak} to 0.` : ''}`);
    return {
      ...state,
      currentStreak: 0,
      tossCount,
      history: [...state.history, ...historyEntries],
    };
  }
}

function purchaseUpgrade(state, upgradeId) {
  if (state.gameOver) {
    return { ...state, history: [...state.history, 'Game is over — no purchases allowed.'] };
  }

  const upgrade = UPGRADE_CATALOG.find(u => u.id === upgradeId);
  if (!upgrade) {
    return { ...state, history: [...state.history, `Unknown upgrade: ${upgradeId}.`] };
  }

  if (state.purchasedUpgradeIds.includes(upgradeId)) {
    return { ...state, history: [...state.history, `Already purchased ${upgrade.label}.`] };
  }

  if (upgrade.requires && !state.purchasedUpgradeIds.includes(upgrade.requires)) {
    const req = UPGRADE_CATALOG.find(u => u.id === upgrade.requires);
    return { ...state, history: [...state.history, `Cannot buy ${upgrade.label} — requires ${req ? req.label : upgrade.requires} first.`] };
  }

  if (state.money < upgrade.cost) {
    return { ...state, history: [...state.history, `Not enough money for ${upgrade.label} (need $${upgrade.cost}, have $${state.money}).`] };
  }

  const newMoney = state.money - upgrade.cost;
  const newChance = +(state.headChance + upgrade.effect).toFixed(4);
  return {
    ...state,
    money: newMoney,
    headChance: newChance,
    purchasedUpgradeIds: [...state.purchasedUpgradeIds, upgradeId],
    history: [...state.history, `Purchased ${upgrade.label} for $${upgrade.cost}. Head chance is now ${(newChance * 100).toFixed(1)}%.`],
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createInitialState, getUpgradeCatalog, resolveToss, purchaseUpgrade, TARGET_STREAK, REWARD_PER_HEAD, INITIAL_HEAD_CHANCE };
}
