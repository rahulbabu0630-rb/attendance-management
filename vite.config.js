import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Core plugins
    plugins: [
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: 'react',
        babel: {
          plugins: [
            ['@babel/plugin-transform-react-jsx', {
              runtime: 'automatic',
              importSource: 'react'
            }]
          ]
        }
      })
    ],

    // Module resolution
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@pages': path.resolve(__dirname, './src/pages')
      }
    },

    // Dependency optimization (FIXED: Added zod)
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'framer-motion',
        'jspdf',
        'html2canvas',
        'axios',
        'zod',
        'react-hook-form',
        '@headlessui/react',
        '@heroicons/react'
      ],
      esbuildOptions: {
        jsx: 'automatic'
      }
    },

    // Dev server configuration
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      hmr: {
        overlay: false
      },
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://durgadevisweets.onrender.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization'
          }
        }
      }
    },

    // Production build configuration
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            animations: ['framer-motion'],
            charts: ['recharts'],
            pdf: ['jspdf', 'html2canvas'],
            forms: ['react-hook-form', 'zod'],
            ui: ['@headlessui/react', '@heroicons/react'],
            vendor: ['axios', 'date-fns', 'lodash', 'uuid']
          }
        }
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true
        }
      },
      sourcemap: mode !== 'production'
    },

    // ESBuild configuration
    esbuild: {
      jsx: 'automatic'
    }
  };
});