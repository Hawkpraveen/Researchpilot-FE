import type { ProviderConfig } from "../../types";

export interface SettingsProps {
  config: ProviderConfig;
  connectionState: { connected: boolean; message: string; models?: string[] } | null;
  onChange: (config: ProviderConfig) => void;
  onSave: () => Promise<void>;
  onTest: () => Promise<void>;
  workspaceName: string;
  onSaveWorkspaceName: (name: string) => Promise<void>;
}
