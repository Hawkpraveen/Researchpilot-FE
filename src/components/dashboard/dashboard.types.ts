import type { ResearchJob, ResearchStatus } from "../../types";
import type { ReactNode } from "react";

export interface DashboardProps {
  jobs: ResearchJob[];
  loading: boolean;
  activeJob: ResearchJob | null;
  query: string;
  onQueryChange: (query: string) => void;
  onNew: () => void;
  onOpenJob: (job: ResearchJob) => void;
  onViewReport: () => void;
  onRetry: () => void;
}

export interface StatusPillProps {
  status: ResearchStatus;
}

export interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}

export interface WorkflowStepProps {
  number: string;
  icon: ReactNode;
  title: string;
  detail: string;
}
