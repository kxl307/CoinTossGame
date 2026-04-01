import { createInitialState } from './game/state.js';
import { applyTossResult } from './game/engine.js';
import { purchaseUpgrade, canPurchaseUpgrade, UPGRADE_CATALOG } from './game/upgrades.js';
import { appendHistoryEntry, createHistoryEntry } from './game/history.js';
import { renderGame } from './ui/render.js';

let state = createInitialState();

function handleToss() {
  if (state.gameOver) return;
  const randomValue = Math.random();
  applyTossResult(state, randomValue);

  if (state.lastOutcome === 'heads') {
    const msg = `#${state.tossCount}: HEADS — streak ${state.streak}, earned $${state.lastReward} (balance: $${state.balance})`;
    appendHistoryEntry(state, createHistoryEntry('toss', msg, { outcome: 'heads', streak: state.streak, reward: state.lastReward }));
  } else {
    const msg = `#${state.tossCount}: TAILS (balance: $${state.balance})`;
    appendHistoryEntry(state, createHistoryEntry('toss', msg, { outcome: 'tails' }));
  }

  if (state.win) {
    const msg = `#${state.tossCount}: 🎉 WIN — 10 consecutive heads in ${state.tossCount} tosses! Final balance: $${state.balance}`;
    appendHistoryEntry(state, createHistoryEntry('win', msg));
  }

  renderGame(state);
}

function handleUpgradeClick(e) {
  const btn = e.target.closest('[data-upgrade-id]');
  if (!btn) return;
  const upgradeId = btn.getAttribute('data-upgrade-id');
  if (!canPurchaseUpgrade(state, upgradeId)) return;

  const catalog = UPGRADE_CATALOG.find(u => u.id === upgradeId);
  purchaseUpgrade(state, upgradeId);

  const msg = `#${state.tossCount}: UPGRADE — bought ${catalog.name} for $${catalog.cost} (balance: $${state.balance}, head chance: ${(state.currentHeadsChance * 100).toFixed(1)}%)`;
  appendHistoryEntry(state, createHistoryEntry('upgrade', msg, { upgrade: catalog.name, cost: catalog.cost }));

  renderGame(state);
}

function handleReset() {
  state = createInitialState();
  renderGame(state);
}

export function bootstrapGame() {
  document.getElementById('toss-btn').addEventListener('click', handleToss);
  document.getElementById('reset-btn').addEventListener('click', handleReset);
  document.getElementById('upgrade-list').addEventListener('click', handleUpgradeClick);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !state.gameOver) {
      e.preventDefault();
      handleToss();
    }
  });

  renderGame(state);
}

export function getState() { return state; }

document.addEventListener('DOMContentLoaded', bootstrapGame);
