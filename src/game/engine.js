import { WIN_STREAK, HEAD_REWARD, STREAK_BONUS } from './config.js';
import { getRewardBonus } from './upgrades.js';

export function resolveToss(randomValue, headsChance) {
  return randomValue < headsChance ? 'heads' : 'tails';
}

export function applyTossResult(state, randomValue) {
  if (state.gameOver) return state;

  const outcome = resolveToss(randomValue, state.currentHeadsChance);
  state.tossCount++;
  state.lastOutcome = outcome;

  if (outcome === 'heads') {
    state.streak++;
    const bonus = getRewardBonus(state);
    const reward = HEAD_REWARD + state.streak * STREAK_BONUS + bonus;
    state.lastReward = reward;
    state.balance += reward;
    state.lifetimeEarnings += reward;
    state.headsReward = reward;

    if (state.streak >= WIN_STREAK) {
      state.win = true;
      state.gameOver = true;
    }
  } else {
    state.streak = 0;
    state.lastReward = 0;
    state.headsReward = 0;
  }

  return state;
}
