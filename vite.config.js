import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/greenwashing-detector/',
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  }
})