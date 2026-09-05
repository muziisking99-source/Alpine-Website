// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
//
// Vercel: nitro preset is pinned below. Lovable cloud builds still force Cloudflare internally.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Ensure Nitro emits Vercel Functions output for Git/CLI deploys
  nitro: {
    preset: "vercel",
  },
  vite: {
    // Open the HTTP server before the full dep crawl finishes (big cold-start win on Windows).
    optimizeDeps: {
      holdUntilCrawlEnd: false,
      include: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "framer-motion",
        "@tanstack/react-router",
        "@tanstack/react-query",
        "@radix-ui/react-dialog",
        "clsx",
        "tailwind-merge",
        "class-variance-authority",
      ],
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/framer-motion")) {
              return "motion";
            }
            if (id.includes("node_modules/@radix-ui")) {
              return "radix";
            }
          },
        },
      },
    },
    server: {
      warmup: {
        clientFiles: [
          "./src/routes/__root.tsx",
          "./src/routes/index.tsx",
          "./src/styles.css",
        ],
      },
      watch: {
        ignored: ["**/.git/**", "**/.vercel/**", "**/.lovable/**", "**/dist/**"],
      },
    },
  },
});