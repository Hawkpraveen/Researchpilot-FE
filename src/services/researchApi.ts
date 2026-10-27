import type { CreateResearchRequest, ProviderConfig, ResearchJob, ResearchReport } from "../types";
import { getAccessToken } from "./authToken";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:5000/api/v1";
const DEMO_MODE = (import.meta.env.VITE_DEMO_MODE as string | undefined) !== "false";
const RESEARCH_DEMO_MODE = (
  (import.meta.env.VITE_RESEARCH_DEMO_MODE as string | undefined)
  ?? (import.meta.env.VITE_DEMO_MODE as string | undefined)
) !== "false";

function toApiRequest(input: CreateResearchRequest) {
  return {
    goal: input.question,
    alternatives: [],
    criteria: input.criteria.map((label, index) => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, weight: Math.max(1, 5 - index) })),
    constraints: input.constraints.trim() ? [input.constraints.trim()] : [],
    depth: input.depth === "moderate" ? "standard" : input.depth,
  };
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const demoReport: ResearchReport = {
  researchStatus: "completed",
  summary:
    "For a small support team, prioritize reliable ticket integration, transparent pricing, and a clear path to human handoff. Public information is sufficient for a preliminary shortlist, but final selection should depend on a trial and confirmation of security requirements.",
  recommendation:
    "Shortlist Vendor A for a trial because its published workflow features best match the stated needs. Treat this as a preliminary recommendation: confirm total cost, data retention, and integration limits with the vendor before making a purchase.",
  alternatives: [
    "Vendor B may be a better fit if lower entry cost is the primary constraint.",
    "Vendor C is worth revisiting if advanced workflow customization becomes essential.",
  ],
  comparison: [
    { criterion: "Published pricing", values: { "Vendor A": "Tiered; confirm seat limits", "Vendor B": "Starting price published", "Vendor C": "Sales quote required" } },
    { criterion: "Workflow automation", values: { "Vendor A": "Strong published feature set", "Vendor B": "Core automation", "Vendor C": "Advanced options; verify plan" } },
    { criterion: "Integrations", values: { "Vendor A": "Common helpdesk integrations", "Vendor B": "Limited public detail", "Vendor C": "Broad integration catalog" } },
    { criterion: "Security evidence", values: { "Vendor A": "Review current trust page", "Vendor B": "Some controls documented", "Vendor C": "Request compliance documents" } },
  ],
  sources: [
    {
      id: "s1",
      title: "Vendor A — Plans and pricing",
      domain: "vendor-a.example",
      url: "https://example.com",
      accessedAt: "Today",
      snippet: "Official pricing page. Confirm included seats, usage allowances, and any add-on charges.",
      reliability: "high",
    },
    {
      id: "s2",
      title: "Vendor B — Product documentation",
      domain: "docs.vendor-b.example",
      url: "https://example.com",
      accessedAt: "Today",
      snippet: "Official documentation describing core automation and available integrations.",
      reliability: "high",
    },
    {
      id: "s3",
      title: "Independent comparison of support tools",
      domain: "review-site.example",
      url: "https://example.com",
      accessedAt: "Today",
      snippet: "Third-party overview. Useful for discovering trade-offs; verify claims against official sources.",
      reliability: "medium",
    },
  ],
  uncertainties: [
    "Vendor C does not publish a directly comparable price on the reviewed page.",
    "Security certifications and data-retention terms should be verified from current official documentation.",
    "Review evidence can be biased by company size, use case, and reviewer selection.",
  ],
};

const demoJobs: ResearchJob[] = [
  {
    id: "rp-1042",
    title: "AI customer-support platforms",
    question: "Compare three AI customer-support platforms for a 20-person startup.",
    status: "completed",
    createdAt: "Today, 10:24 AM",
    updatedAt: "Today, 10:28 AM",
    progress: 100,
    currentStage: "Report ready",
    sourceCount: 18,
    report: demoReport,
  },
  {
    id: "rp-1041",
    title: "Vector databases for a small RAG app",
    question: "Compare vector database options for a small RAG application.",
    status: "completed",
    createdAt: "Yesterday",
    updatedAt: "Yesterday",
    progress: 100,
    currentStage: "Report ready",
    sourceCount: 12,
    report: {
      ...demoReport,
      summary: "A lightweight first version can often begin with the search capabilities already available in the primary database. Add a dedicated vector store when semantic retrieval quality, scale, or filtering needs justify the operational complexity.",
      recommendation: "Start with the simplest option that supports your evaluation criteria, then compare retrieval quality on a fixed dataset before migrating.",
    },
  },
  {
    id: "rp-1038",
    title: "Self-hosted LLM inference options",
    question: "Evaluate local inference options for a zero-budget prototype.",
    status: "failed",
    createdAt: "Oct 22",
    updatedAt: "Oct 22",
    progress: 42,
    currentStage: "Research interrupted",
    sourceCount: 6,
  },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      typeof body === "object" && body !== null && "error" in body
        && typeof body.error === "object" && body.error !== null
        && "message" in body.error && typeof body.error.message === "string"
        ? body.error.message
        : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function listResearch(): Promise<ResearchJob[]> {
  if (RESEARCH_DEMO_MODE) {
    await wait(180);
    return demoJobs;
  }
  return request<ResearchJob[]>("/research-jobs");
}

export async function getResearch(id: string): Promise<ResearchJob> {
  if (RESEARCH_DEMO_MODE) {
    await wait(120);
    const job = demoJobs.find((item) => item.id === id);
    if (!job) throw new Error("Research job not found");
    return job;
  }
  return request<ResearchJob>(`/research-jobs/${encodeURIComponent(id)}`);
}

export async function createResearch(input: CreateResearchRequest): Promise<ResearchJob> {
  if (RESEARCH_DEMO_MODE) {
    await wait(450);
    const title = input.question.length > 48 ? `${input.question.slice(0, 45)}…` : input.question;
    return {
      id: `demo-${Date.now()}`,
      title,
      question: input.question,
      status: "running",
      createdAt: "Just now",
      updatedAt: "Just now",
      progress: 8,
      currentStage: "Planning research questions",
      sourceCount: 0,
      report: undefined,
    };
  }
  const created = await request<{ jobId: string }>("/research-jobs", { method: "POST", body: JSON.stringify(toApiRequest(input)) });
  return request<ResearchJob>(`/research-jobs/${encodeURIComponent(created.jobId)}`);
}

export async function saveProviderConfig(config: ProviderConfig): Promise<void> {
  if (DEMO_MODE) {
    await wait(240);
    return;
  }
  await request("/settings/provider", { method: "PUT", body: JSON.stringify(config) });
}

export async function checkAgentConnection(): Promise<{ connected: boolean; message: string }> {
  if (RESEARCH_DEMO_MODE) {
    await wait(260);
    return { connected: true, message: "Demo agent is ready" };
  }
  try {
    await request("/health");
    return { connected: true, message: "Backend is reachable; the Agent is checked when a research job runs." };
  } catch {
    return { connected: false, message: "Could not reach the configured API" };
  }
}
