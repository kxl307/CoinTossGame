import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveToss, canToss } from '../src/gameEngine.js';
import { createInitialState } from '../src/gameState.js';

describe('resolveToss', () => {
  it('resolves to heads and increments streak when roll < effectiveHeadChance', () => {
    const state = createInitialState(); // effectiveHeadChance = 0.10
    const result = resolveToss(state, 0.05); // below 0.10 → heads
    assert.equal(result.lastOutcome, 'heads');
    assert.equal(result.streak, 1);
  });

  it('resolves to tails and resets streak when roll >= effectiveHeadChance', () => {
    let state = createInitialState();
    state = { ...state, streak: 3 };
    const result = resolveToss(state, 0.10); // at threshold → tails
    assert.equal(result.lastOutcome, 'tails');
    assert.equal(result.streak, 0);
  });

  it('marks gameOver and won when streak reaches maxStreak (10)', () => {
    let state = createInitialState();
    state = { ...state, streak: 9 }; // one away from winning
    const result = resolveToss(state, 0.05); // heads → streak becomes 10
    assert.equal(result.streak, 10);
    assert.equal(result.gameOver, true);
    assert.equal(result.won, true);
  });

  it('increments totalTosses on each toss', () => {
    const state = createInitialState();
    const result = resolveToss(state, 0.50);
    assert.equal(result.totalTosses, 1);
  });
});

describe('canToss', () => {
  it('returns true when game is not over', () => {
    const state = createInitialState();
    assert.equal(canToss(state), true);
  });

  it('returns false when gameOver is true', () => {
    let state = createInitialState();
    state = { ...state, gameOver: true };
    assert.equal(canToss(state), false);
  });

  it('prevents resolveToss from progressing once gameOver', () => {
    let state = createInitialState();
    state = { ...state, gameOver: true, won: true, streak: 10 };
    const result = resolveToss(state, 0.05);
    // State unchanged
    assert.equal(result.streak, 10);
    assert.equal(result.totalTosses, state.totalTosses);
  });
});
