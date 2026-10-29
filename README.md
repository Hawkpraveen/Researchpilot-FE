# ResearchPilot Web

React + TypeScript + Vite frontend for ResearchPilot, an evidence-first research and decision workspace.

The frontend provides the dashboard, research request flow, progress states,
reports, authentication screens, provider settings, and responsive layouts.
Email/password registration and login use the Node API and its bearer sessions.
The Explore demo workspace button uses the development-only API demo endpoint;
OAuth providers, phone OTP, and 2FA are UI placeholders and are not enabled.

## Source structure

Local model users select **Local LLM (your computer)** in Settings and connect
through the browser, without downloading our desktop app. After the one-time
Ollama origin setting and browser permission, choosing a model saves it immediately.
Keep Ollama and the ResearchPilot tab open while researching. See
[Browser local models](Documents/Browser-Local-Models.md) for setup and limits.
The Windows desktop connector remains an optional alternative. Its download is
served from `public/downloads/`; source/build instructions live in the agent repo
under `connector/`. Deploy the connector-compatible API/agent before this UI.

- `src/app/` composes feature hooks and the route tree.
- `src/routes/` defines URL routes and the authenticated workspace guard.
- `src/components/<feature>/` contains feature UI, exported prop contracts (`*.types.ts`), and feature hooks (`use*.ts`).
- `src/components/layout/` contains the shared authenticated workspace shell.
- `src/services/` contains API adapters; `src/types.ts` contains shared domain types.

Tailwind CSS v4 is integrated with the Vite plugin. `src/styles.css` contains global resets, theme tokens, and reusable controls. It is imported once, before the application, by `main.tsx`.

Keep feature rules in `src/components/<feature>/<feature>.styles.css` (for example, `auth/auth.styles.css`), imported by that feature's component. Keep its responsive rules, dark-theme overrides, and animations in the same file. Shared classes such as `.primary-button`, `.field-label`, and `.surface-card` belong in `src/styles.css`; reuse those classes instead of copying their definitions into feature files. Continue using component Tailwind utilities or `@apply` for new UI styling.

Start each feature stylesheet with `@reference "tailwindcss"` so its `@apply` rules can resolve Tailwind utilities without emitting another copy of Tailwind. Import it from the feature's TSX entry point, not from the global stylesheet as well. Existing feature CSS files have been consolidated into the corresponding `.styles.css` files. Before adding a rule, check the shared stylesheet and the feature file for an existing definition; intentional state, theme, and viewport overrides should remain beside their base component rule.

Project-specific setup, UI contracts, local ports, and planned backend integration are documented in [Documents/ResearchPilot-UI-Contract.md](./Documents/ResearchPilot-UI-Contract.md).

The architecture baseline is maintained in the separate [ResearchPilot-Architecture](../ResearchPilot-Architecture) repository.
