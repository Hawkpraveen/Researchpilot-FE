import type { FormEvent } from "react";
import type { AuthSession, CreateResearchRequest, ProviderConfig, ResearchJob } from "../types";

export interface AppRoutesProps {
  session: AuthSession | null;
  theme: "light" | "dark";
  authLoading: boolean;
  authError: string;
  authChallenge: AuthSession | null;
  onToggleTheme: () => void;
  onAuthModeChange: (mode: "signin" | "signup") => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
  onDemoLogin: () => Promise<void>;
  onVerify: (code: string) => Promise<void>;
  onOAuth: (provider: "google" | "microsoft" | "github") => void;
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
  error: string;
  onDismissError: () => void;
  onSignOut: () => Promise<void>;
}

export type AuthRouteMode = "signin" | "signup";
