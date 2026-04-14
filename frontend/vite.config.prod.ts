import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration de production pour Hostinger
export default defineConfig({
  plugins: [react()],
  
  // Configuration de build pour production
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    
    // Optimisation des chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', '@emotion/react', '@emotion/styled'],
          mui: ['@mui/material', '@mui/icons-material'],
          charts: ['recharts'],
          pdf: ['jspdf', 'jspdf-autotable'],
          ai: ['@huggingface/inference', 'tesseract.js']
        },
        
        // Nettoyage des noms de fichiers
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Optimisation spécifique pour production
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
        drop_debugger: true
      }
    }
  },
  
  // Configuration de base pour Hostinger
  base: '/',
  
  // Variables d'environnement
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VITE_APP_URL': JSON.stringify('https://sante.quantum221.com'),
    'process.env.VITE_API_BASE_URL': JSON.stringify('https://sante.quantum221.com/api')
  },
  
  // Résolution des chemins
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@shared': path.resolve(__dirname, '../shared/src')
    }
  },
  
  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      '@emotion/react',
      '@emotion/styled'
    ]
  },
  
  // Configuration du serveur de preview
  preview: {
    port: 4173,
    host: true
  }
});
