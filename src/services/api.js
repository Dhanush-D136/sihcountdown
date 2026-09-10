/* ==========================================================================
   SIH 2026 - API & REALTIME SSE SERVICE
   Authoritative state synchronization with VITE_API_BASE_URL fallback.
   ========================================================================== */

const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '';

export async function fetchEventStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/event/status`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Unable to fetch event status:', e);
  }
  return null;
}

// ASYNCHRONOUS NON-BLOCKING START REQUEST
export async function startEventAsync() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/events/start`, { method: 'POST' });
    if (!res.ok) {
      // Fallback endpoint check
      const fallbackRes = await fetch(`${API_BASE_URL}/api/event/public_start`, { method: 'POST' });
      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }
    } else {
      return await res.json();
    }
  } catch (e) {
    console.warn('Asynchronous start request warning:', e);
  }
  return null;
}

export function initSSEStream(onStateUpdate) {
  let evtSource = null;
  let pollInterval = null;

  try {
    const streamUrl = `${API_BASE_URL}/api/events/stream`;
    evtSource = new EventSource(streamUrl);

    evtSource.onmessage = (event) => {
      try {
        const state = JSON.parse(event.data);
        if (typeof onStateUpdate === 'function') {
          onStateUpdate(state);
        }
      } catch (e) {}
    };

    evtSource.onerror = () => {
      if (evtSource) {
        evtSource.close();
      }
      // Revert to lightweight polling if SSE is disconnected
      if (!pollInterval) {
        pollInterval = setInterval(async () => {
          const state = await fetchEventStatus();
          if (state && typeof onStateUpdate === 'function') {
            onStateUpdate(state);
          }
        }, 2000);
      }
    };
  } catch (e) {
    pollInterval = setInterval(async () => {
      const state = await fetchEventStatus();
      if (state && typeof onStateUpdate === 'function') {
        onStateUpdate(state);
      }
    }, 2000);
  }

  return () => {
    if (evtSource) evtSource.close();
    if (pollInterval) clearInterval(pollInterval);
  };
}
