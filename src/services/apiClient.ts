import { getaccess_token } from "./authToken";
import { messages } from "../constants/messages";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:5000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly requestId?: string,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Shared authenticated transport; mutations are deliberately never auto-retried. */
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  const token = getaccess_token();
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const error = typeof body === "object" && body !== null && "error" in body
      && typeof body.error === "object" && body.error !== null ? body.error : null;
    const message = error && "message" in error && typeof error.message === "string"
      ? error.message : messages.requestFailed(response.status);
    const code = error && "code" in error && typeof error.code === "string" ? error.code : undefined;
    const retryHeader = response.headers.get("Retry-After");
    const retrySeconds = retryHeader === null ? NaN : Number(retryHeader);
    throw new ApiError(message, response.status, code, response.headers.get("X-Request-ID") ?? undefined,
      Number.isFinite(retrySeconds) && retrySeconds >= 0 ? retrySeconds : undefined);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
