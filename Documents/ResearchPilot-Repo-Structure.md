# ResearchPilot — Repository Structure Specification

**Version:** 1.0  
**Date:** 25 October 2026  
**Status:** Proposed standard for implementation  
**Scope:** `researchpilot-FE`, `researchpilot-BE`, and `researchpilot-agent`

## 1. Purpose

This document defines how ResearchPilot source code should be organized across three separate repositories. The guiding principle is:

> **Organize by feature/domain first, keep code close to where it is used, and separate responsibilities clearly.**

For the frontend, one feature folder contains its UI, its feature logic, its local types/constants, and its tests. The API and agent use the same domain vocabulary but keep their own architectural layers.

This is a ResearchPilot-specific adaptation of the supplied repository-structure reference, not a copy of the Piqual product structure.

## 2. Repository boundaries

```text
researchpilot-FE/       React + TypeScript + Vite
researchpilot-BE/       Node.js + Express + TypeScript
researchpilot-agent/    Python + FastAPI + LangGraph
```

Each repository has its own Git history, dependency management, environment configuration, CI checks, README, and release lifecycle. Do not create a monorepo. Do not create a fourth shared-contract repository unless that decision is explicitly revisited.

## 3. Frontend — `researchpilot-FE`

### 3.1 Recommended structure

```text
researchpilot-FE/
├── src/
│   ├── app/                       # App bootstrap, providers, router, theme
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   └── providers.tsx
│   │
│   ├── pages/                     # Route shells only: compose features
│   │   ├── DashboardPage.tsx
│   │   ├── NewResearchPage.tsx
│   │   ├── ResearchJobPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── components/                # Feature folders; feature logic stays local
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── useLogin.ts
│   │   │   ├── login.types.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── research-form/
│   │   │   ├── ResearchForm.tsx
│   │   │   ├── useResearchForm.ts
│   │   │   ├── research-form.types.ts
│   │   │   ├── research-form.constants.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── job-progress/
│   │   │   ├── JobProgress.tsx
│   │   │   ├── useJobProgress.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── research-report/
│   │   │   ├── ResearchReport.tsx
│   │   │   ├── useResearchReport.ts
│   │   │   └── __tests__/
│   │   │
│   │   ├── research-history/
│   │   │   ├── ResearchHistory.tsx
│   │   │   ├── useResearchHistory.ts
│   │   │   └── __tests__/
│   │   │
│   │   └── settings/
│   │       ├── Settings.tsx
│   │       ├── useSettings.ts
│   │       └── __tests__/
│   │
│   ├── store/
│   │   ├── api/                   # Shared API base URL, auth, error handling
│   │   │   └── baseApi.ts
│   │   ├── services/              # API clients by domain
│   │   └── types/                 # Cross-feature types only
│   │
│   ├── hooks/                     # Cross-feature hooks only
│   ├── utils/                     # Pure cross-feature helpers
│   ├── constants/                 # App-wide constants
│   ├── routes/                    # Route table and route guards
│   ├── test/                      # Shared test setup, fixtures, factories
│   └── assets/
│
├── public/
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

The list of feature folders is a starting point. Add or rename a folder only when the actual product scope calls for it.

### 3.2 The feature-folder rule

A feature folder should be the first place a developer looks to understand that feature.

- **UI file (`*.tsx`)**: markup and presentation. It receives state and callbacks from its hook and renders the screen/component.
- **Logic hook (`use*.ts`)**: local state, event handlers, validation, derived values, and coordination with API clients. No JSX.
- **Feature-local types/constants**: stay beside the feature while only that feature uses them.
- **Feature tests (`__tests__/`)**: tests move and evolve with the feature.
- **Feature subcomponents**: add only when they improve readability or reuse inside that feature.

Example:

```text
components/auth/
├── Login.tsx           # UI only
├── useLogin.ts         # login state and behavior; no JSX
├── login.types.ts      # auth-screen-specific types
├── login.constants.ts  # auth-screen-specific constants, if needed
└── __tests__/
```

Prefer `useLogin.ts` to `login_functions.tsx`: React hooks follow the `use...` naming convention, and `.ts` signals that the file contains no JSX. A non-hook pure function can use a domain-specific `.ts` filename when that is clearer.

### 3.3 Responsibilities

**`pages/`**
- Select layout and mount features.
- Keep page components thin.
- No feature-specific fetch calls, handlers, validation rules, or business logic.

**`components/<feature>/`**
- Own the feature UI and feature-specific logic.
- Call API clients from the shared API layer rather than embedding raw network configuration.
- Keep local types/constants/tests with the feature.

**`store/api/` and `store/services/`**
- Own cross-feature API configuration and domain API client functions.
- A feature hook calls a service function; it does not duplicate base URL, headers, or common error parsing.
- Keep provider keys and server secrets out of frontend code and all `VITE_*` variables.

**`hooks/`, `utils/`, and `constants/`**
- Cross-cutting only.
- Do not put a feature's hook in the root `hooks/` folder.
- Promote a helper when a second feature genuinely needs it; do not create shared abstractions speculatively.

**`ui/` shared primitives**
- If needed, create `components/ui/` for generic controls such as Button, Modal, Input, and Spinner.
- Shared primitives must not contain ResearchPilot business logic.

## 4. API — `researchpilot-BE`

The API is the public entry point and the source of truth for job lifecycle, persistence, public API contracts, and progress events. Keep the domain names consistent with the frontend and agent, while separating transport, business logic, data access, and infrastructure.

### 4.1 Recommended structure

```text
researchpilot-BE/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── routes/                    # URL surface; wiring only
│   │   ├── researchJobs.routes.ts
│   │   ├── reports.routes.ts
│   │   └── health.routes.ts
│   ├── middleware/                # Validation, auth, rate limit, errors
│   ├── guardrails/                # Request limits, ownership and safety policy
│   ├── controllers/               # HTTP request in → response out
│   │   ├── researchJobs.controller.ts
│   │   └── reports.controller.ts
│   ├── services/                  # Domain business logic/orchestration
│   │   ├── research-jobs/
│   │   │   ├── researchJobs.service.ts
│   │   │   ├── researchJobs.queue.ts
│   │   │   └── __tests__/
│   │   ├── reports/
│   │   │   ├── reports.service.ts
│   │   │   └── __tests__/
│   │   └── events/
│   │       ├── events.service.ts
│   │       └── __tests__/
│   ├── models/                    # Persistence schemas by domain
│   │   ├── research-jobs/
│   │   ├── sources/
│   │   ├── evidence/
│   │   ├── reports/
│   │   └── events/
│   ├── repositories/              # Database access (recommended explicit layer)
│   ├── jobs/
│   │   ├── queues/                # Queue workers
│   │   └── schedulers/            # Only if scheduled jobs are introduced
│   ├── integrations/              # Provider clients behind interfaces
│   │   ├── agent/
│   │   └── search/                # If API owns search integration
│   ├── config/                    # Environment validation and configuration
│   ├── lib/                       # Pure helpers; no I/O
│   └── tests/                     # Integration and end-to-end tests
│
├── openapi/
│   └── openapi.yaml               # Canonical public API contract
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### 4.2 Layering rules

- **Routes** map URLs and middleware to controllers; they contain no business logic.
- **Controllers** parse the HTTP request, call a service, and shape the HTTP response. They do not implement research workflow rules.
- **Services** own domain decisions and orchestration. A service should not depend directly on Express `req` or `res`.
- **Repositories/models** own persistence details. Agent orchestration should not write directly to the database.
- **Integrations** wrap external systems (agent service, search provider, model/provider clients if owned here) behind narrow interfaces.
- **Helpers/lib** are pure transformations. They do not orchestrate workflows or hide I/O.
- **Middleware/guardrails** enforce cross-cutting request validation, rate limits, ownership checks, and security policy.
- **Queue workers** handle background work and retries. They call services; they do not duplicate domain rules.

A repository layer is recommended if it makes persistence boundaries clearer; avoid adding empty abstraction files without a concrete need.

## 5. Agent — `researchpilot-agent`

The Python service owns the research workflow and LangGraph execution. It should be stateless from the API's point of view: receive a versioned request, execute bounded work, and return structured JSON. In the initial design, the API remains the only writer to the product database.

### 5.1 Recommended structure

```text
researchpilot-agent/
├── app/
│   ├── main.py                    # FastAPI app and router registration
│   ├── routers/                   # Validate and dispatch requests
│   │   └── research.py
│   ├── services/
│   │   └── research/
│   │       ├── service.py         # Orchestration entry point
│   │       ├── graph.py           # LangGraph nodes and conditional edges
│   │       ├── state.py            # Typed graph state
│   │       ├── schemas.py         # Typed request/result/evidence models
│   │       ├── nodes/             # Optional when graph nodes grow
│   │       └── __tests__/
│   ├── prompts/                   # Prompt assets, not inline long strings
│   │   ├── registry.py            # Prompt name and version lookup
│   │   └── research/
│   ├── guardrails/                # Input/output checks and injection defenses
│   ├── providers/                 # LLM, search, fetcher, extractor interfaces
│   ├── core/                      # Execution budgets, tracing, checkpoints
│   ├── config/                    # Environment/model configuration
│   ├── utils/                     # Pure shared helpers
│   └── tests/                     # Integration and end-to-end tests
│
├── pyproject.toml
├── .env.example
└── README.md
```

### 5.2 Agent rules

- Router validates and dispatches; it does not contain graph logic.
- `service.py` is the orchestration entry point; `graph.py` defines the graph.
- Keep graph state and typed input/output schemas explicit.
- Prompts are versioned assets in `prompts/`, not scattered inline string literals.
- Run input guardrails before untrusted content enters the workflow and output validation before results leave it.
- Provider integrations sit behind interfaces so Ollama and any explicitly configured eligible cloud/BYOK provider can be swapped without rewriting the graph.
- The agent does not directly access or write the product database in the initial architecture.
- Keep the loop bounded by configured page, subtask, retry, and follow-up-round budgets.

## 6. Domain vocabulary across repositories

Use the same canonical names across all three repositories:

| Domain | Frontend feature | API area | Agent area |
|---|---|---|---|
| `auth` | `components/auth/` | Auth routes/services only if auth is implemented | Usually not required for research execution |
| `research-jobs` | `components/research-form/`, `components/job-progress/` | `researchJobs` routes/controllers/services | `services/research/` |
| `research-history` | `components/research-history/` | research job query service | Not a separate agent domain |
| `sources` | Usually displayed within report UI | sources persistence/service | source collection and normalization |
| `evidence` | Evidence/citation UI inside report feature | evidence persistence/service | evidence extraction and verification |
| `reports` | `components/research-report/` | report routes/controllers/services | report generation/quality gate |
| `settings` | `components/settings/` | settings APIs only if needed | provider/configuration only where appropriate |

Not every frontend feature must become a separate backend service or agent graph. Use the same vocabulary where a domain exists; do not create artificial modules solely to make folder names match.

## 7. Cross-repository contracts without a monorepo

- `researchpilot-BE/openapi/openapi.yaml` is the canonical public API contract.
- The frontend generates or maintains its typed client from a pinned API schema version.
- The agent defines typed internal request/response schemas and contract tests.
- Keep versioned JSON fixtures in the API and agent repositories, and test them against one another in CI where possible.
- Include `contractVersion` on the API-to-agent request/response.
- Do not create a fourth shared-contract repository unless explicitly approved.

## 8. Testing conventions

- Unit tests live beside the feature/service/helper they cover, in a local `__tests__/` folder or equivalent naming convention.
- Root `test/` or `tests/` folders are for shared setup, fixtures, factories, integration tests, and end-to-end tests that cross boundaries.
- Agent tests include prompt regressions, guardrail regressions, schema validation, graph branching, and provider failure cases.
- Test the zero-spend guarantee: if a provider is missing or quota is exhausted, the application must not call a paid fallback.
- Do not claim a test passes until it has actually been run.

## 9. Naming conventions

- React UI components: `PascalCase.tsx`, e.g. `ResearchForm.tsx`.
- React custom hooks: `useCamelCase.ts`, e.g. `useResearchForm.ts`.
- Feature-local types/constants: `<feature>.types.ts`, `<feature>.constants.ts`.
- Node files: use consistent domain names and `.routes.ts`, `.controller.ts`, `.service.ts`, `.repository.ts` suffixes.
- Python modules: `snake_case.py`.
- Use one canonical spelling for a domain across repositories.
- Avoid generic dumping grounds such as `helpers/` or `utils/` for feature-specific code.

## 10. What not to do

- Do not put all UI handlers and fetch calls directly in a page/component.
- Do not move feature hooks to a global `hooks/` folder just because they are hooks.
- Do not create shared abstractions before there is a real second consumer.
- Do not let controllers contain business logic or services depend on HTTP request/response objects.
- Do not let the agent write directly to the product database in the initial architecture.
- Do not scatter prompts through graph nodes.
- Do not allow unbounded agent loops or automatic paid-provider fallback.
- Do not add empty folders/files purely to match this diagram; create modules when implementation requires them.

## 11. Adoption checklist

- [ ] Create the three separate repositories.
- [ ] Add a README and `.env.example` to each repository.
- [ ] Add lint/format/type-check/test commands.
- [ ] Establish the frontend feature-folder rule.
- [ ] Establish API route/controller/service/repository boundaries.
- [ ] Establish agent router/service/graph/schema/prompt boundaries.
- [ ] Add OpenAPI and versioned agent contracts.
- [ ] Add CI checks for schema and contract drift.
- [ ] Keep tests beside their feature and integration tests at repository level.
- [ ] Document any deviation from this structure in a short architecture decision record.



