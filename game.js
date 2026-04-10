(function() {
  'use strict';

  // ========================================
  // 1. Game State
  // ========================================
  const DEFAULT_STATE = {
    version: 1,
    money: 0,
    totalMoneyEarned: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalTosses: 0,
    upgrades: {
      headChanceBoost: { level: 0, baseCost: 10 },
      moneyMultiplier: { level: 0, baseCost: 30 },
      streakShield: { owned: false, baseCost: 25, timesPurchased: 0 },
      luckyToss: { owned: false, baseCost: 50, timesPurchased: 0 }
    },
    shieldActive: false,
    luckyTossActive: false,
    history: [],
    gameWon: false,
    totalUpgradesBought: 0
  };

  let state = deepCopy(DEFAULT_STATE);
  let isTossing = false;

  function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ========================================
  // 2. Formula Functions (UX-SPEC Section 6)
  // ========================================
  function getHeadChance() {
    return Math.min(0.10 + (state.upgrades.headChanceBoost.level * 0.02), 0.50);
  }

  function getMoneyMultiplier() {
    return 1.0 + (state.upgrades.moneyMultiplier.level * 0.5);
  }

  function getUpgradeCost(upgradeKey) {
    var upgrade = state.upgrades[upgradeKey];
    if (upgradeKey === 'streakShield' || upgradeKey === 'luckyToss') {
      return upgrade.baseCost * Math.pow(2, upgrade.timesPurchased);
    }
    return upgrade.baseCost * Math.pow(2, upgrade.level);
  }

  // ========================================
  // 3. DOM References
  // ========================================
  var dom = {};

  function cacheDom() {
    var $ = function(id) { return document.getElementById(id); };
    dom = {
      money: $('money'),
      bestStreak: $('best-streak'),
      totalTosses: $('total-tosses'),
      headChance: $('head-chance'),
      streakStars: $('streak-stars'),
      streakText: $('streak-text'),
      shieldIcon: $('shield-icon'),
      coinContainer: $('coin-container'),
      coin: $('coin'),
      moneyPopupContainer: $('money-popup-container'),
      tossBtn: $('toss-btn'),
      historyLog: $('history-log'),
      victoryOverlay: $('victory-overlay'),
      victoryTosses: $('victory-tosses'),
      victoryMoney: $('victory-money'),
      victoryStreak: $('victory-streak'),
      victoryUpgrades: $('victory-upgrades'),
      victoryHeadChance: $('victory-head-chance'),
      newgameOverlay: $('newgame-overlay'),
      newGameBtn: $('new-game-btn'),
      cancelNewgameBtn: $('cancel-newgame-btn'),
      confirmNewgameBtn: $('confirm-newgame-btn'),
      playAgainBtn: $('play-again-btn'),
      ariaAnnouncer: $('aria-announcer')
    };
  }

  // ========================================
  // 4. Utility Functions
  // ========================================
  function formatMoney(n) {
    return '$' + n.toLocaleString();
  }

  function announce(text) {
    if (dom.ariaAnnouncer) {
      dom.ariaAnnouncer.textContent = text;
    }
  }

  function animateClass(el, className, duration) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth; // force reflow to restart animation
    el.classList.add(className);
    setTimeout(function() {
      el.classList.remove(className);
    }, duration);
  }

  // ========================================
  // 5. Render Functions
  // ========================================
  function renderStats() {
    dom.money.textContent = formatMoney(state.money);
    dom.bestStreak.textContent = state.bestStreak;
    dom.totalTosses.textContent = state.totalTosses;
    dom.headChance.textContent = Math.round(getHeadChance() * 100) + '%';
  }

  function renderStreak() {
    var stars = dom.streakStars.querySelectorAll('.star');
    for (var i = 0; i < stars.length; i++) {
      if (i < state.currentStreak) {
        stars[i].classList.add('filled');
      } else {
        stars[i].classList.remove('filled');
      }
    }
    dom.streakText.textContent = state.currentStreak + ' / 10 consecutive heads';

    if (state.shieldActive) {
      dom.shieldIcon.classList.remove('hidden');
      document.body.classList.add('shield-active');
    } else {
      dom.shieldIcon.classList.add('hidden');
      document.body.classList.remove('shield-active');
    }
  }

  function renderShop() {
    var cards = document.querySelectorAll('.shop-card');
    cards.forEach(function(card) {
      var key = card.dataset.upgrade;
      var upgrade = state.upgrades[key];
      var cost = getUpgradeCost(key);
      var levelSpan = card.querySelector('.level');
      var costSpan = card.querySelector('.cost');
      var buyBtn = card.querySelector('.buy-btn');
      var costDiv = card.querySelector('.shop-card-cost');

      // Remove old badges
      var oldBadge = card.querySelector('.consumable-badge');
      if (oldBadge) oldBadge.remove();

      card.classList.remove('affordable', 'cant-afford', 'maxed');

      if (key === 'headChanceBoost') {
        levelSpan.textContent = upgrade.level;
        if (getHeadChance() >= 0.50) {
          card.classList.add('maxed');
          levelSpan.textContent = 'MAX';
          costDiv.style.display = 'none';
          buyBtn.style.display = 'none';
          return;
        }
        costDiv.style.display = '';
        buyBtn.style.display = '';
      } else if (key === 'moneyMultiplier') {
        levelSpan.textContent = upgrade.level;
        costDiv.style.display = '';
        buyBtn.style.display = '';
      } else if (key === 'streakShield' || key === 'luckyToss') {
        if (upgrade.owned) {
          levelSpan.textContent = '';
          var badge = document.createElement('span');
          badge.className = 'consumable-badge ready';
          badge.textContent = 'READY';
          card.querySelector('.shop-card-name').appendChild(badge);
          buyBtn.disabled = true;
          buyBtn.textContent = 'OWNED';
          costDiv.style.display = 'none';
          card.classList.remove('affordable', 'cant-afford');
          return;
        } else {
          levelSpan.textContent = '';
          buyBtn.disabled = false;
          buyBtn.textContent = 'BUY';
          costDiv.style.display = '';
        }
      }

      costSpan.textContent = formatMoney(cost);

      if (state.gameWon) {
        buyBtn.disabled = true;
        card.classList.add('cant-afford');
      } else if (state.money >= cost) {
        card.classList.add('affordable');
        buyBtn.disabled = false;
      } else {
        card.classList.add('cant-afford');
        buyBtn.disabled = true;
      }
    });
  }

  function renderHistory() {
    dom.historyLog.innerHTML = '';
    if (state.history.length === 0) {
      var placeholder = document.createElement('div');
      placeholder.className = 'history-placeholder';
      placeholder.textContent = 'No events yet. Toss a coin!';
      dom.historyLog.appendChild(placeholder);
      return;
    }
    state.history.forEach(function(entry) {
      var div = document.createElement('div');
      div.className = 'history-entry ' + entry.type;
      div.textContent = entry.text;
      dom.historyLog.appendChild(div);
    });
  }

  function renderCoin() {
    dom.coinContainer.classList.remove('flipping-heads', 'flipping-tails');
  }

  function renderTossButton() {
    if (state.gameWon) {
      dom.tossBtn.disabled = true;
      dom.tossBtn.textContent = '🎉 YOU WON!';
      document.body.classList.remove('lucky-active');
    } else if (state.luckyTossActive) {
      dom.tossBtn.textContent = '🎲 LUCKY TOSS ✨';
      document.body.classList.add('lucky-active');
    } else {
      dom.tossBtn.textContent = '🎲 TOSS COIN';
      document.body.classList.remove('lucky-active');
    }
  }

  function renderAll() {
    renderStats();
    renderStreak();
    renderShop();
    renderHistory();
    renderTossButton();
  }

  // ========================================
  // 6. History Tracking
  // ========================================
  function addHistoryEntry(type, text) {
    var entry = { type: type, text: text, timestamp: Date.now() };
    state.history.unshift(entry);
    if (state.history.length > 200) {
      state.history = state.history.slice(0, 200);
    }
    // Add DOM entry at top
    var placeholder = dom.historyLog.querySelector('.history-placeholder');
    if (placeholder) placeholder.remove();

    var div = document.createElement('div');
    div.className = 'history-entry ' + type;
    div.textContent = text;
    dom.historyLog.insertBefore(div, dom.historyLog.firstChild);

    // Cap DOM entries at 200
    while (dom.historyLog.children.length > 200) {
      dom.historyLog.removeChild(dom.historyLog.lastChild);
    }
  }

  // ========================================
  // 7. Money Popup
  // ========================================
  function showMoneyPopup(amount) {
    var popup = document.createElement('div');
    popup.className = 'money-popup';
    popup.textContent = '+' + formatMoney(amount);
    dom.moneyPopupContainer.appendChild(popup);
    setTimeout(function() {
      if (popup.parentNode) popup.parentNode.removeChild(popup);
    }, 1000);
  }

  // ========================================
  // 8. Core Toss Logic
  // ========================================
  function tossCoin() {
    if (state.gameWon || isTossing) return;
    isTossing = true;
    dom.tossBtn.disabled = true;
    dom.tossBtn.textContent = 'Tossing...';

    var result;
    var usedLucky = false;
    if (state.luckyTossActive) {
      result = 'heads';
      usedLucky = true;
      state.luckyTossActive = false;
      state.upgrades.luckyToss.owned = false;
      addHistoryEntry('lucky', '✨ Lucky Toss used — guaranteed heads!');
    } else {
      result = Math.random() < getHeadChance() ? 'heads' : 'tails';
    }

    state.totalTosses++;

    // Trigger coin flip animation — reset position first
    dom.coinContainer.classList.remove('flipping-heads', 'flipping-tails');
    dom.coin.style.transition = 'none';
    dom.coin.style.transform = 'rotateY(0deg)';
    void dom.coin.offsetWidth; // force reflow
    dom.coin.style.transition = '';
    dom.coinContainer.classList.add(result === 'heads' ? 'flipping-heads' : 'flipping-tails');

    setTimeout(function() {
      processResult(result, usedLucky);
      // Remove animation and set final resting position without triggering transition
      dom.coin.style.transition = 'none';
      dom.coinContainer.classList.remove('flipping-heads', 'flipping-tails');
      dom.coin.style.transform = result === 'heads' ? 'rotateY(0deg)' : 'rotateY(180deg)';
      void dom.coin.offsetWidth; // force reflow
      dom.coin.style.transition = '';
      renderStats();
      renderStreak();
      renderShop();
      renderTossButton();
      saveGame();
      isTossing = false;
      if (!state.gameWon) {
        dom.tossBtn.disabled = false;
      }
    }, 800);
  }

  function processResult(result, usedLucky) {
    if (result === 'heads') {
      state.currentStreak++;
      var earned = Math.floor(state.currentStreak * getMoneyMultiplier());
      state.money += earned;
      state.totalMoneyEarned += earned;

      if (state.currentStreak > state.bestStreak) {
        state.bestStreak = state.currentStreak;
        addHistoryEntry('milestone', '🔥 New best streak: ' + state.bestStreak + '!');
      }

      addHistoryEntry('heads', 'Toss #' + state.totalTosses + ': HEADS ★' + state.currentStreak + ' (+' + formatMoney(earned) + ')');

      // Animate star
      var stars = dom.streakStars.querySelectorAll('.star');
      var starIdx = state.currentStreak - 1;
      if (starIdx >= 0 && starIdx < stars.length) {
        stars[starIdx].classList.add('filled', 'filling');
        setTimeout(function() {
          stars[starIdx].classList.remove('filling');
        }, 300);
      }

      showMoneyPopup(earned);
      animateClass(dom.money.parentElement, 'flash-green', 400);
      announce('Heads! Streak is now ' + state.currentStreak + '. Earned ' + formatMoney(earned) + '.');

      if (state.currentStreak >= 10) {
        state.gameWon = true;
        setTimeout(showVictory, 1000);
      }
    } else {
      // Tails
      if (state.shieldActive) {
        state.shieldActive = false;
        state.upgrades.streakShield.owned = false;
        addHistoryEntry('shield', '🛡️ Shield blocked tails! Streak saved.');
        announce('Tails! But your shield saved the streak.');
      } else {
        var prevStreak = state.currentStreak;
        state.currentStreak = 0;
        addHistoryEntry('tails', 'Toss #' + state.totalTosses + ': Tails — streak reset');

        // Animate star reset
        if (prevStreak > 0) {
          var stars = dom.streakStars.querySelectorAll('.star.filled');
          stars.forEach(function(star) {
            star.classList.add('resetting');
          });
          setTimeout(function() {
            var allStars = dom.streakStars.querySelectorAll('.star');
            allStars.forEach(function(star) {
              star.classList.remove('filled', 'resetting');
            });
          }, 400);
        }

        animateClass(dom.money.parentElement, 'flash-red', 400);
        announce('Tails. Streak reset to zero.');
      }
    }
  }

  // ========================================
  // 9. Shop System
  // ========================================
  var upgradeNames = {
    headChanceBoost: 'Head Chance Boost',
    moneyMultiplier: 'Money Multiplier',
    streakShield: 'Streak Shield',
    luckyToss: 'Lucky Toss'
  };

  function buyUpgrade(upgradeKey) {
    if (state.gameWon) return;
    var cost = getUpgradeCost(upgradeKey);
    var card = document.querySelector('.shop-card[data-upgrade="' + upgradeKey + '"]');

    if (state.money < cost) {
      animateClass(card, 'shake', 400);
      animateClass(dom.money.parentElement, 'flash-red', 400);
      return;
    }

    var upgrade = state.upgrades[upgradeKey];

    // Consumables: can't buy if already owned
    if ((upgradeKey === 'streakShield' || upgradeKey === 'luckyToss') && upgrade.owned) {
      return;
    }

    state.money -= cost;
    state.totalUpgradesBought++;

    var historyText = '';
    if (upgradeKey === 'headChanceBoost') {
      upgrade.level++;
      historyText = 'Bought ' + upgradeNames[upgradeKey] + ' Lv.' + upgrade.level + ' — ' + formatMoney(cost);
    } else if (upgradeKey === 'moneyMultiplier') {
      upgrade.level++;
      historyText = 'Bought ' + upgradeNames[upgradeKey] + ' Lv.' + upgrade.level + ' — ' + formatMoney(cost);
    } else if (upgradeKey === 'streakShield') {
      upgrade.owned = true;
      state.shieldActive = true;
      upgrade.timesPurchased++;
      historyText = 'Bought ' + upgradeNames[upgradeKey] + ' — ' + formatMoney(cost);
    } else if (upgradeKey === 'luckyToss') {
      upgrade.owned = true;
      state.luckyTossActive = true;
      upgrade.timesPurchased++;
      historyText = 'Bought ' + upgradeNames[upgradeKey] + ' — ' + formatMoney(cost);
    }

    addHistoryEntry('purchase', historyText);
    animateClass(card, 'success-flash', 500);
    animateClass(dom.money.parentElement, 'flash-red', 400);
    renderStats();
    renderStreak();
    renderShop();
    renderTossButton();
    saveGame();
  }

  // ========================================
  // 10. Victory Flow
  // ========================================
  function showVictory() {
    dom.victoryTosses.textContent = state.totalTosses;
    dom.victoryMoney.textContent = formatMoney(state.totalMoneyEarned);
    dom.victoryStreak.textContent = state.bestStreak;
    dom.victoryUpgrades.textContent = state.totalUpgradesBought;
    dom.victoryHeadChance.textContent = Math.round(getHeadChance() * 100) + '%';

    dom.victoryOverlay.classList.remove('hidden');
    dom.victoryOverlay.classList.add('victory-entering');
    setTimeout(function() {
      dom.victoryOverlay.classList.remove('victory-entering');
    }, 600);
  }

  function playAgain() {
    state = deepCopy(DEFAULT_STATE);
    localStorage.removeItem('cointoss-save');
    dom.victoryOverlay.classList.add('hidden');
    dom.newgameOverlay.classList.add('hidden');
    dom.historyLog.innerHTML = '';
    dom.coinContainer.classList.remove('flipping-heads', 'flipping-tails');
    dom.coin.style.transform = '';
    isTossing = false;
    renderAll();
  }

  // ========================================
  // 11. New Game Confirmation
  // ========================================
  function showNewGameDialog() {
    dom.newgameOverlay.classList.remove('hidden');
  }

  function hideNewGameDialog() {
    dom.newgameOverlay.classList.add('hidden');
  }

  // ========================================
  // 12. localStorage Persistence
  // ========================================
  function saveGame() {
    try {
      localStorage.setItem('cointoss-save', JSON.stringify(state));
    } catch (e) {
      // localStorage full or unavailable — silently fail
    }
  }

  function loadGame() {
    try {
      var saved = localStorage.getItem('cointoss-save');
      if (!saved) return;
      var parsed = JSON.parse(saved);

      // Merge with defaults to handle missing fields from older saves
      state = deepCopy(DEFAULT_STATE);
      state.version = parsed.version || 1;
      state.money = parsed.money || 0;
      state.totalMoneyEarned = parsed.totalMoneyEarned || 0;
      state.currentStreak = parsed.currentStreak || 0;
      state.bestStreak = parsed.bestStreak || 0;
      state.totalTosses = parsed.totalTosses || 0;
      state.gameWon = parsed.gameWon || false;
      state.totalUpgradesBought = parsed.totalUpgradesBought || 0;
      state.history = Array.isArray(parsed.history) ? parsed.history : [];

      if (parsed.upgrades) {
        if (parsed.upgrades.headChanceBoost) {
          state.upgrades.headChanceBoost.level = parsed.upgrades.headChanceBoost.level || 0;
        }
        if (parsed.upgrades.moneyMultiplier) {
          state.upgrades.moneyMultiplier.level = parsed.upgrades.moneyMultiplier.level || 0;
        }
        if (parsed.upgrades.streakShield) {
          state.upgrades.streakShield.owned = parsed.upgrades.streakShield.owned || false;
          state.upgrades.streakShield.timesPurchased = parsed.upgrades.streakShield.timesPurchased || 0;
        }
        if (parsed.upgrades.luckyToss) {
          state.upgrades.luckyToss.owned = parsed.upgrades.luckyToss.owned || false;
          state.upgrades.luckyToss.timesPurchased = parsed.upgrades.luckyToss.timesPurchased || 0;
        }
      }

      // Re-derive active states from owned
      state.shieldActive = state.upgrades.streakShield.owned;
      state.luckyTossActive = state.upgrades.luckyToss.owned;

      // Cap history
      if (state.history.length > 200) {
        state.history = state.history.slice(0, 200);
      }
    } catch (e) {
      // Corrupt save — start fresh
      state = deepCopy(DEFAULT_STATE);
      localStorage.removeItem('cointoss-save');
    }
  }

  // ========================================
  // 13. Mobile Collapsible Sections
  // ========================================
  function initCollapsible() {
    var headers = document.querySelectorAll('.collapsible-header');
    headers.forEach(function(header) {
      header.addEventListener('click', function() {
        // Only toggle on mobile
        if (window.matchMedia('(max-width: 767px)').matches) {
          var section = header.parentElement;
          section.classList.toggle('collapsed');
        }
      });
    });
  }

  // ========================================
  // 14. Initialization
  // ========================================
  function init() {
    cacheDom();
    loadGame();

    // Wire events
    dom.tossBtn.addEventListener('click', tossCoin);
    dom.newGameBtn.addEventListener('click', showNewGameDialog);
    dom.cancelNewgameBtn.addEventListener('click', hideNewGameDialog);
    dom.confirmNewgameBtn.addEventListener('click', playAgain);
    dom.playAgainBtn.addEventListener('click', playAgain);

    // Wire shop buy buttons
    document.querySelectorAll('.buy-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var card = btn.closest('.shop-card');
        if (card) {
          buyUpgrade(card.dataset.upgrade);
        }
      });
    });

    initCollapsible();
    renderAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
