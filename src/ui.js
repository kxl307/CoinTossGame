import { getUpgradeCatalog } from './game/upgrades.js';

/**
 * Pure render helpers that produce HTML strings from game state.
 * No direct DOM mutation — main.js handles wiring.
 */

export function renderStatus(state) {
  return `<div>Streak: <strong>${state.currentStreak}</strong> / ${state.targetStreak}</div>
<div>Best: <strong>${state.bestStreak}</strong></div>
<div>Money: <strong>$${state.money}</strong></div>
<div>Odds: <strong>${(state.headChance * 100).toFixed(0)}%</strong> heads / <strong>${(state.tailChance * 100).toFixed(0)}%</strong> tails</div>`;
}

export function renderUpgradeList(state) {
  const catalog = getUpgradeCatalog();
  return catalog.map(u => {
    const owned = state.ownedUpgrades.includes(u.id);
    const canAfford = state.money >= u.cost;
    const disabled = owned || !canAfford || state.isGameOver;
    const label = owned ? 'Owned' : `$${u.cost}`;
    const btnClass = owned ? 'owned' : '';
    return `<div class="upgrade-card" data-id="${u.id}">
  <div>
    <strong>${u.name}</strong><br>
    <small>${u.description}</small>
  </div>
  <button class="buy-btn ${btnClass}" data-upgrade="${u.id}" ${disabled ? 'disabled' : ''}>${label}</button>
</div>`;
  }).join('\n');
}

export function renderHistory(state) {
  return state.history.map(entry => `<li>${entry}</li>`).join('\n');
}

export function renderTossButton(state) {
  return state.isGameOver ? 'disabled' : '';
}

export function renderGameOver(state) {
  if (!state.isGameOver) return '';
  return `<h2>🎉 You Win!</h2>
<p>You reached ${state.targetStreak} consecutive heads in ${state.totalTosses} tosses!</p>
<p>Final money: $${state.money}</p>`;
}
