import {
  LUCK_UPGRADE_COST,
  LUCK_UPGRADE_BOOST,
  PAYOUT_UPGRADE_COST,
  PAYOUT_UPGRADE_BOOST,
  PER_HEAD_PAYOUT,
} from './config.js';

/**
 * Returns the upgrade catalog. Each upgrade is a one-time purchase.
 */
export function getUpgradeCatalog() {
  return [
    {
      id: 'luck-1',
      name: 'Lucky Coin',
      description: `Increase heads chance by ${LUCK_UPGRADE_BOOST * 100}% (10% → 11%)`,
      cost: LUCK_UPGRADE_COST,
      effect: { type: 'headChance', value: LUCK_UPGRADE_BOOST },
    },
    {
      id: 'payout-1',
      name: 'Golden Heads',
      description: `Each heads pays $${PAYOUT_UPGRADE_BOOST} more ($${PER_HEAD_PAYOUT} → $${PER_HEAD_PAYOUT + PAYOUT_UPGRADE_BOOST})`,
      cost: PAYOUT_UPGRADE_COST,
      effect: { type: 'payout', value: PAYOUT_UPGRADE_BOOST },
    },
    {
      id: 'luck-2',
      name: 'Four-Leaf Clover',
      description: `Increase heads chance by another ${LUCK_UPGRADE_BOOST * 100}% (stacks with Lucky Coin)`,
      cost: LUCK_UPGRADE_COST * 3,
      effect: { type: 'headChance', value: LUCK_UPGRADE_BOOST },
    },
  ];
}

/**
 * Pure upgrade purchase. Returns { success, state, reason }.
 * Never mutates the input state.
 */
export function purchaseUpgrade(state, upgradeId) {
  const catalog = getUpgradeCatalog();
  const upgrade = catalog.find(u => u.id === upgradeId);

  if (!upgrade) {
    return { success: false, state, reason: `Unknown upgrade: ${upgradeId}` };
  }

  if (state.ownedUpgrades.includes(upgradeId)) {
    return { success: false, state, reason: `You already own ${upgrade.name}` };
  }

  if (state.money < upgrade.cost) {
    return { success: false, state, reason: `Cannot afford ${upgrade.name} (need $${upgrade.cost}, have $${state.money})` };
  }

  const history = [...state.history];
  let headChance = state.headChance;
  let tailChance = state.tailChance;
  let perHeadPayout = state.perHeadPayout ?? PER_HEAD_PAYOUT;

  // Apply effect
  if (upgrade.effect.type === 'headChance') {
    headChance += upgrade.effect.value;
    tailChance = 1 - headChance;
    history.push(`Purchased ${upgrade.name}! Heads chance is now ${(headChance * 100).toFixed(0)}%.`);
  } else if (upgrade.effect.type === 'payout') {
    perHeadPayout += upgrade.effect.value;
    history.push(`Purchased ${upgrade.name}! Each heads now pays $${perHeadPayout}.`);
  }

  return {
    success: true,
    state: {
      ...state,
      money: state.money - upgrade.cost,
      headChance,
      tailChance,
      perHeadPayout,
      ownedUpgrades: [...state.ownedUpgrades, upgradeId],
      history,
    },
    reason: null,
  };
}
