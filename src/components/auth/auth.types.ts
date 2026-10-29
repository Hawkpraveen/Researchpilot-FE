import type { AuthSession } from "../../types";

export type AuthMode = "signin" | "signup";
export type OAuthProvider = "google" | "microsoft";

export interface AuthPageProps {
  mode: AuthMode;
  theme: "light" | "dark";
  onThemeChange: () => void;
  onModeChange: (mode: AuthMode) => void;
  loading: boolean;
  error: string;
  challenge: AuthSession | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  onVerify: (code: string) => Promise<void>;
  onOAuth: (provider: OAuthProvider, idToken: string) => Promise<void>;
}
