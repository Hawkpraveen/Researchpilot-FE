import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Exercise the same TypeScript selector used by the dashboard, without a DOM test harness.
const source = await readFile(new URL("../src/components/dashboard/researchList.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { selectResearchJobs, jobTimestamp } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const now = Date.parse("2026-10-29T12:00:00Z");
const defaults = { query: "", status: "all", date: "all", sources: "all", sort: "updated-desc" };
const jobs = [
  { id: "old", title: "Vector 10", question: "Compare database pricing", status: "completed", sourceCount: 8, updatedAt: "Invalid", updatedAtIso: "2026-08-01T00:00:00Z" },
  { id: "recent", title: "vector 2", question: "Compare database quality", status: "partial", sourceCount: 3, updatedAt: "29/10/2026, 1:00 pm", updatedAtIso: "2026-10-29T07:30:00Z" },
  { id: "queued", title: "Cloud tools", question: "Compare providers", status: "queued", sourceCount: 0, updatedAt: "Yesterday", updatedAtIso: "2026-10-28T08:00:00Z" },
  { id: "unknown", title: "Unknown date", question: "Unavailable timestamp", status: "failed", sourceCount: 0, updatedAt: "Unknown" },
];
const ids = (options = {}) => selectResearchJobs(jobs, { ...defaults, ...options }, now).map((job) => job.id);

test("search terms combine with status, date and source filters without mutating jobs", () => {
  const before = structuredClone(jobs);
  assert.deepEqual(ids({ query: "  DATABASE vector  ", status: "partial", date: "7", sources: "with" }), ["recent"]);
  assert.deepEqual(ids({ status: "active", sources: "without" }), ["queued"]);
  assert.deepEqual(ids({ status: "completed", date: "7" }), []);
  assert.deepEqual(ids({ query: "no match" }), []);
  assert.deepEqual(jobs, before);
});

test("all six sort orders are deterministic, including unknown dates and numeric titles", () => {
  assert.deepEqual(ids(), ["recent", "queued", "old", "unknown"]);
  assert.deepEqual(ids({ sort: "updated-asc" }), ["old", "queued", "recent", "unknown"]);
  assert.deepEqual(ids({ sort: "title-asc" }), ["queued", "unknown", "recent", "old"]);
  assert.deepEqual(ids({ sort: "title-desc" }), ["old", "recent", "unknown", "queued"]);
  assert.deepEqual(ids({ sort: "sources-desc" }), ["old", "recent", "queued", "unknown"]);
  assert.deepEqual(ids({ sort: "sources-asc" }), ["queued", "unknown", "recent", "old"]);
});

test("date filtering uses ISO timestamps and inclusive rolling boundaries", () => {
  assert.equal(jobTimestamp(jobs[1], now), Date.parse(jobs[1].updatedAtIso));
  const dated = (id, stamp) => ({ ...jobs[0], id, updatedAtIso: stamp });
  const input = [dated("boundary", new Date(now - 7 * 86400000).toISOString()), dated("old", new Date(now - 7 * 86400000 - 1).toISOString()), dated("future", new Date(now + 1).toISOString()), jobs[3]];
  assert.deepEqual(selectResearchJobs(input, { ...defaults, date: "7" }, now).map((job) => job.id), ["boundary"]);
  assert.equal(selectResearchJobs(jobs, { ...defaults, date: "90" }, now).length, 3);
});

test("relative demo dates remain sortable and missing dates are excluded from date filters", () => {
  const today = jobTimestamp({ ...jobs[0], updatedAtIso: undefined, updatedAt: "Today, 10:24 AM" }, now);
  const yesterday = jobTimestamp({ ...jobs[0], updatedAtIso: undefined, updatedAt: "Yesterday" }, now);
  assert.ok(today > yesterday);
  assert.equal(jobTimestamp(jobs[3], now), null);
  assert.equal(selectResearchJobs([], defaults, now).length, 0);
});
