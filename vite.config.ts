import react from '@vitejs/plugin-react'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      imports: [],
      dts: 'src/types/auto-imports.d.ts',
      resolvers: [
        (name) => {
          if (/^[A-Z][A-Za-z0-9]*(Outlined|Filled|TwoTone)$/.test(name)) {
            return { name, from: '@ant-design/icons' }
          }
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
