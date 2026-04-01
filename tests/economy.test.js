import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyTossResult } from '../src/game/engine.js';
import { createInitialState } from '../src/game/state.js';

describe('Economy: reward accounting', () => {
  it('heads toss increases balance by the configured reward', () => {
    const state = createInitialState();
    applyTossResult(state, 0.05); // heads
    assert.ok(state.balance > 0, 'balance should increase on heads');
    assert.equal(state.balance, state.lastReward);
    assert.equal(state.lifetimeEarnings, state.balance);
  });

  it('tails toss leaves balance unchanged', () => {
    const state = createInitialState();
    applyTossResult(state, 0.05); // heads — earn money
    const balBefore = state.balance;
    applyTossResult(state, 0.50); // tails
    assert.equal(state.balance, balBefore, 'tails should not change balance');
    assert.equal(state.lastReward, 0);
  });

  it('cumulative balance reflects multiple heads', () => {
    const state = createInitialState();
    state.currentHeadsChance = 1.0;
    applyTossResult(state, 0.0); // heads #1
    const r1 = state.lastReward;
    applyTossResult(state, 0.0); // heads #2
    const r2 = state.lastReward;
    assert.equal(state.balance, r1 + r2);
    assert.equal(state.lifetimeEarnings, r1 + r2);
  });

  it('balance starts at zero', () => {
    const state = createInitialState();
    assert.equal(state.balance, 0);
    assert.equal(state.lifetimeEarnings, 0);
    assert.equal(state.lastReward, 0);
  });

  it('streak bonus increases reward for longer streaks', () => {
    const state = createInitialState();
    state.currentHeadsChance = 1.0;
    applyTossResult(state, 0.0); // streak 1
    const r1 = state.lastReward;
    applyTossResult(state, 0.0); // streak 2
    const r2 = state.lastReward;
    assert.ok(r2 > r1, 'higher streak should give bigger reward');
  });
});
