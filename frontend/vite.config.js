// ===================================
// VITE CONFIGURATION - PRODUCTION READY
// NO basicSsl, NO https, PURE REACT
// ===================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    outDir: 'build',
  },
})

