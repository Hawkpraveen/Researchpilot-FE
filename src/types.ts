export type ResearchStatus = "completed" | "running" | "queued" | "failed" | "partial" | "needs_clarification";

export interface ResearchJobError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ResearchClarification { candidateIndex?: number; context?: string }

export interface ResearchSource {
  id: string;
  title: string;
  domain: string;
  url: string;
  publishedAt?: string;
  accessedAt: string;
  snippet: string;
  reliability: "high" | "medium" | "low";
}

export interface ComparisonCell {
  criterion: string;
  values: Record<string, string>;
}

export interface ResearchReport {
  researchStatus: "not_run" | "completed" | "partial" | "needs_clarification";
  resolution?: {
    status: "resolved" | "ambiguous" | "unresolved";
    subject: string;
    explanation: string;
    candidates: Array<{ label: string; description: string; sourceIds: string[] }>;
    selectedSourceIds: string[];
  };
  summary: string;
  recommendation: string;
  alternatives: string[];
  comparison: ComparisonCell[];
  sources: ResearchSource[];
  uncertainties: string[];
}

export interface ResearchJob {
  request?: { goal: string; depth: "quick" | "standard" | "deep"; criteria: Array<{ id: string; label: string; weight: number }>; constraints: string[]; alternatives: string[] };
  id: string;
  title: string;
  question: string;
  status: ResearchStatus;
  createdAt: string;
  updatedAt: string;
  createdAtIso?: string;
  updatedAtIso?: string;
  progress: number;
  currentStage: string;
  sourceCount: number;
  error?: ResearchJobError | null;
  report?: ResearchReport;
}

export interface CreateResearchRequest {
  question: string;
  researchType: "product-comparison" | "technical-research" | "business-decision";
  depth: "quick" | "moderate" | "deep";
  criteria: string[];
  constraints: string;
}

export type ProviderKind = "ollama" | "openai" | "anthropic" | "custom";

export interface ProviderConfig {
  mode: "local" | "byok";
  provider: ProviderKind;
  endpoint: string;
  model: string;
  apiKey: string;
}

export type UserRole = "super_admin" | "user";

export interface AuthUser {
  id: string;
  tenant_id: string;
  workspace_id: string;
  email: string;
  first_name: string;
  last_name: string;
  auth_type?: "basic_auth" | "google" | "microsoft";
  profile_url?: string;
  role: UserRole;
  twoFactorEnabled: boolean;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  expires_at?: string;
  requiresTwoFactor?: boolean;
  challengeId?: string;
}
