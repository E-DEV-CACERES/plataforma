import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname), '')
  const useHttps = env.VITE_HTTPS === 'true'

  const plugins = [react()]
  if (useHttps) {
    const basicSsl = (await import('@vitejs/plugin-basic-ssl')).default
    plugins.unshift(basicSsl())
  }

  const backendProtocol = env.VITE_BACKEND_HTTPS === 'true' ? 'https' : 'http';
  const proxyTarget = `${backendProtocol}://localhost:4000`;

  return {
    plugins,
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
