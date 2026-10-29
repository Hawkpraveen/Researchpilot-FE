import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { checkAgentConnection, getProviderConfig, getWorkspaceName, saveProviderConfig, saveWorkspaceName as requestSaveWorkspaceName } from "../../services/researchApi";
import type { ProviderConfig } from "../../types";
import { messages } from "../../constants/messages";
import { request } from "../../services/apiClient";

const defaultConfig: ProviderConfig = {
  mode: "local",
  provider: "ollama",
  endpoint: "http://connector.local",
  model: "llama3.2:3b",
  apiKey: "",
};

export function useProviderSettings(enabled: boolean) {
  const location = useLocation();
  const autoLoadModels = enabled && location.pathname.endsWith("/settings");
  const [config, setConfig] = useState<ProviderConfig>(defaultConfig);
  const [connectionState, setConnectionState] = useState<{ connected: boolean; message: string; models?: string[] } | null>(null);
  const [workspaceName, setWorkspaceName] = useState("Personal workspace");
  const testSequence = useRef(0);
  const autoTestTimer = useRef<number | undefined>(undefined);

  const testConfig = async (candidate: ProviderConfig) => {
    const sequence = ++testSequence.current;
    const result = candidate.mode === "local"
      ? await request<{ connected: boolean; message: string; models: string[] }>("/connectors/status")
      : await checkAgentConnection(candidate);
    if (sequence === testSequence.current) setConnectionState(result);
  };

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void getProviderConfig().then((nextConfig) => {
      if (active) setConfig(nextConfig);
      if (active && autoLoadModels) void testConfig(nextConfig);
    }).catch(() => undefined);
    void getWorkspaceName().then(({ workspace_name }) => {
      if (active) setWorkspaceName(workspace_name);
    }).catch(() => undefined);
    return () => {
      active = false;
      if (autoTestTimer.current !== undefined) window.clearTimeout(autoTestTimer.current);
      testSequence.current += 1;
    };
  }, [enabled, autoLoadModels]);

  const save = async () => {
    await saveProviderConfig(config);
    setConnectionState((current) => ({ connected: true, message: messages.providerSaved, ...(current?.models ? { models: current.models } : {}) }));
  };

  const updateConfig = (nextConfig: ProviderConfig) => {
    setConfig(nextConfig);
    const agentChanged = nextConfig.provider !== config.provider
      || nextConfig.endpoint !== config.endpoint
      || nextConfig.apiKey !== config.apiKey;
    if (agentChanged) {
      setConnectionState(null);
      if (autoTestTimer.current !== undefined) window.clearTimeout(autoTestTimer.current);
      if (autoLoadModels) autoTestTimer.current = window.setTimeout(() => { void testConfig(nextConfig); }, 500);
      return;
    }
    if (nextConfig.model !== config.model) {
      setConnectionState((current) => current?.models
        ? {
          ...current,
          connected: current.models.includes(nextConfig.model),
          message: current.models.includes(nextConfig.model)
            ? `Connected; ${current.models.length} models are available.`
            : "The selected model is not available from this agent.",
        }
        : current);
    }
  };

  const testConnection = async () => {
    await testConfig(config);
  };

  const saveWorkspaceName = async (nextName: string) => {
    const result = await requestSaveWorkspaceName(nextName);
    setWorkspaceName(result.workspace_name);
  };

  return { config, setConfig: updateConfig, connectionState, workspaceName, saveWorkspaceName, save, testConnection };
}
