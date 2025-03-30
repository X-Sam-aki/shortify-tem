import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      '/youtube': {
        target: 'https://www.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/youtube/, '')
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'googleapis',
      'google-auth-library',
      'sonner',
      '@google-cloud/local-auth'
    ],
    exclude: ['fsevents']
  },
  build: {
    commonjsOptions: {
      include: [/googleapis/, /google-auth-library/, /node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: ['fsevents'],
      output: {
        manualChunks: {
          googleapis: ['googleapis'],
          'google-auth': ['google-auth-library']
        }
      }
    }
  },
}));
