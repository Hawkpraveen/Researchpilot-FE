/** Shared client-side fallbacks; server error messages take precedence. */
export const messages = {
  providerSaved: "Provider configuration saved",
  providerConnectionFailed: "Could not test provider connection.",
  researchNotFound: "Research job not found",
  requestFailed: (status: number) => `Request failed (${status})`,
} as const;
