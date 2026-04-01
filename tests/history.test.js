import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/game/state.js';
import { applyTossResult } from '../src/game/engine.js';
import { purchaseUpgrade } from '../src/game/upgrades.js';
import { createHistoryEntry, appendHistoryEntry, resetHistorySeq } from '../src/game/history.js';

describe('History: event recording', () => {
  it('creates a structured history entry with type and message', () => {
    resetHistorySeq();
    const entry = createHistoryEntry('toss', 'Test message', { outcome: 'heads', streak: 1, reward: 15 });
    assert.equal(entry.type, 'toss');
    assert.equal(entry.message, 'Test message');
    assert.equal(entry.outcome, 'heads');
    assert.equal(entry.streak, 1);
    assert.equal(entry.reward, 15);
    assert.equal(entry.seq, 1);
    assert.ok(entry.timestamp > 0);
  });

  it('appendHistoryEntry pushes to state.history in order', () => {
    resetHistorySeq();
    const state = createInitialState();
    const e1 = createHistoryEntry('toss', 'First');
    const e2 = createHistoryEntry('toss', 'Second');
    appendHistoryEntry(state, e1);
    appendHistoryEntry(state, e2);
    assert.equal(state.history.length, 2);
    assert.equal(state.history[0].message, 'First');
    assert.equal(state.history[1].message, 'Second');
  });

  it('toss events are appendable with heads details', () => {
    resetHistorySeq();
    const state = createInitialState();
    applyTossResult(state, 0.05); // heads
    const entry = createHistoryEntry('toss', 'heads toss', {
      outcome: state.lastOutcome,
      streak: state.streak,
      reward: state.lastReward,
    });
    appendHistoryEntry(state, entry);
    assert.equal(state.history.length, 1);
    assert.equal(state.history[0].outcome, 'heads');
  });

  it('upgrade purchase creates a history entry', () => {
    resetHistorySeq();
    const state = createInitialState();
    state.balance = 100;
    purchaseUpgrade(state, 'odds-boost');
    const entry = createHistoryEntry('upgrade', 'bought Lucky Penny', {
      upgrade: 'Lucky Penny',
      cost: 50,
    });
    appendHistoryEntry(state, entry);
    assert.equal(state.history.length, 1);
    assert.equal(state.history[0].type, 'upgrade');
    assert.equal(state.history[0].upgrade, 'Lucky Penny');
  });

  it('win event creates a terminal history entry', () => {
    resetHistorySeq();
    const state = createInitialState();
    state.currentHeadsChance = 1.0;
    for (let i = 0; i < 10; i++) applyTossResult(state, 0.0);
    assert.equal(state.win, true);
    const entry = createHistoryEntry('win', '10 consecutive heads!');
    appendHistoryEntry(state, entry);
    assert.equal(state.history[0].type, 'win');
  });

  it('history entries have incrementing sequence numbers', () => {
    resetHistorySeq();
    const e1 = createHistoryEntry('toss', 'a');
    const e2 = createHistoryEntry('toss', 'b');
    const e3 = createHistoryEntry('upgrade', 'c');
    assert.equal(e1.seq, 1);
    assert.equal(e2.seq, 2);
    assert.equal(e3.seq, 3);
  });
});
