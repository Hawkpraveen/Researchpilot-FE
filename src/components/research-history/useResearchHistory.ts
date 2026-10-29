import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteResearch, getResearch, listResearch, renameResearch } from "../../services/researchApi";
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
        setActiveJob(items.find((job) => ["queued", "running"].includes(job.status)) ?? items[0] ?? null);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load research history."))
      .finally(() => setLoading(false));
  }, [authenticated]);

  const pendingIds = jobs.filter((job) => !job.id.startsWith("demo-") && ["queued", "running"].includes(job.status)).map((job) => job.id).join(",");
  useEffect(() => {
    if (!authenticated || !pendingIds) return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      const results = await Promise.allSettled(pendingIds.split(",").map(getResearch));
      if (disposed) return;
      const updates = new Map<string, ResearchJob>();
      for (const result of results) {
        if (result.status === "fulfilled") updates.set(result.value.id, result.value);
        else setError(result.reason instanceof Error ? result.reason.message : "Could not refresh research status.");
      }
      setJobs((current) => current.map((job) => updates.get(job.id) ?? job));
      setActiveJob((current) => current ? updates.get(current.id) ?? current : current);
      timer = setTimeout(() => void refresh(), 2000);
    };
    void refresh();
    return () => { disposed = true; clearTimeout(timer); };
  }, [authenticated, pendingIds]);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return jobs;
    return jobs.filter((job) => `${job.title} ${job.question}`.toLowerCase().includes(normalizedQuery));
  }, [jobs, query]);

  const openJob = (job: ResearchJob) => {
    setActiveJob(job);
    navigate(`/workspace/research/${encodeURIComponent(job.id)}`);
  };

  const addJob = (job: ResearchJob) => {
    setJobs((current) => current.some((item) => item.id === job.id) ? current.map((item) => item.id === job.id ? job : item) : [job, ...current]);
    setActiveJob(job);
  };
  const renameJob = async (job: ResearchJob, title: string) => {
    const updated = await renameResearch(job.id, title);
    setJobs((current) => current.map((item) => item.id === updated.id ? updated : item));
    setActiveJob((current) => current?.id === updated.id ? updated : current);
  };
  const deleteJob = async (job: ResearchJob) => {
    await deleteResearch(job.id);
    setJobs((current) => current.filter((item) => item.id !== job.id));
    setActiveJob((current) => current?.id === job.id ? null : current);
    if (window.location.pathname === `/workspace/research/${encodeURIComponent(job.id)}`) navigate("/workspace");
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
    renameJob,
    deleteJob,
  };
}
