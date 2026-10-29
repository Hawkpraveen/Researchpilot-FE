import "./settings.styles.css";
import { Activity, ArrowUpRight, Check, CheckCircle2, ChevronDown, LoaderCircle, LockKeyhole, Settings2, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import type { SettingsProps } from "./settings.types";
import { useSettingsForm } from "./useSettingsForm";
import type { ProviderConfig } from "../../types";
import { useState } from "react";
import { WorkspaceNameSettings } from "./WorkspaceNameSettings";
import { LocalConnector, CONNECTOR_ENDPOINT } from "./LocalConnector";

export function SettingsView({ config, connectionState, onChange, onSave, onTest, workspaceName, onSaveWorkspaceName }: SettingsProps) {
  const { saving, update, save } = useSettingsForm(config, onChange, onSave);
  const availableModels = connectionState?.models ?? [];
  const [manualModel, setManualModel] = useState(false);
  const chooseAgent = (value: string) => {
    const [mode, provider] = value.split(":") as [ProviderConfig["mode"], ProviderConfig["provider"]];
    setManualModel(false);
    if (provider === "ollama") update({ mode, provider, endpoint: CONNECTOR_ENDPOINT, model: "llama3.2:3b", apiKey: "" });
    else if (provider === "openai") update({ mode, provider, endpoint: "https://api.openai.com/v1", model: "", apiKey: "" });
    else if (provider === "anthropic") update({ mode, provider, endpoint: "https://api.anthropic.com", model: "", apiKey: "" });
    else update({ mode, provider, model: "", apiKey: "" });
  };

  return (
    <div className="settings-page">
      <div className="settings-hero">
        <div>
          <div className="eyebrow"><Settings2 size={14} /> WORKSPACE CONFIGURATION</div>
          <h1>Connect your research engine</h1>
          <p>Choose how ResearchPilot runs models, then verify the connection before you start a run.</p>
        </div>
        <div className="settings-hero-badge"><Sparkles size={16} /><span>Ready when you are</span></div>
      </div>

      <div className="settings-layout">
        <div className="settings-main">

      <WorkspaceNameSettings workspaceName={workspaceName} onSave={onSaveWorkspaceName} />

      <section className="form-card surface-card settings-card">
        <div className="form-section-title">
          <span className="form-step"><Zap size={15} /></span>
          <div><h2>Research agent</h2><p>Choose which provider will run research.</p></div>
        </div>
        <label className="field-label mt-4" htmlFor="research-agent">Agent / provider
          <select id="research-agent" value={`${config.mode}:${config.provider}`} onChange={(event) => chooseAgent(event.target.value)}>
            <option value="local:ollama">Local LLM (your computer)</option>
            <option value="byok:openai">OpenAI</option>
            <option value="byok:anthropic">Anthropic Claude</option>
            <option value="byok:custom">Custom OpenAI-compatible</option>
          </select>
        </label>
      </section>

      {config.mode === "local" ? <LocalConnector config={config} onChange={onChange} /> : <section className="form-card surface-card settings-card">
        <div className="form-section-title">
          <span className="form-step"><Activity size={15} /></span>
          <div>
            <h2>Provider connection</h2>
            <p>The browser never calls model providers directly.</p>
          </div>
        </div>
        <div className="settings-fields grid grid-cols-1 gap-3 min-[761px]:grid-cols-2">
          <label className="field-label" htmlFor="endpoint">
            API endpoint
            <input id="endpoint" value={config.endpoint} onChange={(event) => update({ endpoint: event.target.value })} placeholder="http://localhost:11434" />
          </label>
          <div className="field-label model-picker-label">Model
            <details className="model-picker">
              <summary>{manualModel ? "Enter a model manually…" : config.model || "Choose a model"}<ChevronDown size={15} /></summary>
              <div className="model-picker-options" role="listbox" aria-label="Available models">
                {!availableModels.includes(config.model) && <span className="model-picker-empty">{config.model ? `Current model: ${config.model} · test to check availability` : "Test this agent to load available models."}</span>}
                {availableModels.map((model) => <button type="button" role="option" aria-selected={model === config.model && !manualModel} key={model} onClick={(event) => { setManualModel(false); update({ model }); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{model}</button>)}
                <button type="button" role="option" aria-selected={manualModel} onClick={(event) => { setManualModel(true); update({ model: "" }); event.currentTarget.closest("details")?.removeAttribute("open"); }}>Enter a model manually…</button>
              </div>
            </details>
          </div>
          {manualModel && <label className="field-label" htmlFor="model">Custom model ID<input id="model" value={config.model} onChange={(event) => update({ model: event.target.value })} placeholder="Enter a model ID" /></label>}
        </div>
        {config.mode === "byok" && (
          <label className="field-label" htmlFor="api-key">
            API key
            <input id="api-key" type="password" value={config.apiKey} onChange={(event) => update({ apiKey: event.target.value })} placeholder="sk-…" autoComplete="off" />
          </label>
        )}
        <div className="mt-4 flex justify-end gap-2 border-t border-[#eff0f4] pt-4 [.theme-dark_&]:border-[#25324a] max-[760px]:flex-col max-[760px]:[&>button]:w-full">
          <button className="secondary-button" onClick={onTest}><Activity size={15} /> Test current configuration</button>
          <button className="primary-button" onClick={save} disabled={saving}>
            {saving ? <><LoaderCircle size={15} className="spin" /> Saving…</> : <><Check size={15} /> Save configuration</>}
          </button>
        </div>
        {connectionState && (
          <div className={`mt-3 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] ${connectionState.connected
            ? "bg-[#eaf8f1] text-[#16815c] [.theme-dark_&]:bg-[#143328] [.theme-dark_&]:text-[#70d5ac]"
            : "bg-[#fff0f1] text-[#b34d57] [.theme-dark_&]:bg-[#3a202b] [.theme-dark_&]:text-[#ff9fa8]"}`}>
            <span className="status-dot" />{connectionState.message}
          </div>
        )}
        <p className="provider-test-note">Testing uses these current selections and any saved key for the same provider and endpoint. It does not save your changes.</p>
      </section>}

      <section className="form-card surface-card settings-card">
        <div className="form-section-title">
          <span className="form-step"><ShieldCheck size={15} /></span>
          <div><h2>Safety defaults</h2><p>These controls stay enabled for every provider.</p></div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-[#eff0f4] py-3.5 [.theme-dark_&]:border-[#25324a] max-[480px]:items-start max-[480px]:flex-col">
          <div className="flex flex-col gap-1.5">
            <strong className="text-[12px] text-[#17202f] [.theme-dark_&]:text-[#edf2ff]">Evidence-first reporting</strong>
            <span className="text-[12px] leading-[1.6] text-[#929aa7] [.theme-dark_&]:text-[#a7b3c9]">Claims, sources, gaps, and conflicts stay visible in every report.</span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[12px] font-bold text-[#16815c] [.theme-dark_&]:text-[#70d5ac]"><CheckCircle2 size={14} /> Enabled</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-[#eff0f4] py-3.5 [.theme-dark_&]:border-[#25324a] max-[480px]:items-start max-[480px]:flex-col">
          <div className="flex flex-col gap-1.5">
            <strong className="text-[12px] text-[#17202f] [.theme-dark_&]:text-[#edf2ff]">Automatic paid fallback</strong>
            <span className="text-[12px] leading-[1.6] text-[#929aa7] [.theme-dark_&]:text-[#a7b3c9]">ResearchPilot never switches providers without explicit configuration.</span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[12px] font-bold text-[#a1a7b2]"><X size={14} /> Disabled</span>
        </div>
      </section>
        </div>

        <aside className="settings-rail">
          {config.mode !== "local" && <section className="settings-status-card">
            <div className="settings-status-heading"><span className="settings-status-icon"><Activity size={16} /></span><span><strong>Connection status</strong><small>Current workspace setup</small></span></div>
            <div className={`settings-status-value ${connectionState?.connected ? "is-connected" : ""}`}><span className="status-dot" />{connectionState?.connected ? "Connected" : "Not tested yet"}</div>
            <p>{connectionState?.message ?? "Run a connection test to confirm that your selected provider is reachable."}</p>
            <button className="settings-rail-link" type="button" onClick={onTest}>Test connection <ArrowUpRight size={14} /></button>
          </section>}
          <section className="settings-note-card">
            <div className="settings-note-icon"><LockKeyhole size={16} /></div>
            <strong>{config.mode === "local" ? "Your computer, your models" : "Your key stays private"}</strong>
            <p>{config.mode === "local" ? "Only your connected computer receives model requests. Keep Ollama running and your ResearchPilot tab open while you research." : "Keys are sent to the API to test or save a provider. They are never stored in browser storage or returned by the API."}</p>
          </section>
          <section className="settings-help-card">
            <span className="nav-label">QUICK GUIDE</span>
            <div><span>1</span><p>{config.mode === "local" ? "Connect Ollama" : "Pick your provider"}</p></div>
            <div><span>2</span><p>{config.mode === "local" ? "Choose an installed model" : "Enter the endpoint and model"}</p></div>
            <div><span>3</span><p>{config.mode === "local" ? "Start your research" : "Test, then save"}</p></div>
          </section>
        </aside>
      </div>
    </div>
  );
}
