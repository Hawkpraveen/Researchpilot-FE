import { useState } from "react";
import { Link } from "react-router-dom";
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
  const [guideStep, setGuideStep] = useState(0);
  const [platform, setPlatform] = useState(navigator.platform.includes("Mac") ? "mac" : navigator.platform.includes("Win") ? "windows" : "linux");
  const connected = relay.phase === "ready";
  const connecting = relay.phase === "connecting";
  const selected = config.endpoint === CONNECTOR_ENDPOINT && relay.models.includes(config.model) ? config.model : "";
  const origin = window.location.origin;
  const command = platform === "windows"
    ? `$rpOrigin = '${origin}'\n$rpSaved = [Environment]::GetEnvironmentVariable('OLLAMA_ORIGINS', 'User')\n$env:OLLAMA_ORIGINS = ((@($rpSaved -split ',') + $rpOrigin) | ForEach-Object { $_.Trim() } | Where-Object { $_ } | Select-Object -Unique) -join ','\n[Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', $env:OLLAMA_ORIGINS, 'User')\nStart-Process -FilePath (Join-Path (Split-Path (Get-Command ollama).Source) 'ollama app.exe') -WindowStyle Hidden`
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

  return <section id="local-model-setup" tabIndex={-1} className="form-card surface-card settings-card local-connector">
    <div className="form-section-title"><span className="form-step"><Laptop size={18} /></span><div><h2>Let’s connect your local model</h2><p>We’ll guide you through it. You only need to allow this website once on each computer.</p></div></div>
    <ol className="local-setup-steps" aria-label="Local model setup progress">
      {["Open Ollama", "Allow this website", "Choose your model"].map((label, index) => <li key={label}>
        <button type="button" aria-current={(connected ? 2 : guideStep) === index ? "step" : undefined} disabled={connected || connecting} onClick={() => setGuideStep(index)}>
          <span>{connected && (index < 2 || selected) ? <CheckCircle2 size={16} /> : index + 1}</span>{label}
        </button>
      </li>)}
    </ol>
    {!connected && guideStep === 0 && <div className="local-setup-panel">
      <h3>1. Open Ollama on this computer</h3>
      <p>Ollama runs the model on your computer. If you already use it, open it now.</p>
      <p>New to Ollama? <a href="https://ollama.com/download" target="_blank" rel="noreferrer">Install Ollama</a>, open it, and download a chat model in Ollama before continuing.</p>
      <button className="primary-button" type="button" onClick={() => setGuideStep(1)}>Ollama is open — next</button>
      <button className="text-button" type="button" onClick={() => setGuideStep(2)}>Already set up this website? Connect now</button>
    </div>}
    {!connected && guideStep === 2 && <div className="local-setup-panel">
      <h3>3. Connect, then choose your model</h3>
      <p>Click Connect Ollama below. If your browser asks to access this computer’s local network, choose Allow. Your installed models will appear here after it connects.</p>
    </div>}
    <p className={connected ? "local-connector-status" : ""} role="status">{connected && <CheckCircle2 size={16} />}{relay.message}</p>
    {connected ? <>
      <label className="field-label" htmlFor="browser-local-model">Model
        <select id="browser-local-model" value={selected} disabled={saving} onChange={event => { void chooseModel(event.target.value); }}>
          <option value="">Choose an installed model</option>
          {relay.models.map(model => <option key={model} value={model}>{model}</option>)}
        </select>
      </label>
      {!relay.models.length && <p>Install a chat model in Ollama. It will appear here automatically. Embedding models are excluded.</p>}
      {selected && <><p className="local-connector-status"><CheckCircle2 size={16} /> You’re ready! Your model choice is saved.</p><Link className="primary-button" to="/workspace/research/new">Start your first research</Link></>}
      <p className="local-connector-hint">Keep Ollama running and this tab open while research runs. Prompts and results pass through ResearchPilot; model inference runs on your computer.</p>
      <button className="text-button" type="button" onClick={() => { void disconnect(); }}><Unplug size={14} /> Disconnect</button>
    </> : guideStep === 2 && <div className="local-connector-actions">
      <button className="primary-button" type="button" disabled={connecting} onClick={() => { setError(""); browserOllama.connect(); }}>
        {connecting ? <LoaderCircle size={15} className="spin" /> : <Laptop size={15} />}{connecting ? "Connecting…" : "Connect Ollama"}
      </button>
      {connecting && <button className="secondary-button" type="button" onClick={() => browserOllama.stop(true)}>Cancel</button>}
    </div>}
    {!connected && (guideStep === 1 || (guideStep === 2 && relay.phase === "error")) && <div className="ollama-browser-setup local-setup-panel">
      <h3>2. Allow ResearchPilot to use Ollama</h3>
      <p>This one-time step lets this website talk to Ollama. Copy the command below, paste it into {platform === "windows" ? "PowerShell" : "Terminal"}, and press Enter. Then come back here.</p>
      <label className="field-label" htmlFor="ollama-setup-platform">Your computer
        <select id="ollama-setup-platform" value={platform} onChange={event => { setPlatform(event.target.value); setCopied(false); }}><option value="windows">Windows</option><option value="mac">macOS</option><option value="linux">Linux</option></select>
      </label>
      <p>{platform === "windows" ? "Quit Ollama from the system tray, then run this once in PowerShell. It saves this website permission and starts Ollama with the new setting." : platform === "mac" ? "Run this once in Terminal, then quit and reopen Ollama." : "Update Ollama's service configuration with this website origin, then restart the service."}</p>
      <pre>{command}</pre>
      <button className="secondary-button" type="button" onClick={() => { void navigator.clipboard.writeText(command).then(() => setCopied(true)).catch(() => setCopied(false)); }}>{copied ? "Copied" : "Copy setup command"}</button>
      <p className="local-connector-hint">If OLLAMA_ORIGINS already contains other websites, add this website to that list. Keep Ollama on its default local address. If browser access was blocked, allow it in this site's browser permissions and reconnect.</p>
      <a href="https://docs.ollama.com/faq#how-can-i-allow-additional-web-origins-to-access-ollama" target="_blank" rel="noreferrer">Ollama setup guide</a>
      <button className="primary-button" type="button" disabled={connecting} onClick={() => setGuideStep(2)}>I’ve finished setup — next</button>
    </div>}
    {error && <p className="local-connector-error" role="alert">{error}</p>}
    <button className="text-button" type="button" onClick={() => setDesktop(true)}>Other option: use the desktop connector</button>
  </section>;
}
