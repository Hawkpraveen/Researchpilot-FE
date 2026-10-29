import type { ResearchJob, ResearchStatus } from "../../types";

export type ResearchSort = "updated-desc" | "updated-asc" | "title-asc" | "title-desc" | "sources-desc" | "sources-asc";
export type StatusFilter = "all" | "active" | ResearchStatus;
export type DateFilter = "all" | "7" | "30" | "90";
export type SourceFilter = "all" | "with" | "without";

export function jobTimestamp(job: ResearchJob, now = Date.now()): number | null {
  const iso = Date.parse(job.updatedAtIso ?? "");
  if (Number.isFinite(iso)) return iso;
  const relative = /^(today|yesterday)(?:,?\s+(.+))?$/i.exec(job.updatedAt);
  if (relative) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    if (relative[1].toLowerCase() === "yesterday") date.setDate(date.getDate() - 1);
    if (relative[2]) {
      const time = new Date(`2000-01-01 ${relative[2]}`);
      if (Number.isFinite(time.getTime())) date.setHours(time.getHours(), time.getMinutes());
    }
    return date.getTime();
  }
  const dayFirst = /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(.*)$/.exec(job.updatedAt);
  if (dayFirst && Number(dayFirst[1]) > 12) {
    const parsed = Date.parse(`${dayFirst[3]}-${dayFirst[2].padStart(2, "0")}-${dayFirst[1]} ${dayFirst[4]}`);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const display = /^[A-Za-z]{3}\s+\d{1,2}$/.test(job.updatedAt) ? `${job.updatedAt}, ${new Date(now).getFullYear()}` : job.updatedAt;
  const parsed = Date.parse(display);
  return Number.isFinite(parsed) ? parsed : null;
}

export function selectResearchJobs(jobs: ResearchJob[], options: {
  query: string; status: StatusFilter; date: DateFilter; sources: SourceFilter; sort: ResearchSort;
}, now = Date.now()): ResearchJob[] {
  const terms = options.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = jobs.filter((job) => {
    const text = `${job.title} ${job.question}`.toLowerCase();
    if (!terms.every((term) => text.includes(term))) return false;
    if (options.status === "active" ? !["running", "queued"].includes(job.status) : options.status !== "all" && job.status !== options.status) return false;
    if (options.sources === "with" && job.sourceCount === 0 || options.sources === "without" && job.sourceCount > 0) return false;
    if (options.date !== "all") {
      const timestamp = jobTimestamp(job, now);
      if (timestamp === null || timestamp < now - Number(options.date) * 86400000 || timestamp > now) return false;
    }
    return true;
  });
  const direction = options.sort.endsWith("asc") ? 1 : -1;
  return filtered.sort((a, b) => {
    let comparison: number;
    if (options.sort.startsWith("title")) comparison = a.title.localeCompare(b.title, undefined, { sensitivity: "base", numeric: true });
    else if (options.sort.startsWith("sources")) comparison = a.sourceCount - b.sourceCount;
    else {
      const aTime = jobTimestamp(a, now), bTime = jobTimestamp(b, now);
      if (aTime === null || bTime === null) return aTime === bTime ? a.id.localeCompare(b.id) : aTime === null ? 1 : -1;
      comparison = aTime - bTime;
    }
    return comparison * direction || a.id.localeCompare(b.id);
  });
}
