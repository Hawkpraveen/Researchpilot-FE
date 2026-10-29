# Local models through the browser

The default Local LLM connection uses the open ResearchPilot tab to reach
Ollama directly on `http://127.0.0.1:11434`. Users do not need the ResearchPilot
desktop connector, a tunnel, or a model API key. They still need Ollama and a
chat model installed, and must keep Ollama and the tab running during research.

## One-time user setup

1. Open Settings and choose **Local LLM (your computer)**.
2. Expand **First-time Ollama browser setup**. Add the exact website origin to
   `OLLAMA_ORIGINS` using the instructions for Windows, macOS or Linux, then
   restart Ollama. Preserve other existing origins; do not use a wildcard.
3. Click **Connect Ollama** and allow the browser's loopback/local-network
   permission when requested.
4. Choose an installed chat model. It saves immediately and is ready for research.

The browser cannot silently change Ollama's settings. Keep Ollama bound to its
default loopback address; there is no need for public listening or port forwarding.
Browsers that do not allow the cross-origin loopback request can use the desktop
connector under **Other option**, or a configured cloud model provider.

## Runtime and privacy

The relay is mounted at the App level, so navigating from Settings to a research
page does not stop it. The existing authenticated pairing/queue protocol binds
model work to the signed-in tenant, workspace and user. Logout, account/workspace
changes and selecting a cloud provider abort the browser relay.

Device credentials remain in memory. The only session-storage flag records that
the user enabled the browser connection; no model key or device token is stored.
On refresh, automatic reconnection occurs only when the browser reports existing
loopback permission. Otherwise the user clicks Connect again. Web Locks prevent
competing tabs for the same scope on supported browsers. A revoked connection
requires an explicit reconnect, rather than repeatedly taking over another tab.

Only fixed local `/api/tags`, `/api/show` and `/api/chat` routes are used. API and
device Authorization headers are never sent to Ollama. Requests omit cookies,
reject redirects, validate installed models and budgets, and cap payload size.
Embedding-only models are excluded using Ollama's completion capability.

Prompts/results pass through ResearchPilot's server; inference runs locally.
The tab must remain open and the computer awake. Browser suspension or aggressive
background-tab throttling can interrupt work. This mode is not a durable background
worker. Closing a tab disconnects after the server's short heartbeat window.

## Deployment and validation

This uses the existing connector API, private agent bearer forwarding and internal
relay; no new API routes or environment secrets are required. Publish the prior
connector-compatible backend/agent revision before deploying this frontend. If
the backend still pins the old agent revision, model requests fail authentication.
The Docker compatibility check added to the backend catches that stale checkout.

Frontend tests cover native model execution, usage forwarding, credential
separation, model/budget restrictions, CORS rejection, tab ownership, scope changes
and revocation. A real local Ollama generation can verify the protocol, but does
not replace a hosted browser permission/CORS check after deployment.

References:
- https://docs.ollama.com/faq#how-can-i-allow-additional-web-origins-to-access-ollama
- https://developer.chrome.com/docs/modern-web-guidance/guides/security/local-network-access
