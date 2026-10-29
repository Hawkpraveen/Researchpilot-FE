import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/services/browserRelayClient.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { BrowserRelayClient } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const json = (value, status = 200) => new Response(JSON.stringify(value), { status });
const waitFor = async predicate => {
  for (let i = 0; i < 100; i++) { if (predicate()) return; await new Promise(resolve => setTimeout(resolve, 5)); }
  assert.fail("Timed out waiting for relay state");
};
function fixture(task, overrides = {}) {
  const localCalls = [], apiCalls = [], remembered = [];
  let claimed = false;
  const dependencies = {
    remember: (...args) => remembered.push(args),
    fetch: async (url, init) => {
      localCalls.push({ url, init });
      if (url.endsWith("/api/tags")) return json({ models: [{ name: "chat" }, { name: "embeddings" }] });
      if (url.endsWith("/api/show")) return json({ capabilities: [JSON.parse(init.body).model === "chat" ? "completion" : "embedding"] });
      return json({ message: { content: '{"ok":true}' }, prompt_eval_count: 5, eval_count: 3 });
    },
    api: async (path, init) => {
      apiCalls.push({ path, init });
      if (path.endsWith("/pairings")) return { code: "single-use-code" };
      if (path.endsWith("/pair")) return { token: "memory-only-secret" };
      if (path.endsWith("/results")) return;
      if (task && !claimed) { claimed = true; return { task }; }
      return new Promise((_resolve, reject) => {
        const abort = () => reject(new DOMException("Stopped", "AbortError"));
        if (init.signal.aborted) abort(); else init.signal.addEventListener("abort", abort, { once: true });
      });
    }, ...overrides,
  };
  const relay = new BrowserRelayClient(dependencies);
  relay.setScope("tenant/workspace/user");
  return { relay, localCalls, apiCalls, remembered };
}

test("browser relays native Ollama chat and usage, excludes embeddings, and never sends device credentials to localhost", async () => {
  const f = fixture({ id: "task", payload: { model: "chat", messages: [{ role: "user", content: "Return JSON" }], stream: false, format: { type: "object" }, options: { num_ctx: 4096, num_predict: 16 } } });
  try {
    f.relay.connect();
    await waitFor(() => f.apiCalls.some(call => call.path.endsWith("/results")));
    assert.deepEqual(f.relay.getSnapshot().models, ["chat"]);
    assert.deepEqual(f.remembered, [["tenant/workspace/user", true]]);
    const local = f.localCalls.find(call => call.url.endsWith("/api/chat"));
    assert.equal(local.url, "http://127.0.0.1:11434/api/chat");
    for (const call of f.localCalls) {
      assert.equal(new Headers(call.init.headers).has("Authorization"), false);
      assert.equal(call.init.credentials, "omit");
      assert.equal(call.init.redirect, "error");
    }
    const result = f.apiCalls.find(call => call.path.endsWith("/results"));
    assert.equal(result.init.headers.Authorization, "Bearer memory-only-secret");
    assert.equal(JSON.parse(result.init.body).result.eval_count, 3);
  } finally { f.relay.stop(); }
});

test("uninstalled models and invalid budgets cannot trigger local inference", async () => {
  for (const payload of [{ model: "embeddings", options: {} }, { model: "chat", options: { num_predict: 999999 } }]) {
    const f = fixture({ id: "task", payload: { messages: [], stream: false, format: {}, ...payload } });
    try {
      f.relay.connect();
      await waitFor(() => f.apiCalls.some(call => call.path.endsWith("/results")));
      assert.equal(f.localCalls.some(call => call.url.endsWith("/api/chat")), false);
      assert.equal(typeof JSON.parse(f.apiCalls.find(call => call.path.endsWith("/results")).init.body).error, "string");
    } finally { f.relay.stop(); }
  }
});

test("Ollama origin rejection does not pair a computer or expose credentials", async () => {
  const f = fixture(null, { fetch: async () => json({ error: "Forbidden" }, 403) });
  try {
    f.relay.connect();
    await waitFor(() => f.relay.getSnapshot().phase === "error");
    assert.equal(f.apiCalls.length, 0);
    assert.match(f.relay.getSnapshot().message, /allowed this website/);
  } finally { f.relay.stop(); }
});

test("tab lock prevents competing relays and account changes abort pending polling", async () => {
  const denied = fixture(null, { withLock: async () => false });
  denied.relay.connect();
  await waitFor(() => denied.relay.getSnapshot().phase === "error");
  assert.equal(denied.localCalls.length, 0);
  denied.relay.stop();

  const f = fixture(null);
  f.relay.connect();
  await waitFor(() => f.apiCalls.some(call => call.path.endsWith("/poll")));
  const polling = f.apiCalls.find(call => call.path.endsWith("/poll"));
  f.relay.setScope("different/account/workspace");
  assert.equal(polling.init.signal.aborted, true);
  assert.equal(f.relay.getSnapshot().phase, "idle");
});

test("revoked browser connections stop and require explicit reconnection", async () => {
  const f = fixture(null, { api: async path => {
    if (path.endsWith("/pairings")) return { code: "one-use-code" };
    if (path.endsWith("/pair")) return { token: "not-persisted" };
    throw Object.assign(new Error("Revoked"), { status: 401 });
  } });
  try {
    f.relay.connect();
    await waitFor(() => f.relay.getSnapshot().phase === "error");
    assert.deepEqual(f.remembered.at(-1), ["tenant/workspace/user", false]);
    assert.match(f.relay.getSnapshot().message, /replaced or expired/);
  } finally { f.relay.stop(); }
});
