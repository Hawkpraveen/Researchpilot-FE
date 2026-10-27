const STORAGE_KEY = "researchpilot_access_token";
let accessToken: string | null = null;

export function getAccessToken() {
  if (accessToken) return accessToken;
  if (typeof sessionStorage !== "undefined") accessToken = sessionStorage.getItem(STORAGE_KEY);
  return accessToken;
}

export function setAccessToken(token: string) {
  accessToken = token;
  if (typeof sessionStorage !== "undefined") sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearAccessToken() {
  accessToken = null;
  if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
}
