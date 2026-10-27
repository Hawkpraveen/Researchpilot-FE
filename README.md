# ResearchPilot Web

React + TypeScript + Vite frontend for ResearchPilot, an evidence-first research and decision workspace.

The frontend provides the dashboard, research request flow, progress states,
reports, authentication screens, provider settings, and responsive layouts.
Email/password registration and login use the Node API and its bearer sessions.
The Explore demo workspace button uses the development-only API demo endpoint;
OAuth providers, phone OTP, and 2FA are UI placeholders and are not enabled.

## Source structure

- `src/app/` composes feature hooks and the route tree.
- `src/routes/` defines URL routes and the authenticated workspace guard.
- `src/components/<feature>/` contains feature UI, exported prop contracts (`*.types.ts`), and feature hooks (`use*.ts`).
- `src/components/layout/` contains the shared authenticated workspace shell.
- `src/services/` contains API adapters; `src/types.ts` contains shared domain types.

Tailwind CSS v4 is integrated with the Vite plugin and is used across the full app. Component styles in `src/styles.css` are composed from Tailwind utilities with `@apply`, including arbitrary-property utilities for design values that do not have a built-in token. Keep theme variables and keyframe animations in CSS; add new screen styling as Tailwind utilities in the component or as Tailwind `@apply` rules rather than writing standalone CSS declarations. The shared surface utility also lives in `src/styles.css`.

Project-specific setup, UI contracts, local ports, and planned backend integration are documented in [Documents/ResearchPilot-UI-Contract.md](./Documents/ResearchPilot-UI-Contract.md).

The architecture baseline is maintained in the separate [ResearchPilot-Architecture](../ResearchPilot-Architecture) repository.
