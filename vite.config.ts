import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  // Keep Rust compiler output from `tauri dev` on screen.
  clearScreen: false,
  server: {
    // tauri.conf.json hardcodes devUrl, so fail loudly rather than drift to 5174.
    port: 5173,
    strictPort: true,
    watch: {
      // src-tauri/target churns tens of thousands of files during a Rust build.
      ignored: ['**/src-tauri/**'],
    },
  },
})
