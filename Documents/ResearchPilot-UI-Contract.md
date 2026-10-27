# ResearchPilot Web — UI Contract

**Status:** UI-only prototype

This document describes the screens and states that the future API and local agent must support. It intentionally does not contain credentials or secrets.

## Local development

- Frontend: `http://localhost:8080`
- Backend target: `http://localhost:5000`
- Demo mode is enabled by default.

Run the UI with:

```bash
npm install
npm run dev
```

## UI areas

- Authentication: password login, two-factor verification, OAuth entry points, and phone OTP entry point.
- Roles: `super_admin` and `user`. The UI hides admin-only surfaces for regular users, while the backend must enforce authorization.
- Workspace: dashboard, research history, new research form, staged progress, report overview, sources/evidence, and settings.
- Provider setup: local Ollama, OpenAI, Claude, or custom OpenAI-compatible endpoint.
- Theme selection: light and dark themes are available from the UI; custom themes are deferred.
- Safety states: no automatic paid fallback, visible provider mode, evidence gaps, and connection failures.

## Frontend routes

- `/login` — sign-in and demo-login screen.
- `/signup` — account-creation preview.
- `/verify` — two-factor challenge; available only while a challenge is active.
- `/workspace` — authenticated overview.
- `/workspace/research/new` — new research request.
- `/workspace/research/:jobId` — report or progress view for a research job.
- `/workspace/settings` — provider settings.

Workspace routes require an in-memory UI session and redirect to `/login` when signed out. The root path redirects to `/login` or `/workspace` depending on the current session. This prototype does not persist authentication across reloads; the API must enforce authorization independently.

## Future backend contract

The UI adapters are isolated in `src/services/`. The planned API surface is:

- `/auth/login`
- `/auth/2fa/verify`
- `/auth/google`, `/auth/microsoft`, `/auth/github`
- `/auth/phone/request`
- `/research-jobs`
- `/research-jobs/:id`
- `/research-jobs/:id/events`
- `/health`
- `/settings/provider`

These routes are placeholders for the backend phase. The current UI demo does not require a running backend.

## Security boundary

The browser may render role-aware screens, but it must never be the source of truth for authorization. The backend must verify sessions, enforce `super_admin` access, protect provider secrets, implement 2FA, and validate OAuth/phone identities.
