import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),

    // ── Progressive Web App ──────────────────────────────────────────────
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // Pre-cache all build assets
        globPatterns: ['**/*.{js,css,html,ico,svg,png,woff2}'],
        // Cache the Web Worker chunk as well
        additionalManifestEntries: [],
        runtimeCaching: [
          {
            // Cache Google Fonts stylesheets (stale-while-revalidate)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            // Cache Google Fonts files (long-lived)
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,   // 1 year
              },
            },
          },
        ],
      },
      manifest: {
        name: 'DataGrid Pro',
        short_name: 'DataGrid',
        description: 'High-performance client-side data grid with 50,000 records at 60 FPS',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any',
          },
        ],
      },
      devOptions: {
        enabled: false,     // disable PWA in dev to avoid service-worker noise
      },
    }),

    // ── Bundle Visualizer (only on build, not dev) ───────────────────────
    mode === 'production' && visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    }),
  ].filter(Boolean),

  build: {
    rollupOptions: {
      output: {
        // Manual chunk splitting for better long-term caching
        manualChunks: {
          'router': ['react-router-dom'],
          'virtualize': ['react-window', 'react-virtualized-auto-sizer'],
        },
      },
    },
    // Generate source maps for production profiling
    sourcemap: false,
    // Target modern browsers
    target: 'es2020',
  },

  // Expose the Worker URL to the bundler correctly
  worker: {
    format: 'es',
  },
}));
