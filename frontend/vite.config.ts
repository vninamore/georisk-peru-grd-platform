import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'github-pages' ? '/georisk-peru-grd-platform/' : '/',
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 4173 },
  build: {
    // Keep GIS and charting dependencies cacheable across dashboard releases.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          'map-vendor': ['leaflet'],
          'charts-vendor': ['recharts'],
        },
      },
    },
  },
}))
