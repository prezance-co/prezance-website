import { defineConfig } from 'vite';

// Custom domain (prezance.co) serves from the root, so base is '/'.
// Default root + publicDir ('public') — templates/ and demos/ live there and are
// copied verbatim into dist/ at build time.
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
