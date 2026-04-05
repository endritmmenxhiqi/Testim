import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Kjo shton pikën para rrugëve të skedarëve që të gjenden pas build-it
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  }
})