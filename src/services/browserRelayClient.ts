export interface BrowserRelayState {
  phase: "idle" | "connecting" | "ready" | "error";
  models: string[];
  message: string;
}
interface Task { id: string; payload: Record<string, unknown> }
export interface BrowserRelayDependencies {
  api<T>(path: string, init?: RequestInit): Promise<T>;
  fetch: typeof fetch;
  remember(scope: string, enabled: boolean): void;
  withLock?: (scope: string, work: () => Promise<void>) => Promise<boolean>;
}

const LOCAL = "http://127.0.0.1:11434";
const MAX_BYTES = 256 * 1024;
const initial = (): BrowserRelayState => ({ phase: "idle", models: [], message: "Connect to Ollama running on this computer." });
const unauthorized = (error: unknown) => typeof error === "object" && error !== null && "status" in error && error.status === 401;

/** Runs only while the signed-in app tab is open. Device credentials stay in memory. */
export class BrowserRelayClient {
  private state = initial();
  private listeners = new Set<() => void>();
  private scope: string | null = null;
  private controller: AbortController | undefined;
  private capabilities = new Map<string, boolean>();
  private generating = false;
  constructor(private readonly dependencies: BrowserRelayDependencies) {}
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private update(value: Partial<BrowserRelayState>) { this.state = { ...this.state, ...value }; this.listeners.forEach(listener => listener()); }
  setScope(scope: string | null) {
    if (scope === this.scope) return;
    this.stop();
    this.scope = scope;
  }
  stop(forget = false) {
    this.controller?.abort();
    this.controller = undefined;
    this.generating = false;
    if (forget && this.scope) this.dependencies.remember(this.scope, false);
    this.update(initial());
  }
  connect() {
    if (!this.scope) { this.update({ phase: "error", message: "Sign in before connecting a local model." }); return; }
    if (this.controller && this.state.phase !== "error") return;
    this.stop();
    const controller = new AbortController();
    const scope = this.scope;
    this.controller = controller;
    this.capabilities.clear();
    this.update({ phase: "connecting", message: "Connecting to Ollama. Allow local access if your browser asks." });
    const work = () => this.run(scope, controller);
    const execution = this.dependencies.withLock ? this.dependencies.withLock(scope, work) : work().then(() => true);
    void execution.then(acquired => {
      if (!acquired && this.controller === controller) {
        this.controller = undefined;
        this.update({ phase: "error", models: [], message: "Another ResearchPilot tab is using local models. Use that tab, or disconnect it first." });
      }
    }).catch(error => {
      if (controller.signal.aborted || this.controller !== controller) return;
      controller.abort();
      this.controller = undefined;
      this.update({ phase: "error", models: [], message: error instanceof TypeError
        ? "Ollama could not be reached. Start it, allow this website in Ollama, and allow local access in browser settings."
        : error instanceof Error ? error.message : "Could not connect to Ollama." });
    });
  }
  private async local(path: "/api/tags" | "/api/show" | "/api/chat", signal: AbortSignal, body?: unknown, timeout = 6000) {
    const abort = new AbortController();
    const cancel = () => abort.abort();
    if (signal.aborted) abort.abort();
    signal.addEventListener("abort", cancel, { once: true });
    const timer = setTimeout(cancel, timeout);
    try {
      const response = await this.dependencies.fetch(LOCAL + path, {
        ...(body === undefined ? {} : { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
        credentials: "omit", cache: "no-store", redirect: "error", signal: abort.signal,
      });
      if (!response.ok) throw new Error(response.status === 403
        ? "Ollama has not allowed this website yet. Follow the one-time browser setup below."
        : `Ollama returned HTTP ${response.status}. Check that the selected chat model is available.`);
      const text = await response.text();
      if (new TextEncoder().encode(text).length > MAX_BYTES) throw new Error("The local model response is too large.");
      const value: unknown = JSON.parse(text);
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Ollama returned an invalid response.");
      return value as Record<string, unknown>;
    } catch (error) {
      if (!signal.aborted && abort.signal.aborted) throw new Error("Ollama took too long to respond. Check it is running or choose a smaller model.");
      throw error;
    } finally { clearTimeout(timer); signal.removeEventListener("abort", cancel); }
  }
  private async discover(signal: AbortSignal) {
    const tags = await this.local("/api/tags", signal);
    const installed = (Array.isArray(tags.models) ? tags.models : []).flatMap((model: unknown) => {
      return typeof model === "object" && model !== null && "name" in model && typeof model.name === "string" ? [model.name] : [];
    }).slice(0, 200);
    for (const model of installed) {
      if (!this.capabilities.has(model)) {
        const details = await this.local("/api/show", signal, { model });
        this.capabilities.set(model, Array.isArray(details.capabilities) && details.capabilities.includes("completion"));
      }
    }
    return installed.filter(model => this.capabilities.get(model));
  }
  private async generate(task: Task, token: string, controller: AbortController) {
    const { signal } = controller;
    const complete = (body: object) => this.dependencies.api("/connectors/runtime/results", {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, signal,
      body: JSON.stringify({ taskId: task.id, ...body }),
    });
    try {
      const payload = task.payload;
      if (typeof payload.model !== "string" || !this.state.models.includes(payload.model)
        || !Array.isArray(payload.messages) || payload.messages.length > 100 || payload.stream !== false) {
        throw new Error("The request does not target an available local chat model.");
      }
      const options = payload.options as Record<string, unknown> | undefined;
      const context = options?.num_ctx ?? 8192, predict = options?.num_predict ?? 2500;
      if (!Number.isInteger(context) || Number(context) < 1 || Number(context) > 16384
        || !Number.isInteger(predict) || Number(predict) < 1 || Number(predict) > 4096) throw new Error("Invalid local model budget.");
      const body = { model: payload.model, messages: payload.messages, stream: false, format: payload.format,
        options: { num_ctx: context, num_predict: predict, temperature: 0 } };
      if (new TextEncoder().encode(JSON.stringify(body)).length > MAX_BYTES) throw new Error("The model request is too large.");
      const result = await this.local("/api/chat", signal, body, 105000);
      if (!signal.aborted) await complete({ result });
    } catch {
      if (!signal.aborted) await complete({ error: "The browser could not complete the local model request." }).catch(() => undefined);
    } finally { if (this.controller === controller) this.generating = false; }
  }
  private async wait(signal: AbortSignal, duration: number) {
    await new Promise<void>(resolve => {
      const done = () => { clearTimeout(timer); signal.removeEventListener("abort", done); resolve(); };
      const timer = setTimeout(done, duration);
      signal.addEventListener("abort", done, { once: true });
      if (signal.aborted) done();
    });
  }
  private async run(scope: string, controller: AbortController) {
    const { signal } = controller;
    if (signal.aborted) return;
    let models = await this.discover(signal);
    const pairing = await this.dependencies.api<{ code: string }>("/connectors/pairings", { method: "POST", signal });
    const device = await this.dependencies.api<{ token: string }>("/connectors/pair", {
      method: "POST", body: JSON.stringify({ code: pairing.code, name: "This browser" }), signal,
    });
    if (signal.aborted || this.controller !== controller) return;
    this.dependencies.remember(scope, true);
    this.update({ phase: "ready", models, message: "Ollama is connected through this tab." });
    while (!signal.aborted) {
      let response: { task: Task | null };
      try {
        response = await this.dependencies.api("/connectors/runtime/poll", {
          method: "POST", headers: { Authorization: `Bearer ${device.token}` }, signal, body: JSON.stringify({ models }),
        });
      } catch (error) {
        if (signal.aborted) return;
        if (unauthorized(error)) {
          this.dependencies.remember(scope, false);
          throw new Error("This connection was replaced or expired. Connect Ollama again from Settings.");
        }
        this.update({ phase: "connecting", message: "Reconnecting to ResearchPilot. Keep this tab open." });
        await this.wait(signal, 3000);
        continue;
      }
      if (signal.aborted) return;
      this.update({ phase: "ready", message: "Ollama is connected through this tab." });
      if (response.task) {
        if (this.generating) {
          await this.dependencies.api("/connectors/runtime/results", { method: "POST", headers: { Authorization: `Bearer ${device.token}` }, signal,
            body: JSON.stringify({ taskId: response.task.id, error: "This tab is already running a model request." }) }).catch(() => undefined);
        } else {
          this.generating = true;
          void this.generate(response.task, device.token, controller);
        }
      }
      await this.wait(signal, 1000);
      if (signal.aborted) return;
      models = await this.discover(signal);
      this.update({ models });
    }
  }
}
