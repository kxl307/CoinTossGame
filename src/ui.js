import { createInitialState } from './gameState.js';
import { resolveToss, canToss } from './gameEngine.js';

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

  // Upgrade section placeholder — wired in PLAN-02
  const upgradeSection = $('#upgrade-list');
  if (upgradeSection) upgradeSection.innerHTML = '<p class="placeholder">Upgrades coming soon…</p>';

  // History section placeholder — wired in PLAN-03
  const historySection = $('#history-list');
  if (historySection) historySection.innerHTML = '<p class="placeholder">History coming soon…</p>';
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

// Expose state setter for upgrade/history wiring in later plans
export function getState() { return state; }
export function setState(s) { state = s; renderGame(); }
