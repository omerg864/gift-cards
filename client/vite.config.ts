import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";
import manifest from "./manifest.json";

import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(manifest)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
})
