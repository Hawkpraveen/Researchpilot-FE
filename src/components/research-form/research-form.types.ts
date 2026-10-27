import type { FormEvent } from "react";
import type { CreateResearchRequest } from "../../types";

export interface NewResearchProps {
  form: CreateResearchRequest;
  submitting: boolean;
  onChange: (form: CreateResearchRequest) => void;
  onToggleCriterion: (criterion: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}
