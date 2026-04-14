import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  return {
    server: {
      port: 3004,
      host: '127.0.0.1', // Changé de 0.0.0.0 pour éviter les erreurs réseau
      hmr: {
        port: 3004
      },
      // Configuration stable
      open: false,
      strictPort: true, // Force le port 3004
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      target: 'es2015',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react'],
            heavy: ['@mui/material', '@mui/icons-material', 'recharts', 'jspdf', 'jspdf-autotable']
          }
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // Optimisation des dépendances
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react'
      ],
      force: true // Force la reconstruction
    },
    // Configuration du cache
    cacheDir: 'node_modules/.vite'
  };
});
