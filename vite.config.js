import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages deployment
  base: '/',

  // Set the public directory for assets
  publicDir: 'public',

  // Server configuration
  server: {
    port: 5173,
    open: true, // Auto-open browser
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
});
