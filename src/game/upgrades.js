export const UPGRADE_CATALOG = [
  {
    id: 'odds-boost',
    name: 'Lucky Penny',
    description: '+1% head chance',
    cost: 50,
    repeatable: true,
    maxPurchases: 30,
    apply(state) { state.currentHeadsChance += 0.01; },
  },
  {
    id: 'reward-boost',
    name: 'Gold Magnet',
    description: '+$5 base heads reward',
    cost: 75,
    repeatable: true,
    maxPurchases: 20,
    apply(state) { /* reward boost tracked via purchasedUpgrades count */ },
  },
  {
    id: 'mega-odds',
    name: 'Four-Leaf Clover',
    description: '+3% head chance',
    cost: 200,
    repeatable: true,
    maxPurchases: 10,
    apply(state) { state.currentHeadsChance += 0.03; },
  },
  {
    id: 'horseshoe',
    name: 'Golden Horseshoe',
    description: '+5% head chance',
    cost: 500,
    repeatable: true,
    maxPurchases: 5,
    apply(state) { state.currentHeadsChance += 0.05; },
  },
];

export function canPurchaseUpgrade(state, upgradeId) {
  const catalog = UPGRADE_CATALOG.find(u => u.id === upgradeId);
  if (!catalog) return false;
  const owned = getPurchaseCount(state, upgradeId);
  return state.balance >= catalog.cost && owned < catalog.maxPurchases && !state.gameOver;
}

export function purchaseUpgrade(state, upgradeId) {
  if (!canPurchaseUpgrade(state, upgradeId)) return false;
  const catalog = UPGRADE_CATALOG.find(u => u.id === upgradeId);

  state.balance -= catalog.cost;

  const existing = state.purchasedUpgrades.find(u => u.id === upgradeId);
  if (existing) {
    existing.count++;
  } else {
    state.purchasedUpgrades.push({ id: upgradeId, count: 1 });
  }

  catalog.apply(state);
  state.currentHeadsChance = Math.min(state.currentHeadsChance, 0.95);

  return true;
}

export function getPurchaseCount(state, upgradeId) {
  const entry = state.purchasedUpgrades.find(u => u.id === upgradeId);
  return entry ? entry.count : 0;
}

export function getRewardBonus(state) {
  return getPurchaseCount(state, 'reward-boost') * 5;
}
