import { Navigate, Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { AuthView } from "../components/auth/AuthPage";
import { Dashboard } from "../components/dashboard/DashboardPage";
import { NewResearch } from "../components/research-form/NewResearchPage";
import { ReportView } from "../components/research-report/ResearchReportPage";
import { SettingsView } from "../components/settings/SettingsPage";
import { ProfileSettingsPage } from "../components/workspace/ProfileSettingsPage";
import { WorkspaceLayout } from "../components/layout/WorkspaceLayout";
import type { AppRoutesProps, AuthRouteMode } from "./app-routes.types";

export function AppRoutes(props: AppRoutesProps) {
  const navigate = useNavigate();

  if (props.authInitializing) {
    return <div className="auth-bootstrap" role="status" aria-live="polite"><div className="auth-bootstrap-mark">✦</div><strong>Restoring your workspace</strong><span>Checking your saved session…</span></div>;
  }

  const authPage = (mode: AuthRouteMode) => (
    <AuthView
      mode={mode}
      theme={props.theme}
      onThemeChange={props.onToggleTheme}
      onModeChange={props.onAuthModeChange}
      loading={props.authLoading}
      error={props.authError}
      challenge={null}
      onSignIn={props.onSignIn}
      onSignUp={props.onSignUp}
      onVerify={props.onVerify}
      onOAuth={props.onOAuth}
    />
  );

  return (
    <Routes>
      <Route path="/" element={<Navigate replace to={props.session ? "/workspace" : "/login"} />} />
      <Route path="/login" element={props.session ? <Navigate replace to="/workspace" /> : authPage("signin")} />
      <Route path="/signup" element={props.session ? <Navigate replace to="/workspace" /> : authPage("signup")} />
      <Route
        path="/verify"
        element={props.session
          ? <Navigate replace to="/workspace" />
          : props.authChallenge?.requiresTwoFactor
            ? <AuthView
                mode="signin"
                theme={props.theme}
                onThemeChange={props.onToggleTheme}
                onModeChange={props.onAuthModeChange}
                loading={props.authLoading}
                error={props.authError}
                challenge={props.authChallenge}
                onSignIn={props.onSignIn}
                onSignUp={props.onSignUp}
                onVerify={props.onVerify}
                onOAuth={props.onOAuth}
              />
            : <Navigate replace to="/login" />}
      />
      <Route element={props.session ? <Outlet /> : <Navigate replace to="/login" />}>
        <Route
          path="/workspace"
          element={props.session ? <WorkspaceLayout
            session={props.session}
            workspaceName={props.workspaceName}
            theme={props.theme}
            jobs={props.jobs}
            activeJob={props.activeJob}
            loading={props.loading}
            error={props.error}
            onToggleTheme={props.onToggleTheme}
            onSignOut={props.onSignOut}
            onOpenJob={props.onOpenJob}
            onStartNew={props.onStartNew}
            onDismissError={props.onDismissError}
          /> : <Navigate replace to="/login" />}
        >
          <Route index element={<Dashboard
            jobs={props.filteredJobs}
            loading={props.loading}
            activeJob={props.activeJob}
            query={props.query}
            onQueryChange={props.onQueryChange}
            onNew={props.onStartNew}
            onOpenJob={props.onOpenJob}
            onViewReport={() => props.activeJob && props.onOpenJob(props.activeJob)}
            onRetry={props.onStartNew}
          />} />
          <Route path="research/new" element={<NewResearch
            form={props.form}
            submitting={props.submitting}
            onChange={props.onFormChange}
            onToggleCriterion={props.onToggleCriterion}
            onSubmit={props.onSubmitResearch}
            onCancel={() => navigate("/workspace")}
          />} />
          <Route path="research/:jobId" element={<ResearchJobRoute {...props} />} />
          <Route path="settings" element={<SettingsView
            config={props.providerConfig}
            connectionState={props.connectionState}
            onChange={props.onProviderConfigChange}
            onSave={props.onSaveProviderConfig}
            onTest={props.onTestProviderConnection}
            workspaceName={props.workspaceName}
            onSaveWorkspaceName={props.onSaveWorkspaceName}
          />} />
          <Route path="profile" element={<ProfileSettingsPage session={props.session!} onSave={props.onUpdateProfile} onUploadPicture={props.onUpdateProfilePicture} onDeletePicture={props.onRemoveProfilePicture} />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate replace to={props.session ? "/workspace" : "/login"} />} />
    </Routes>
  );
}

function ResearchJobRoute({ jobs, activeJob, activeReportTab, onReportTabChange, onStartNew }: AppRoutesProps) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const job = jobs.find((item) => item.id === jobId) ?? (activeJob?.id === jobId ? activeJob : null);

  if (!job) {
    return <div className="empty-state"><h2>Research not found</h2><p>This research run does not exist in the current session.</p><button className="primary-button" onClick={() => navigate("/workspace")}>Back to overview</button></div>;
  }

  return <ReportView
    job={job}
    activeTab={activeReportTab}
    onTabChange={onReportTabChange}
    onBack={() => navigate("/workspace")}
    onNew={onStartNew}
  />;
}
