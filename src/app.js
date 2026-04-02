// src/app.js — Browser entry point for Coin Toss Game
(function () {

let state = createInitialState();
const catalog = getUpgradeCatalog();

const els = {
  currentStreak: document.getElementById('current-streak'),
  bestStreak: document.getElementById('best-streak'),
  progress: document.getElementById('progress'),
  money: document.getElementById('money'),
  headChance: document.getElementById('head-chance'),
  tossCount: document.getElementById('toss-count'),
  tossBtn: document.getElementById('toss-btn'),
  upgrades: document.getElementById('upgrades-container'),
  history: document.getElementById('history-container'),
  banner: document.getElementById('game-over-banner'),
};

function render() {
  els.currentStreak.textContent = state.currentStreak;
  els.bestStreak.textContent = state.bestStreak;
  els.progress.textContent = `${state.currentStreak} / 10`;
  els.money.textContent = `$${state.money}`;
  els.headChance.textContent = `${(state.headChance * 100).toFixed(1)}%`;
  els.tossCount.textContent = state.tossCount;

  // Victory banner
  if (state.gameOver) {
    els.banner.textContent = '🎉 You Win! 10 consecutive heads!';
    els.banner.classList.remove('hidden');
    els.tossBtn.disabled = true;
  }

  renderUpgrades();
  renderHistory();
}

function renderUpgrades() {
  els.upgrades.innerHTML = '';
  for (const up of catalog) {
    const btn = document.createElement('button');
    btn.className = 'upgrade-btn';

    const purchased = state.purchasedUpgradeIds.includes(up.id);
    const hasPrereq = !up.requires || state.purchasedUpgradeIds.includes(up.requires);
    const canAfford = state.money >= up.cost;

    let statusText = `$${up.cost}`;
    if (purchased) {
      statusText = '✓ Owned';
      btn.classList.add('purchased');
    } else if (!hasPrereq) {
      const req = catalog.find(u => u.id === up.requires);
      statusText = `🔒 Requires ${req ? req.label : up.requires}`;
    } else if (!canAfford) {
      statusText = `$${up.cost} (need $${up.cost - state.money} more)`;
    }

    btn.disabled = purchased || !hasPrereq || !canAfford || state.gameOver;

    btn.innerHTML = `
      <div class="upgrade-info">
        <span class="upgrade-name">${up.label}</span>
        <span class="upgrade-detail">+${(up.effect * 100).toFixed(0)}% head chance</span>
      </div>
      <span class="upgrade-cost">${statusText}</span>
    `;

    btn.addEventListener('click', () => {
      if (state.gameOver) return;
      state = purchaseUpgrade(state, up.id);
      render();
    });

    els.upgrades.appendChild(btn);
  }
}

function renderHistory() {
  els.history.innerHTML = '';
  for (let i = state.history.length - 1; i >= 0; i--) {
    const div = document.createElement('div');
    div.className = 'history-entry';
    div.textContent = state.history[i];
    els.history.appendChild(div);
  }
}

els.tossBtn.addEventListener('click', () => {
  if (state.gameOver) return;
  state = resolveToss(state, Math.random());
  render();
});

render();

})();
