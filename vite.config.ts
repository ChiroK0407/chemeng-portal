import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@':           path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages':      path.resolve(__dirname, './src/pages'),
      '@layouts':    path.resolve(__dirname, './src/layouts'),
      '@hooks':      path.resolve(__dirname, './src/hooks'),
      '@services':   path.resolve(__dirname, './src/services'),
      '@api':        path.resolve(__dirname, './src/api'),
      '@context':    path.resolve(__dirname, './src/context'),
      '@lib':        path.resolve(__dirname, './src/lib'),
      '@utils':      path.resolve(__dirname, './src/utils'),
      '@types':      path.resolve(__dirname, './src/types'),
      '@features':   path.resolve(__dirname, './src/features'),
      '@assets':     path.resolve(__dirname, './src/assets'),
      '@store':      path.resolve(__dirname, './src/store'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'react-vendor'
          if (id.includes('@tanstack/react-query')) return 'query-vendor'
          if (id.includes('framer-motion'))         return 'motion-vendor'
          if (id.includes('@supabase'))             return 'supabase-vendor'
          if (id.includes('react-hook-form') || id.includes('zod')) return 'form-vendor'
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})