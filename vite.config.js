import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Automatically updates the service worker
      devOptions: {
        enabled: true, // Enable PWA features during development
      },
      manifest: {
        name: "My Vite React App",
        short_name: "MyApp",
        description: "A React app converted to PWA",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // Cache key files for offline support
        globPatterns: ["**/*.{js,css,html,png,jpg,jpeg,svg}"],
      },
    }),
  ],
});