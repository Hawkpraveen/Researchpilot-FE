import { useState } from "react";
import { checkAgentConnection, saveProviderConfig } from "../../services/researchApi";
import type { ProviderConfig } from "../../types";

const defaultConfig: ProviderConfig = {
  mode: "local",
  provider: "ollama",
  endpoint: "http://localhost:11434",
  model: "llama3.1",
  apiKey: "",
};

export function useProviderSettings() {
  const [config, setConfig] = useState<ProviderConfig>(defaultConfig);
  const [connectionState, setConnectionState] = useState<{ connected: boolean; message: string } | null>(null);

  const save = async () => {
    await saveProviderConfig(config);
    setConnectionState({ connected: true, message: "Provider configuration saved" });
  };

  const testConnection = async () => {
    setConnectionState(await checkAgentConnection());
  };

  return { config, setConfig, connectionState, save, testConnection };
}
