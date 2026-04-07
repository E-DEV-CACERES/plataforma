import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname), '')
  const useHttps = env.VITE_HTTPS === 'true'

  // Backend: HTTP por defecto. Si usa HTTPS (USE_HTTPS=true), target debe ser https
  const backendProtocol = env.VITE_BACKEND_HTTPS === 'true' ? 'https' : 'http';
  const proxyTarget = `${backendProtocol}://localhost:4000`;

  return {
    plugins: [...(useHttps ? [basicSsl()] : []), react()],
    server: {
      https: useHttps,
      host: true,
      allowedHosts: ['.ngrok-free.dev', '.ngrok.io'],
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false, // Acepta certs autofirmados del backend
        },
        '/uploads': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
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
