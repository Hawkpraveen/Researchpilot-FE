import { useLayoutEffect, useSyncExternalStore } from "react";
import { API_BASE_URL, request } from "../../services/apiClient";
import { BrowserRelayClient } from "../../services/browserRelayClient";

const preference = (scope: string) => `researchpilot_browser_ollama:${API_BASE_URL}:${scope}`;
export const browserOllama = new BrowserRelayClient({
  api: request,
  fetch: (...args) => fetch(...args),
  remember: (scope, enabled) => {
    try { if (enabled) sessionStorage.setItem(preference(scope), "enabled"); else sessionStorage.removeItem(preference(scope)); } catch { /* Storage can be disabled. */ }
  },
  withLock: async (scope, work) => {
    if (!navigator.locks) { await work(); return true; }
    return navigator.locks.request(`researchpilot-ollama:${API_BASE_URL}:${scope}`, { ifAvailable: true }, async lock => {
      if (!lock) return false;
      await work();
      return true;
    });
  },
});

async function localPermissionGranted() {
  if (!navigator.permissions) return false;
  for (const name of ["loopback-network", "local-network-access"]) {
    try {
      const permission = await navigator.permissions.query({ name: name as PermissionName });
      return permission.state === "granted";
    } catch { /* Older browsers may not expose these permissions. */ }
  }
  return false;
}

/** Mounted at the app level so research navigation does not stop the relay. */
export function useBrowserOllamaSession(scope: string | null) {
  useLayoutEffect(() => {
    browserOllama.setScope(scope);
    let active = true;
    let optedIn = false;
    try { optedIn = Boolean(scope && sessionStorage.getItem(preference(scope)) === "enabled"); } catch { /* Optional preference only. */ }
    if (scope && optedIn) void localPermissionGranted().then(granted => { if (active && granted) browserOllama.connect(); });
    return () => { active = false; browserOllama.setScope(null); };
  }, [scope]);
}

export function useBrowserOllamaState() { return useSyncExternalStore(browserOllama.subscribe, browserOllama.getSnapshot); }
