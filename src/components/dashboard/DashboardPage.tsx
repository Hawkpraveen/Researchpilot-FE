import { Activity, ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, Clock3, FileText, FlaskConical, Globe2, Link2, LoaderCircle, Plus, Search, ShieldCheck, Sparkles, Target } from "lucide-react";
import type { DashboardProps, StatCardProps, WorkflowStepProps, StatusPillProps } from "./dashboard.types";
import type { ResearchStatus } from "../../types";

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
  return ({ completed: "Completed", running: "In progress", queued: "Queued", failed: "Interrupted" })[status];
}

function StatusPill({ status }: StatusPillProps) {
  return <span className={`status-pill status-${status}`}><span className="status-dot" />{statusLabel(status)}</span>;
}

export function Dashboard({ jobs, loading, activeJob, query, onQueryChange, onNew, onOpenJob, onViewReport, onRetry }: DashboardProps) {
  const completed = jobs.filter((job) => job.status === "completed").length;
  const inProgress = jobs.filter((job) => job.status === "running" || job.status === "queued").length;
  const sources = jobs.reduce((sum, job) => sum + job.sourceCount, 0);

  return (
    <>
      <section className="welcome-row">
        <div><div className="eyebrow"><Sparkles size={14} /> BOUNDED RESEARCH PLANNING</div><h1>Turn complex questions<br className="desktop-break" /> into clear decisions.</h1><p>ResearchPilot turns your question into a bounded plan. Source collection and verification are still in progress, so current runs do not yet produce evidence-backed findings.</p></div>
        <div className="welcome-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-core"><Sparkles size={30} /></div><div className="art-node node-one"><Globe2 size={17} /></div><div className="art-node node-two"><ShieldCheck size={17} /></div><div className="art-node node-three"><FileText size={17} /></div></div>
      </section>

      <section className="quick-start-card surface-card">
        <div className="quick-icon"><Search size={20} /></div>
        <div className="quick-copy"><strong>What do you need to make a decision about?</strong><span>Compare products, research a technical question, or evaluate a business opportunity.</span></div>
        <button className="primary-button" onClick={onNew}><Plus size={16} /> Start research <ArrowRight size={16} /></button>
      </section>

      <section className="stats-grid">
        <StatCard icon={<FlaskConical size={17} />} label="Research runs" value={String(jobs.length).padStart(2, "0")} detail="All your investigations" />
        <StatCard icon={<CheckCircle2 size={17} />} label="Runs complete" value={String(completed).padStart(2, "0")} detail="Plans or reports ready" />
        <StatCard icon={<Activity size={17} />} label="In progress" value={String(inProgress).padStart(2, "0")} detail="Active or queued" />
        <StatCard icon={<Link2 size={17} />} label="Sources collected" value={String(sources).padStart(2, "0")} detail="Demo examples or reviewed sources" />
      </section>

      <section className="section-block">
        <div className="section-heading"><div><h2>Recent research</h2><p>Pick up where you left off.</p></div><div className="table-tools"><label className="search-field"><Search size={14} /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search research" aria-label="Search research" /></label><button className="text-button" onClick={onNew}>New research <ArrowRight size={15} /></button></div></div>
        <div className="research-table-wrap surface-card">
          <table className="research-table">
            <thead><tr><th>RESEARCH</th><th>STATUS</th><th>SOURCES</th><th>LAST UPDATED</th><th /></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={5}><div className="table-loading"><LoaderCircle size={17} className="spin" /> Loading research…</div></td></tr>}
              {!loading && jobs.map((job) => (
                <tr key={job.id} onClick={() => onOpenJob(job)} className="clickable-row">
                  <td><div className="table-title"><div className="table-file-icon"><FileText size={16} /></div><div><strong>{job.title}</strong><span>{job.question}</span></div></div></td>
                  <td><StatusPill status={job.status} /></td>
                  <td><span className="source-count"><Link2 size={14} /> {job.sourceCount}</span></td>
                  <td><span className="muted-cell"><Clock3 size={14} /> {job.updatedAt}</span></td>
                  <td><button className="row-action" aria-label={`Open ${job.title}`} onClick={(event) => { event.stopPropagation(); onOpenJob(job); }}><ArrowUpRight size={17} /></button></td>
                </tr>
              ))}
              {!loading && !jobs.length && <tr><td colSpan={5}><div className="empty-table"><BookOpen size={23} /><strong>{query ? "No matching research" : "No research yet"}</strong><span>{query ? "Try a different search term." : "Create a research request to get started."}</span>{!query && <button className="text-button" onClick={onNew}>Start your first research <ArrowRight size={15} /></button>}</div></td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {(activeJob?.status === "running" || activeJob?.status === "queued") && (
        <section className="progress-card surface-card">
          <div className="section-heading compact"><div><h2>{activeJob.status === "queued" ? "Research queued" : "Research in progress"}</h2><p>{activeJob.currentStage}</p></div><span className="mini-badge"><LoaderCircle size={13} className="spin" /> {activeJob.progress}% complete</span></div>
          <div className="progress-bar"><span style={{ width: `${activeJob.progress}%` }} /></div>
          <div className="progress-steps">{stages.map((stage, index) => <div key={stage} className={`progress-step ${index < Math.round((activeJob.progress / 100) * stages.length) ? "complete" : ""} ${stage === activeJob.currentStage ? "current" : ""}`}><span>{index < Math.round((activeJob.progress / 100) * stages.length) ? <Check size={11} /> : index + 1}</span><small>{stage}</small></div>)}</div>
        </section>
      )}

      <section className="bottom-grid">
        <div className="workflow-card surface-card">
          <div className="section-heading compact"><div><h2>Workflow status</h2><p>Planning works now; search and evidence checks are still being built.</p></div><span className="mini-badge"><ShieldCheck size={13} /> Plan only</span></div>
          <div className="workflow-steps">
            <WorkflowStep number="01" icon={<Target size={16} />} title="Plan" detail="Break down your question" />
            <ArrowRight className="workflow-arrow" size={15} />
            <WorkflowStep number="02" icon={<Globe2 size={16} />} title="Research" detail="Not run yet" />
            <ArrowRight className="workflow-arrow" size={15} />
            <WorkflowStep number="03" icon={<ShieldCheck size={16} />} title="Verify" detail="Not run yet" />
            <ArrowRight className="workflow-arrow" size={15} />
            <WorkflowStep number="04" icon={<FileText size={16} />} title="Decide" detail="Build your report" />
          </div>
        </div>
        <div className="continue-card surface-card">
          <div className="continue-icon"><Clock3 size={18} /></div><div className="continue-content"><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h3>{activeJob?.title ?? "Your next decision starts here"}</h3><p>{activeJob ? `${activeJob.sourceCount} sources · ${statusLabel(activeJob.status)}` : "Start a bounded research plan. Evidence-backed reports are not available yet."}</p></div>
          {activeJob?.status === "completed" ? <button className="icon-button bordered" aria-label="Open latest report" onClick={onViewReport}><ArrowRight size={17} /></button> : <button className="icon-button bordered" aria-label="Continue research" onClick={onRetry}><ArrowRight size={17} /></button>}
        </div>
      </section>
      <footer className="page-footer"><span>ResearchPilot <span className="footer-dot">·</span> Built for better decisions</span><span><ShieldCheck size={13} /> Evidence over assumptions</span></footer>
    </>
  );
}

function StatCard({ icon, label, value, detail }: StatCardProps) {
  return <div className="stat-card surface-card"><div className="stat-top"><span className="stat-icon">{icon}</span><span>{label}</span></div><div className="stat-value">{value}</div><div className="stat-detail">{detail}</div></div>;
}

function WorkflowStep({ number, icon, title, detail }: WorkflowStepProps) {
  return <div className="workflow-step"><span className="workflow-number">{number}</span><span className="workflow-icon">{icon}</span><strong>{title}</strong><small>{detail}</small></div>;
}
