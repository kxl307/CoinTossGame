// Coin Toss Game — Core Engine

const GameState = {
  PLAYING: 'playing',
  WON: 'won',
};

function createGame() {
  return {
    status: GameState.PLAYING,
    baseHeadChance: 0.10,
    consecutiveHeads: 0,
    totalTosses: 0,
    money: 0,
    upgrades: [],
    history: [],
  };
}

function getEffectiveHeadChance(game) {
  let chance = game.baseHeadChance;
  for (const u of game.upgrades) {
    if (u.effect.type === 'headChanceBonus') {
      chance += u.effect.value;
    }
  }
  return Math.min(chance, 1);
}

function tossCoin(game) {
  if (game.status === GameState.WON) return game;

  const chance = getEffectiveHeadChance(game);
  const roll = Math.random();
  const isHeads = roll < chance;
  game.totalTosses++;

  if (isHeads) {
    game.consecutiveHeads++;
    const reward = 10 + game.consecutiveHeads * 5;
    game.money += reward;

    addHistory(game, {
      type: 'toss',
      outcome: 'heads',
      streak: game.consecutiveHeads,
      reward,
      money: game.money,
    });

    if (game.consecutiveHeads >= 10) {
      game.status = GameState.WON;
      addHistory(game, { type: 'win', totalTosses: game.totalTosses, finalMoney: game.money });
    }
  } else {
    const lostStreak = game.consecutiveHeads;
    game.consecutiveHeads = 0;

    addHistory(game, {
      type: 'toss',
      outcome: 'tails',
      lostStreak,
      money: game.money,
    });
  }

  return game;
}

// --- Upgrades catalog ---

const UPGRADES_CATALOG = [
  {
    id: 'luck1',
    name: 'Lucky Penny',
    description: '+1% head chance',
    cost: 50,
    effect: { type: 'headChanceBonus', value: 0.01 },
    maxPurchases: 10,
  },
  {
    id: 'luck2',
    name: 'Four-Leaf Clover',
    description: '+3% head chance',
    cost: 200,
    effect: { type: 'headChanceBonus', value: 0.03 },
    maxPurchases: 5,
  },
  {
    id: 'luck3',
    name: 'Golden Horseshoe',
    description: '+5% head chance',
    cost: 500,
    effect: { type: 'headChanceBonus', value: 0.05 },
    maxPurchases: 3,
  },
];

function getAvailableUpgrades(game) {
  return UPGRADES_CATALOG.map((catalog) => {
    const purchased = game.upgrades.filter((u) => u.id === catalog.id).length;
    return { ...catalog, purchased, canBuy: purchased < catalog.maxPurchases && game.money >= catalog.cost };
  });
}

function buyUpgrade(game, upgradeId) {
  if (game.status === GameState.WON) return { success: false, reason: 'Game already won' };

  const catalog = UPGRADES_CATALOG.find((u) => u.id === upgradeId);
  if (!catalog) return { success: false, reason: 'Unknown upgrade' };

  const purchased = game.upgrades.filter((u) => u.id === upgradeId).length;
  if (purchased >= catalog.maxPurchases) return { success: false, reason: 'Max purchases reached' };
  if (game.money < catalog.cost) return { success: false, reason: 'Not enough money' };

  game.money -= catalog.cost;
  game.upgrades.push({ id: catalog.id, name: catalog.name, effect: catalog.effect });

  addHistory(game, {
    type: 'upgrade',
    upgrade: catalog.name,
    cost: catalog.cost,
    money: game.money,
    newHeadChance: getEffectiveHeadChance(game),
  });

  return { success: true };
}

// --- History ---

function addHistory(game, event) {
  game.history.push({ ...event, toss: game.totalTosses, timestamp: Date.now() });
}

function formatHistory(game) {
  return game.history.map((e) => {
    switch (e.type) {
      case 'toss':
        if (e.outcome === 'heads') {
          return `#${e.toss}: HEADS — streak ${e.streak}, earned $${e.reward} (balance: $${e.money})`;
        }
        return `#${e.toss}: TAILS${e.lostStreak > 0 ? ` — lost streak of ${e.lostStreak}` : ''} (balance: $${e.money})`;
      case 'upgrade':
        return `#${e.toss}: UPGRADE — bought ${e.upgrade} for $${e.cost} (balance: $${e.money}, head chance: ${(e.newHeadChance * 100).toFixed(1)}%)`;
      case 'win':
        return `#${e.toss}: 🎉 WIN — 10 consecutive heads after ${e.totalTosses} tosses! Final balance: $${e.finalMoney}`;
      default:
        return `#${e.toss}: ${e.type}`;
    }
  });
}

// Export for both Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createGame, tossCoin, getEffectiveHeadChance, getAvailableUpgrades, buyUpgrade, formatHistory, GameState, UPGRADES_CATALOG };
}
