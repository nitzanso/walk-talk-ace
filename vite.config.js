import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  define: { __BUILD__: JSON.stringify('v3 · ' + new Date().toISOString().slice(0,16).replace('T',' ')) },
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { skipWaiting: true, clientsClaim: true, cleanupOutdatedCaches: true },
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Walk Talk Ace',
        short_name: 'Walk Talk Ace',
        description: 'Walk, talk, and find your own strength.',
        theme_color: '#F6E3DC',
        background_color: '#F6E3DC',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
