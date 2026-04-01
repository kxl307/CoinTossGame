let seq = 0;

export function createHistoryEntry(type, message, details = {}) {
  return {
    seq: ++seq,
    type,
    message,
    outcome: details.outcome || null,
    streak: details.streak || null,
    reward: details.reward || null,
    upgrade: details.upgrade || null,
    cost: details.cost || null,
    timestamp: Date.now(),
  };
}

export function appendHistoryEntry(state, entry) {
  state.history.push(entry);
  return state;
}

export function resetHistorySeq() {
  seq = 0;
}
