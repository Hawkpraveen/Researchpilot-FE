import { useLocation, useNavigate } from "react-router-dom";
import { Building2, Check, ChevronDown, FileText, LayoutDashboard, Pencil, Plus, Settings2, Sparkles, Trash2, X, Zap } from "lucide-react";
import type { WorkspaceSidebarProps } from "./workspace.types";
import { WorkspaceDialog } from "./WorkspaceDialog";
import { useWorkspaceManager } from "./useWorkspaceManager";

const RESEARCH_DEMO_MODE = (
  (import.meta.env.VITE_RESEARCH_DEMO_MODE as string | undefined)
  ?? (import.meta.env.VITE_DEMO_MODE as string | undefined)
) !== "false";

export function WorkspaceSidebar({ session, jobs, activeJob, loading, open, onClose, onOpenJob, onStartNew }: WorkspaceSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    workspaces, activeWorkspace, setActiveWorkspace, menuOpen, setMenuOpen, dialog, name, setName,
    error, setError, menuRef, openDialog, save, remove, closeDialog,
  } = useWorkspaceManager();
  const isNewResearch = location.pathname.endsWith("/research/new");
  const isReport = /^\/workspace\/research\/[^/]+$/.test(location.pathname) && !isNewResearch;
  const isSettings = location.pathname.endsWith("/settings");
  const userInitials = session.user.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  const navigateTo = (path: string) => {
    onClose();
    navigate(path);
  };

  return <>
    {open && <button className="mobile-scrim" aria-label="Close navigation" onClick={onClose} />}
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand-row">
        <div className="brand-mark"><Sparkles size={19} strokeWidth={2.4} /></div>
        <div className="brand-copy"><span>ResearchPilot</span><small>Research workspace</small></div>
        <button className="icon-button sidebar-close" aria-label="Close menu" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="workspace-menu-wrap" ref={menuRef}>
        <button className={`workspace-switcher ${menuOpen ? "menu-open" : ""}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
          <div className="workspace-avatar"><Building2 size={15} /></div>
          <span><strong>{activeWorkspace}</strong><small>{workspaces.length} {workspaces.length === 1 ? "workspace" : "workspaces"}</small></span>
          <ChevronDown size={15} />
        </button>
        {menuOpen && <div className="workspace-menu" role="menu" aria-label="Workspaces">
          <span className="menu-section-label">YOUR WORKSPACES</span>
          {workspaces.map((workspace) => <div key={workspace} className={`workspace-menu-row ${activeWorkspace === workspace ? "workspace-menu-row-active" : ""}`}>
            <button className="workspace-menu-item" role="menuitem" onClick={() => { setActiveWorkspace(workspace); setMenuOpen(false); }}>
              <span className="workspace-menu-icon"><Building2 size={15} /></span><span>{workspace}</span>{activeWorkspace === workspace && <Check size={15} />}
            </button>
            <div className="workspace-menu-actions">
              <button type="button" aria-label={`Edit ${workspace}`} title="Edit workspace" onClick={() => openDialog("edit", workspace)}><Pencil size={14} /></button>
              <button type="button" aria-label={`Delete ${workspace}`} title={workspaces.length === 1 ? "Keep at least one workspace" : "Delete workspace"} disabled={workspaces.length === 1} onClick={() => openDialog("delete", workspace)}><Trash2 size={14} /></button>
            </div>
          </div>)}
          <div className="menu-divider" />
          <button className="workspace-menu-create" role="menuitem" onClick={() => openDialog("create")}><Plus size={16} /> Create workspace</button>
        </div>}
      </div>

      <button className="new-research-button" onClick={onStartNew}><Plus size={17} /> New research <span>⌘ K</span></button>
      <div className="nav-label">WORKSPACE</div>
      <nav className="primary-nav">
        <button className={!isNewResearch && !isReport && !isSettings ? "nav-item active" : "nav-item"} onClick={() => navigateTo("/workspace")}><LayoutDashboard size={17} /> Overview</button>
        <button className={isReport ? "nav-item active" : "nav-item"} onClick={() => activeJob?.report ? onOpenJob(activeJob) : onStartNew()}><FileText size={17} /> Research reports</button>
        <button className={isSettings ? "nav-item active" : "nav-item"} onClick={() => navigateTo("/workspace/settings")}><Settings2 size={17} /> Settings</button>
      </nav>

      <div className="history-heading"><span className="nav-label">RECENT RESEARCH</span><button className="icon-button tiny" aria-label="New research" onClick={onStartNew}><Plus size={15} /></button></div>
      <div className="history-list">
        {jobs.map((job) => <button key={job.id} className={`history-item ${activeJob?.id === job.id ? "history-active" : ""}`} onClick={() => onOpenJob(job)}>
          <span className={`history-icon ${job.status}`}><FileText size={14} /></span>
          <span className="history-text"><strong>{job.title}</strong><small>{job.createdAt}</small></span>
        </button>)}
        {!jobs.length && !loading && <p className="empty-small">Your research runs will appear here.</p>}
      </div>

      <div className="sidebar-bottom">
        <div className="usage-card surface-card">
          <div className="usage-top"><span className="usage-icon"><Zap size={15} /></span><strong>Research budget</strong><span className="free-tag">FREE</span></div>
          <p>{RESEARCH_DEMO_MODE ? "Demo data · no paid requests" : "Plan only · no provider calls"}</p>
          <div className="usage-track"><span /></div>
          <small>Paid providers are never enabled automatically.</small>
        </div>
        <button className="profile-button" type="button" onClick={() => navigateTo("/workspace/settings")}>
          <div className="profile-avatar">{userInitials}</div>
          <span><strong>{session.user.name}</strong><small>{session.user.role.replace("_", " ")}</small></span>
          <ChevronDown size={15} />
        </button>
      </div>
    </aside>
    {dialog && <WorkspaceDialog dialog={dialog} error={error} name={name} onNameChange={(value) => { setName(value); setError(""); }} onClose={closeDialog} onSave={save} onDelete={remove} />}
  </>;
}
