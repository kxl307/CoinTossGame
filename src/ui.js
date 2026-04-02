import { createInitialState } from './gameState.js';
import { resolveToss, canToss } from './gameEngine.js';
import { UPGRADES, purchaseUpgrade, applyUpgradeEffects } from './upgrades.js';
import { createHistoryEntry, appendHistory } from './history.js';

let state = createInitialState();

function $(sel) { return document.querySelector(sel); }

export function renderGame() {
  $('#streak').textContent = state.streak;
  $('#max-streak').textContent = state.maxStreak;
  $('#head-chance').textContent = (state.effectiveHeadChance * 100).toFixed(1) + '%';
  $('#money').textContent = state.money;
  $('#total-tosses').textContent = state.totalTosses;
  $('#last-outcome').textContent = state.lastOutcome ?? '—';
  $('#status-message').textContent = state.statusMessage;

  const tossBtn = $('#toss-btn');
  tossBtn.disabled = !canToss(state);

  // Show/hide reset button and add won styling
  const resetBtn = $('#reset-btn');
  if (resetBtn) {
    resetBtn.style.display = state.gameOver ? 'inline-block' : 'none';
  }
  const statusEl = $('#status-message');
  statusEl.classList.toggle('won', state.won);

  renderUpgrades();
  renderHistory();
}

function renderUpgrades() {
  const container = $('#upgrade-list');
  if (!container) return;
  container.innerHTML = '';

  for (const upgrade of UPGRADES) {
    const owned = state.upgrades.includes(upgrade.id);
    const canAfford = state.money >= upgrade.cost;

    const card = document.createElement('div');
    card.className = 'upgrade-card'
      + (owned ? ' owned' : '')
      + (!owned && !canAfford ? ' unaffordable' : '')
      + (!owned && canAfford ? ' affordable' : '');

    card.innerHTML = `
      <strong>${upgrade.name}</strong>
      <span class="upgrade-desc">${upgrade.description}</span>
      <span class="upgrade-cost">$${upgrade.cost}</span>
    `;

    if (!owned && !state.gameOver) {
      const btn = document.createElement('button');
      btn.textContent = owned ? 'Owned' : canAfford ? 'Buy' : 'Too expensive';
      btn.disabled = !canAfford;
      btn.addEventListener('click', () => handlePurchase(upgrade.id));
      card.appendChild(btn);
    } else if (owned) {
      const badge = document.createElement('span');
      badge.className = 'owned-badge';
      badge.textContent = '✓ Owned';
      card.appendChild(badge);
    }

    container.appendChild(card);
  }
}

function handlePurchase(upgradeId) {
  const result = purchaseUpgrade(state, upgradeId);
  if (!result) return;
  state = applyUpgradeEffects(result);

  const upgrade = UPGRADES.find(u => u.id === upgradeId);
  state = appendHistory(state, createHistoryEntry('purchase', {
    upgradeName: upgrade.name,
    cost: upgrade.cost,
    effectiveHeadChance: state.effectiveHeadChance,
  }));
  state = { ...state, statusMessage: `Purchased ${upgrade.name}! Head chance now ${(state.effectiveHeadChance * 100).toFixed(1)}%` };

  renderGame();
}

function renderHistory() {
  const container = $('#history-list');
  if (!container) return;
  container.innerHTML = '';

  if (state.history.length === 0) {
    container.innerHTML = '<p class="placeholder">No events yet. Start tossing!</p>';
    return;
  }

  for (const entry of state.history) {
    const div = document.createElement('div');
    div.className = `history-entry history-${entry.type}`;
    div.textContent = formatHistoryEntry(entry);
    container.appendChild(div);
  }

  // Auto-scroll to latest
  container.scrollTop = container.scrollHeight;
}

function formatHistoryEntry(entry) {
  switch (entry.type) {
    case 'toss':
      return entry.outcome === 'heads'
        ? `🪙 Heads! Streak: ${entry.streak} | +$${entry.moneyDelta}`
        : `🪙 Tails — streak reset to 0`;
    case 'purchase':
      return `🛒 Bought ${entry.upgradeName} for $${entry.cost} → head chance now ${(entry.effectiveHeadChance * 100).toFixed(1)}%`;
    case 'win':
      return `🏆 Victory! Reached ${entry.streak} consecutive heads!`;
    default:
      return `[${entry.type}]`;
  }
}

function handleToss() {
  if (!canToss(state)) return;
  const roll = Math.random();
  state = resolveToss(state, roll);
  renderGame();
}

export function initApp() {
  renderGame();
  $('#toss-btn').addEventListener('click', handleToss);
  const resetBtn = $('#reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state = createInitialState();
      renderGame();
    });
  }
}

export function getState() { return state; }
export function setState(s) { state = s; renderGame(); }
