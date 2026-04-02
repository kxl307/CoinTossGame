const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { createInitialState, getUpgradeCatalog, resolveToss, purchaseUpgrade, TARGET_STREAK, REWARD_PER_HEAD, INITIAL_HEAD_CHANCE } = require('../src/gameLogic.js');

describe('createInitialState', () => {
  it('returns correct defaults', () => {
    const s = createInitialState();
    assert.equal(s.currentStreak, 0);
    assert.equal(s.bestStreak, 0);
    assert.equal(s.money, 0);
    assert.equal(s.headChance, 0.10);
    assert.equal(s.gameOver, false);
    assert.equal(s.tossCount, 0);
    assert.deepEqual(s.purchasedUpgradeIds, []);
    assert.deepEqual(s.history, []);
  });
});

describe('resolveToss', () => {
  it('heads when roll < headChance (10% threshold)', () => {
    const s = createInitialState();
    const next = resolveToss(s, 0.05); // below 0.10 → heads
    assert.equal(next.currentStreak, 1);
    assert.equal(next.money, REWARD_PER_HEAD);
    assert.equal(next.tossCount, 1);
  });

  it('tails when roll >= headChance', () => {
    const s = createInitialState();
    const next = resolveToss(s, 0.10); // exactly 0.10 → tails
    assert.equal(next.currentStreak, 0);
    assert.equal(next.money, 0);
    assert.equal(next.tossCount, 1);
  });

  it('increments streak on consecutive heads', () => {
    let s = createInitialState();
    for (let i = 0; i < 5; i++) {
      s = resolveToss(s, 0.01);
    }
    assert.equal(s.currentStreak, 5);
    assert.equal(s.bestStreak, 5);
    assert.equal(s.money, 5 * REWARD_PER_HEAD);
  });

  it('resets streak on tails', () => {
    let s = createInitialState();
    s = resolveToss(s, 0.01); // heads → streak 1
    s = resolveToss(s, 0.01); // heads → streak 2
    s = resolveToss(s, 0.99); // tails → streak 0
    assert.equal(s.currentStreak, 0);
    assert.equal(s.bestStreak, 2);
    assert.equal(s.money, 2 * REWARD_PER_HEAD);
  });

  it('wins at 10 consecutive heads', () => {
    let s = createInitialState();
    for (let i = 0; i < TARGET_STREAK; i++) {
      s = resolveToss(s, 0.01);
    }
    assert.equal(s.currentStreak, TARGET_STREAK);
    assert.equal(s.gameOver, true);
    assert.ok(s.history.some(h => h.includes('Victory')));
  });

  it('blocks toss after game over', () => {
    let s = createInitialState();
    for (let i = 0; i < TARGET_STREAK; i++) {
      s = resolveToss(s, 0.01);
    }
    const after = resolveToss(s, 0.01);
    assert.equal(after.tossCount, s.tossCount); // unchanged
    assert.ok(after.history[after.history.length - 1].includes('already over'));
  });

  it('records history entries for heads and tails', () => {
    let s = createInitialState();
    s = resolveToss(s, 0.01); // heads
    assert.ok(s.history[0].includes('Heads'));
    s = resolveToss(s, 0.99); // tails
    assert.ok(s.history[s.history.length - 1].includes('Tails'));
  });
});

describe('purchaseUpgrade', () => {
  it('purchases weighted-coin-1 with enough money', () => {
    let s = createInitialState();
    s = resolveToss(s, 0.01); // earn $5
    s = purchaseUpgrade(s, 'weighted-coin-1');
    assert.equal(s.money, 0);
    assert.equal(s.headChance, 0.11);
    assert.ok(s.purchasedUpgradeIds.includes('weighted-coin-1'));
    assert.ok(s.history.some(h => h.includes('Purchased Weighted Coin I')));
  });

  it('rejects purchase with insufficient money', () => {
    const s = createInitialState();
    const next = purchaseUpgrade(s, 'weighted-coin-1');
    assert.equal(next.money, 0);
    assert.equal(next.headChance, INITIAL_HEAD_CHANCE);
    assert.ok(next.history.some(h => h.includes('Not enough money')));
  });

  it('rejects duplicate purchase', () => {
    let s = createInitialState();
    s.money = 100;
    s = purchaseUpgrade(s, 'weighted-coin-1');
    const next = purchaseUpgrade(s, 'weighted-coin-1');
    assert.equal(next.headChance, s.headChance); // unchanged
    assert.ok(next.history[next.history.length - 1].includes('Already purchased'));
  });

  it('rejects purchase missing prerequisite', () => {
    let s = createInitialState();
    s.money = 100;
    const next = purchaseUpgrade(s, 'weighted-coin-2');
    assert.equal(next.money, 100); // money unchanged
    assert.ok(next.history[next.history.length - 1].includes('requires'));
  });

  it('allows chained upgrades with correct prereqs', () => {
    let s = createInitialState();
    s.money = 100;
    s = purchaseUpgrade(s, 'weighted-coin-1'); // +0.01
    s = purchaseUpgrade(s, 'weighted-coin-2'); // +0.02
    s = purchaseUpgrade(s, 'weighted-coin-3'); // +0.03
    assert.equal(s.headChance, 0.16);
    assert.equal(s.money, 100 - 5 - 15 - 30);
    assert.equal(s.purchasedUpgradeIds.length, 3);
  });

  it('blocks purchase after game over', () => {
    let s = createInitialState();
    s.money = 100;
    for (let i = 0; i < TARGET_STREAK; i++) {
      s = resolveToss(s, 0.01);
    }
    const next = purchaseUpgrade(s, 'weighted-coin-1');
    assert.equal(next.headChance, s.headChance);
    assert.ok(next.history[next.history.length - 1].includes('Game is over'));
  });
});

describe('getUpgradeCatalog', () => {
  it('returns 3 upgrades', () => {
    const catalog = getUpgradeCatalog();
    assert.equal(catalog.length, 3);
    assert.equal(catalog[0].id, 'weighted-coin-1');
    assert.equal(catalog[2].requires, 'weighted-coin-2');
  });
});
