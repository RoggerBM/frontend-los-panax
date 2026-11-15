import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // El chunk del modelo 3D (three.js + malla anatómica ~500 KB) se carga aparte, solo en la ficha del tripulante
    chunkSizeWarningLimit: 1200,
  },
})
