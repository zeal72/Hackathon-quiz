import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [tailwindcss(), react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['glitch-effect.svg', 'terminal-icon-192x192.png', 'matrix-icon-512x512.png'],
    manifest: {
      name: 'HackQuiz - Code & Conquer',
      short_name: 'HackQuiz',
      description: 'Dominate Quiz challenges in this  tech showdown!',
      theme_color: '#3b82f6',
      background_color: '#0f172a',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: 'terminal-icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable any'
        },
        {
          src: 'matrix-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable any'
        }
      ]
    }
  })
  ],
})