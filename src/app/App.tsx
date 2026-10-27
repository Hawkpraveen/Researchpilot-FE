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
  const providerSettings = useProviderSettings();
  const [activeReportTab, setActiveReportTab] = useState<"overview" | "evidence">("overview");

  const startNewResearch = () => {
    history.setError("");
    researchForm.startNew();
  };

  const dismissError = () => {
    history.setError("");
    researchForm.setError("");
  };

  return <AppRoutes
    session={auth.session}
    theme={theme.theme}
    authLoading={auth.loading}
    authError={auth.error}
    authChallenge={auth.challenge}
    onToggleTheme={theme.toggleTheme}
    onAuthModeChange={auth.changeMode}
    onSignIn={auth.signIn}
    onSignUp={auth.signUp}
    onDemoLogin={auth.signInToDemo}
    onVerify={auth.verify}
    onOAuth={auth.showOAuthPlaceholder}
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
    error={researchForm.error || history.error}
    onDismissError={dismissError}
    onSignOut={auth.signOut}
  />;
}

export default App;
