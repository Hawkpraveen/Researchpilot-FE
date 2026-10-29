import { useEffect, useState } from "react";
import { CheckCircle2, Download, Laptop, LoaderCircle, Unplug } from "lucide-react";
import { request } from "../../services/apiClient";
import { saveProviderConfig } from "../../services/researchApi";
import type { ProviderConfig } from "../../types";

import { CONNECTOR_ENDPOINT } from "../../constants/localModels";
interface Status { connected: boolean; name: string | null; models: string[]; message: string }
export function DesktopConnector({ config, onChange }: { config: ProviderConfig; onChange: (config: ProviderConfig) => void }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [paired, setPaired] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = () => { void request<Status>("/connectors/status").then(value => { if (active) setStatus(value); }).catch(() => { if (active) setStatus(null); }); };
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const connect = async () => {
    setWorking(true); setError("");
    try {
      const local = await fetch("http://127.0.0.1:11436/status", { signal: AbortSignal.timeout(5000), credentials: "omit" });
      if (!local.ok) throw new Error("Open ResearchPilot Connector on this computer, then try again.");
      const { code } = await request<{ code: string }>("/connectors/pairings", { method: "POST" });
      const response = await fetch("http://127.0.0.1:11436/pair", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }), signal: AbortSignal.timeout(20000), credentials: "omit" });
      if (!response.ok) throw new Error("Could not connect this computer. Try again.");
      setPaired(true);
      setStatus(await request<Status>("/connectors/status"));
    } catch (cause) {
      setError(cause instanceof TypeError || (cause instanceof DOMException && cause.name === "TimeoutError")
        ? "Open the connector and allow this site's local-network access in your browser, then try again."
        : cause instanceof Error ? cause.message : "Could not connect this computer.");
    } finally { setWorking(false); }
  };
  const selectModel = async (model: string) => {
    if (!model) return;
    setWorking(true); setError(""); setSaved(false);
    try {
      const next: ProviderConfig = { mode: "local", provider: "ollama", endpoint: CONNECTOR_ENDPOINT, model, apiKey: "" };
      await saveProviderConfig(next);
      onChange(next); setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not select this model."); }
    finally { setWorking(false); }
  };
  const disconnect = async () => {
    setWorking(true); setError("");
    try { await request("/connectors/connection", { method: "DELETE" }); setStatus(null); setSaved(false); setPaired(false); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not disconnect."); }
    finally { setWorking(false); }
  };
  const selected = config.endpoint === CONNECTOR_ENDPOINT && status?.models.includes(config.model) ? config.model : "";
  return <section className="form-card surface-card settings-card local-connector">
    <div className="form-section-title"><span className="form-step"><Laptop size={18} /></span><div><h2>Your local models</h2><p>Run research on your computer with Ollama.</p></div></div>
    {status?.connected ? <>
      <p className="local-connector-status"><CheckCircle2 size={16} /> {status.name || "Your computer"} is connected</p>
      <label className="field-label" htmlFor="connector-model">Model
        <select id="connector-model" value={selected} disabled={working} onChange={event => { void selectModel(event.target.value); }}>
          <option value="">Choose an installed model</option>
          {status.models.map(model => <option key={model} value={model}>{model}</option>)}
        </select>
      </label>
      {!status.models.length && <p>Download a chat model in Ollama. It will appear here automatically.</p>}
      {(saved || selected) && <p className="local-connector-status" role="status"><CheckCircle2 size={16} /> Ready to research. Keep Ollama and the connector running.</p>}
      <button className="text-button" type="button" disabled={working} onClick={() => { void disconnect(); }}><Unplug size={14} /> Disconnect this computer</button>
    </> : <>
      <p>{paired ? "Computer paired. Waiting for Ollama to report your models…" : "First time? Install and open the Windows connector. After that, just choose your model."}</p>
      <div className="local-connector-actions">
        {!paired && <a className="secondary-button" href="/downloads/ResearchPilot-Connector.zip" download><Download size={15} /> Download connector</a>}
        <button className="primary-button" type="button" disabled={working} onClick={() => { void connect(); }}>{working ? <LoaderCircle className="spin" size={15} /> : <Laptop size={15} />} Connect this computer</button>
      </div>
      <p className="local-connector-hint">Install Ollama and a chat model first. Allow local-network access when your browser asks.</p>
    </>}
    {error && <p className="local-connector-error" role="alert">{error}</p>}
  </section>;
}

