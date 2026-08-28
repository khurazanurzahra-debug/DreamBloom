import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Only the GitHub Pages CI build sets GITHUB_PAGES=true (see .github/workflows/deploy-pages.yml).
// Local dev, local build/preview, and any other host (Vercel/Netlify) keep base "/" exactly as before.
const isGithubPages = process.env.GITHUB_PAGES === 'true'
const base = isGithubPages ? '/DreamBloom/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
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
        start_url: base,
        scope: base,
        background_color: '#FFF8F1',
        theme_color: '#F2E8D5',
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: `${base}icons/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell + static assets only. The onboarding video is explicitly excluded —
        // it's large, and it must never be managed/rewritten by the service worker's
        // precache lifecycle. Financial data lives in localStorage, untouched by any of this.
        navigateFallback: `${base}index.html`,
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
