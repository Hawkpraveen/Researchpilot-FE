import { ChevronDown, Eye, ArrowUpRight } from "lucide-react";
import type { ResearchJob } from "../../types";

interface ProjectQuickPreviewProps {
  job: ResearchJob;
  status: string;
  onOpen: () => void;
}

export function ProjectQuickPreview({ job, status, onOpen }: ProjectQuickPreviewProps) {
  const sources = job.report?.sources ?? [];
  const inProgress = job.status === "running" || job.status === "queued";

  return <details className="project-quick-preview">
    <summary aria-label={`Quick preview: ${job.title}`}><Eye size={13} /><span>Quick preview</span><ChevronDown size={12} className="preview-chevron" /></summary>
    <div className="project-preview-body">
      <div className="preview-heading"><span>PROJECT PREVIEW</span><span>{status}</span></div>
      <h3>{job.title}</h3>
      <dl className="preview-metadata">
        <div><dt>Created</dt><dd>{job.createdAt}</dd></div>
        <div><dt>Updated</dt><dd>{job.updatedAt}</dd></div>
        <div><dt>Sources</dt><dd>{job.sourceCount}</dd></div>
      </dl>
      <h4>Research question</h4>
      <p>{job.question || job.request?.goal || job.title}</p>
      {inProgress && <div className="preview-progress"><h4>Progress</h4><p>{job.currentStage || status}</p><progress aria-label="Research progress" max={100} value={Math.min(100, Math.max(0, job.progress))} /></div>}
      {job.error && <div className="preview-error"><h4>What happened</h4><p>{job.error.message}</p></div>}
      <h4>Findings</h4>
      <p>{job.report?.summary || (inProgress ? "Findings will appear as research completes." : "No findings are available in this preview yet.")}</p>
      <h4>Sources collected</h4>
      {sources.length > 0 ? <>
        <ul className="preview-sources">{sources.slice(0, 3).map((source) => <li key={source.id}><strong>{source.title}</strong><span>{source.domain}</span></li>)}</ul>
        {sources.length > 3 && <p className="preview-source-count">+{sources.length - 3} more in the full project</p>}
      </> : <p>{job.sourceCount > 0 ? "Source details are not included in this preview." : "No sources collected yet."}</p>}
      <button type="button" className="preview-open-button" onClick={onOpen}>Open full project <ArrowUpRight size={14} /></button>
    </div>
  </details>;
}
