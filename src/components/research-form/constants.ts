import type { CreateResearchRequest } from "../../types";

export const initialForm: CreateResearchRequest = {
  question: "",
  researchType: "product-comparison",
  depth: "moderate",
  criteria: ["Pricing", "Features", "Integrations", "Security"],
  constraints: "",
};
