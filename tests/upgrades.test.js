import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/game/state.js';
import { applyTossResult } from '../src/game/engine.js';
import { canPurchaseUpgrade, purchaseUpgrade, UPGRADE_CATALOG, getPurchaseCount } from '../src/game/upgrades.js';

describe('Upgrade: purchase and odds', () => {
  it('buying odds-boost reduces balance and increases currentHeadsChance by 0.01', () => {
    const state = createInitialState();
    state.balance = 100;
    const chanceBefore = state.currentHeadsChance;
    const result = purchaseUpgrade(state, 'odds-boost');
    assert.equal(result, true);
    assert.equal(state.balance, 50);
    assert.ok(Math.abs(state.currentHeadsChance - (chanceBefore + 0.01)) < 0.0001);
    assert.equal(getPurchaseCount(state, 'odds-boost'), 1);
  });

  it('later tosses use the upgraded odds value', () => {
    const state = createInitialState();
    state.balance = 100;
    purchaseUpgrade(state, 'odds-boost');
    // Now chance is 0.11; value 0.105 should be heads
    applyTossResult(state, 0.105);
    assert.equal(state.lastOutcome, 'heads');
  });

  it('insufficient balance blocks purchase and leaves state unchanged', () => {
    const state = createInitialState();
    state.balance = 10;
    const chanceBefore = state.currentHeadsChance;
    const balBefore = state.balance;
    const result = purchaseUpgrade(state, 'odds-boost');
    assert.equal(result, false);
    assert.equal(state.balance, balBefore);
    assert.equal(state.currentHeadsChance, chanceBefore);
  });

  it('cannot purchase when game is over', () => {
    const state = createInitialState();
    state.balance = 1000;
    state.gameOver = true;
    assert.equal(canPurchaseUpgrade(state, 'odds-boost'), false);
  });

  it('respects max purchase limits', () => {
    const state = createInitialState();
    state.balance = 100000;
    const catalog = UPGRADE_CATALOG.find(u => u.id === 'odds-boost');
    for (let i = 0; i < catalog.maxPurchases; i++) {
      purchaseUpgrade(state, 'odds-boost');
    }
    assert.equal(canPurchaseUpgrade(state, 'odds-boost'), false);
  });

  it('heads chance is capped at 95%', () => {
    const state = createInitialState();
    state.balance = 100000;
    state.currentHeadsChance = 0.94;
    purchaseUpgrade(state, 'horseshoe'); // +5% would be 99%, capped to 95%
    assert.ok(state.currentHeadsChance <= 0.95);
  });

  it('reward-boost upgrade is purchasable', () => {
    const state = createInitialState();
    state.balance = 100;
    const result = purchaseUpgrade(state, 'reward-boost');
    assert.equal(result, true);
    assert.equal(state.balance, 25);
    assert.equal(getPurchaseCount(state, 'reward-boost'), 1);
  });
});
