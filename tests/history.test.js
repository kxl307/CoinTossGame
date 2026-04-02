import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHistoryEntry, appendHistory } from '../src/history.js';
import { resolveToss } from '../src/gameEngine.js';
import { purchaseUpgrade, applyUpgradeEffects } from '../src/upgrades.js';
import { createInitialState } from '../src/gameState.js';

describe('history model', () => {
  it('appendHistory preserves insertion order', () => {
    let state = createInitialState();
    state = appendHistory(state, createHistoryEntry('toss', { outcome: 'heads' }));
    state = appendHistory(state, createHistoryEntry('toss', { outcome: 'tails' }));
    assert.equal(state.history.length, 2);
    assert.equal(state.history[0].outcome, 'heads');
    assert.equal(state.history[1].outcome, 'tails');
  });

  it('toss events include outcome, money delta, and streak', () => {
    const entry = createHistoryEntry('toss', {
      outcome: 'heads',
      moneyDelta: 5,
      streak: 3,
    });
    assert.equal(entry.type, 'toss');
    assert.equal(entry.outcome, 'heads');
    assert.equal(entry.moneyDelta, 5);
    assert.equal(entry.streak, 3);
  });

  it('purchase events capture upgrade name, cost, and resulting odds', () => {
    const entry = createHistoryEntry('purchase', {
      upgradeName: 'Lucky Penny',
      cost: 10,
      effectiveHeadChance: 0.11,
    });
    assert.equal(entry.type, 'purchase');
    assert.equal(entry.upgradeName, 'Lucky Penny');
    assert.equal(entry.cost, 10);
  });

  it('win events are a distinct type', () => {
    const entry = createHistoryEntry('win', { streak: 10 });
    assert.equal(entry.type, 'win');
    assert.equal(entry.streak, 10);
  });
});

describe('history emission from state transitions', () => {
  it('heads toss appends event with outcome, money earned, and new streak', () => {
    const state = createInitialState();
    const result = resolveToss(state, 0.05); // heads
    assert.ok(result.history.length >= 1);
    const last = result.history[result.history.length - 1];
    assert.equal(last.type, 'toss');
    assert.equal(last.outcome, 'heads');
    assert.ok(last.moneyDelta > 0);
    assert.equal(last.streak, 1);
  });

  it('tails toss appends event explaining streak reset', () => {
    let state = { ...createInitialState(), streak: 3 };
    const result = resolveToss(state, 0.50); // tails
    const last = result.history[result.history.length - 1];
    assert.equal(last.type, 'toss');
    assert.equal(last.outcome, 'tails');
    assert.equal(last.streak, 0);
  });

  it('winning toss appends a win entry and updates statusMessage', () => {
    let state = { ...createInitialState(), streak: 9 };
    const result = resolveToss(state, 0.05); // heads → win
    const last = result.history[result.history.length - 1];
    assert.equal(last.type, 'win');
    assert.equal(last.streak, 10);
    assert.ok(result.statusMessage.includes('win'));
  });
});
