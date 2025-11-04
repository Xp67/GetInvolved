import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Use official React plugin but disable Fast Refresh to avoid 500 on /@react-refresh
    react({ fastRefresh: false }),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: { clientPort: 5173 },
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
})
