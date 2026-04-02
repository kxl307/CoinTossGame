/**
 * Structured history event model. Append-only, chronological.
 */

/**
 * Create a normalized history entry.
 * @param {'toss'|'purchase'|'win'|'game-over'} type
 * @param {object} data - type-specific payload
 * @returns {object} history entry
 */
export function createHistoryEntry(type, data = {}) {
  return {
    type,
    timestamp: Date.now(),
    ...data,
  };
}

/**
 * Append a history entry to state, returning new state (immutable).
 */
export function appendHistory(state, entry) {
  return {
    ...state,
    history: [...state.history, entry],
  };
}
