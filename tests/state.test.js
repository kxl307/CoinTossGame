import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from '../src/game/state.js';
import {
  BASE_HEAD_CHANCE,
  BASE_TAIL_CHANCE,
  STARTING_MONEY,
  TARGET_STREAK,
} from '../src/game/config.js';

describe('createInitialGameState', () => {
  it('returns an object with all roadmap-required fields', () => {
    const state = createInitialGameState();
    const requiredKeys = [
      'currentStreak',
      'bestStreak',
      'money',
      'headChance',
      'tailChance',
      'isGameOver',
      'ownedUpgrades',
      'history',
      'lastOutcome',
    ];
    for (const key of requiredKeys) {
      assert.ok(key in state, `missing field: ${key}`);
    }
  });

  it('starts with zero streak and zero money', () => {
    const state = createInitialGameState();
    assert.strictEqual(state.currentStreak, 0);
    assert.strictEqual(state.bestStreak, 0);
    assert.strictEqual(state.money, STARTING_MONEY);
  });

  it('uses baseline odds of 10% heads / 90% tails', () => {
    const state = createInitialGameState();
    assert.strictEqual(state.headChance, BASE_HEAD_CHANCE);
    assert.strictEqual(state.headChance, 0.10);
    assert.strictEqual(state.tailChance, BASE_TAIL_CHANCE);
    assert.strictEqual(state.tailChance, 0.90);
  });

  it('head and tail chances are complementary', () => {
    const state = createInitialGameState();
    assert.strictEqual(state.headChance + state.tailChance, 1);
  });

  it('starts with game not over', () => {
    const state = createInitialGameState();
    assert.strictEqual(state.isGameOver, false);
  });

  it('starts with empty upgrades and history', () => {
    const state = createInitialGameState();
    assert.deepStrictEqual(state.ownedUpgrades, []);
    assert.deepStrictEqual(state.history, []);
  });

  it('tracks target streak from config', () => {
    const state = createInitialGameState();
    assert.strictEqual(state.targetStreak, TARGET_STREAK);
    assert.strictEqual(state.targetStreak, 10);
  });

  it('returns independent state objects on each call', () => {
    const a = createInitialGameState();
    const b = createInitialGameState();
    a.money = 999;
    assert.notStrictEqual(a.money, b.money);
  });
});
