import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

function oauthPopupHeaders() {
  const setHeaders = (request: { url?: string }, response: { setHeader(name: string, value: string): void }, next: () => void) => {
    const pathname = new URL(request.url ?? "/", "http://vite.local").pathname;
    // MSAL v5 needs this bridge document in the same browsing context group.
    if (pathname !== "/redirect.html") response.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  };

  return {
    name: "oauth-popup-headers",
    configureServer(server: { middlewares: { use(handler: typeof setHeaders): void } }) {
      server.middlewares.use(setHeaders);
    },
    configurePreviewServer(server: { middlewares: { use(handler: typeof setHeaders): void } }) {
      server.middlewares.use(setHeaders);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), oauthPopupHeaders()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), "index.html"),
        redirect: resolve(process.cwd(), "redirect.html"),
      },
    },
  },
  server: { port: 8080, host: "0.0.0.0" }
});
