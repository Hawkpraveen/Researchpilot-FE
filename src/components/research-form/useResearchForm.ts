import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createResearch } from "../../services/researchApi";
import type { CreateResearchRequest, ResearchJob } from "../../types";
import { initialForm } from "./constants";

export function useResearchForm(onCreated: (job: ResearchJob) => void) {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateResearchRequest>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const startNew = () => {
    setForm(initialForm);
    setError("");
    navigate("/workspace/research/new");
  };

  const toggleCriterion = (criterion: string) => {
    setForm((current) => ({
      ...current,
      criteria: current.criteria.includes(criterion)
        ? current.criteria.filter((item) => item !== criterion)
        : [...current.criteria, criterion],
    }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.question.trim().length < 12) {
      setError("Add a little more detail so the research agent can plan useful questions.");
      return;
    }
    if (!form.criteria.length) {
      setError("Choose at least one comparison criterion.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const created = await createResearch({ ...form, question: form.question.trim() });
      onCreated(created);
      navigate("/workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start research.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    setForm,
    submitting,
    error,
    setError,
    startNew,
    toggleCriterion,
    submit,
  };
}
