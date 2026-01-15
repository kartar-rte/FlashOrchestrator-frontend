import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: '0.0.0.0', // Allow external access
    proxy: {
      '/api': {
        target: 'http://185.15.211.80:3004',
        // target: 'http://localhost:3004',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://185.15.211.80:8082',
        // target: 'ws://localhost:8082',
        ws: true,
      }
    }
  }
})


