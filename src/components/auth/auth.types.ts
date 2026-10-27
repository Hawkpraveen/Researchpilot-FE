import type { AuthSession } from "../../types";

export type AuthMode = "signin" | "signup";
export type OAuthProvider = "google" | "microsoft" | "github";

export interface AuthPageProps {
  mode: AuthMode;
  theme: "light" | "dark";
  onThemeChange: () => void;
  onModeChange: (mode: AuthMode) => void;
  loading: boolean;
  error: string;
  challenge: AuthSession | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onDemoLogin: () => Promise<void>;
  onVerify: (code: string) => Promise<void>;
  onOAuth: (provider: OAuthProvider) => void;
}
