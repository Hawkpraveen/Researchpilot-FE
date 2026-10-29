import type { ResearchJob, ResearchClarification } from "../../types";

export type ResearchReportTab = "overview" | "evidence" | "gaps";

export interface ResearchReportProps {
  job: ResearchJob;
  activeTab: ResearchReportTab;
  onTabChange: (tab: ResearchReportTab) => void;
  onBack: () => void;
  onNew: () => void;
  onRenameJob: (job: ResearchJob, title: string) => Promise<void>;
  onDeleteJob: (job: ResearchJob) => Promise<void>;
  onRetry: () => void;
  onClarify: (clarification: ResearchClarification) => void;
  busy?: boolean;
}
