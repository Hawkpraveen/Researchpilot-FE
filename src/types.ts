export type ResearchStatus = "completed" | "running" | "queued" | "failed";

export interface ResearchJobError {
  code: string;
  message: string;
  retryable: boolean;
}

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
  researchStatus: "not_run" | "completed";
  summary: string;
  recommendation: string;
  alternatives: string[];
  comparison: ComparisonCell[];
  sources: ResearchSource[];
  uncertainties: string[];
}

export interface ResearchJob {
  id: string;
  title: string;
  question: string;
  status: ResearchStatus;
  createdAt: string;
  updatedAt: string;
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
  email: string;
  name: string;
  role: UserRole;
  twoFactorEnabled: boolean;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  expiresAt?: string;
  requiresTwoFactor?: boolean;
  challengeId?: string;
}
