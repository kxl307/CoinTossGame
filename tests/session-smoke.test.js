import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/game/state.js';
import { applyTossResult } from '../src/game/engine.js';
import { purchaseUpgrade, getPurchaseCount } from '../src/game/upgrades.js';
import { appendHistoryEntry, createHistoryEntry, resetHistorySeq } from '../src/game/history.js';
import { BASE_HEADS_CHANCE } from '../src/game/config.js';

describe('Session smoke: integrated game flow', () => {
  it('scripted session: earn, upgrade, verify new odds, log history', () => {
    resetHistorySeq();
    const state = createInitialState();

    // Earn money with several heads
    const headsValues = [0.05, 0.05, 0.05]; // all heads
    for (const v of headsValues) {
      applyTossResult(state, v);
      appendHistoryEntry(state, createHistoryEntry('toss', `Toss #${state.tossCount}`, { outcome: 'heads', streak: state.streak }));
    }
    assert.equal(state.streak, 3);
    assert.ok(state.balance > 0);
    assert.equal(state.history.length, 3);

    // Buy odds upgrade
    const balBefore = state.balance;
    if (state.balance >= 50) {
      purchaseUpgrade(state, 'odds-boost');
      appendHistoryEntry(state, createHistoryEntry('upgrade', 'Bought Lucky Penny'));
      assert.ok(state.currentHeadsChance > BASE_HEADS_CHANCE);
      assert.equal(getPurchaseCount(state, 'odds-boost'), 1);
    }

    // Tails to reset streak
    applyTossResult(state, 0.99);
    appendHistoryEntry(state, createHistoryEntry('toss', 'Tails', { outcome: 'tails' }));
    assert.equal(state.streak, 0);

    // Upgraded chance persists
    assert.ok(state.currentHeadsChance > BASE_HEADS_CHANCE);
    assert.ok(state.history.length >= 4);
  });

  it('10-head streak marks game over and prevents further tosses', () => {
    resetHistorySeq();
    const state = createInitialState();
    state.currentHeadsChance = 1.0;

    for (let i = 0; i < 10; i++) {
      applyTossResult(state, 0.0);
    }
    assert.equal(state.win, true);
    assert.equal(state.gameOver, true);
    assert.equal(state.streak, 10);

    const tossCountBefore = state.tossCount;
    applyTossResult(state, 0.0); // should be blocked
    assert.equal(state.tossCount, tossCountBefore);
  });

  it('reset creates fresh state with base odds, zero balance, empty history', () => {
    resetHistorySeq();
    const state = createInitialState();
    state.currentHeadsChance = 1.0;
    for (let i = 0; i < 5; i++) applyTossResult(state, 0.0);
    purchaseUpgrade(state, 'odds-boost');
    appendHistoryEntry(state, createHistoryEntry('toss', 'test'));

    // Simulate reset
    const fresh = createInitialState();
    assert.equal(fresh.balance, 0);
    assert.equal(fresh.streak, 0);
    assert.equal(fresh.currentHeadsChance, BASE_HEADS_CHANCE);
    assert.equal(fresh.history.length, 0);
    assert.equal(fresh.purchasedUpgrades.length, 0);
    assert.equal(fresh.gameOver, false);
    assert.equal(fresh.win, false);
    assert.equal(fresh.tossCount, 0);
  });
});
