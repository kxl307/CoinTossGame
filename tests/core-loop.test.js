import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveToss, applyTossResult } from '../src/game/engine.js';
import { createInitialState } from '../src/game/state.js';
import { BASE_HEADS_CHANCE } from '../src/game/config.js';

describe('resolveToss', () => {
  it('returns heads for random values below headsChance', () => {
    assert.equal(resolveToss(0.05, 0.10), 'heads');
    assert.equal(resolveToss(0.0, 0.10), 'heads');
    assert.equal(resolveToss(0.099, 0.10), 'heads');
  });

  it('returns tails for random values at or above headsChance', () => {
    assert.equal(resolveToss(0.10, 0.10), 'tails');
    assert.equal(resolveToss(0.5, 0.10), 'tails');
    assert.equal(resolveToss(0.99, 0.10), 'tails');
  });
});

describe('applyTossResult', () => {
  it('increments streak on heads', () => {
    const state = createInitialState();
    applyTossResult(state, 0.05); // heads
    assert.equal(state.streak, 1);
    assert.equal(state.lastOutcome, 'heads');
    assert.equal(state.tossCount, 1);
  });

  it('resets streak on tails', () => {
    const state = createInitialState();
    applyTossResult(state, 0.05); // heads — streak 1
    applyTossResult(state, 0.05); // heads — streak 2
    applyTossResult(state, 0.50); // tails — streak 0
    assert.equal(state.streak, 0);
    assert.equal(state.lastOutcome, 'tails');
  });

  it('sets win and gameOver at 10 consecutive heads', () => {
    const state = createInitialState();
    state.currentHeadsChance = 1.0; // force heads
    for (let i = 0; i < 10; i++) {
      applyTossResult(state, 0.0);
    }
    assert.equal(state.streak, 10);
    assert.equal(state.win, true);
    assert.equal(state.gameOver, true);
  });

  it('does not change state after gameOver', () => {
    const state = createInitialState();
    state.currentHeadsChance = 1.0;
    for (let i = 0; i < 10; i++) applyTossResult(state, 0.0);
    const snapToss = state.tossCount;
    const snapStreak = state.streak;
    applyTossResult(state, 0.0);
    assert.equal(state.tossCount, snapToss);
    assert.equal(state.streak, snapStreak);
  });

  it('uses currentHeadsChance from state for resolution', () => {
    const state = createInitialState();
    state.currentHeadsChance = 0.50;
    // 0.40 < 0.50, so should be heads
    applyTossResult(state, 0.40);
    assert.equal(state.lastOutcome, 'heads');
  });
});
