import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "avatar.svg",
        "cover.svg",
        "pwa-icons/icon-192.svg",
        "pwa-icons/icon-512.svg"
      ],
      manifest: {
        name: "Most Badass Resume Ever",
        short_name: "BadassCV",
        description: "Resume interattivo in stile terminale Fallout.",
        theme_color: "#0f1d0f",
        background_color: "#060d06",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "pwa-icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html"
      },
      devOptions: {
        enabled: false
      }
    })
  ]
});
