import { createInitialGameState } from './game/state.js';

let gameState = createInitialGameState();

function render() {
  // Stub — T04 will implement full UI rendering.
  const root = document.getElementById('app');
  if (!root) return;
  root.dataset.ready = 'true';
}

function init() {
  gameState = createInitialGameState();
  render();
}

document.addEventListener('DOMContentLoaded', init);

export { gameState, render, init };
