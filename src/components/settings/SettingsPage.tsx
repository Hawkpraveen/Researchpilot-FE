import { Activity, Check, CheckCircle2, Globe2, LoaderCircle, Settings2, ShieldCheck, Zap, X } from "lucide-react";
import type { SettingsProps } from "./settings.types";
import { useSettingsForm } from "./useSettingsForm";
import type { ProviderConfig } from "../../types";

export function SettingsView({ config, connectionState, onChange, onSave, onTest }: SettingsProps) {
  const { saving, update, save } = useSettingsForm(config, onChange, onSave);
  const providerChoiceClass = (selected: boolean) => [
    "grid grid-cols-[22px_1fr] gap-x-[9px] gap-y-[3px] rounded-[9px] border p-3.5 text-left text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7168df]",
    "border-[#e6e7ec] bg-white text-[#7f8794] hover:border-[#c9c5f5] hover:bg-[#faf9ff] hover:text-[#5e55ce]",
    "[.theme-dark_&]:border-[#34415a] [.theme-dark_&]:bg-[#111a2c] [.theme-dark_&]:text-[#b5bfd2]",
    selected && "border-[#c9c5f5] bg-[#faf9ff] text-[#5e55ce] [.theme-dark_&]:border-[#756bd9] [.theme-dark_&]:bg-[#252444] [.theme-dark_&]:text-[#d2ccff]",
  ].filter(Boolean).join(" ");

  return (
    <div className="settings-page mx-auto w-full max-w-900px">
      <div className="eyebrow"><Settings2 size={14} /> WORKSPACE CONFIGURATION</div>
      <h1 className="mb-2.5 mt-11px text-[31px] font-extrabold leading-tight tracking-[-1.6px] text-[#17202f] [.theme-dark_&]:text-[#edf2ff]">
        Connect your research engine
      </h1>
      <p className="mb-6 max-w-650px text-[14px] leading-[1.8] text-[#7f8897] [.theme-dark_&]:text-[#a7b3c9]">
        Run the agent locally with Ollama, or connect a server-side BYO key for OpenAI, Claude, or any OpenAI-compatible provider. Keys are sent only to the API when saved and are never stored in browser storage.
      </p>

      <section className="form-card surface-card mb-4">
        <div className="form-section-title">
          <span className="form-step"><Zap size={15} /></span>
          <div><h2>Execution mode</h2><p>Choose where research models run.</p></div>
        </div>
        <div className="provider-toggle mt-4 grid grid-cols-1 gap-2.5 min-[761px]:grid-cols-2">
          <button className={providerChoiceClass(config.mode === "local")} aria-pressed={config.mode === "local"} onClick={() => update({ mode: "local", provider: "ollama", endpoint: "http://localhost:11434", model: "llama3.1" })}>
            <Globe2 className="row-span-2 mt-0.5" size={17} />
            <strong className="text-[14px] text-[#465061] [.theme-dark_&]:text-[#edf2ff]">Local agent</strong>
            <small className="text-[14px] text-[#949ba7] [.theme-dark_&]:text-[#9eabc0]">Ollama on this machine</small>
          </button>
          <button className={providerChoiceClass(config.mode === "byok")} aria-pressed={config.mode === "byok"} onClick={() => update({ mode: "byok" })}>
            <ShieldCheck className="row-span-2 mt-0.5" size={17} />
            <strong className="text-[14px] text-[#465061] [.theme-dark_&]:text-[#edf2ff]">Bring your own key</strong>
            <small className="text-[14px] text-[#949ba7] [.theme-dark_&]:text-[#9eabc0]">OpenAI, Claude, or custom</small>
          </button>
        </div>
      </section>

      <section className="form-card surface-card mb-4">
        <div className="form-section-title">
          <span className="form-step"><Activity size={15} /></span>
          <div>
            <h2>{config.mode === "local" ? "Local agent connection" : "Provider connection"}</h2>
            <p>{config.mode === "local" ? "The API should reach Ollama through the local agent service." : "The browser never calls model providers directly."}</p>
          </div>
        </div>
        {config.mode === "byok" && (
          <label className="field-label" htmlFor="provider">
            Provider
            <select id="provider" value={config.provider} onChange={(event) => update({ provider: event.target.value as ProviderConfig["provider"] })}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Claude (Anthropic)</option>
              <option value="custom">Custom OpenAI-compatible</option>
            </select>
          </label>
        )}
        <div className="settings-fields grid grid-cols-1 gap-3 min-[761px]:grid-cols-2">
          <label className="field-label" htmlFor="endpoint">
            API endpoint
            <input id="endpoint" value={config.endpoint} onChange={(event) => update({ endpoint: event.target.value })} placeholder="http://localhost:11434" />
          </label>
          <label className="field-label" htmlFor="model">
            Model
            <input id="model" value={config.model} onChange={(event) => update({ model: event.target.value })} placeholder={config.provider === "anthropic" ? "claude-sonnet-4-5" : "gpt-4.1-mini"} />
          </label>
        </div>
        {config.mode === "byok" && (
          <label className="field-label" htmlFor="api-key">
            API key
            <input id="api-key" type="password" value={config.apiKey} onChange={(event) => update({ apiKey: event.target.value })} placeholder="sk-…" autoComplete="off" />
          </label>
        )}
        <div className="mt-4 flex justify-end gap-2 border-t border-[#eff0f4] pt-4 [.theme-dark_&]:border-[#25324a] max-[760px]:flex-col max-[760px]:[&>button]:w-full">
          <button className="secondary-button" onClick={onTest}><Activity size={15} /> Test connection</button>
          <button className="primary-button" onClick={save} disabled={saving}>
            {saving ? <><LoaderCircle size={15} className="spin" /> Saving…</> : <><Check size={15} /> Save configuration</>}
          </button>
        </div>
        {connectionState && (
          <div className={`mt-3 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[14px] ${connectionState.connected
            ? "bg-[#eaf8f1] text-[#16815c] [.theme-dark_&]:bg-[#143328] [.theme-dark_&]:text-[#70d5ac]"
            : "bg-[#fff0f1] text-[#b34d57] [.theme-dark_&]:bg-[#3a202b] [.theme-dark_&]:text-[#ff9fa8]"}`}>
            <span className="status-dot" />{connectionState.message}
          </div>
        )}
      </section>

      <section className="form-card surface-card mb-4">
        <div className="form-section-title">
          <span className="form-step"><ShieldCheck size={15} /></span>
          <div><h2>Safety defaults</h2><p>These controls stay enabled for every provider.</p></div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-[#eff0f4] py-3.5 [.theme-dark_&]:border-[#25324a] max-[480px]:items-start max-[480px]:flex-col">
          <div className="flex flex-col gap-1.5">
            <strong className="text-[14px] text-[#17202f] [.theme-dark_&]:text-[#edf2ff]">Evidence-first reporting</strong>
            <span className="text-[14px] leading-[1.6] text-[#929aa7] [.theme-dark_&]:text-[#a7b3c9]">Claims, sources, gaps, and conflicts stay visible in every report.</span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[14px] font-bold text-[#16815c] [.theme-dark_&]:text-[#70d5ac]"><CheckCircle2 size={14} /> Enabled</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-[#eff0f4] py-3.5 [.theme-dark_&]:border-[#25324a] max-[480px]:items-start max-[480px]:flex-col">
          <div className="flex flex-col gap-1.5">
            <strong className="text-[14px] text-[#17202f] [.theme-dark_&]:text-[#edf2ff]">Automatic paid fallback</strong>
            <span className="text-[14px] leading-[1.6] text-[#929aa7] [.theme-dark_&]:text-[#a7b3c9]">ResearchPilot never switches providers without explicit configuration.</span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[14px] font-bold text-[#a1a7b2]"><X size={14} /> Disabled</span>
        </div>
      </section>
    </div>
  );
}
