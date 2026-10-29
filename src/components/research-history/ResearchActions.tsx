import "./research-history.styles.css";
import { useEffect, useId, useRef, useState } from "react";
import { LoaderCircle, Pencil, Trash2, X } from "lucide-react";
import type { ResearchJob } from "../../types";

export interface ResearchActionsProps {
  job: ResearchJob;
  onRenameJob: (job: ResearchJob, title: string) => Promise<void>;
  onDeleteJob: (job: ResearchJob) => Promise<void>;
}

export function ResearchActions({ job, onRenameJob, onDeleteJob }: ResearchActionsProps) {
  const [mode, setMode] = useState<"rename" | "delete" | null>(null);
  const active = job.status === "running" || job.status === "queued";
  return <div className="research-actions" onClick={(event) => event.stopPropagation()}>
    <button type="button" className="icon-button" aria-label={`Rename ${job.title}`} title="Rename report" onClick={() => setMode("rename")}><Pencil size={15} /></button>
    <button type="button" className="icon-button research-delete-action" aria-label={`Delete ${job.title}`} title={active ? "Wait for research to finish before deleting" : "Delete report"} disabled={active} onClick={() => setMode("delete")}><Trash2 size={15} /></button>
    {mode && <ResearchManagementDialog job={job} mode={mode} onRenameJob={onRenameJob} onDeleteJob={onDeleteJob} onClose={() => setMode(null)} />}
  </div>;
}

function ResearchManagementDialog({ job, mode, onRenameJob, onDeleteJob, onClose }: ResearchActionsProps & { mode: "rename" | "delete"; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [title, setTitle] = useState(job.title);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "rename") await onRenameJob(job, title.trim());
      else await onDeleteJob(job);
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not save this change. Please try again.");
      setBusy(false);
    }
  };
  return <dialog ref={dialogRef} className="research-management-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <button className="icon-button research-dialog-close" aria-label="Close dialog" disabled={busy} onClick={onClose}><X size={17} /></button>
    <h2 id={`${id}-title`}>{mode === "rename" ? "Rename report" : "Delete report?"}</h2>
    <p id={`${id}-description`}>{mode === "rename" ? "Give this research a clear title. The original question and findings are preserved." : <>Remove <strong>{job.title}</strong> and its report from your workspace?</>}</p>
    <form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      {mode === "rename" && <label htmlFor={`${id}-name`}>Report title<input id={`${id}-name`} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required autoFocus disabled={busy} /></label>}
      {error && <p className="research-action-error" role="alert">{error}</p>}
      <div className="research-dialog-buttons"><button type="button" className="secondary-button" onClick={onClose} disabled={busy}>Cancel</button><button type="submit" className={mode === "delete" ? "research-confirm-delete" : "primary-button"} disabled={busy || mode === "rename" && !title.trim()}>{busy && <LoaderCircle size={14} className="spin" />}{busy ? "Saving…" : mode === "rename" ? "Save title" : "Delete report"}</button></div>
    </form>
  </dialog>;
}
