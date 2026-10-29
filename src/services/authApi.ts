import type { AuthSession, AuthUser } from "../types";
import { clearaccess_token, getaccess_token, setaccess_token } from "./authToken";

import { ApiError, request } from "./apiClient";
export { ApiError } from "./apiClient";

async function createSession(path: string, input?: unknown): Promise<AuthSession> {
  const session = await request<AuthSession>(path, {
    method: "POST",
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
  setaccess_token(session.access_token);
  return session;
}

export function signIn(email: string, password: string) {
  return createSession("/auth/login", { email, password });
}

export function signUp(firstName: string, lastName: string, email: string, password: string) {
  return createSession("/auth/register", {
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    email,
    password,
  });
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  if (!getaccess_token()) return null;
  try {
    const user = await request<AuthUser>("/auth/me");
    return { user, access_token: getaccess_token() ?? "" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearaccess_token();
      return null;
    }
    throw error;
  }
}

export async function signOut() {
  try {
    if (getaccess_token()) await request<void>("/auth/logout", { method: "POST" });
  } finally {
    clearaccess_token();
  }
}

export async function verifyTwoFactor(challengeId: string, code: string): Promise<AuthSession> {
  const session = await request<AuthSession>("/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ challengeId, code }),
  });
  setaccess_token(session.access_token);
  return session;
}

export async function signInWithOAuth(provider: "google" | "microsoft", idToken: string): Promise<AuthSession> {
  return createSession(`/auth/${provider}`, { id_token: idToken });
}

export async function updateProfile(firstName: string, lastName: string): Promise<AuthUser> {
  return request<AuthUser>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim() }),
  });
}

export async function uploadProfilePicture(file: Blob): Promise<AuthUser> {
  return request<AuthUser>("/auth/profile/avatar", {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
}

export async function deleteProfilePicture(): Promise<AuthUser> {
  return request<AuthUser>("/auth/profile/avatar", { method: "DELETE" });
}

export async function requestPhoneCode(phone: string): Promise<void> {
  await request("/auth/phone/request", { method: "POST", body: JSON.stringify({ phone }) });
}
