import { createInitialState } from './gameState.js';
import { resolveToss, canToss } from './gameEngine.js';
import { UPGRADES, purchaseUpgrade, applyUpgradeEffects } from './upgrades.js';

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

  renderUpgrades();

  // History section placeholder — wired in PLAN-03
  const historySection = $('#history-list');
  if (historySection) historySection.innerHTML = '<p class="placeholder">History coming soon…</p>';
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
  renderGame();
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
}

export function getState() { return state; }
export function setState(s) { state = s; renderGame(); }
