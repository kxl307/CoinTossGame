import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UPGRADES, purchaseUpgrade, applyUpgradeEffects } from '../src/upgrades.js';
import { resolveToss } from '../src/gameEngine.js';
import { createInitialState } from '../src/gameState.js';

describe('upgrade catalog', () => {
  it('includes a baseline upgrade that moves head chance from 0.10 to 0.11', () => {
    const lucky = UPGRADES.find(u => u.id === 'lucky-penny');
    assert.ok(lucky);
    assert.equal(lucky.effect.field, 'headChance');
    assert.equal(lucky.effect.delta, 0.01);
  });
});

describe('purchaseUpgrade', () => {
  it('rejects purchase when player lacks money', () => {
    const state = createInitialState(); // money = 0
    const result = purchaseUpgrade(state, 'lucky-penny');
    assert.equal(result, null);
  });

  it('deducts cost and records ownership when affordable', () => {
    let state = { ...createInitialState(), money: 15 };
    const result = purchaseUpgrade(state, 'lucky-penny');
    assert.ok(result);
    assert.equal(result.money, 5); // 15 - 10
    assert.ok(result.upgrades.includes('lucky-penny'));
  });

  it('rejects duplicate purchase', () => {
    let state = { ...createInitialState(), money: 50, upgrades: ['lucky-penny'] };
    const result = purchaseUpgrade(state, 'lucky-penny');
    assert.equal(result, null);
  });
});

describe('applyUpgradeEffects', () => {
  it('derives effectiveHeadChance from owned upgrades without mutating base', () => {
    let state = { ...createInitialState(), upgrades: ['lucky-penny'] };
    const result = applyUpgradeEffects(state);
    assert.equal(result.baseHeadChance, 0.10);
    const expected = 0.11;
    assert.ok(Math.abs(result.effectiveHeadChance - expected) < 1e-9);
  });

  it('stacks multiple head-chance upgrades', () => {
    let state = { ...createInitialState(), upgrades: ['lucky-penny', 'double-down'] };
    const result = applyUpgradeEffects(state);
    const expected = 0.13; // 0.10 + 0.01 + 0.02
    assert.ok(Math.abs(result.effectiveHeadChance - expected) < 1e-9);
  });
});

describe('money rewards', () => {
  it('heads awards money', () => {
    const state = createInitialState();
    const result = resolveToss(state, 0.05); // heads
    assert.ok(result.money > 0);
  });

  it('tails does not award money', () => {
    const state = createInitialState();
    const result = resolveToss(state, 0.50); // tails
    assert.equal(result.money, 0);
  });

  it('after Lucky Penny, roll below 0.11 resolves to heads', () => {
    let state = { ...createInitialState(), upgrades: ['lucky-penny'] };
    state = applyUpgradeEffects(state);
    const result = resolveToss(state, 0.105); // between 0.10 and 0.11 → heads with upgrade
    assert.equal(result.lastOutcome, 'heads');
  });

  it('after Lucky Penny, roll at 0.11 resolves to tails', () => {
    let state = { ...createInitialState(), upgrades: ['lucky-penny'] };
    state = applyUpgradeEffects(state);
    const result = resolveToss(state, 0.11);
    assert.equal(result.lastOutcome, 'tails');
  });

  it('upgraded odds persist across multiple tosses', () => {
    let state = { ...createInitialState(), upgrades: ['lucky-penny'] };
    state = applyUpgradeEffects(state);
    // Multiple heads at 0.105 — should all resolve to heads with 11% chance
    state = resolveToss(state, 0.105);
    assert.equal(state.lastOutcome, 'heads');
    state = resolveToss(state, 0.105);
    assert.equal(state.lastOutcome, 'heads');
    assert.equal(state.streak, 2);
  });
});
