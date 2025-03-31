import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: true,
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
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
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
});
