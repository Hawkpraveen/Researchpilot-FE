import { useEffect, useState } from "react";
import { Building2, Check, LoaderCircle } from "lucide-react";

export function WorkspaceNameSettings({ workspaceName, onSave }: { workspaceName: string; onSave: (name: string) => Promise<void> }) {
  const [name, setName] = useState(workspaceName);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => setName(workspaceName), [workspaceName]);

  const save = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await onSave(name);
      setNotice("Workspace name saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the workspace name.");
    } finally {
      setSaving(false);
    }
  };

  return <section className="form-card surface-card settings-card workspace-name-card">
    <div className="form-section-title"><span className="form-step"><Building2 size={15} /></span><div><h2>Workspace name</h2><p>This name appears in the workspace switcher and throughout your workspace.</p></div></div>
    <label className="field-label" htmlFor="workspace-settings-name">Name<input id="workspace-settings-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required /></label>
    {error && <p className="profile-form-message error" role="alert">{error}</p>}
    {notice && <p className="profile-form-message success" role="status">{notice}</p>}
    <div className="profile-settings-actions"><button className="primary-button" type="button" onClick={() => void save()} disabled={saving || !name.trim() || name.trim() === workspaceName}>{saving ? <><LoaderCircle size={15} className="spin" /> Saving…</> : <><Check size={15} /> Save workspace name</>}</button></div>
  </section>;
}
