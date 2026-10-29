import { useState } from "react";
import { CheckCircle2, Laptop, LoaderCircle, Unplug } from "lucide-react";
import { request } from "../../services/apiClient";
import { saveProviderConfig } from "../../services/researchApi";
import type { ProviderConfig } from "../../types";
import { CONNECTOR_ENDPOINT } from "../../constants/localModels";
import { browserOllama, useBrowserOllamaState } from "./useBrowserOllama";
import { DesktopConnector } from "./DesktopConnector";
export { CONNECTOR_ENDPOINT } from "../../constants/localModels";

export function LocalConnector({ config, onChange }: { config: ProviderConfig; onChange: (config: ProviderConfig) => void }) {
  const relay = useBrowserOllamaState();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [desktop, setDesktop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState(navigator.platform.includes("Mac") ? "mac" : navigator.platform.includes("Win") ? "windows" : "linux");
  const connected = relay.phase === "ready";
  const connecting = relay.phase === "connecting";
  const selected = config.endpoint === CONNECTOR_ENDPOINT && relay.models.includes(config.model) ? config.model : "";
  const origin = window.location.origin;
  const command = platform === "windows"
    ? `[Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '${origin}', 'User')`
    : platform === "mac" ? `launchctl setenv OLLAMA_ORIGINS "${origin}"`
      : `sudo systemctl edit ollama.service\n\n# Add these lines, then save:\n[Service]\nEnvironment="OLLAMA_ORIGINS=${origin}"\n\n# Apply the change:\nsudo systemctl daemon-reload\nsudo systemctl restart ollama`;

  const chooseModel = async (model: string) => {
    if (!model) return;
    setSaving(true); setError("");
    try {
      const next: ProviderConfig = { mode: "local", provider: "ollama", endpoint: CONNECTOR_ENDPOINT, model, apiKey: "" };
      await saveProviderConfig(next);
      onChange(next);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not select this model."); }
    finally { setSaving(false); }
  };
  const disconnect = async () => {
    browserOllama.stop(true);
    setError("");
    try { await request("/connectors/connection", { method: "DELETE" }); }
    catch { setError("This tab has stopped using local models. The server will mark it offline shortly."); }
  };
  if (desktop) return <>
    <button className="text-button" type="button" onClick={() => setDesktop(false)}>Use Ollama through this browser instead</button>
    <DesktopConnector config={config} onChange={onChange} />
  </>;

  return <section className="form-card surface-card settings-card local-connector">
    <div className="form-section-title"><span className="form-step"><Laptop size={18} /></span><div><h2>Your local models</h2><p>Connect to Ollama directly through this browser. No ResearchPilot app download.</p></div></div>
    <p className={connected ? "local-connector-status" : ""} role="status">{connected && <CheckCircle2 size={16} />}{relay.message}</p>
    {connected ? <>
      <label className="field-label" htmlFor="browser-local-model">Model
        <select id="browser-local-model" value={selected} disabled={saving} onChange={event => { void chooseModel(event.target.value); }}>
          <option value="">Choose an installed model</option>
          {relay.models.map(model => <option key={model} value={model}>{model}</option>)}
        </select>
      </label>
      {!relay.models.length && <p>Install a chat model in Ollama. It will appear here automatically. Embedding models are excluded.</p>}
      {selected && <p className="local-connector-status"><CheckCircle2 size={16} /> Ready to research. Model selection is saved automatically.</p>}
      <p className="local-connector-hint">Keep Ollama running and this tab open while research runs. Prompts and results pass through ResearchPilot; model inference runs on your computer.</p>
      <button className="text-button" type="button" onClick={() => { void disconnect(); }}><Unplug size={14} /> Disconnect</button>
    </> : <div className="local-connector-actions">
      <button className="primary-button" type="button" disabled={connecting} onClick={() => { setError(""); browserOllama.connect(); }}>
        {connecting ? <LoaderCircle size={15} className="spin" /> : <Laptop size={15} />}{connecting ? "Connecting…" : "Connect Ollama"}
      </button>
      {connecting && <button className="secondary-button" type="button" onClick={() => browserOllama.stop(true)}>Cancel</button>}
    </div>}
    {!connected && <details className="ollama-browser-setup" key={relay.phase === "error" ? "error" : "setup"} open={relay.phase === "error" ? true : undefined}>
      <summary>First-time Ollama browser setup</summary>
      <p>Ollama must be installed with a chat model. Allow this website in Ollama once, then allow local access when your browser asks.</p>
      <label className="field-label" htmlFor="ollama-setup-platform">Your computer
        <select id="ollama-setup-platform" value={platform} onChange={event => { setPlatform(event.target.value); setCopied(false); }}><option value="windows">Windows</option><option value="mac">macOS</option><option value="linux">Linux</option></select>
      </label>
      <p>{platform === "windows" ? "Quit Ollama from the system tray, run this once in PowerShell, then reopen Ollama." : platform === "mac" ? "Run this once in Terminal, then quit and reopen Ollama." : "Update Ollama's service configuration with this website origin, then restart the service."}</p>
      <pre>{command}</pre>
      <button className="secondary-button" type="button" onClick={() => { void navigator.clipboard.writeText(command).then(() => setCopied(true)).catch(() => setCopied(false)); }}>{copied ? "Copied" : "Copy setup command"}</button>
      <p className="local-connector-hint">If OLLAMA_ORIGINS already contains other websites, add this website to that list. Keep Ollama on its default local address. If browser access was blocked, allow it in this site's browser permissions and reconnect.</p>
      <a href="https://docs.ollama.com/faq#how-can-i-allow-additional-web-origins-to-access-ollama" target="_blank" rel="noreferrer">Ollama setup guide</a>
    </details>}
    {error && <p className="local-connector-error" role="alert">{error}</p>}
    <button className="text-button" type="button" onClick={() => setDesktop(true)}>Other option: use the desktop connector</button>
  </section>;
}
