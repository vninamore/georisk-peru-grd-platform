import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'github-pages' ? '/georisk-peru-grd-platform/' : '/',
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 4173 },
  build: {
    // MapLibre is intentionally isolated; its worker and rendering engine are sizeable.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'map-vendor': ['maplibre-gl'],
          'charts-vendor': ['recharts'],
        },
      },
    },
  },
}))
