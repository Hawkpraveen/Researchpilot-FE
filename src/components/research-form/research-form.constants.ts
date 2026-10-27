import type { CreateResearchRequest } from "../../types";

export const researchCriteria = [
  "Pricing",
  "Features",
  "Integrations",
  "Security",
  "Scalability",
  "Customer feedback",
  "Ease of use",
  "Support quality",
];

export const researchDepthOptions: Array<{
  value: CreateResearchRequest["depth"];
  title: string;
  detail: string;
  tag: string;
}> = [
  { value: "quick", title: "Quick plan", detail: "Up to 3 tasks and 5 pages", tag: "Plan only" },
  { value: "moderate", title: "Balanced plan", detail: "Up to 5 tasks and 15 pages", tag: "Recommended" },
  { value: "deep", title: "Detailed plan", detail: "Up to 8 tasks and 30 pages", tag: "Largest budget" },
];
