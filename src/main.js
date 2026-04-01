import { createInitialState } from './game/state.js';
import { applyTossResult } from './game/engine.js';
import { renderGame } from './ui/render.js';

let state = createInitialState();

function handleToss() {
  if (state.gameOver) return;
  const randomValue = Math.random();
  applyTossResult(state, randomValue);
  renderGame(state);
}

function handleReset() {
  state = createInitialState();
  renderGame(state);
}

export function bootstrapGame() {
  document.getElementById('toss-btn').addEventListener('click', handleToss);
  document.getElementById('reset-btn').addEventListener('click', handleReset);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !state.gameOver) {
      e.preventDefault();
      handleToss();
    }
  });

  renderGame(state);
}

// Expose for upgrade purchasing (wired in PLAN-03)
export function getState() { return state; }
export function setState(s) { state = s; }

document.addEventListener('DOMContentLoaded', bootstrapGame);
