// ── Constants ──
const TARGET_STREAK = 10;
const BASE_HEAD_CHANCE = 0.10; // 10%
const HEAD_REWARD = 10;        // money per head

const UPGRADES = [
  { id: 'odds1',  name: 'Lucky Penny',     desc: '+1% head chance',  cost: 25,  boost: 0.01 },
  { id: 'odds2',  name: 'Silver Dollar',   desc: '+2% head chance',  cost: 75,  boost: 0.02 },
  { id: 'odds3',  name: 'Golden Coin',     desc: '+5% head chance',  cost: 200, boost: 0.05 },
];

// ── State ──
let state;

function freshState() {
  return {
    streak: 0,
    money: 0,
    headChance: BASE_HEAD_CHANCE,
    targetStreak: TARGET_STREAK,
    gameOver: false,
    won: false,
    purchasedUpgrades: {},   // id → count
    history: [],
  };
}

// ── DOM refs ──
const dom = {
  streak:       document.getElementById('streak'),
  headChance:   document.getElementById('head-chance'),
  money:        document.getElementById('money'),
  tossBtn:      document.getElementById('toss-btn'),
  resultDisplay:document.getElementById('result-display'),
  upgradesList: document.getElementById('upgrades-list'),
  historyLog:   document.getElementById('history-log'),
  gameOverSec:  document.getElementById('game-over-section'),
  gameOverMsg:  document.getElementById('game-over-msg'),
  restartBtn:   document.getElementById('restart-btn'),
};

// ── Render helpers ──
function pct(n) { return (n * 100).toFixed(0) + '%'; }

function renderStats() {
  dom.streak.textContent     = state.streak;
  dom.headChance.textContent = pct(state.headChance);
  dom.money.textContent      = '$' + state.money;
}

function renderUpgrades() {
  dom.upgradesList.innerHTML = '';
  UPGRADES.forEach(u => {
    const count = state.purchasedUpgrades[u.id] || 0;
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    card.innerHTML = `
      <div class="upgrade-info">
        <div class="upgrade-name">${u.name}${count ? ' ×' + count : ''}</div>
        <div class="upgrade-desc">${u.desc} — $${u.cost}</div>
      </div>`;
    const btn = document.createElement('button');
    btn.className = 'upgrade-btn';
    btn.textContent = 'Buy $' + u.cost;
    btn.disabled = state.money < u.cost || state.gameOver;
    btn.addEventListener('click', () => buyUpgrade(u));
    card.appendChild(btn);
    dom.upgradesList.appendChild(card);
  });
}

function addHistory(text, cls) {
  state.history.push({ text, cls });
  const el = document.createElement('div');
  el.className = 'history-entry ' + (cls || '');
  el.textContent = text;
  dom.historyLog.prepend(el);  // newest first
}

function renderFullHistory() {
  dom.historyLog.innerHTML = '';
  // show newest first
  for (let i = state.history.length - 1; i >= 0; i--) {
    const h = state.history[i];
    const el = document.createElement('div');
    el.className = 'history-entry ' + (h.cls || '');
    el.textContent = h.text;
    dom.historyLog.appendChild(el);
  }
}

// ── Core toss ──
function toss() {
  if (state.gameOver) return;

  const roll = Math.random();
  const isHead = roll < state.headChance;

  if (isHead) {
    state.streak++;
    state.money += HEAD_REWARD;
    dom.resultDisplay.textContent = '🟢 HEADS!';
    dom.resultDisplay.className = 'heads';
    addHistory(`Toss: HEADS — streak ${state.streak}, earned $${HEAD_REWARD}`, 'head');

    if (state.streak >= state.targetStreak) {
      state.gameOver = true;
      state.won = true;
      dom.tossBtn.disabled = true;
      dom.gameOverSec.classList.remove('hidden');
      dom.gameOverMsg.textContent = '🎉 YOU WIN! 10 consecutive heads!';
      addHistory('🏆 GAME WON — 10 consecutive heads achieved!', 'win');
    }
  } else {
    const lostStreak = state.streak;
    state.streak = 0;
    dom.resultDisplay.textContent = '🔴 TAILS';
    dom.resultDisplay.className = 'tails';
    const resetNote = lostStreak > 0 ? ` (streak of ${lostStreak} lost)` : '';
    addHistory(`Toss: TAILS — streak reset to 0${resetNote}`, 'tail');
  }

  renderStats();
  renderUpgrades();
}

// ── Upgrade purchase ──
function buyUpgrade(u) {
  if (state.money < u.cost || state.gameOver) return;

  state.money -= u.cost;
  state.headChance += u.boost;
  state.purchasedUpgrades[u.id] = (state.purchasedUpgrades[u.id] || 0) + 1;

  addHistory(`Bought ${u.name} for $${u.cost} — head chance now ${pct(state.headChance)}`, 'upgrade');
  renderStats();
  renderUpgrades();
}

// ── Restart ──
function restartGame() {
  addHistory('── Game restarted ──', 'restart');
  state = freshState();
  dom.tossBtn.disabled = false;
  dom.resultDisplay.textContent = '';
  dom.resultDisplay.className = '';
  dom.gameOverSec.classList.add('hidden');
  addHistory('New game started — good luck!', 'restart');
  renderStats();
  renderUpgrades();
  renderFullHistory();
}

// ── Init ──
function init() {
  state = freshState();
  dom.tossBtn.addEventListener('click', toss);
  dom.restartBtn.addEventListener('click', restartGame);
  renderStats();
  renderUpgrades();
}

init();
