import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), [
    'VITE_',
    'NODE_ENV'
  ]);

  return {
    plugins: [
      react(),
      // Optional bundle analyzer (remove in production)
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
      }) 
    ],

    // Base public path (for deployments in subdirectories)
    base: '/',

    // Proxy configuration for API calls
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
          }
        }
      }
    },

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: mode !== 'production',
      minify: 'terser',
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            reactRouter: ['react-router-dom'],
            reactIcons: ['react-icons'],
            vendor: ['axios', 'react-toastify'],
          },
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`
        }
      }
    },

    // Environment variables
    define: {
      'process.env': {
        ...env,
        NODE_ENV: mode
      }
    },

    // CSS configuration
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCaseOnly'
      }
    },

    // Preview server configuration
    preview: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true
        }
      }
    },

    // Resolver configuration
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@pages': '/src/pages',
        '@assets': '/src/assets'
      }
    }
  };
});