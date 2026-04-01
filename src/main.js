import { createInitialGameState } from './game/state.js';
import { resolveToss } from './game/engine.js';
import { purchaseUpgrade } from './game/upgrades.js';
import { renderStatus, renderUpgradeList, renderHistory, renderTossButton, renderGameOver } from './ui.js';

let gameState = createInitialGameState();

function render() {
  const status = document.getElementById('status');
  const upgradeList = document.getElementById('upgrade-list');
  const historyLog = document.getElementById('history-log');
  const tossBtn = document.getElementById('toss-btn');
  const gameOverMsg = document.getElementById('game-over-message');

  if (status) status.innerHTML = renderStatus(gameState);
  if (upgradeList) {
    upgradeList.innerHTML = renderUpgradeList(gameState);
    upgradeList.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.upgrade;
        const result = purchaseUpgrade(gameState, id);
        if (result.success) {
          gameState = result.state;
          render();
        }
      });
    });
  }
  if (historyLog) {
    historyLog.innerHTML = renderHistory(gameState);
    historyLog.scrollTop = historyLog.scrollHeight;
  }
  if (tossBtn) {
    tossBtn.disabled = gameState.isGameOver;
    if (renderTossButton(gameState) === 'disabled') {
      tossBtn.disabled = true;
    }
  }
  if (gameOverMsg) {
    const content = renderGameOver(gameState);
    if (content) {
      gameOverMsg.innerHTML = content;
      gameOverMsg.hidden = false;
    } else {
      gameOverMsg.hidden = true;
    }
  }
}

function handleToss() {
  if (gameState.isGameOver) return;
  gameState = resolveToss(gameState, Math.random());
  render();
}

function init() {
  gameState = createInitialGameState();
  const tossBtn = document.getElementById('toss-btn');
  if (tossBtn) tossBtn.addEventListener('click', handleToss);
  render();
}

document.addEventListener('DOMContentLoaded', init);

export { gameState, render, init };
