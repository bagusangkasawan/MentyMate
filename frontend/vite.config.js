import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { blogData } from './src/data/blogData.js';

const SITE_URL = 'https://mentymate.mategroup.id';

/**
 * Generates dynamic `sitemap.xml` and `llms.txt` during production builds
 * from the active `blogData` catalog so new articles are indexed automatically.
 */
function seoGeoPlugin() {
  return {
    name: 'mentymate-seo-geo-generator',
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      const staticRoutes = [
        { path: '/', priority: '1.0' },
        { path: '/try', priority: '0.9' },
        { path: '/support', priority: '0.9' },
        { path: '/impact', priority: '0.8' },
        { path: '/blog', priority: '0.8' },
      ];
      const articleRoutes = blogData.map((a) => ({ path: `/blog/${a.id}`, priority: '0.7' }));
      const urls = [...staticRoutes, ...articleRoutes]
        .map(
          ({ path, priority }) =>
            `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
        )
        .join('\n');

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });

      const llmsLines = [
        '# MentyMate (MateGroup)',
        '> Bilingual (EN/ID) preventive mental wellbeing PWA with validated PHQ-9/GAD-7 screening, stepped local support directory, and deterministic crisis escalation.',
        '',
        '## Core Public Pages',
        `- Home: ${SITE_URL}/`,
        `- 2-Minute Guest Preview: ${SITE_URL}/try`,
        `- Local Support & Care Directory: ${SITE_URL}/support`,
        `- Anonymous Impact & Safety Metrics: ${SITE_URL}/impact`,
        `- Wellbeing Resources: ${SITE_URL}/blog`,
        '',
        '## Wellbeing Articles',
        ...blogData.map((a) => `- [${a.title}](${SITE_URL}/blog/${a.id}) (${a.lang || 'id'}): ${a.excerpt}`),
      ].join('\n');

      this.emitFile({
        type: 'asset',
        fileName: 'llms.txt',
        source: `${llmsLines}\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    seoGeoPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png', 'offline.html', 'robots.txt'],
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
            purpose: 'any maskable',
          },
          {
            src: '/icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
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
