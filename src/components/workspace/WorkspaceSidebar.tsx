import "./workspace.styles.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Building2, Check, ChevronsLeft, ChevronsRight, FileText, FolderOpen, LayoutDashboard, PanelLeftClose, Pencil, Plus, Search, Settings2, Sparkles, Trash2, X, Zap } from "lucide-react";
import type { WorkspaceSidebarProps } from "./workspace.types";
import type { ResearchStatus } from "../../types";
import { WorkspaceDialog } from "./WorkspaceDialog";
import { useWorkspaceManager } from "./useWorkspaceManager";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProjectQuickPreview } from "./ProjectQuickPreview";
import { useRailTooltip } from "./useRailTooltip";

const RESEARCH_DEMO_MODE = (
  (import.meta.env.VITE_RESEARCH_DEMO_MODE as string | undefined)
  ?? (import.meta.env.VITE_DEMO_MODE as string | undefined)
) !== "false";

function statusLabel(status: ResearchStatus) {
  return ({ completed: "Completed", partial: "Limited coverage", needs_clarification: "Clarification needed", running: "In progress", queued: "Queued", failed: "Interrupted" })[status];
}

export function WorkspaceSidebar({ session, workspaceName, jobs, activeJob, loading, open, workspaceExpanded, onWorkspaceExpandedChange, onClose, onOpenJob, onStartNew }: WorkspaceSidebarProps) {
  const [projectQuery, setProjectQuery] = useState("");
  const [globalExpanded, setGlobalExpanded] = useState(false);
  const { hintProps, hideTooltip, tooltip } = useRailTooltip(globalExpanded);
  const [projectFilter, setProjectFilter] = useState<"all" | "active" | "completed">("all");
  const location = useLocation();
  const navigate = useNavigate();
  const {
    workspaces, activeWorkspace, setActiveWorkspace, menuOpen, setMenuOpen, dialog, name, setName,
    error, setError, menuRef, openDialog, save, remove, closeDialog,
  } = useWorkspaceManager(workspaceName);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);
  const isNewResearch = location.pathname.endsWith("/research/new");
  const isReport = /^\/workspace\/research\/[^/]+$/.test(location.pathname) && !isNewResearch;
  const isSettings = location.pathname.endsWith("/settings");
  const isProfile = location.pathname.endsWith("/profile");
  const visibleJobs = jobs.filter((job) => {
    const matchesQuery = `${job.title} ${job.question}`.toLowerCase().includes(projectQuery.trim().toLowerCase());
    const matchesFilter = projectFilter === "all" || (projectFilter === "active" ? ["running", "queued", "needs_clarification"].includes(job.status) : job.status === "completed");
    return matchesQuery && matchesFilter;
  });
  const displayName = [session.user.first_name, session.user.last_name].filter(Boolean).join(" ") || session.user.email;
  const userInitials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  const navigateTo = (path: string) => {
    onClose();
    navigate(path);
  };
  const startResearch = () => { onClose(); onStartNew(); };
  const openProject = (job: (typeof jobs)[number]) => { onClose(); onOpenJob(job); };

  return <>
    {open && <button className="mobile-scrim" aria-label="Close navigation" onClick={onClose} />}
    <div className={`workspace-navigation ${open ? "navigation-open" : ""} ${globalExpanded ? "global-expanded" : ""} ${workspaceExpanded ? "" : "workspace-collapsed"}`}>
    <aside className="global-rail" id="global-navigation" aria-label="Global navigation" onClick={hideTooltip}>
      <button className="brand-mark" aria-label="ResearchPilot home" {...hintProps("ResearchPilot home")} onClick={() => navigateTo("/workspace")}><Sparkles size={20} strokeWidth={2.4} /></button>
      <button className="rail-button rail-toggle" aria-label={globalExpanded ? "Collapse global sidebar" : "Expand global sidebar"} {...hintProps("Expand global sidebar")} aria-expanded={globalExpanded} aria-controls="global-navigation" onClick={() => { setGlobalExpanded((value) => !value); setMenuOpen(false); }}>{globalExpanded ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}<span className="rail-label">Collapse menu</span></button>
      <div className="workspace-menu-wrap" ref={menuRef}>
        <button className={`rail-button rail-workspace ${menuOpen ? "rail-active" : ""}`} aria-label={`Switch workspace: ${activeWorkspace}`} {...hintProps("Switch workspace")} aria-expanded={menuOpen} aria-haspopup="menu" onClick={() => setMenuOpen((value) => !value)}>
          <Building2 size={20} /><span className="rail-label">Workspaces</span>
        </button>
        {menuOpen && <div className="workspace-menu" role="menu" aria-label="Workspaces">
          <span className="menu-section-label">YOUR WORKSPACES</span>
          {workspaces.map((workspace) => <div key={workspace} className={`workspace-menu-row ${activeWorkspace === workspace ? "workspace-menu-row-active" : ""}`}>
            <button className="workspace-menu-item" role="menuitem" onClick={() => { setActiveWorkspace(workspace); onWorkspaceExpandedChange(true); setMenuOpen(false); }}>
              <span className="workspace-menu-icon"><Building2 size={15} /></span><span>{workspace}</span>{activeWorkspace === workspace && <Check size={15} />}
            </button>
            <div className="workspace-menu-actions">
              <button type="button" aria-label={`Edit ${workspace}`} title="Edit workspace settings" onClick={() => navigateTo("/workspace/settings")}><Pencil size={14} /></button>
              <button type="button" aria-label={`Delete ${workspace}`} title={workspaces.length === 1 ? "Keep at least one workspace" : "Delete workspace"} disabled={workspaces.length === 1} onClick={() => openDialog("delete", workspace)}><Trash2 size={14} /></button>
            </div>
          </div>)}
          <div className="menu-divider" />
          <button className="workspace-menu-create" role="menuitem" onClick={() => openDialog("create")}><Plus size={16} /> Create workspace</button>
        </div>}
      </div>
      <nav className="rail-links" aria-label="Main navigation">
        <button className={`rail-button ${!isNewResearch && !isReport && !isSettings && !isProfile ? "rail-active" : ""}`} aria-label="Overview" {...hintProps("Overview")} aria-current={!isNewResearch && !isReport && !isSettings && !isProfile ? "page" : undefined} onClick={() => navigateTo("/workspace")}><LayoutDashboard size={20} /><span className="rail-label">Overview</span></button>
        <button className={`rail-button rail-projects ${workspaceExpanded ? "rail-active" : ""}`} aria-label="Open projects" {...hintProps("Projects")} aria-expanded={workspaceExpanded} aria-controls="workspace-project-panel" onClick={() => { onWorkspaceExpandedChange(true); setMenuOpen(false); }}><FolderOpen size={20} /><span className="rail-label">Projects</span></button>
      </nav>
      <div className="rail-bottom">
        <button className={`rail-button ${isSettings ? "rail-active" : ""}`} aria-label="Settings" {...hintProps("Settings")} aria-current={isSettings ? "page" : undefined} onClick={() => navigateTo("/workspace/settings")}><Settings2 size={20} /><span className="rail-label">Settings</span></button>
        <button className={`rail-button rail-profile ${isProfile ? "rail-active" : ""}`} type="button" aria-label={`Profile settings for ${displayName}`} {...hintProps("Profile settings")} onClick={() => navigateTo("/workspace/profile")}>
          <ProfileAvatar url={session.user.profile_url} initials={userInitials} className="profile-avatar" />
          <span className="rail-label">{displayName}</span>
        </button>
        <button className="rail-button mobile-navigation-close" aria-label="Close navigation" {...hintProps("Close navigation")} onClick={onClose}><X size={20} /><span className="rail-label">Close menu</span></button>
      </div>
    </aside>
    <aside className="sidebar project-sidebar" id="workspace-project-panel" aria-label="Workspace projects" hidden={!workspaceExpanded}>
      <header className="workspace-panel-header">
        <div><span className="workspace-panel-eyebrow">WORKSPACE</span><h1 title={activeWorkspace}>{activeWorkspace}</h1></div>
        <button className="icon-button workspace-collapse" aria-label="Collapse workspace sidebar" title="Collapse workspace sidebar" aria-expanded={workspaceExpanded} aria-controls="workspace-project-panel" onClick={() => onWorkspaceExpandedChange(false)}><PanelLeftClose size={18} /></button>
        <button className="icon-button sidebar-close" aria-label="Close menu" onClick={onClose}><X size={18} /></button>
      </header>
      <button className="new-research-button" onClick={startResearch}><Plus size={17} /> New research</button>

      <section className="sidebar-projects" aria-labelledby="sidebar-projects-title">
      <div className="project-section-heading">
        <h2 id="sidebar-projects-title"><FolderOpen size={16} /> Your projects <span className="history-count">{jobs.length}</span></h2>
        <button className="icon-button tiny" aria-label="Start new research" title="Start new research" onClick={startResearch}><Plus size={16} /></button>
      </div>
      <div className="project-search">
        <Search size={15} aria-hidden="true" />
        <input aria-label="Search projects" placeholder="Find a project…" value={projectQuery} onChange={(event) => setProjectQuery(event.target.value)} />
        {projectQuery && <button className="icon-button tiny" aria-label="Clear project search" onClick={() => setProjectQuery("")}><X size={13} /></button>}
      </div>
      <div className="project-filters" role="group" aria-label="Filter projects by status">
        {(["all", "active", "completed"] as const).map((filter) => <button key={filter} aria-pressed={projectFilter === filter} onClick={() => setProjectFilter(filter)}>{filter === "all" ? "All projects" : filter === "active" ? "Active" : "Completed"}</button>)}
      </div>
      <div className="history-list project-list" aria-label="Projects" aria-busy={loading} tabIndex={0}>
        {visibleJobs.map((job) => <div key={job.id} className="project-entry"><button className={`history-item ${isReport && activeJob?.id === job.id ? "history-active" : ""}`} aria-current={isReport && activeJob?.id === job.id ? "page" : undefined} title={job.title} onClick={() => openProject(job)}>
          <span className={`history-icon ${job.status}`}><FileText size={14} /></span>
          <span className="history-text"><strong>{job.title}</strong><small>{statusLabel(job.status)}{job.sourceCount > 0 && <> · {job.sourceCount} {job.sourceCount === 1 ? "source" : "sources"}</>}</small></span>
          <span className={`history-status history-status-${job.status}`} aria-label={statusLabel(job.status)} />
        </button><ProjectQuickPreview job={job} status={statusLabel(job.status)} onOpen={() => openProject(job)} /></div>)}
        {loading && <div className="history-loading" aria-label="Loading research history"><span /><span /><span /></div>}
        {!jobs.length && !loading && <div className="history-empty"><FolderOpen size={22} /><p>A home for your next big question.</p><button type="button" onClick={startResearch}>Start your first project</button></div>}
        {jobs.length > 0 && !visibleJobs.length && !loading && <div className="history-empty"><Search size={20} /><p>No projects match your search or filter.</p><button type="button" onClick={() => { setProjectQuery(""); setProjectFilter("all"); }}>Show all projects</button></div>}
      </div>
      <p className="project-list-caption" role="status">{loading ? "Updating projects…" : `${visibleJobs.length} of ${jobs.length} projects`}</p>
      </section>

      <div className="sidebar-mode" title="Search and cloud providers may charge for usage."><Zap size={13} /><span>{RESEARCH_DEMO_MODE ? "Demo mode · no paid requests" : "Web search · your selected model"}</span></div>
    </aside>
    </div>
    {tooltip}
    {dialog && <WorkspaceDialog dialog={dialog} error={error} name={name} onNameChange={(value) => { setName(value); setError(""); }} onClose={closeDialog} onSave={save} onDelete={remove} />}
  </>;
}
