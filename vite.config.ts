import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  base: '/',
  build: {
    target: 'es2015',
    minify: 'oxc',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', 'lucide-react'],
  },
});
