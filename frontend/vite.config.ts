import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: false,
      registerType: 'autoUpdate',
      includeAssets: ['yazoo.png'],
      manifest: {
        name: 'Yazoo Lab — Inventario',
        short_name: 'Yazoo Lab',
        description: 'Laboratorio, almacén y calidad Yazoo Caribe',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#FCFCF9',
        theme_color: '#1A120E',
        icons: [
          { src: '/yazoo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/yazoo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    port: 3005,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8010',
        changeOrigin: true,
      },
    },
  },
  preview: { port: 3005, host: true },
})