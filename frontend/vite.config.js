import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png', 'offline.html', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'MentyMate: Preventive Mental Wellbeing',
        short_name: 'MentyMate',
        description:
          'Earlier Awareness. Safer Support. Bilingual preventive mental wellbeing platform with validated screening, stepped local support, and crisis guidance.',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#F7F8F2',
        theme_color: '#205781',
        lang: 'en',
        categories: ['health', 'medical', 'lifestyle'],
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/chat/crisis-guidance'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'crisis-guidance-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/support/services'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'support-directory-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-i18n': ['i18next', 'react-i18next'],
          'vendor-markdown': ['marked', 'dompurify'],
        },
      },
    },
  },
});
