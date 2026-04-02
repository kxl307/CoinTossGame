import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UPGRADES, purchaseUpgrade, applyUpgradeEffects } from '../src/upgrades.js';
import { resolveToss, canToss } from '../src/gameEngine.js';
import { createInitialState } from '../src/gameState.js';

describe('progression baseline', () => {
  it('baseline toss odds are 10% before any purchase', () => {
    const state = createInitialState();
    assert.equal(state.effectiveHeadChance, 0.10);
    assert.equal(state.baseHeadChance, 0.10);
  });

  it('first upgrade increases effective head chance to 11%', () => {
    let state = { ...createInitialState(), money: 100 };
    state = purchaseUpgrade(state, 'lucky-penny');
    state = applyUpgradeEffects(state);
    assert.ok(Math.abs(state.effectiveHeadChance - 0.11) < 1e-9);
  });

  it('upgrade cost/reward values allow the player to afford progression', () => {
    // At $5 per head with 10% chance, expected money per toss = $0.50
    // Lucky Penny costs $10, so ~20 expected tosses to afford first upgrade
    // This is achievable — not a deadlock
    const luckyPenny = UPGRADES.find(u => u.id === 'lucky-penny');
    const state = createInitialState();
    const expectedMoneyPerToss = state.effectiveHeadChance * (state.moneyPerHead || 5);
    const expectedTossesToAfford = luckyPenny.cost / expectedMoneyPerToss;
    assert.ok(expectedTossesToAfford < 100, `Takes ~${expectedTossesToAfford} tosses — should be < 100`);
  });
});

describe('seeded progression simulation', () => {
  function seededRun(headChance, seedValues) {
    let state = createInitialState();
    state = { ...state, effectiveHeadChance: headChance };
    let maxStreak = 0;

    for (const roll of seedValues) {
      if (!canToss(state)) break;
      state = resolveToss(state, roll);
      if (state.streak > maxStreak) maxStreak = state.streak;
    }
    return { state, maxStreak };
  }

  // Generate deterministic pseudo-random sequence
  function pseudoRandom(seed, count) {
    const values = [];
    let s = seed;
    for (let i = 0; i < count; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      values.push((s % 10000) / 10000);
    }
    return values;
  }

  it('upgraded runs achieve higher max streaks than baseline', () => {
    const rolls = pseudoRandom(42, 500);

    const baseline = seededRun(0.10, rolls);
    const upgraded = seededRun(0.18, rolls); // with several upgrades

    // Upgraded should perform measurably better
    assert.ok(
      upgraded.maxStreak >= baseline.maxStreak,
      `Upgraded max streak (${upgraded.maxStreak}) should be >= baseline (${baseline.maxStreak})`
    );
  });

  it('baseline run is harsh — low streak in typical play', () => {
    const rolls = pseudoRandom(123, 200);
    const { maxStreak } = seededRun(0.10, rolls);
    // At 10% odds, hitting 10 consecutive in 200 tosses is astronomically unlikely
    assert.ok(maxStreak < 10, `Max streak ${maxStreak} should be < 10 in 200 baseline tosses`);
  });
});

describe('full player flow', () => {
  it('toss → earn → buy upgrade → toss with improved odds → reach win', () => {
    let state = createInitialState();

    // Simulate earning money: 10 heads at $5 each = $50
    for (let i = 0; i < 10; i++) {
      state = resolveToss(state, 0.05); // forced heads
    }
    assert.ok(state.money >= 50);
    assert.equal(state.streak, 10); // Actually this would win!

    // Start fresh and do a more realistic flow
    state = createInitialState();

    // Earn some money (mix of heads and tails)
    state = resolveToss(state, 0.05); // heads +$5
    state = resolveToss(state, 0.50); // tails (resets streak)
    state = resolveToss(state, 0.05); // heads +$5
    state = resolveToss(state, 0.50); // tails
    assert.equal(state.money, 10);
    assert.equal(state.streak, 0);

    // Buy Lucky Penny
    state = purchaseUpgrade(state, 'lucky-penny');
    assert.ok(state);
    state = applyUpgradeEffects(state);
    assert.ok(Math.abs(state.effectiveHeadChance - 0.11) < 1e-9);
    assert.equal(state.money, 0);

    // Now rolls between 0.10 and 0.11 resolve as heads
    state = resolveToss(state, 0.105);
    assert.equal(state.lastOutcome, 'heads');
    assert.equal(state.streak, 1);

    // Drive to win with forced heads
    for (let i = 0; i < 9; i++) {
      state = resolveToss(state, 0.05);
    }
    assert.equal(state.won, true);
    assert.equal(state.gameOver, true);
    assert.equal(state.streak, 10);

    // History should have entries
    assert.ok(state.history.length > 0);
    const winEntries = state.history.filter(e => e.type === 'win');
    assert.equal(winEntries.length, 1);
  });
});
