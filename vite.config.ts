import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // SECURITY: Warn if mock mode is configured in production
  if (mode === 'production' && process.env.VITE_DATA_PROVIDER === 'mock') {
    console.warn(
      '\x1b[33m⚠️  WARNING: VITE_DATA_PROVIDER is set to "mock" in production build.\n' +
      '   Mock authentication will be disabled for security.\n' +
      '   Set VITE_DATA_PROVIDER="api" for proper backend authentication.\x1b[0m'
    );
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
