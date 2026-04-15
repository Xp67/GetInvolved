import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      '@mui/material',
      '@mui/system',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'axios',
      'jwt-decode',
    ],
  },
  server: {
    port: 3001,
    host: '0.0.0.0',
  },
})
