const STORAGE_KEY = "researchpilot_access_token";
let access_token: string | null = null;

export function getaccess_token() {
  if (access_token) return access_token;
  if (typeof sessionStorage !== "undefined") access_token = sessionStorage.getItem(STORAGE_KEY);
  return access_token;
}

export function setaccess_token(token: string) {
  access_token = token;
  if (typeof sessionStorage !== "undefined") sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearaccess_token() {
  access_token = null;
  if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
}
