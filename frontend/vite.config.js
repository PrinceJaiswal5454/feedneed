import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://feedneed.onrender.com/api',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://feedneed.onrender.com/api',
        changeOrigin: true,
      },
    },
  },
});
