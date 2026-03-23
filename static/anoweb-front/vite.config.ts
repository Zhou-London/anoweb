import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '/var/www/anoweb',
    emptyOutDir: true
  },
  ssr: {
    // Bundle all dependencies in SSR build so CSS imports are handled by Vite
    noExternal: true
  }
})
