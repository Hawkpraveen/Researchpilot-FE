import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResearch, listResearch } from "../../services/researchApi";
import type { ResearchJob } from "../../types";

export function useResearchHistory(authenticated: boolean) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [activeJob, setActiveJob] = useState<ResearchJob | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authenticated) {
      setJobs([]);
      setActiveJob(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    listResearch()
      .then((items) => {
        setJobs(items);
        setActiveJob(items.find((job) => job.status === "completed") ?? items[0] ?? null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load research history."))
      .finally(() => setLoading(false));
  }, [authenticated]);

  useEffect(() => {
    if (!activeJob || activeJob.id.startsWith("demo-") || !["queued", "running"].includes(activeJob.status)) return;

    const interval = window.setInterval(() => {
      getResearch(activeJob.id)
        .then((updated) => {
          setJobs((current) => current.map((job) => job.id === updated.id ? updated : job));
          setActiveJob((current) => current?.id === updated.id ? updated : current);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Could not refresh research status.");
        });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeJob?.id, activeJob?.status]);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return jobs;
    return jobs.filter((job) => `${job.title} ${job.question}`.toLowerCase().includes(normalizedQuery));
  }, [jobs, query]);

  const openJob = (job: ResearchJob) => {
    setActiveJob(job);
    navigate(job.status === "completed" ? `/workspace/research/${encodeURIComponent(job.id)}` : "/workspace");
  };

  const addJob = (job: ResearchJob) => {
    setJobs((current) => [job, ...current]);
    setActiveJob(job);
  };

  return {
    jobs,
    filteredJobs,
    activeJob,
    query,
    setQuery,
    loading,
    error,
    setError,
    openJob,
    addJob,
  };
}
