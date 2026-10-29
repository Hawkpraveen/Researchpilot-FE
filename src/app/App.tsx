import { useState } from "react";
import { AppRoutes } from "../routes/AppRoutes";
import { useAuth } from "../components/auth/useAuth";
import { useResearchForm } from "../components/research-form/useResearchForm";
import { useResearchHistory } from "../components/research-history/useResearchHistory";
import { useProviderSettings } from "../components/settings/useProviderSettings";
import { useTheme } from "../hooks/useTheme";

function App() {
  const auth = useAuth();
  const theme = useTheme();
  const history = useResearchHistory(Boolean(auth.session));
  const researchForm = useResearchForm(history.addJob);
  const providerSettings = useProviderSettings(Boolean(auth.session));
  const [activeReportTab, setActiveReportTab] = useState<"overview" | "evidence">("overview");

  const startNewResearch = () => {
    history.setError("");
    researchForm.startNew();
  };

  const dismissError = () => {
    history.setError("");
    researchForm.setError("");
  };

  return <>
    {auth.toast && <div className={`fixed right-4 top-4 z-50 flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${auth.toast.type === "success" ? "border-[#a8e0c9] bg-[#effbf5] text-[#176a4e]" : "border-[#f3cdd1] bg-[#fff3f4] text-[#b34d57]"}`} role="alert">
      <span>{auth.toast.message}</span>
      <button type="button" onClick={auth.dismissToast} aria-label="Dismiss notification">×</button>
    </div>}
    <AppRoutes
    session={auth.session}
    authInitializing={auth.initializing}
    theme={theme.theme}
    authLoading={auth.loading}
    authError={auth.error}
    authChallenge={auth.challenge}
    onToggleTheme={theme.toggleTheme}
    onAuthModeChange={auth.changeMode}
    onSignIn={auth.signIn}
    onSignUp={auth.signUp}
    onVerify={auth.verify}
    onOAuth={auth.oauthSignIn}
    onUpdateProfile={auth.updateProfile}
    onUpdateProfilePicture={auth.updateProfilePicture}
    onRemoveProfilePicture={auth.removeProfilePicture}
    jobs={history.jobs}
    filteredJobs={history.filteredJobs}
    activeJob={history.activeJob}
    loading={history.loading}
    query={history.query}
    onQueryChange={history.setQuery}
    onOpenJob={history.openJob}
    onStartNew={startNewResearch}
    onSubmitResearch={researchForm.submit}
    form={researchForm.form}
    onFormChange={researchForm.setForm}
    onToggleCriterion={researchForm.toggleCriterion}
    submitting={researchForm.submitting}
    activeReportTab={activeReportTab}
    onReportTabChange={setActiveReportTab}
    providerConfig={providerSettings.config}
    connectionState={providerSettings.connectionState}
    onProviderConfigChange={providerSettings.setConfig}
    onSaveProviderConfig={providerSettings.save}
    onTestProviderConnection={providerSettings.testConnection}
    workspaceName={providerSettings.workspaceName}
    onSaveWorkspaceName={providerSettings.saveWorkspaceName}
    error={researchForm.error || history.error}
    onDismissError={dismissError}
    onSignOut={auth.signOut}
    />
  </>;
}

export default App;
