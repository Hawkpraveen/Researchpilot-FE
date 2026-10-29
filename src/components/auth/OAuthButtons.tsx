import { PublicClientApplication } from "@azure/msal-browser";
import { useEffect, useRef, useState } from "react";
import type { OAuthProvider } from "./auth.types";

interface GoogleCredentialResponse { credential?: string }
interface GoogleIdentityApi {
  accounts: {
    id: {
      initialize(options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }): void;
      renderButton(parent: HTMLElement, options: { theme: "outline" | "filled_black"; size: "large"; shape: "rectangular"; text: "continue_with"; width: number }): void;
    };
  };
}

declare global {
  interface Window { google?: GoogleIdentityApi }
}

const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ?? "";
const microsoftClientId = (import.meta.env.VITE_MICROSOFT_CLIENT_ID as string | undefined)?.trim() ?? "";
const microsoftTenantId = (import.meta.env.VITE_MICROSOFT_TENANT_ID as string | undefined)?.trim() || "common";
let googleScriptPromise: Promise<GoogleIdentityApi> | undefined;
let initializedGoogleClientId = "";
let activeGoogleHandler: ((idToken: string) => void) | undefined;
let msalInstancePromise: Promise<PublicClientApplication> | undefined;

function loadGoogleIdentity(): Promise<GoogleIdentityApi> {
  if (window.google) return Promise.resolve(window.google);
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise<GoogleIdentityApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => window.google ? resolve(window.google) : reject(new Error("Google sign-in could not be initialized."));
    script.onerror = () => reject(new Error("Could not load Google sign-in. Check your connection and try again."));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    googleScriptPromise = undefined;
    throw error;
  });
  return googleScriptPromise!;
}

function getMicrosoftClient(): Promise<PublicClientApplication> {
  if (!msalInstancePromise) {
    const instance = new PublicClientApplication({
      auth: {
        clientId: microsoftClientId,
        authority: `https://login.microsoftonline.com/${encodeURIComponent(microsoftTenantId)}`,
        redirectUri: new URL("/redirect.html", window.location.origin).toString(),
      },
      cache: { cacheLocation: "sessionStorage" },
    });
    msalInstancePromise = instance.initialize().then(() => instance).catch((error: unknown) => {
      msalInstancePromise = undefined;
      throw error;
    });
  }
  return msalInstancePromise;
}

export function OAuthButtons({
  loading,
  theme,
  onOAuth,
}: {
  loading: boolean;
  theme: "light" | "dark";
  onOAuth: (provider: OAuthProvider, idToken: string) => Promise<void>;
}) {
  const googleButton = useRef<HTMLDivElement>(null);
  const oauthHandler = useRef(onOAuth);
  const [googleError, setGoogleError] = useState("");
  const [microsoftError, setMicrosoftError] = useState("");
  const [microsoftWorking, setMicrosoftWorking] = useState(false);
  oauthHandler.current = onOAuth;

  useEffect(() => {
    if (!googleClientId || !googleButton.current) return;
    let cancelled = false;
    activeGoogleHandler = (idToken) => { void oauthHandler.current("google", idToken); };
    void loadGoogleIdentity().then((google) => {
      if (cancelled || !googleButton.current) return;
      if (!initializedGoogleClientId) {
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response.credential) activeGoogleHandler?.(response.credential);
          },
        });
        initializedGoogleClientId = googleClientId;
      }
      if (initializedGoogleClientId !== googleClientId) {
        setGoogleError("Google sign-in is already initialized with a different client ID. Reload after updating your environment.");
        return;
      }
      google.accounts.id.renderButton(googleButton.current, {
        theme: theme === "dark" ? "filled_black" : "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: 180,
      });
      setGoogleError("");
    }).catch((error: unknown) => {
      if (!cancelled) setGoogleError(error instanceof Error ? error.message : "Google sign-in could not be loaded.");
    });
    return () => {
      cancelled = true;
      activeGoogleHandler = undefined;
    };
  }, [theme]);

  const signInMicrosoft = async () => {
    if (!microsoftClientId || loading || microsoftWorking) return;
    setMicrosoftWorking(true);
    setMicrosoftError("");
    try {
      const client = await getMicrosoftClient();
      const response = await client.loginPopup({ scopes: ["openid", "profile", "email"] });
      if (!response.idToken) throw new Error("Microsoft did not return an ID token. Check the app registration's OpenID Connect settings.");
      await onOAuth("microsoft", response.idToken);
    } catch (error) {
      setMicrosoftError(error instanceof Error ? error.message : "Could not sign in with Microsoft.");
    } finally {
      setMicrosoftWorking(false);
    }
  };

  const googleConfigured = Boolean(googleClientId && googleClientId !== "***");
  const microsoftConfigured = Boolean(microsoftClientId && microsoftClientId !== "***");

  return <div className="w-full">
    <div className="grid w-full grid-cols-2 items-center gap-3">
      {googleConfigured
        ? <div ref={googleButton} className={`oauth-google-button ${loading ? "oauth-button-loading" : ""}`} aria-label="Continue with Google" />
        : <button type="button" className="oauth-provider-placeholder" disabled title="Configure VITE_GOOGLE_CLIENT_ID to enable Google sign-in"><span className="oauth-provider-g">G</span>Google</button>}
      <button
        className="oauth-provider-placeholder microsoft-provider"
        type="button"
        onClick={() => void signInMicrosoft()}
        disabled={loading || microsoftWorking || !microsoftConfigured}
        title={microsoftConfigured ? "Continue with Microsoft" : "Configure VITE_MICROSOFT_CLIENT_ID to enable Microsoft sign-in"}
      ><span className="microsoft-logo" aria-hidden="true"><i /><i /><i /><i /></span><span>{microsoftWorking ? "Connecting…" : "Microsoft"}</span></button>
    </div>
    {(googleError || microsoftError) && <p className="oauth-error" role="alert">{googleError || microsoftError}</p>}
    {(!googleConfigured || !microsoftConfigured) && <p className="oauth-setup-note">Add the provider client IDs to the frontend and matching backend environment variables to enable sign-in.</p>}
    {googleConfigured && <p className="oauth-setup-note">Google OAuth must allow {window.location.origin} as a JavaScript origin. Register {window.location.origin}/redirect.html as the Microsoft SPA redirect URI.</p>}
  </div>;
}
