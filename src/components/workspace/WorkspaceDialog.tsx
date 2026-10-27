import { Building2, Pencil, Plus, Trash2, X } from "lucide-react";
import type { WorkspaceDialogProps } from "./workspace.types";

export function WorkspaceDialog({ dialog, error, name, onNameChange, onClose, onSave, onDelete }: WorkspaceDialogProps) {
  return (
    <div className="workspace-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="workspace-dialog surface-card" role="dialog" aria-modal="true" aria-labelledby="workspace-dialog-title">
        <div className={`workspace-dialog-icon ${dialog.mode === "delete" ? "workspace-dialog-icon-danger" : ""}`}>
          {dialog.mode === "delete" ? <Trash2 size={20} /> : dialog.mode === "edit" ? <Pencil size={20} /> : <Building2 size={20} />}
        </div>
        <button className="workspace-dialog-close" type="button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
        {dialog.mode === "delete" ? <>
          <h2 id="workspace-dialog-title">Delete workspace?</h2>
          <p><strong>{dialog.workspace}</strong> will be removed from this demo session. This action cannot be undone.</p>
          {error && <span className="workspace-dialog-error">{error}</span>}
          <div className="workspace-dialog-actions">
            <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
            <button className="workspace-delete-confirm" type="button" onClick={onDelete}><Trash2 size={15} /> Delete workspace</button>
          </div>
        </> : <>
          <h2 id="workspace-dialog-title">{dialog.mode === "edit" ? "Rename workspace" : "Create a workspace"}</h2>
          <p>{dialog.mode === "edit" ? "Choose a new name for this workspace." : "Set up a separate space for another team or research project."}</p>
          <form onSubmit={onSave}>
            <label htmlFor="workspace-name">Workspace name</label>
            <input id="workspace-name" autoFocus value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="e.g. Product research" maxLength={50} required />
            {error && <span className="workspace-dialog-error">{error}</span>}
            <div className="workspace-dialog-actions">
              <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
              <button className="primary-button" type="submit">{dialog.mode === "edit" ? <Pencil size={15} /> : <Plus size={15} />}{dialog.mode === "edit" ? "Save changes" : "Create workspace"}</button>
            </div>
          </form>
          <small className="workspace-dialog-note">Workspaces are stored in this demo session only.</small>
        </>}
      </section>
    </div>
  );
}
