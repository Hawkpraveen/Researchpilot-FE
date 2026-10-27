import type { AuthSession, AuthUser } from "../types";
import { clearAccessToken, getAccessToken, setAccessToken } from "./authToken";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:5000/api/v1";
const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE as string | undefined) !== "false";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message = typeof body === "object" && body !== null
      && "error" in body && typeof body.error === "object" && body.error !== null
      && "message" in body.error && typeof body.error.message === "string"
      ? body.error.message
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function createSession(path: string, input?: unknown): Promise<AuthSession> {
  const session = await request<AuthSession>(path, {
    method: "POST",
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
  setAccessToken(session.accessToken);
  return session;
}

export function signIn(email: string, password: string) {
  return createSession("/auth/login", { email, password });
}

export function signUp(name: string, email: string, password: string) {
  return createSession("/auth/register", { name, email, password });
}

export async function signInDemo(): Promise<AuthSession> {
  if (!DEMO_MODE) throw new Error("Demo login is only available in demo mode.");
  return createSession("/auth/demo");
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  if (!getAccessToken()) return null;
  try {
    const user = await request<AuthUser>("/auth/me");
    return { user, accessToken: getAccessToken() ?? "" };
  } catch (error) {
    if (error instanceof Error && error.message === "Your session is invalid or has expired.") {
      clearAccessToken();
      return null;
    }
    throw error;
  }
}

export async function signOut() {
  try {
    if (getAccessToken()) await request<void>("/auth/logout", { method: "POST" });
  } finally {
    clearAccessToken();
  }
}

export async function verifyTwoFactor(challengeId: string, code: string): Promise<AuthSession> {
  const session = await request<AuthSession>("/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ challengeId, code }),
  });
  setAccessToken(session.accessToken);
  return session;
}

export function getOAuthUrl(provider: "google" | "microsoft" | "github") {
  return `${API_BASE_URL}/auth/${provider}`;
}

export async function requestPhoneCode(phone: string): Promise<void> {
  await request("/auth/phone/request", { method: "POST", body: JSON.stringify({ phone }) });
}
