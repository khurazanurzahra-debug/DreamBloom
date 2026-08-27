import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'DreamBloom',
        short_name: 'DreamBloom',
        description: 'Tabungan yang tumbuh bersama mimpi.',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        background_color: '#FFF8F1',
        theme_color: '#F2E8D5',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell + static assets only. The onboarding video is explicitly excluded —
        // it's large, and it must never be managed/rewritten by the service worker's
        // precache lifecycle. Financial data lives in localStorage, untouched by any of this.
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['**/videos/**'],
      },
    }),
  ],
  server: {
    port: 5175,
    strictPort: true,
  },
})
