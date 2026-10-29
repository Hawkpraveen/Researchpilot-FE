import type { FormEvent } from "react";
import type { AuthSession, CreateResearchRequest, ProviderConfig, ResearchJob } from "../types";

export interface AppRoutesProps {
  session: AuthSession | null;
  authInitializing: boolean;
  theme: "light" | "dark";
  authLoading: boolean;
  authError: string;
  authChallenge: AuthSession | null;
  onToggleTheme: () => void;
  onAuthModeChange: (mode: "signin" | "signup") => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  onVerify: (code: string) => Promise<void>;
  onOAuth: (provider: "google" | "microsoft", idToken: string) => Promise<void>;
  onUpdateProfile: (firstName: string, lastName: string) => Promise<void>;
  onUpdateProfilePicture: (file: Blob) => Promise<void>;
  onRemoveProfilePicture: () => Promise<void>;
  jobs: ResearchJob[];
  filteredJobs: ResearchJob[];
  activeJob: ResearchJob | null;
  loading: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onOpenJob: (job: ResearchJob) => void;
  onStartNew: () => void;
  onSubmitResearch: (event: FormEvent<HTMLFormElement>) => void;
  form: CreateResearchRequest;
  onFormChange: (form: CreateResearchRequest) => void;
  onToggleCriterion: (criterion: string) => void;
  submitting: boolean;
  activeReportTab: "overview" | "evidence";
  onReportTabChange: (tab: "overview" | "evidence") => void;
  providerConfig: ProviderConfig;
  connectionState: { connected: boolean; message: string } | null;
  onProviderConfigChange: (config: ProviderConfig) => void;
  onSaveProviderConfig: () => Promise<void>;
  onTestProviderConnection: () => Promise<void>;
  workspaceName: string;
  onSaveWorkspaceName: (name: string) => Promise<void>;
  error: string;
  onDismissError: () => void;
  onSignOut: () => Promise<void>;
}

export type AuthRouteMode = "signin" | "signup";
