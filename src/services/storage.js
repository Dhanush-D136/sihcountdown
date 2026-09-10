/* ==========================================================================
   SIH 2026 - LOCALSTORAGE EVENT STATE MANAGER (ZERO BACKEND)
   Handles state persistence across browser refreshes with safety fallbacks.
   ========================================================================== */

const STORAGE_KEY = 'SIH_2026_STANDALONE_EVENT_STATE';

const DEFAULT_STATE = {
  status: 'NOT_STARTED', // NOT_STARTED, RUNNING, COMPLETED
  eventStartedAt: null,
  eventEndAt: null,
  durationSeconds: 86400, // 24 hours
};

export function getStoredEventState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_STATE };
    }

    // Validate timestamps
    if (parsed.status === 'RUNNING') {
      if (!parsed.eventEndAt || typeof parsed.eventEndAt !== 'number') {
        return { ...DEFAULT_STATE };
      }
      // Check if already expired
      if (Date.now() >= parsed.eventEndAt) {
        return {
          ...parsed,
          status: 'COMPLETED',
        };
      }
    }

    return {
      status: parsed.status || 'NOT_STARTED',
      eventStartedAt: parsed.eventStartedAt || null,
      eventEndAt: parsed.eventEndAt || null,
      durationSeconds: parsed.durationSeconds || 86400,
    };
  } catch (e) {
    console.warn('Corrupted localStorage state detected, resetting:', e);
    clearStoredEventState();
    return { ...DEFAULT_STATE };
  }
}

export function saveStoredEventState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Unable to save event state to localStorage:', e);
  }
}

export function clearStoredEventState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
}
