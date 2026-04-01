import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rollCoin, resolveToss } from '../src/game/engine.js';
import { createInitialGameState } from '../src/game/state.js';
import { PER_HEAD_PAYOUT, TARGET_STREAK } from '../src/game/config.js';

describe('rollCoin', () => {
  it('returns "heads" when random value is below head chance', () => {
    assert.strictEqual(rollCoin(0.05, 0.10), 'heads');
  });

  it('returns "heads" at exactly 0 (edge)', () => {
    assert.strictEqual(rollCoin(0, 0.10), 'heads');
  });

  it('returns "tails" when random value equals head chance', () => {
    assert.strictEqual(rollCoin(0.10, 0.10), 'tails');
  });

  it('returns "tails" when random value exceeds head chance', () => {
    assert.strictEqual(rollCoin(0.50, 0.10), 'tails');
  });

  it('respects upgraded head chance', () => {
    assert.strictEqual(rollCoin(0.15, 0.20), 'heads');
    assert.strictEqual(rollCoin(0.25, 0.20), 'tails');
  });
});

describe('resolveToss', () => {
  it('increments streak and awards money on heads', () => {
    const state = createInitialGameState();
    const next = resolveToss(state, 0.05); // forces heads
    assert.strictEqual(next.currentStreak, 1);
    assert.strictEqual(next.money, PER_HEAD_PAYOUT);
    assert.strictEqual(next.lastOutcome, 'heads');
    assert.strictEqual(next.totalTosses, 1);
    assert.strictEqual(next.totalHeads, 1);
  });

  it('updates best streak when current exceeds it', () => {
    let state = createInitialGameState();
    state = resolveToss(state, 0.05); // heads → streak 1
    state = resolveToss(state, 0.05); // heads → streak 2
    assert.strictEqual(state.bestStreak, 2);
    state = resolveToss(state, 0.99); // tails → reset
    assert.strictEqual(state.bestStreak, 2);
    assert.strictEqual(state.currentStreak, 0);
  });

  it('resets streak on tails but preserves best streak', () => {
    let state = createInitialGameState();
    state = resolveToss(state, 0.05); // heads → streak 1
    assert.strictEqual(state.currentStreak, 1);
    state = resolveToss(state, 0.99); // tails → reset
    assert.strictEqual(state.currentStreak, 0);
    assert.strictEqual(state.bestStreak, 1);
    assert.strictEqual(state.lastOutcome, 'tails');
  });

  it('does not award money on tails', () => {
    const state = createInitialGameState();
    const next = resolveToss(state, 0.99); // tails
    assert.strictEqual(next.money, 0);
  });

  it('triggers game over at exactly 10 consecutive heads', () => {
    let state = createInitialGameState();
    for (let i = 0; i < TARGET_STREAK; i++) {
      state = resolveToss(state, 0.05);
    }
    assert.strictEqual(state.currentStreak, TARGET_STREAK);
    assert.strictEqual(state.isGameOver, true);
  });

  it('rejects toss after game is over', () => {
    let state = createInitialGameState();
    for (let i = 0; i < TARGET_STREAK; i++) {
      state = resolveToss(state, 0.05);
    }
    assert.strictEqual(state.isGameOver, true);
    const frozen = resolveToss(state, 0.05);
    assert.strictEqual(frozen, state); // exact same reference
  });

  it('does not mutate the original state', () => {
    const state = createInitialGameState();
    const next = resolveToss(state, 0.05);
    assert.strictEqual(state.currentStreak, 0);
    assert.strictEqual(next.currentStreak, 1);
  });

  it('appends readable history entry on heads', () => {
    const state = createInitialGameState();
    const next = resolveToss(state, 0.05);
    assert.strictEqual(next.history.length, 1);
    assert.ok(next.history[0].includes('Heads'), 'should mention Heads');
    assert.ok(next.history[0].includes(`$${PER_HEAD_PAYOUT}`), 'should mention payout');
  });

  it('appends readable history entry on tails', () => {
    let state = createInitialGameState();
    state = resolveToss(state, 0.05); // heads first
    state = resolveToss(state, 0.99); // tails
    const tailEntry = state.history[state.history.length - 1];
    assert.ok(tailEntry.includes('Tails'), 'should mention Tails');
    assert.ok(tailEntry.includes('reset'), 'should mention reset');
  });

  it('appends readable win event in history', () => {
    let state = createInitialGameState();
    for (let i = 0; i < TARGET_STREAK; i++) {
      state = resolveToss(state, 0.05);
    }
    const lastEntry = state.history[state.history.length - 1];
    assert.ok(
      lastEntry.toLowerCase().includes('win') || lastEntry.includes('🎉'),
      'should record the win event'
    );
  });

  it('records streak reset only when there was a streak to lose', () => {
    const state = createInitialGameState();
    const next = resolveToss(state, 0.99); // tails with 0 streak
    const tailEntry = next.history[next.history.length - 1];
    assert.ok(tailEntry.includes('Tails'), 'should still record tails');
  });
});
