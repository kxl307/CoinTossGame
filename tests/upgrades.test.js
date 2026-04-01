import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getUpgradeCatalog, purchaseUpgrade } from '../src/game/upgrades.js';
import { createInitialGameState } from '../src/game/state.js';
import { resolveToss } from '../src/game/engine.js';
import { LUCK_UPGRADE_COST, LUCK_UPGRADE_BOOST, PER_HEAD_PAYOUT, PAYOUT_UPGRADE_BOOST } from '../src/game/config.js';

describe('getUpgradeCatalog', () => {
  it('returns at least two upgrades', () => {
    const catalog = getUpgradeCatalog();
    assert.ok(catalog.length >= 2, 'need at least two upgrades');
  });

  it('includes a luck upgrade that boosts head chance', () => {
    const catalog = getUpgradeCatalog();
    const luck = catalog.find(u => u.id === 'luck-1');
    assert.ok(luck, 'luck-1 upgrade should exist');
    assert.strictEqual(luck.effect.type, 'headChance');
    assert.strictEqual(luck.effect.value, LUCK_UPGRADE_BOOST);
  });

  it('each upgrade has id, name, description, cost, and effect', () => {
    const catalog = getUpgradeCatalog();
    for (const u of catalog) {
      assert.ok(u.id, 'id');
      assert.ok(u.name, 'name');
      assert.ok(u.description, 'description');
      assert.ok(typeof u.cost === 'number' && u.cost > 0, 'cost > 0');
      assert.ok(u.effect, 'effect');
    }
  });
});

describe('purchaseUpgrade', () => {
  it('rejects unknown upgrade ids', () => {
    const state = { ...createInitialGameState(), money: 999 };
    const result = purchaseUpgrade(state, 'nonexistent');
    assert.strictEqual(result.success, false);
    assert.ok(result.reason.includes('Unknown'));
  });

  it('rejects purchase when player cannot afford it', () => {
    const state = { ...createInitialGameState(), money: 0 };
    const result = purchaseUpgrade(state, 'luck-1');
    assert.strictEqual(result.success, false);
    assert.ok(result.reason.includes('afford'));
  });

  it('deducts cost on successful purchase', () => {
    const state = { ...createInitialGameState(), money: LUCK_UPGRADE_COST + 10 };
    const result = purchaseUpgrade(state, 'luck-1');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.state.money, 10);
  });

  it('first luck upgrade changes head chance from 0.10 to 0.11', () => {
    const state = { ...createInitialGameState(), money: LUCK_UPGRADE_COST };
    const result = purchaseUpgrade(state, 'luck-1');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.state.headChance, 0.10 + LUCK_UPGRADE_BOOST);
    assert.strictEqual(result.state.tailChance, 1 - result.state.headChance);
  });

  it('records upgrade in ownedUpgrades', () => {
    const state = { ...createInitialGameState(), money: LUCK_UPGRADE_COST };
    const result = purchaseUpgrade(state, 'luck-1');
    assert.ok(result.state.ownedUpgrades.includes('luck-1'));
  });

  it('prevents buying same one-time upgrade twice', () => {
    let state = { ...createInitialGameState(), money: LUCK_UPGRADE_COST * 2 };
    const first = purchaseUpgrade(state, 'luck-1');
    const second = purchaseUpgrade(first.state, 'luck-1');
    assert.strictEqual(second.success, false);
    assert.ok(second.reason.includes('already'));
  });

  it('appends readable purchase history entry', () => {
    const state = { ...createInitialGameState(), money: LUCK_UPGRADE_COST };
    const result = purchaseUpgrade(state, 'luck-1');
    const entry = result.state.history[result.state.history.length - 1];
    assert.ok(entry.includes('Purchased'), 'should mention purchase');
  });

  it('later tosses use upgraded head chance', () => {
    let state = { ...createInitialGameState(), money: LUCK_UPGRADE_COST };
    const result = purchaseUpgrade(state, 'luck-1');
    state = result.state;
    // randomValue 0.10 should now be heads (headChance is 0.11)
    const next = resolveToss(state, 0.10);
    assert.strictEqual(next.lastOutcome, 'heads');
  });

  it('payout upgrade increases per-head earnings', () => {
    const catalog = getUpgradeCatalog();
    const payoutUpg = catalog.find(u => u.effect.type === 'payout');
    if (!payoutUpg) return; // skip if no payout upgrade exists
    let state = { ...createInitialGameState(), money: payoutUpg.cost };
    const result = purchaseUpgrade(state, payoutUpg.id);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.state.perHeadPayout, PER_HEAD_PAYOUT + PAYOUT_UPGRADE_BOOST);
  });

  it('does not mutate original state', () => {
    const state = { ...createInitialGameState(), money: LUCK_UPGRADE_COST };
    const original_money = state.money;
    purchaseUpgrade(state, 'luck-1');
    assert.strictEqual(state.money, original_money);
  });
});
