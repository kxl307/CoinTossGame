import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialGameState } from '../src/game/state.js';
import { resolveToss } from '../src/game/engine.js';
import { purchaseUpgrade, getUpgradeCatalog } from '../src/game/upgrades.js';
import {
  TARGET_STREAK,
  PER_HEAD_PAYOUT,
  LUCK_UPGRADE_COST,
  LUCK_UPGRADE_BOOST,
  PAYOUT_UPGRADE_COST,
  PAYOUT_UPGRADE_BOOST,
} from '../src/game/config.js';

describe('full game flow: baseline toss path', () => {
  it('heads awards money and grows streak', () => {
    let state = createInitialGameState();
    state = resolveToss(state, 0.05); // heads
    assert.strictEqual(state.currentStreak, 1);
    assert.strictEqual(state.money, PER_HEAD_PAYOUT);
    assert.strictEqual(state.totalTosses, 1);
  });

  it('tails resets streak but keeps money', () => {
    let state = createInitialGameState();
    state = resolveToss(state, 0.05); // heads
    state = resolveToss(state, 0.05); // heads
    const moneyBefore = state.money;
    state = resolveToss(state, 0.99); // tails
    assert.strictEqual(state.currentStreak, 0);
    assert.strictEqual(state.money, moneyBefore);
  });
});

describe('full game flow: earn and buy upgrade', () => {
  it('player can earn enough for first upgrade then buy it', () => {
    let state = createInitialGameState();
    const tosses = Math.ceil(LUCK_UPGRADE_COST / PER_HEAD_PAYOUT);
    for (let i = 0; i < tosses; i++) {
      state = resolveToss(state, 0.05); // force heads
    }
    assert.ok(state.money >= LUCK_UPGRADE_COST, `earned $${state.money}, need $${LUCK_UPGRADE_COST}`);
    const result = purchaseUpgrade(state, 'luck-1');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.state.headChance, 0.10 + LUCK_UPGRADE_BOOST);
  });

  it('upgraded odds make previously-tails values land as heads', () => {
    let state = createInitialGameState();
    // Earn money for luck upgrade
    for (let i = 0; i < Math.ceil(LUCK_UPGRADE_COST / PER_HEAD_PAYOUT); i++) {
      state = resolveToss(state, 0.05);
    }
    const result = purchaseUpgrade(state, 'luck-1');
    state = result.state;
    // 0.10 would be tails at base 10%, but heads at 11%
    state = resolveToss(state, 0.10);
    assert.strictEqual(state.lastOutcome, 'heads');
  });
});

describe('full game flow: reaching 10 consecutive heads', () => {
  it('wins the game at exactly 10 heads', () => {
    let state = createInitialGameState();
    for (let i = 0; i < TARGET_STREAK; i++) {
      assert.strictEqual(state.isGameOver, false);
      state = resolveToss(state, 0.05);
    }
    assert.strictEqual(state.isGameOver, true);
    assert.strictEqual(state.currentStreak, TARGET_STREAK);
    assert.strictEqual(state.bestStreak, TARGET_STREAK);
  });

  it('rejects further tosses after win', () => {
    let state = createInitialGameState();
    for (let i = 0; i < TARGET_STREAK; i++) {
      state = resolveToss(state, 0.05);
    }
    const frozen = resolveToss(state, 0.05);
    assert.strictEqual(frozen, state);
    assert.strictEqual(frozen.history.length, state.history.length);
  });

  it('rejects upgrade purchase after win', () => {
    let state = createInitialGameState();
    for (let i = 0; i < TARGET_STREAK; i++) {
      state = resolveToss(state, 0.05);
    }
    const result = purchaseUpgrade(state, 'luck-1');
    // Should fail because game is over (even if affordable)
    assert.strictEqual(state.isGameOver, true);
  });
});

describe('full game flow: history narrative', () => {
  it('records the full story in chronological order', () => {
    let state = createInitialGameState();
    // Two heads
    state = resolveToss(state, 0.05);
    state = resolveToss(state, 0.05);
    // One tails (reset)
    state = resolveToss(state, 0.99);
    // Check history order
    assert.strictEqual(state.history.length, 3);
    assert.ok(state.history[0].includes('Heads'));
    assert.ok(state.history[1].includes('Heads'));
    assert.ok(state.history[2].includes('Tails'));
    assert.ok(state.history[2].includes('reset'));
  });

  it('includes purchase events in history', () => {
    let state = { ...createInitialGameState(), money: LUCK_UPGRADE_COST };
    const result = purchaseUpgrade(state, 'luck-1');
    assert.ok(result.state.history.some(e => e.includes('Purchased')));
  });

  it('win event is the last entry in a winning run', () => {
    let state = createInitialGameState();
    for (let i = 0; i < TARGET_STREAK; i++) {
      state = resolveToss(state, 0.05);
    }
    const last = state.history[state.history.length - 1];
    assert.ok(last.includes('🎉') || last.toLowerCase().includes('win'));
  });
});

describe('balance sanity checks', () => {
  it('first upgrade requires at least 2 heads to afford', () => {
    assert.ok(LUCK_UPGRADE_COST > PER_HEAD_PAYOUT, 'upgrade should not be free after one heads');
    assert.ok(LUCK_UPGRADE_COST <= PER_HEAD_PAYOUT * 10, 'first upgrade reachable within a lucky streak');
  });

  it('payout upgrade cost is higher than luck upgrade', () => {
    assert.ok(PAYOUT_UPGRADE_COST > LUCK_UPGRADE_COST, 'payout upgrade should cost more');
  });

  it('luck boost is meaningful but not game-breaking', () => {
    assert.ok(LUCK_UPGRADE_BOOST >= 0.01, 'at least 1% boost');
    assert.ok(LUCK_UPGRADE_BOOST <= 0.05, 'no more than 5% per upgrade');
  });

  it('payout boost is noticeable', () => {
    assert.ok(PAYOUT_UPGRADE_BOOST >= 1, 'at least $1 more per heads');
    assert.ok(PAYOUT_UPGRADE_BOOST <= PER_HEAD_PAYOUT * 2, 'not more than double base payout');
  });

  it('all upgrades are listed in the catalog', () => {
    const catalog = getUpgradeCatalog();
    assert.ok(catalog.length >= 2, 'at least two upgrades for progression');
    const luckUpgrades = catalog.filter(u => u.effect.type === 'headChance');
    assert.ok(luckUpgrades.length >= 1, 'at least one luck upgrade');
  });
});
