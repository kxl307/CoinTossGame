/**
 * Data-driven upgrade catalog. Add new entries here to extend progression.
 * Each upgrade: { id, name, description, cost, effect: { field, delta } }
 */
export const UPGRADES = [
  {
    id: 'lucky-penny',
    name: 'Lucky Penny',
    description: '+1% head chance',
    cost: 10,
    effect: { field: 'headChance', delta: 0.01 },
  },
  {
    id: 'double-down',
    name: 'Double Down',
    description: '+2% head chance',
    cost: 30,
    effect: { field: 'headChance', delta: 0.02 },
  },
  {
    id: 'golden-edge',
    name: 'Golden Edge',
    description: '+5% head chance',
    cost: 80,
    effect: { field: 'headChance', delta: 0.05 },
  },
  {
    id: 'money-magnet',
    name: 'Money Magnet',
    description: 'Double money per head',
    cost: 25,
    effect: { field: 'moneyMultiplier', delta: 1 },
  },
];

/**
 * Attempt to purchase an upgrade. Returns updated state or null if cannot afford / already owned.
 */
export function purchaseUpgrade(state, upgradeId) {
  const upgrade = UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade) return null;
  if (state.upgrades.includes(upgradeId)) return null;
  if (state.money < upgrade.cost) return null;

  return {
    ...state,
    money: state.money - upgrade.cost,
    upgrades: [...state.upgrades, upgradeId],
  };
}

/**
 * Derive effectiveHeadChance and moneyPerHead from owned upgrades.
 * Always builds from base values so effects are additive and traceable.
 */
export function applyUpgradeEffects(state) {
  let headChanceBonus = 0;
  let moneyMultiplier = 1;

  for (const ownedId of state.upgrades) {
    const upgrade = UPGRADES.find(u => u.id === ownedId);
    if (!upgrade) continue;
    if (upgrade.effect.field === 'headChance') {
      headChanceBonus += upgrade.effect.delta;
    } else if (upgrade.effect.field === 'moneyMultiplier') {
      moneyMultiplier += upgrade.effect.delta;
    }
  }

  return {
    ...state,
    effectiveHeadChance: state.baseHeadChance + headChanceBonus,
    moneyPerHead: 5 * moneyMultiplier,
  };
}
