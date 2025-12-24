import { apiFetch } from "./api";

// Generate a unique session ID for tracking
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get or create session ID from sessionStorage
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem("tracking_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem("tracking_session_id", sessionId);
  }
  return sessionId;
}

// Start tracking session
export async function startTracking(): Promise<void> {
  const sessionId = getSessionId();
  try {
    await apiFetch("/tracking/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
      credentials: "include",
    });
  } catch (err) {
    console.error("Failed to start tracking:", err);
  }
}

// End tracking session
export async function endTracking(): Promise<void> {
  const sessionId = sessionStorage.getItem("tracking_session_id");
  if (!sessionId) return;

  try {
    await apiFetch("/tracking/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
      credentials: "include",
    });
  } catch (err) {
    console.error("Failed to end tracking:", err);
  }
}

// Update tracking session (heartbeat)
export async function updateTracking(): Promise<void> {
  const sessionId = sessionStorage.getItem("tracking_session_id");
  if (!sessionId) return;

  try {
    await apiFetch("/tracking/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
      credentials: "include",
    });
  } catch (err) {
    console.error("Failed to update tracking:", err);
  }
}

// Initialize tracking on app load
export function initializeTracking(): () => void {
  // Start tracking
  startTracking();

  // Update tracking every 30 seconds
  const updateInterval = setInterval(updateTracking, 30000);

  // End tracking on page unload
  const handleUnload = () => {
    endTracking();
  };

  window.addEventListener("beforeunload", handleUnload);

  // Return cleanup function
  return () => {
    clearInterval(updateInterval);
    window.removeEventListener("beforeunload", handleUnload);
    endTracking();
  };
}
