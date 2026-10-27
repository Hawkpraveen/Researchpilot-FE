import type { ResearchJob } from "../../types";

export type ResearchReportTab = "overview" | "evidence";

export interface ResearchReportProps {
  job: ResearchJob;
  activeTab: ResearchReportTab;
  onTabChange: (tab: ResearchReportTab) => void;
  onBack: () => void;
  onNew: () => void;
}
