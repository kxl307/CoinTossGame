import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderStatus, renderUpgradeList, renderHistory, renderTossButton, renderGameOver } from '../src/ui.js';
import { createInitialGameState } from '../src/game/state.js';
import { resolveToss } from '../src/game/engine.js';
import { purchaseUpgrade } from '../src/game/upgrades.js';
import { TARGET_STREAK, LUCK_UPGRADE_COST } from '../src/game/config.js';

describe('renderStatus', () => {
  it('includes streak progress', () => {
    const state = createInitialGameState();
    const html = renderStatus(state);
    assert.ok(html.includes('0'), 'current streak');
    assert.ok(html.includes(`${TARGET_STREAK}`), 'target streak');
  });

  it('shows money', () => {
    const state = { ...createInitialGameState(), money: 42 };
    const html = renderStatus(state);
    assert.ok(html.includes('$42'));
  });

  it('shows head and tail odds', () => {
    const state = createInitialGameState();
    const html = renderStatus(state);
    assert.ok(html.includes('10%'));
    assert.ok(html.includes('90%'));
  });

  it('reflects upgraded odds', () => {
    let state = { ...createInitialGameState(), money: LUCK_UPGRADE_COST };
    const result = purchaseUpgrade(state, 'luck-1');
    const html = renderStatus(result.state);
    assert.ok(html.includes('11%'));
  });
});

describe('renderUpgradeList', () => {
  it('lists all upgrades with names and costs', () => {
    const state = createInitialGameState();
    const html = renderUpgradeList(state);
    assert.ok(html.includes('Lucky Coin'));
    assert.ok(html.includes('Golden Heads'));
  });

  it('marks owned upgrades as disabled with Owned label', () => {
    let state = { ...createInitialGameState(), money: LUCK_UPGRADE_COST };
    const result = purchaseUpgrade(state, 'luck-1');
    const html = renderUpgradeList(result.state);
    assert.ok(html.includes('Owned'));
  });

  it('disables unaffordable upgrades', () => {
    const state = { ...createInitialGameState(), money: 0 };
    const html = renderUpgradeList(state);
    assert.ok(html.includes('disabled'));
  });
});

describe('renderHistory', () => {
  it('renders empty for fresh state', () => {
    const state = createInitialGameState();
    const html = renderHistory(state);
    assert.strictEqual(html, '');
  });

  it('renders history entries as list items', () => {
    let state = createInitialGameState();
    state = resolveToss(state, 0.05); // heads
    const html = renderHistory(state);
    assert.ok(html.includes('<li>'));
    assert.ok(html.includes('Heads'));
  });
});

describe('renderTossButton', () => {
  it('returns empty string when game is active', () => {
    const state = createInitialGameState();
    assert.strictEqual(renderTossButton(state), '');
  });

  it('returns disabled when game is over', () => {
    const state = { ...createInitialGameState(), isGameOver: true };
    assert.strictEqual(renderTossButton(state), 'disabled');
  });
});

describe('renderGameOver', () => {
  it('returns empty when game is not over', () => {
    const state = createInitialGameState();
    assert.strictEqual(renderGameOver(state), '');
  });

  it('shows win message when game is over', () => {
    let state = createInitialGameState();
    for (let i = 0; i < TARGET_STREAK; i++) {
      state = resolveToss(state, 0.05);
    }
    const html = renderGameOver(state);
    assert.ok(html.includes('🎉'));
    assert.ok(html.includes('Win'));
    assert.ok(html.includes(`${TARGET_STREAK}`));
  });
});
