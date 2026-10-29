import { useState } from "react";
import { Activity, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronDown, Clock3, FileText, Filter, FlaskConical, Globe2, Link2, LoaderCircle, Plus, Search, ShieldCheck, Target, X } from "lucide-react";
import type { DashboardProps, StatCardProps, WorkflowStepProps, StatusPillProps } from "./dashboard.types";
import type { ResearchStatus } from "../../types";
import "./dashboard.css";
import { selectResearchJobs } from "./researchList";
import type { DateFilter, ResearchSort, SourceFilter, StatusFilter } from "./researchList";
import { ResearchActions } from "../research-history/ResearchActions";

const stages = [
  "Planning research questions",
  "Searching public sources",
  "Extracting evidence",
  "Verifying claims",
  "Comparing options",
  "Quality checks",
  "Generating report",
];

function statusLabel(status: ResearchStatus) {
  return ({ completed: "Completed", partial: "Limited coverage", needs_clarification: "Clarification needed", running: "In progress", queued: "Queued", failed: "Interrupted" })[status];
}

function StatusPill({ status }: StatusPillProps) {
  return <span className={`status-pill status-${status}`}><span className="status-dot" />{statusLabel(status)}</span>;
}

export function Dashboard({ jobs, loading, activeJob, query, onQueryChange, onNew, onOpenJob, onViewReport, onRetry, onRenameJob, onDeleteJob }: DashboardProps) {
  const [tab, setTab] = useState<"research" | "workflow">("research");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sort, setSort] = useState<ResearchSort>("updated-desc");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredJobs = selectResearchJobs(jobs, { query, status: statusFilter, date: dateFilter, sources: sourceFilter, sort });
  const hasFilters = Boolean(normalizedQuery) || statusFilter !== "all" || dateFilter !== "all" || sourceFilter !== "all";
  const activeControlCount = [statusFilter !== "all", dateFilter !== "all", sourceFilter !== "all", sort !== "updated-desc"].filter(Boolean).length;
  const resetFilters = () => { onQueryChange(""); setStatusFilter("all"); setDateFilter("all"); setSourceFilter("all"); setSort("updated-desc"); };
  const completed = jobs.filter((job) => job.status === "completed").length;
  const inProgress = jobs.filter((job) => job.status === "running" || job.status === "queued").length;
  const sources = jobs.reduce((sum, job) => sum + job.sourceCount, 0);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Research overview</h1>
        <div className="dashboard-header-actions">
          <button className="dashboard-disclosure" aria-expanded={summaryOpen} aria-controls="dashboard-summary" onClick={() => setSummaryOpen((value) => !value)}><Activity size={14} />{summaryOpen ? "Hide summary" : "Show summary"}<ChevronDown size={13} /></button>
          <button className="primary-button" onClick={onNew}><Plus size={15} /> New research</button>
        </div>
      </header>

      <div className="dashboard-toolbar">
        <div className="dashboard-tabs" role="tablist" aria-label="Overview sections">
          {(["research", "workflow"] as const).map((value) => <button key={value} id={`dashboard-tab-${value}`} role="tab" aria-selected={tab === value} aria-controls={`dashboard-panel-${value}`} tabIndex={tab === value ? 0 : -1} onClick={() => setTab(value)} onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === "Home" ? "research" : event.key === "End" ? "workflow" : value === "research" ? "workflow" : "research";
            setTab(next);
            event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`#dashboard-tab-${next}`)?.focus();
          }}>{value === "research" ? <FileText size={15} /> : <Activity size={15} />}{value === "research" ? "Research" : "Workflow"}{value === "workflow" && inProgress > 0 && <span className="dashboard-tab-count">{inProgress}</span>}</button>)}
        </div>
        {tab === "research" && <label className="search-field dashboard-search"><Search size={15} /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search projects by title or question" aria-label="Search research" />{query && <button className="icon-button" aria-label="Clear research search" onClick={() => onQueryChange("")}><X size={13} /></button>}</label>}
      </div>

      <section className="stats-grid" id="dashboard-summary" aria-label="Workspace summary" hidden={!summaryOpen}>
        <StatCard icon={<FlaskConical size={15} />} label="Research runs" value={String(jobs.length)} detail="All projects" />
        <StatCard icon={<CheckCircle2 size={15} />} label="Completed" value={String(completed)} detail="Ready to review" />
        <StatCard icon={<Activity size={15} />} label="In progress" value={String(inProgress)} detail="Active or queued" />
        <StatCard icon={<Link2 size={15} />} label="Sources" value={String(sources)} detail="Collected across projects" />
      </section>

      <section className="section-block dashboard-panel" id="dashboard-panel-research" role="tabpanel" aria-labelledby="dashboard-tab-research" hidden={tab !== "research"} tabIndex={0}>
        <div className="section-heading research-results-heading">
          <span className="dashboard-result-count" role="status">{loading ? "Loading projects…" : `${filteredJobs.length} of ${jobs.length} projects`}{hasFilters && " · filtered"}</span>
          <div className="research-control-actions">
            {(hasFilters || sort !== "updated-desc") && <button className="text-button" onClick={resetFilters}><X size={12} /> Reset</button>}
            <button className="dashboard-disclosure" aria-expanded={filtersOpen} aria-controls="dashboard-filters" onClick={() => setFiltersOpen((value) => !value)}><Filter size={13} /> Filters &amp; sort {activeControlCount > 0 && <span className="dashboard-tab-count">{activeControlCount}</span>}<ChevronDown size={13} /></button>
          </div>
        </div>
        <div className="research-list-controls" id="dashboard-filters" hidden={!filtersOpen}>
          <label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}><option value="all">All statuses</option><option value="active">Active (running or queued)</option><option value="completed">Completed</option><option value="partial">Limited coverage</option><option value="needs_clarification">Clarification needed</option><option value="running">In progress</option><option value="queued">Queued</option><option value="failed">Interrupted</option></select></label>
          <label>Updated<select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as DateFilter)}><option value="all">Any time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label>
          <label>Sources<select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as SourceFilter)}><option value="all">All projects</option><option value="with">With sources</option><option value="without">Without sources</option></select></label>
          <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value as ResearchSort)}><option value="updated-desc">Recently updated</option><option value="updated-asc">Oldest updated</option><option value="title-asc">Title A–Z</option><option value="title-desc">Title Z–A</option><option value="sources-desc">Most sources</option><option value="sources-asc">Fewest sources</option></select></label>
        </div>
        <div className="research-table-wrap surface-card" role="region" aria-label="Research results" tabIndex={0}>
          <table className="research-table">
            <thead><tr><th>RESEARCH</th><th>STATUS</th><th>SOURCES</th><th>LAST UPDATED</th><th>ACTIONS</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={5}><div className="table-loading"><LoaderCircle size={17} className="spin" /> Loading research…</div></td></tr>}
              {!loading && filteredJobs.map((job) => (
                <tr key={job.id} onClick={() => onOpenJob(job)} className="clickable-row">
                  <td><div className="table-title"><div className="table-file-icon"><FileText size={16} /></div><div><strong>{job.title}</strong><span>{job.question}</span></div></div></td>
                  <td><StatusPill status={job.status} /></td>
                  <td><span className="source-count"><Link2 size={14} /> {job.sourceCount}</span></td>
                  <td><span className="muted-cell"><Clock3 size={14} /> {job.updatedAt}</span></td>
                  <td><div className="research-row-actions"><ResearchActions job={job} onRenameJob={onRenameJob} onDeleteJob={onDeleteJob} /><button className="row-action" aria-label={`Open ${job.title}`} onClick={(event) => { event.stopPropagation(); onOpenJob(job); }}><ArrowUpRight size={17} /></button></div></td>
                </tr>
              ))}
              {!loading && !filteredJobs.length && <tr><td colSpan={5}><div className="empty-table"><BookOpen size={23} /><strong>{hasFilters ? "No matching research" : "No research yet"}</strong><span>{hasFilters ? "Try a different search or reset the filters." : "Create a research request to get started."}</span>{hasFilters ? <button className="text-button" onClick={resetFilters}>Reset filters</button> : <button className="text-button" onClick={onNew}>Start your first research <ArrowRight size={15} /></button>}</div></td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-panel dashboard-workflow-panel" id="dashboard-panel-workflow" role="tabpanel" aria-labelledby="dashboard-tab-workflow" hidden={tab !== "workflow"} tabIndex={0}>
      <div className="section-heading"><div><h2>Research workflow</h2><p>Follow active runs and review how research is organized.</p></div></div>
      {(activeJob?.status === "running" || activeJob?.status === "queued") && (
        <section className="progress-card surface-card">
          <div className="section-heading compact"><div><h2>{activeJob.status === "queued" ? "Research queued" : "Research in progress"}</h2><p>{activeJob.currentStage}</p></div><span className="mini-badge"><LoaderCircle size={13} className="spin" /> {activeJob.progress}% complete</span></div>
          <div className="progress-bar"><span style={{ width: `${activeJob.progress}%` }} /></div>
          <div className="progress-steps">{stages.map((stage, index) => <div key={stage} className={`progress-step ${index < Math.round((activeJob.progress / 100) * stages.length) ? "complete" : ""} ${stage === activeJob.currentStage ? "current" : ""}`}><span>{index < Math.round((activeJob.progress / 100) * stages.length) ? <Check size={11} /> : index + 1}</span><small>{stage}</small></div>)}</div>
        </section>
      )}

      <section className="bottom-grid">
        <div className="workflow-card surface-card">
          <div className="section-heading compact"><div><h2>How research works</h2><p>Plan, search the web, and build a report with cited source excerpts.</p></div><span className="mini-badge"><ShieldCheck size={13} /> Web research</span></div>
          <div className="workflow-steps">
            <WorkflowStep number="01" icon={<Target size={16} />} title="Plan" detail="Break down your question" />
            <ArrowRight className="workflow-arrow" size={15} />
            <WorkflowStep number="02" icon={<Globe2 size={16} />} title="Research" detail="Retrieve source content" />
            <ArrowRight className="workflow-arrow" size={15} />
            <WorkflowStep number="03" icon={<ShieldCheck size={16} />} title="Verify" detail="Check claims and sources" />
            <ArrowRight className="workflow-arrow" size={15} />
            <WorkflowStep number="04" icon={<FileText size={16} />} title="Decide" detail="Build your report" />
          </div>
        </div>
        <div className="continue-card surface-card">
          <div className="continue-icon"><Clock3 size={18} /></div><div className="continue-content"><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h3>{activeJob?.title ?? "Your next decision starts here"}</h3><p>{activeJob ? `${activeJob.sourceCount} sources · ${statusLabel(activeJob.status)}` : "Start a research run using your configured model and web search."}</p></div>
          {activeJob?.status === "completed" ? <button className="icon-button bordered" aria-label="Open latest report" onClick={onViewReport}><ArrowRight size={17} /></button> : <button className="icon-button bordered" aria-label="Continue research" onClick={onRetry}><ArrowRight size={17} /></button>}
        </div>
      </section>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, detail }: StatCardProps) {
  return <div className="stat-card surface-card"><div className="stat-top"><span className="stat-icon">{icon}</span><span>{label}</span></div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></div>;
}

function WorkflowStep({ number, icon, title, detail }: WorkflowStepProps) {
  return <div className="workflow-step"><span className="workflow-number">{number}</span><span className="workflow-icon">{icon}</span><strong>{title}</strong><small>{detail}</small></div>;
}
