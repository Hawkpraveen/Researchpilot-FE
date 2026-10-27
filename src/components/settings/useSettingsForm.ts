import { useState } from "react";
import type { ProviderConfig } from "../../types";

export function useSettingsForm(config: ProviderConfig, onChange: (config: ProviderConfig) => void, onSave: () => Promise<void>) {
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<ProviderConfig>) => onChange({ ...config, ...patch });

  const save = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return { saving, update, save };
}
