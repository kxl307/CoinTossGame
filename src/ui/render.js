export function renderGame(state) {
  // Status bar
  const streakEl = document.getElementById('streak-value');
  const tossEl = document.getElementById('toss-count');
  const outcomeEl = document.getElementById('last-outcome');
  const balanceEl = document.getElementById('balance-value');
  const chanceEl = document.getElementById('chance-value');
  const rewardEl = document.getElementById('reward-value');

  if (streakEl) streakEl.textContent = state.streak;
  if (tossEl) tossEl.textContent = state.tossCount;
  if (chanceEl) chanceEl.textContent = (state.currentHeadsChance * 100).toFixed(1) + '%';
  if (balanceEl) balanceEl.textContent = '$' + state.balance;
  if (rewardEl) rewardEl.textContent = state.lastReward > 0 ? '+$' + state.lastReward : '-';

  // Streak meter
  const streakFill = document.getElementById('streak-fill');
  const streakText = document.getElementById('streak-text');
  if (streakFill) streakFill.style.width = (state.streak / 10 * 100) + '%';
  if (streakText) streakText.textContent = state.streak + ' / 10 consecutive heads';

  // Outcome display
  if (outcomeEl) {
    if (state.lastOutcome === 'heads') {
      outcomeEl.textContent = '🟢 HEADS';
      outcomeEl.className = 'outcome heads';
    } else if (state.lastOutcome === 'tails') {
      outcomeEl.textContent = '🔴 TAILS';
      outcomeEl.className = 'outcome tails';
    } else {
      outcomeEl.textContent = 'Ready to toss!';
      outcomeEl.className = 'outcome';
    }
  }

  // Toss button state
  const tossBtn = document.getElementById('toss-btn');
  if (tossBtn) {
    tossBtn.disabled = state.gameOver;
    tossBtn.textContent = state.gameOver ? (state.win ? '🏆 You Win!' : 'Game Over') : '🪙 Toss Coin';
  }

  // Reset button visibility
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) resetBtn.style.display = state.tossCount > 0 ? 'inline-block' : 'none';

  // Win banner
  const winBanner = document.getElementById('win-banner');
  if (winBanner) {
    winBanner.style.display = state.win ? 'block' : 'none';
    if (state.win) {
      winBanner.innerHTML = `<h2>🎉 YOU WIN!</h2><p>10 consecutive heads in ${state.tossCount} tosses! Final balance: $${state.balance}</p>`;
    }
  }

  // Stats panel
  renderStats(state);

  // Upgrades panel (wired in PLAN-03)
  if (typeof renderUpgrades === 'function') renderUpgrades(state);

  // History panel (wired in PLAN-04)
  renderHistory(state);
}

function renderStats(state) {
  const el = document.getElementById('stats-panel');
  if (!el) return;
  const totalEarned = state.lifetimeEarnings;
  const totalSpent = state.lifetimeEarnings - state.balance;
  el.innerHTML = `
    <div class="stat-row">Total Earned: <strong>$${totalEarned}</strong></div>
    <div class="stat-row">Total Spent: <strong>$${totalSpent}</strong></div>
    <div class="stat-row">Total Tosses: <strong>${state.tossCount}</strong></div>
  `;
}

function renderHistory(state) {
  const el = document.getElementById('history-list');
  if (!el || !state.history || state.history.length === 0) {
    if (el) el.innerHTML = '<div class="history-empty">No events yet — start tossing!</div>';
    return;
  }
  el.innerHTML = state.history.slice().reverse().map(entry => {
    let cls = '';
    if (entry.type === 'toss' && entry.outcome === 'heads') cls = 'h-heads';
    else if (entry.type === 'toss') cls = 'h-tails';
    else if (entry.type === 'upgrade') cls = 'h-upgrade';
    else if (entry.type === 'win') cls = 'h-win';
    return `<div class="history-entry ${cls}">${entry.message}</div>`;
  }).join('');
}
