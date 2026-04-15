import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname), '')

  return {
    plugins: [react()],
    server: {
      host: true,
      allowedHosts: ['.ngrok-free.dev', '.ngrok.io'],
    },
    build: {
      outDir: 'build',
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            'vendor-charts': ['recharts'],
            'vendor-http': ['axios'],
          },
        },
      },
    },
  }
})
