import "./research-report.styles.css";
import { useRef } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, Clock3, Filter, Globe2, Link2, Plus, ShieldCheck, Target } from "lucide-react";
import type { ResearchReportProps, ResearchReportTab } from "./research-report.types";
import { CitedText } from "./CitedText";
import { ResearchActions } from "../research-history/ResearchActions";

function formatSourceDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function EvidenceGaps({ items }: { items: string[] }) {
  const gaps = items.filter((item) => item.startsWith("Incomplete evidence for "));
  const notes = items.filter((item) => !item.startsWith("Incomplete evidence for "));
  return <section className="report-card uncertainty-card evidence-uncertainty surface-card">
    <div className="report-card-heading"><span className="report-card-icon warning-icon"><AlertCircle size={17} /></span><div><h2>Evidence gaps</h2><p>{items.length ? "What still needs verification before you act" : "No unresolved questions were recorded for this run"}</p></div><span className="gap-count">{items.length} open</span></div>
    {gaps.length > 0 && <div className="gap-topics">{gaps.map((item) => <div key={item}><span className="gap-status-dot" /><strong>{item.replace("Incomplete evidence for ", "").replace(/\.$/, "")}</strong><span>Needs evidence</span></div>)}</div>}
    {notes.length > 0 && <details className="research-limitations"><summary>Research limitations <span>{notes.length}</span></summary><ul className="uncertainty-list">{notes.map((item) => <li key={item}>{item}</li>)}</ul></details>}
  </section>;
}

export function ReportView({ job, activeTab, onTabChange, onBack, onNew, onRetry, onClarify, onRenameJob, onDeleteJob, busy = false }: ResearchReportProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const changeTab = (tab: ResearchReportTab) => {
    onTabChange(tab);
    contentRef.current?.scrollTo({ top: 0 });
  };
  const report = job.report;
  const researchWasRun = report?.researchStatus === "completed" || report?.researchStatus === "partial";
  const limitedReport = Boolean(report && (report.researchStatus === "partial" || report.sources.length < 2 || report.uncertainties.some((item) => item.startsWith("Omitted ")) || report.summary.includes("not a synthesized answer")));
  const hasRecommendation = Boolean(report && !report.recommendation.includes("no model recommendation passed"));
  const hasComparison = Boolean(report?.comparison.some((row) => Object.values(row.values).some((value) => !value.startsWith("Unknown:"))));
  const isActive = job.status === "running" || job.status === "queued";
  const vendors = report?.comparison[0] ? Object.keys(report.comparison[0].values) : [];
  if (report?.researchStatus === "needs_clarification") return <div className="report-page subject-clarification">
    <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to overview</button>
    <ResearchActions job={job} onRenameJob={onRenameJob} onDeleteJob={onDeleteJob} />
    <section className="report-card surface-card">
      <span className="eyebrow">CLARIFICATION NEEDED</span><h1>Which subject did you mean?</h1>
      <p className="subject-original-question">{job.question}</p>
      <p>We searched for the subject, but the available evidence does not establish one clear meaning. Choose a result or add a short detail to continue.</p>
      <p>{report.resolution?.explanation}</p>
      <div className="subject-candidates">{report.resolution?.candidates.map((candidate, candidateIndex) => <article key={candidate.label} className="subject-candidate">
        <h2>{candidate.label}</h2><p>{candidate.description}</p>
        <div>{candidate.sourceIds.map((id) => { const source = report.sources.find((item) => item.id === id); return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.title} <ArrowUpRight size={13} /></a> : null; })}</div>
        <button className="secondary-button" disabled={busy} onClick={() => onClarify({ candidateIndex })}>{busy ? "Continuing…" : "Continue with this subject"} <ArrowRight size={14} /></button>
      </article>)}</div>
      <form className="subject-context-form" onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get("context"); if (typeof value === "string" && value.trim()) onClarify({ context: value.trim() }); }}>
        <label htmlFor="subject-context">Something else? Add a website, field, or short description.</label>
        <input disabled={busy} id="subject-context" name="context" required minLength={3} maxLength={500} placeholder="For example: the company that builds enterprise AI tools" />
        <button className="primary-button" type="submit" disabled={busy}>{busy ? "Continuing…" : "Continue research"} <ArrowRight size={15} /></button>
      </form>
    </section>
  </div>;
  return (
    <div className="report-page report-shell">
      <header className="report-fixed-header">
      <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> Back to overview</button>
      <ResearchActions job={job} onRenameJob={onRenameJob} onDeleteJob={onDeleteJob} />
      <div className="report-title-row"><div><div className={`report-status ${limitedReport ? "is-limited" : ""}`}>{job.status === "failed" ? <AlertCircle size={14} /> : <Clock3 size={14} />} {job.status === "failed" ? "Research interrupted" : job.status === "queued" ? "Research queued" : job.status === "running" ? "Research in progress" : researchWasRun ? limitedReport ? "Limited coverage" : "Research complete" : "Plan complete"}</div><h1>{job.title}</h1>{job.question.trim() !== job.title.trim() && <p>{job.question}</p>}</div><div className="report-header-actions">{!isActive && <button className="secondary-button" disabled={busy} onClick={onRetry}><ArrowRight size={15} /> {busy ? "Restarting…" : "Research again"}</button>}<button className="primary-button" onClick={onNew}><Plus size={15} /> New research</button></div></div>
      <div className="report-meta"><span><Clock3 size={14} /> Updated {job.updatedAt}</span><span><Link2 size={14} /> {job.sourceCount} sources {researchWasRun ? "reviewed" : "collected"}</span><span><ShieldCheck size={14} /> {researchWasRun ? "Source-linked report" : "Planning only · no findings verified"}</span></div>
      <div className="report-tabs" aria-label="Report sections">
        <button aria-pressed={activeTab === "overview"} className={`report-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => changeTab("overview")}><BookOpen size={15} /> Overview</button>
        <button aria-pressed={activeTab === "evidence"} className={`report-tab ${activeTab === "evidence" ? "active" : ""}`} onClick={() => changeTab("evidence")}><Link2 size={15} /> Sources <span>{report?.sources.length ?? 0}</span></button>
        <button aria-pressed={activeTab === "gaps"} className={`report-tab ${activeTab === "gaps" ? "active" : ""}`} onClick={() => changeTab("gaps")}><AlertCircle size={15} /> Evidence gaps <span>{report?.uncertainties.length ?? 0}</span></button>
      </div>
      </header>
      <div ref={contentRef} className="report-scroll-content" role="region" aria-label="Report content" tabIndex={0}>
      {activeTab === "overview" && report?.resolution?.status === "resolved" && <details className="report-subject"><summary><Target size={15} /><span>Research subject <strong>{report.resolution.subject}</strong></span></summary><p>{report.resolution.explanation}</p></details>}
      {!report && <div className="empty-state" role="status">{job.status === "failed" ? <AlertCircle size={28} /> : <Clock3 size={28} />}<h2>{job.status === "failed" ? "Research was interrupted" : job.status === "queued" ? "Research is queued" : job.status === "completed" ? "Report unavailable" : "Research is in progress"}</h2><p>{job.status === "failed" ? job.error?.message || "This run stopped before a report was generated. You can review the question and start again." : isActive ? job.currentStage || "The report will appear when the research finishes." : "No report was returned for this run. You can start another run with the same question."}</p>{isActive && <><div className="progress-bar" aria-label="Research progress"><span style={{ width: `${job.progress}%` }} /></div><p>{job.progress}% complete</p></>}</div>}
      {report && activeTab === "overview" && (
        <div className="report-layout">
          <div className="report-main-column">
            {limitedReport && <section className="report-coverage-note" role="status"><AlertCircle size={19} /><div><strong>This report has limited coverage</strong><p>Some findings are missing or supported by few sources. Review the evidence gaps before making a decision.</p></div><button onClick={() => changeTab("gaps")}>Review gaps <ArrowRight size={14} /></button></section>}
            <section className="report-card summary-card surface-card"><div className="report-card-heading"><span className="report-card-icon"><BookOpen size={17} /></span><div><h2>{researchWasRun ? "Research findings" : "Research status"}</h2><p>{researchWasRun ? "The key findings from this research" : "This run prepared a plan only"}</p></div><span className={`quality-label ${limitedReport ? "quality-limited" : ""}`}>{limitedReport ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />} {researchWasRun ? limitedReport ? "Limited coverage" : "Report ready" : "Plan ready"}</span></div><p className="summary-text"><CitedText text={report.summary} sources={report.sources} /></p></section>
            {researchWasRun ? <section className="recommendation-card surface-card"><div className="recommendation-heading"><span className="recommendation-icon"><Target size={18} /></span><div><span className="eyebrow">NEXT STEP</span><h2>{hasRecommendation ? "Recommended next step" : "Recommendation unavailable"}</h2></div></div><p><CitedText text={report.recommendation} sources={report.sources} /></p><div className="recommendation-foot"><ShieldCheck size={14} /> Review the supporting sources before acting</div></section> : <section className="report-card surface-card"><div className="report-card-heading"><span className="report-card-icon"><AlertCircle size={17} /></span><div><h2>No findings or recommendation yet</h2><p>The Agent planned this run, but it did not search or verify sources.</p></div></div><p className="summary-text">Treat the comparison below as unresearched placeholders, not decision guidance.</p></section>}
            {hasComparison && <section className="report-card surface-card"><div className="report-card-heading"><span className="report-card-icon"><Filter size={17} /></span><div><h2>Side-by-side comparison</h2><p>Criteria selected for this research</p></div></div><div className="comparison-wrap"><table className="comparison-table"><thead><tr><th>CRITERION</th>{vendors.map((vendor) => <th key={vendor}>{vendor}</th>)}</tr></thead><tbody>{report.comparison.map((row) => <tr key={row.criterion}><td><strong>{row.criterion}</strong></td>{vendors.map((vendor) => <td key={vendor}><CitedText text={row.values[vendor] ?? "Unknown"} sources={report.sources} /></td>)}</tr>)}</tbody></table></div></section>}
            {report.alternatives.length > 0 && <section className="report-card surface-card"><div className="report-card-heading"><span className="report-card-icon"><ArrowRight size={17} /></span><div><h2>Alternatives to consider</h2><p>Trade-offs that could change the decision</p></div></div><ul className="alternatives-list">{report.alternatives.map((alternative) => <li key={alternative}><span><ArrowUpRight size={15} /></span>{alternative}</li>)}</ul></section>}
          </div>

        </div>
      )}
      {report && activeTab === "evidence" && (
        <div className="evidence-page">
          <div className="evidence-intro"><div><h2>Sources</h2><p>{researchWasRun ? "Review the original material behind the findings." : "This run was planning-only. It did not visit web pages or collect sources."}</p></div><span className="mini-badge"><Link2 size={13} /> {report.sources.length} sources</span></div>
          <div className="report-evidence-summary"><ShieldCheck size={16} /><span>{researchWasRun ? "Claims include source records. Source links do not independently confirm accuracy." : "Search was not run. No claims were verified."}</span><button onClick={() => changeTab("gaps")}>{report.uncertainties.length} open questions <ArrowRight size={14} /></button></div>
          <div className="source-list">
          {report.sources.map((source) => <article className="source-card surface-card" key={source.id}>
            <div className="source-card-top"><span className="source-reference">{source.id}</span><span className="source-domain"><Globe2 size={14} />{source.domain.replace(/^www\./, "")}</span><span className={`reliability reliability-${source.reliability}`}>{source.reliability === "low" ? "Reliability unassessed" : `${source.reliability} reliability`}</span></div>
            <div className="source-content"><h3><a href={source.url} target="_blank" rel="noreferrer">{source.title}<ArrowUpRight size={16} /></a></h3><p>{source.snippet || "No excerpt is available. Open the source to review the original material."}</p><div className="source-card-footer"><span><Clock3 size={13} /> Accessed <time dateTime={source.accessedAt} title={source.accessedAt}>{formatSourceDate(source.accessedAt)}</time></span><a href={source.url} target="_blank" rel="noreferrer">Open source <ArrowUpRight size={14} /></a></div></div>
          </article>)}
          {researchWasRun && report.sources.length === 0 && <section className="report-card surface-card"><h2>No sources available</h2><p>This report has no source records to inspect.</p></section>}
          </div>
          {!researchWasRun && <section className="report-card uncertainty-card surface-card"><div className="report-card-heading"><span className="report-card-icon warning-icon"><AlertCircle size={17} /></span><div><h2>No sources collected</h2><p>Source collection and evidence verification are not connected yet.</p></div></div></section>}

        </div>
      )}
      {report && activeTab === "gaps" && <div className="report-gaps-page"><EvidenceGaps items={report.uncertainties} /><div className="evidence-reading-note"><ShieldCheck size={17} /><p>Review critical claims against the original sources before acting.</p></div></div>}
      <footer className="page-footer"><span>ResearchPilot <span className="footer-dot">·</span> Research report</span><span><ShieldCheck size={13} /> Review critical claims at the source</span></footer>
      </div>
    </div>
  );
}
