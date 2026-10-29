import "./layout.styles.css";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AlertCircle, Menu, Moon, Sun, X } from "lucide-react";
import type { WorkspaceLayoutProps } from "../workspace/workspace.types";
import { ProfileMenu } from "../workspace/ProfileMenu";
import { WorkspaceSidebar } from "../workspace/WorkspaceSidebar";

export function WorkspaceLayout({
  session,
  workspaceName,
  theme,
  jobs,
  activeJob,
  loading,
  error,
  onToggleTheme,
  onSignOut,
  onOpenJob,
  onStartNew,
  onDismissError,
}: WorkspaceLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const showProjects = () => {
    setWorkspaceExpanded(true);
    setSidebarOpen(window.matchMedia("(max-width: 760px)").matches);
  };
  const isNewResearch = location.pathname.endsWith("/research/new");
  const isReport = /^\/workspace\/research\/[^/]+$/.test(location.pathname) && !isNewResearch;
  const isSettings = location.pathname.endsWith("/settings");
  const isProfile = location.pathname.endsWith("/profile");
  const pageTitle = isNewResearch ? "New research" : isReport ? "Research report" : isProfile ? "Profile settings" : isSettings ? "Settings" : "Overview";

  return (
    <div className={`app-shell theme-${theme}`}>
      <WorkspaceSidebar
        session={session}
        workspaceName={workspaceName}
        jobs={jobs}
        activeJob={activeJob}
        loading={loading}
        open={sidebarOpen}
        workspaceExpanded={workspaceExpanded}
        onWorkspaceExpandedChange={setWorkspaceExpanded}
        onClose={() => setSidebarOpen(false)}
        onOpenJob={onOpenJob}
        onStartNew={onStartNew}
      />
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <button className="icon-button mobile-menu" aria-label="Open menu" onClick={showProjects}><Menu size={19} /></button>
            <span className="hidden sm:inline">Workspace</span><span className="crumb-separator hidden sm:inline">/</span><strong>{pageTitle}</strong>
          </div>
          <div className="topbar-actions">
            <button className="icon-button help-button" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`} onClick={onToggleTheme}>
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <ProfileMenu session={session} theme={theme} onToggleTheme={onToggleTheme} onSignOut={onSignOut} />
          </div>
        </header>
        <div className="page-content">
          {error && <div className="alert-banner"><AlertCircle size={17} /><span>{error}</span><button className="icon-button" aria-label="Dismiss error" onClick={onDismissError}><X size={16} /></button></div>}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
