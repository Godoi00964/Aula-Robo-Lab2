import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Evita CORS: o browser chama /nr/... e o Vite repassa para o Node-RED (porta padrão 1880).
    proxy: {
      '/nr': {
        target: 'http://127.0.0.1:1880',
        changeOrigin: true,
      },
    },
  },
})
