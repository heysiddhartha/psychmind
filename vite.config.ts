import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-tooltip', '@radix-ui/react-toast'],
          'supabase': ['@supabase/supabase-js'],
          'pdf': ['jspdf', 'jspdf-autotable'],
          'jitsi': ['@jitsi/react-sdk'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    // Enable minification
    minify: 'esbuild',
    // Source maps only in dev
    sourcemap: mode === 'development',
    // Target modern browsers
    target: 'es2020',
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'lucide-react'],
  },
}));
